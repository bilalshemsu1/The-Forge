import { ai, isLLMConfigured } from '../ai.js';
import { problemBank } from '../problemBank.js';

export function renderImportProblem(container, router) {
  let parsedProblemState = null;

  container.innerHTML = `
    <div class="import-screen">
      <div class="import-header card">
        <h2>Import New Problem</h2>
        <p class="subtitle">Paste raw writeups, CVE descriptions, or challenge prompts. AI restructures them into standard schema for review.</p>
      </div>

      <!-- Step 1: Raw Input -->
      <div class="card import-step-card" id="step-paste-container">
        <h3>Step 1: Paste Raw Problem Text</h3>
        <textarea id="raw-problem-input" class="input-textarea raw-import-textarea" placeholder="Paste problem text, blog post excerpt, CTF writeup, Advent of Code prompt, or JSON here..."></textarea>
        
        <div class="import-actions">
          ${isLLMConfigured() ? `
            <button id="btn-parse-ai" class="btn btn-primary">
              ✨ Parse with AI into Schema
            </button>
          ` : `
            <div class="info-alert">
              ℹ️ LLM endpoint not configured. You can edit the form manually or configure API Key in Settings.
            </div>
          `}
          <button id="btn-manual-form" class="btn btn-secondary">
            📝 Fill Schema Form Manually
          </button>
        </div>
      </div>

      <!-- Step 2: Review & Edit Form -->
      <div class="card import-step-card" id="step-review-container" style="display: none;">
        <h3>Step 2: Review & Edit Problem Schema</h3>
        
        <form id="problem-schema-form" class="schema-form">
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="form-title">Title <span class="req">*</span></label>
              <input type="text" id="form-title" class="input-text" required />
            </div>
            <div class="form-group flex-1">
              <label for="form-category">Category <span class="req">*</span></label>
              <select id="form-category" class="input-select" required>
                <option value="system-design">System Design</option>
                <option value="debugging">Debugging</option>
                <option value="algorithm">Algorithm</option>
                <option value="reverse-engineering">Reverse Engineering</option>
                <option value="read-and-reconstruct">Read & Reconstruct</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="form-difficulty">Difficulty (1 to 10) <span class="req">*</span></label>
              <input type="number" id="form-difficulty" class="input-text" min="1" max="10" value="5" required />
            </div>
            <div class="form-group flex-1">
              <label for="form-evalmode">Evaluation Mode <span class="req">*</span></label>
              <select id="form-evalmode" class="input-select" required>
                <option value="exact-test">exact-test</option>
                <option value="ai-graded">ai-graded</option>
                <option value="self-reported">self-reported</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label for="form-language">Language</label>
              <select id="form-language" class="input-select">
                <option value="python">python</option>
                <option value="javascript">javascript</option>
                <option value="any">any</option>
                <option value="none">none</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="form-prompt">Prompt Markdown <span class="req">*</span></label>
            <textarea id="form-prompt" class="input-textarea prompt-textarea" required></textarea>
          </div>

          <div class="form-group">
            <label for="form-starter">Starter Code (Optional)</label>
            <textarea id="form-starter" class="input-textarea code-textarea"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="form-hint-1">Hint Tier 1 (Socratic Nudge)</label>
              <input type="text" id="form-hint-1" class="input-text" />
            </div>
            <div class="form-group flex-1">
              <label for="form-hint-2">Hint Tier 2 (Named Concept)</label>
              <input type="text" id="form-hint-2" class="input-text" />
            </div>
            <div class="form-group flex-1">
              <label for="form-hint-3">Hint Tier 3 (Full Approach)</label>
              <input type="text" id="form-hint-3" class="input-text" />
            </div>
          </div>

          <div class="form-group">
            <label for="form-tests">Test Cases JSON (for exact-test mode)</label>
            <textarea id="form-tests" class="input-textarea code-textarea" placeholder='[{"input": "...", "expectedOutput": "..."}]'></textarea>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="form-tags">Tags (comma separated)</label>
              <input type="text" id="form-tags" class="input-text" placeholder="concurrency, graphs" />
            </div>
            <div class="form-group flex-1">
              <label for="form-source">Source Attribution</label>
              <input type="text" id="form-source" class="input-text" placeholder="Advent of Code, CVE-2021-XXXX, Original" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" id="btn-cancel-import" class="btn btn-secondary">Cancel</button>
            <button type="submit" id="btn-save-problem" class="btn btn-primary btn-large">Save to Problem Bank →</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const pasteContainer = document.getElementById('step-paste-container');
  const reviewContainer = document.getElementById('step-review-container');
  const rawInput = document.getElementById('raw-problem-input');

  function populateForm(data) {
    parsedProblemState = data;
    document.getElementById('form-title').value = data.title || '';
    document.getElementById('form-category').value = data.category || 'algorithm';
    document.getElementById('form-difficulty').value = data.difficulty || 5;
    document.getElementById('form-evalmode').value = data.evalMode || 'exact-test';
    document.getElementById('form-language').value = data.language || 'python';
    document.getElementById('form-prompt').value = data.prompt || '';
    document.getElementById('form-starter').value = data.starterCode || '';
    document.getElementById('form-hint-1').value = data.hints?.[0] || '';
    document.getElementById('form-hint-2').value = data.hints?.[1] || '';
    document.getElementById('form-hint-3').value = data.hints?.[2] || '';
    document.getElementById('form-tests').value = data.tests ? JSON.stringify(data.tests, null, 2) : '';
    document.getElementById('form-tags').value = (data.tags || []).join(', ');
    document.getElementById('form-source').value = data.source || 'Imported';

    pasteContainer.style.display = 'none';
    reviewContainer.style.display = 'block';
  }

  // Parse with AI handler
  const btnParseAI = document.getElementById('btn-parse-ai');
  if (btnParseAI) {
    btnParseAI.addEventListener('click', async () => {
      const rawText = rawInput.value.trim();
      if (!rawText) {
        alert('Please paste raw problem text before parsing.');
        return;
      }

      btnParseAI.disabled = true;
      btnParseAI.textContent = 'Parsing with AI...';

      try {
        const parsed = await ai.parseImportedProblem(rawText);
        populateForm(parsed);
      } catch (err) {
        alert('AI Parsing error: ' + err.message);
      } finally {
        btnParseAI.disabled = false;
        btnParseAI.textContent = '✨ Parse with AI into Schema';
      }
    });
  }

  // Manual form handler
  document.getElementById('btn-manual-form').addEventListener('click', () => {
    const rawText = rawInput.value.trim();
    let initialData = { prompt: rawText };
    try {
      if (rawText.startsWith('{')) {
        initialData = JSON.parse(rawText);
      }
    } catch (_) {}
    populateForm(initialData);
  });

  document.getElementById('btn-cancel-import').addEventListener('click', () => {
    reviewContainer.style.display = 'none';
    pasteContainer.style.display = 'block';
  });

  // Save Problem submission
  document.getElementById('problem-schema-form').addEventListener('submit', (e) => {
    e.preventDefault();

    let tests = [];
    try {
      const rawTestsStr = document.getElementById('form-tests').value.trim();
      if (rawTestsStr) tests = JSON.parse(rawTestsStr);
    } catch (err) {
      alert('Invalid JSON in Test Cases field: ' + err.message);
      return;
    }

    const tags = document.getElementById('form-tags').value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const problemData = {
      id: parsedProblemState?.id || 'imp-' + Date.now(),
      title: document.getElementById('form-title').value.trim(),
      category: document.getElementById('form-category').value,
      difficulty: parseInt(document.getElementById('form-difficulty').value, 10),
      evalMode: document.getElementById('form-evalmode').value,
      language: document.getElementById('form-language').value,
      prompt: document.getElementById('form-prompt').value.trim(),
      starterCode: document.getElementById('form-starter').value,
      hints: [
        document.getElementById('form-hint-1').value.trim(),
        document.getElementById('form-hint-2').value.trim(),
        document.getElementById('form-hint-3').value.trim()
      ].filter(h => h.length > 0),
      tests,
      tags,
      source: document.getElementById('form-source').value.trim() || 'Imported',
      estimatedMinutes: 30
    };

    problemBank.saveCustomProblem(problemData);
    alert(`Problem "${problemData.title}" saved successfully to Problem Bank!`);
    router.navigate('problem', { id: problemData.id });
  });
}
