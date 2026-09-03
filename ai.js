import { storage } from './storage.js';

export function getLLMConfig() {
  const settings = storage.get('llm_settings', {});
  return {
    url: settings.url || 'https://api.openai.com/v1/chat/completions',
    apiKey: settings.apiKey || '',
    model: settings.model || 'auto'
  };
}

export function isLLMConfigured() {
  const config = getLLMConfig();
  return Boolean(config.apiKey && config.url);
}

async function callOpenAI(messages, responseFormatJson = false) {
  const config = getLLMConfig();
  if (!config.apiKey) {
    throw new Error('LLM API Key is missing. Please configure it in Settings.');
  }

  const payload = {
    model: config.model || 'auto',
    messages,
    temperature: 0.2
  };

  if (responseFormatJson) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`LLM API returned error ${response.status}: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('LLM API returned an empty response.');
  }

  return content;
}

export const ai = {
  /**
   * Get hint (Tier 1, 2, or 3)
   */
  async getHint(problem, tier, userJournalSoFar = '') {
    const systemPrompt = `You are a strict deliberate-practice mentor in an engineering problem-solving simulator ("The Forge"). Your goal is to force the user to think harder and analyze deeply without giving away shortcuts.

RULES:
- NEVER give direct code solutions or copy-paste code snippets.
- NEVER reveal the full answer directly in Tier 1 or Tier 2.
- Tier 1: Provide ONLY a Socratic question or nudge that redirects the user's thinking and exposes blind spots.
- Tier 2: Name the relevant algorithmic concept, data structure, architectural tradeoff, or debugging pattern, but DO NOT apply it to this specific problem code for them.
- Tier 3: Provide a clear conceptual explanation of the algorithmic approach and steps, but STILL prefer describing the algorithm conceptually over pasting full code solutions.

User's current reasoning journal: "${userJournalSoFar}"`;

    const userPrompt = `Problem Title: ${problem.title}
Category: ${problem.category}
Difficulty: ${problem.difficulty}/10
Prompt: ${problem.prompt}
Language: ${problem.language}

Requested Hint Tier: Tier ${tier}

Provide hint for Tier ${tier} following the system instructions exactly.`;

    return await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  },

  /**
   * Ask AI Sparring Partner / Rubber Duck question without score penalty
   */
  async askSparringPartner(problem, userCode = '', userQuestion = '', userJournal = '') {
    const systemPrompt = `You are an AI Engineering Sparring Partner in "The Forge".
Your job is to answer the user's technical questions, point out subtle assumptions, or discuss edge cases WITHOUT writing the solution code for them.
Guide them with precise engineering principles, theoretical bounds, and debugging methodologies. Keep answers concise and direct.`;

    const userPrompt = `Problem: ${problem.title} (${problem.category}, Diff: ${problem.difficulty}/10)
Description: ${problem.prompt}

User's Current Code:
${userCode || '(None)'}

User's Journal/Reasoning:
${userJournal || '(None)'}

User's Question / Discussion Prompt:
"${userQuestion}"`;

    return await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  },

  /**
   * Help draft or refine user's reasoning journal into clear technical articulation (20+ words)
   */
  async helpDraftJournal(problem, userCode = '', roughNotes = '') {
    const systemPrompt = `You are a technical writing assistant in "The Forge".
The user has rough thoughts or written code and needs a concise, high-quality 2-3 sentence technical reasoning journal entry (minimum 25 words).
Articulate:
1. The core strategy/approach chosen.
2. Key edge cases, performance tradeoffs, or failure modes considered.

Return ONLY the journal text paragraph directly. Do NOT include greetings or preamble.`;

    const userPrompt = `Problem: ${problem.title} (${problem.category})
User Code:
${userCode || '(None)'}

Rough Notes / Ideas:
"${roughNotes || 'Formulate reasoning based on problem statement and code approach.'}"`;

    return await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  },

  /**
   * Grade submission for ai-graded or open-ended problems
   */
  async gradeSubmission(problem, userCode = '', userReasoning = '') {
    const systemPrompt = `You are a senior principal engineer performing a rigorous code and system design review in "The Forge".
Your job is to evaluate the user's solution and reasoning critically and accurately.

CRITICAL INSTRUCTION:
- DO NOT be gratuitously encouraging or overly polite. Be candid, accurate, and signal-focused.
- Evaluate both the user's written reasoning/journal and their code/design.
- Output MUST be valid JSON with this exact schema:
{
  "qualityScore": number (1 to 5 integer, where 1 is completely flawed/superficial and 5 is production-grade mastery),
  "strengths": [ "string listing what was done right" ],
  "gaps": [ "string listing missing edge cases, flaws, performance risks, or unaddressed tradeoffs" ],
  "followUpQuestion": "one sharp, open thread question that forces the user to think further about scale/failure modes"
}`;

    const userPrompt = `Problem Title: ${problem.title}
Category: ${problem.category}
Difficulty: ${problem.difficulty}/10
Prompt: ${problem.prompt}
Language: ${problem.language}

User's Reasoning Journal:
${userReasoning}

User's Code / Submission:
${userCode || '(No code submitted, written answer/design only)'}`;

    const rawResponse = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      const match = rawResponse.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('Failed to parse structured JSON from AI grader response.');
    }
  },

  /**
   * Parse raw problem writeup into standard schema
   */
  async parseImportedProblem(rawText) {
    const systemPrompt = `You are an expert problem curation engine for "The Forge".
Restructure the raw problem writeup/text into the exact JSON schema required by the system.

JSON Schema:
{
  "title": "Short concise problem title",
  "category": "system-design" | "debugging" | "algorithm" | "reverse-engineering" | "read-and-reconstruct",
  "difficulty": number (1 to 10 integer),
  "prompt": "Full markdown problem statement with clear specifications, background, and constraints.",
  "language": "python" | "javascript" | "any" | "none",
  "starterCode": "optional starter code string or empty string",
  "hints": [
    "Tier 1 hint (Socratic question nudge)",
    "Tier 2 hint (named concept/pattern)",
    "Tier 3 hint (detailed approach explanation)"
  ],
  "evalMode": "exact-test" | "ai-graded" | "self-reported",
  "tests": [
    { "input": "input string/JSON", "expectedOutput": "expected output string/JSON" }
  ],
  "tags": ["tag1", "tag2"],
  "source": "source attribution or Imported",
  "estimatedMinutes": 30
}

Infer category, difficulty, tags, and hints if not explicitly provided. Output MUST be valid JSON only.`;

    const rawResponse = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: rawText }
    ], true);

    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      const match = rawResponse.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('Failed to parse problem schema JSON from AI import response.');
    }
  }
};
