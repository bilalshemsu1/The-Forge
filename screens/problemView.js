import { problemBank } from '../problemBank.js';
import { skillRating } from '../skillRating.js';
import { evaluateJavaScript } from '../evaluators/javascript.js';
import { evaluatePython } from '../evaluators/python.js';
import { ai, isLLMConfigured } from '../ai.js';

let timerInterval = null;
let monacoEditorInstance = null;

export function renderProblemView(container, router, params) {
  const problemId = params?.id;
  const problem = problemBank.getProblemById(problemId);

  if (!problem) {
    container.innerHTML = `
      <div class="empty-state card">
        <h2>Problem Not Found</h2>
        <p>The requested problem ID "${problemId}" does not exist in the bank.</p>
        <button id="btn-back-picker" class="btn btn-primary">Return to Problem Bank</button>
      </div>
    `;
    document.getElementById('btn-back-picker')?.addEventListener('click', () => router.navigate('picker'));
    return;
  }

  let secondsElapsed = 0;
  let hintsUnlocked = 0;
  const unlockedHintTexts = {};
  let isSubmitting = false;
  let activeRightTab = 'editor'; // 'editor' | 'test-output' | 'ai-sparring'

  if (timerInterval) clearInterval(timerInterval);

  container.innerHTML = `
    <div class="problem-workspace">
      <!-- Top Workspace Toolbar -->
      <div class="workspace-header card">
        <div class="header-left">
          <button id="btn-back" class="btn btn-secondary btn-sm">← Bank</button>
          <span class="category-badge cat-${problem.category}">${problem.category}</span>
          <h2 class="problem-title-text">${problem.title}</h2>
        </div>
        <div class="header-right">
          <div class="timer-box">
            <span class="timer-label">Elapsed:</span>
            <span id="timer-display" class="timer-text">00:00</span>
          </div>
          <span class="meta-badge">Diff: ${problem.difficulty}/10</span>
          <span class="meta-badge">Eval: ${problem.evalMode}</span>
        </div>
      </div>

      <!-- Main Dual-Pane Grid -->
      <div class="workspace-main">
        <!-- Left Pane: Problem Spec, Instructions & Hint Ladder -->
        <div class="panel prompt-panel card">
          <div class="panel-tab-bar">
            <button class="panel-tab active" data-tab="prompt">Problem Statement</button>
            <button class="panel-tab" data-tab="hints">Hint Ladder (${hintsUnlocked}/3)</button>
          </div>

          <!-- Tab Content: Prompt -->
          <div id="tab-prompt-content" class="tab-pane active">
            <div class="panel-body markdown-body">
              ${window.marked ? window.marked.parse(problem.prompt) : formatMarkdownFallback(problem.prompt)}
            </div>
          </div>

          <!-- Tab Content: Hints -->
          <div id="tab-hints-content" class="tab-pane">
            <div class="hint-ladder-section">
              <h4>Hint Ladder (Rating Penalty Applied)</h4>
              <p class="hint-disclaimer">Unlocking hints incurs a permanent score penalty for this attempt. Tier 3 discloses full algorithm explanation.</p>

              <div class="hint-tiers">
                <!-- Tier 1 -->
                <div class="hint-card ${hintsUnlocked >= 1 ? 'unlocked' : 'locked'}" id="hint-tier-1">
                  <div class="hint-header">
                    <span class="tier-label">Tier 1: Socratic Nudge (-20% Score)</span>
                    <button class="btn btn-sm btn-outline btn-unlock-hint" data-tier="1" ${hintsUnlocked >= 1 ? 'disabled' : ''}>
                      ${hintsUnlocked >= 1 ? 'Unlocked' : 'Unlock Tier 1 (-20%)'}
                    </button>
                  </div>
                  <div class="hint-content" id="hint-content-1">
                    ${hintsUnlocked >= 1 ? (unlockedHintTexts[1] || problem.hints[0] || 'Nudge unlocked.') : '🔒 Locked. Click to reveal redirecting question.'}
                  </div>
                </div>

                <!-- Tier 2 -->
                <div class="hint-card ${hintsUnlocked >= 2 ? 'unlocked' : 'locked'}" id="hint-tier-2">
                  <div class="hint-header">
                    <span class="tier-label">Tier 2: Core Concept (-40% Score)</span>
                    <button class="btn btn-sm btn-outline btn-unlock-hint" data-tier="2" ${hintsUnlocked < 1 || hintsUnlocked >= 2 ? 'disabled' : ''}>
                      ${hintsUnlocked >= 2 ? 'Unlocked' : 'Unlock Tier 2 (-40%)'}
                    </button>
                  </div>
                  <div class="hint-content" id="hint-content-2">
                    ${hintsUnlocked >= 2 ? (unlockedHintTexts[2] || problem.hints[1] || 'Concept unlocked.') : '🔒 Locked. Requires Tier 1 unlock first.'}
                  </div>
                </div>

                <!-- Tier 3 -->
                <div class="hint-card ${hintsUnlocked >= 3 ? 'unlocked' : 'locked'}" id="hint-tier-3">
                  <div class="hint-header">
                    <span class="tier-label">Tier 3: Full Approach (-70% Score)</span>
                    <button class="btn btn-sm btn-outline btn-unlock-hint" data-tier="3" ${hintsUnlocked < 2 || hintsUnlocked >= 3 ? 'disabled' : ''}>
                      ${hintsUnlocked >= 3 ? 'Unlocked' : 'Unlock Tier 3 (-70%)'}
                    </button>
                  </div>
                  <div class="hint-content" id="hint-content-3">
                    ${hintsUnlocked >= 3 ? (unlockedHintTexts[3] || problem.hints[2] || 'Explanation unlocked.') : '🔒 Locked. Requires Tier 2 unlock first.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Pane: Code Editor, Test Console & AI Sparring -->
        <div class="panel editor-panel card">
          <div class="panel-tab-bar">
            <button class="panel-tab active" id="tab-btn-editor" data-right-tab="editor">💻 Code Workspace</button>
            <button class="panel-tab" id="tab-btn-test" data-right-tab="test-output">🧪 Test Runner Console</button>
            <button class="panel-tab highlight-ai" id="tab-btn-ai" data-right-tab="ai-sparring">💬 AI Sparring Partner</button>
          </div>

          <!-- Right Pane Tab: Code Editor -->
          <div id="right-tab-editor" class="tab-pane active">
            ${problem.language !== 'none' ? `
              <div id="monaco-container" class="editor-container"></div>
            ` : `
              <div class="no-editor-notice">
                <p>💡 System Design / Open-Ended Problem. Write detailed strategy & tradeoffs in the reasoning journal below.</p>
              </div>
            `}
          </div>

          <!-- Right Pane Tab: Test Runner Console -->
          <div id="right-tab-test-output" class="tab-pane" style="display:none;">
            <div class="test-console-box">
              <div class="console-header">
                <h4>Unit Test Output</h4>
                <button id="btn-run-tests-console" class="btn btn-secondary btn-sm">► Run Local Unit Tests</button>
              </div>
              <div id="test-results-container" class="console-body">
                <p class="text-dim">No tests run yet. Click "Run Local Unit Tests" to evaluate code before committing.</p>
              </div>
            </div>
          </div>

          <!-- Right Pane Tab: AI Sparring Partner -->
          <div id="right-tab-ai-sparring" class="tab-pane" style="display:none;">
            <div class="ai-sparring-box">
              <div class="sparring-header">
                <h4>AI Sparring Partner & Rubber Duck</h4>
                <span class="sparring-disclaimer">Zero Elo Penalty • Ask anything about tradeoffs, assumptions, or syntax</span>
              </div>
              <div id="sparring-chat-feed" class="sparring-chat">
                <div class="chat-msg ai-msg">
                  <strong>AI Partner:</strong> Ask me about edge cases, dynamic programming state transitions, or memory constraints. I won't write your code, but I will help you reason through it cleanly.
                </div>
              </div>
              <div class="sparring-input-bar">
                <input type="text" id="sparring-input" class="input-text" placeholder="Ask a technical question..." />
                <button id="btn-send-sparring" class="btn btn-primary btn-sm">Send</button>
              </div>
            </div>
          </div>

          <!-- Mandatory Reasoning Journal Section with AI Assistance -->
          <div class="journal-section">
            <div class="journal-header">
              <label for="reasoning-journal">
                Mandatory Reasoning Journal
                <span class="required-star">*</span>
              </label>
              <div class="journal-header-right">
                ${isLLMConfigured() ? `
                  <button type="button" id="btn-ai-draft-journal" class="btn btn-sm btn-outline btn-ai-action">
                    ✨ AI Draft Reasoning
                  </button>
                ` : ''}
                <span id="journal-word-count" class="word-count-badge">0 / 20 words min</span>
              </div>
            </div>
            <textarea
              id="reasoning-journal"
              class="input-textarea journal-textarea"
              placeholder="Articulate your strategy and tradeoffs before submitting (Minimum 20 words required)..."
            ></textarea>
            <div id="journal-warning" class="journal-warning-text">
              ⚠️ Written articulation required (minimum 20 words) to enable submission.
            </div>
          </div>

          <!-- Execution Bar -->
          <div class="action-bar">
            <div class="action-bar-left">
              <button id="btn-skip" class="btn btn-danger-outline btn-sm">Give Up / Skip</button>
              ${problem.evalMode === 'exact-test' ? `
                <button id="btn-run-tests" class="btn btn-secondary">
                  ► Run Tests
                </button>
              ` : ''}
            </div>
            <button id="btn-submit" class="btn btn-primary btn-large" disabled>
              Submit for Review →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Start Count-up Timer
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
    const timerElem = document.getElementById('timer-display');
    if (timerElem) timerElem.textContent = `${mins}:${secs}`;
  }, 1000);

  // Init Monaco
  if (problem.language !== 'none') {
    initMonacoEditor(problem.starterCode || '', problem.language);
  }

  // Left Pane Tab Switching (Prompt / Hints)
  container.querySelectorAll('.panel-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.panel-tab[data-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      document.getElementById('tab-prompt-content').style.display = target === 'prompt' ? 'block' : 'none';
      document.getElementById('tab-hints-content').style.display = target === 'hints' ? 'block' : 'none';
    });
  });

  // Right Pane Tab Switching (Editor / Test Console / AI Sparring)
  function switchRightTab(tabName) {
    activeRightTab = tabName;
    container.querySelectorAll('.panel-tab[data-right-tab]').forEach(t => {
      if (t.getAttribute('data-right-tab') === tabName) t.classList.add('active');
      else t.classList.remove('active');
    });

    document.getElementById('right-tab-editor').style.display = tabName === 'editor' ? 'block' : 'none';
    document.getElementById('right-tab-test-output').style.display = tabName === 'test-output' ? 'block' : 'none';
    document.getElementById('right-tab-ai-sparring').style.display = tabName === 'ai-sparring' ? 'block' : 'none';
  }

  container.querySelectorAll('.panel-tab[data-right-tab]').forEach(tab => {
    tab.addEventListener('click', () => switchRightTab(tab.getAttribute('data-right-tab')));
  });

  // Journal Word Count & Gating
  const journalInput = document.getElementById('reasoning-journal');
  const wordCountDisplay = document.getElementById('journal-word-count');
  const journalWarning = document.getElementById('journal-warning');
  const submitBtn = document.getElementById('btn-submit');

  function updateJournalStatus() {
    const text = journalInput.value.trim();
    const words = text ? text.split(/\s+/).filter(w => w.length > 0) : [];
    const count = words.length;

    wordCountDisplay.textContent = `${count} / 20 words min`;

    if (count >= 20) {
      wordCountDisplay.classList.add('valid');
      journalWarning.style.display = 'none';
      submitBtn.disabled = isSubmitting;
    } else {
      wordCountDisplay.classList.remove('valid');
      journalWarning.style.display = 'block';
      submitBtn.disabled = true;
    }
  }

  journalInput.addEventListener('input', updateJournalStatus);

  // AI Draft Reasoning Assistant Handler
  const btnAIDraft = document.getElementById('btn-ai-draft-journal');
  if (btnAIDraft) {
    btnAIDraft.addEventListener('click', async () => {
      const userCode = monacoEditorInstance ? monacoEditorInstance.getValue() : '';
      const roughNotes = journalInput.value.trim();

      btnAIDraft.disabled = true;
      btnAIDraft.textContent = '✨ Drafting...';

      try {
        const draftedText = await ai.helpDraftJournal(problem, userCode, roughNotes);
        journalInput.value = draftedText;
        updateJournalStatus();
      } catch (err) {
        alert('AI Draft Error: ' + err.message);
      } finally {
        btnAIDraft.disabled = false;
        btnAIDraft.textContent = '✨ AI Draft Reasoning';
      }
    });
  }

  // AI Sparring Partner Chat Handler
  const sparringInput = document.getElementById('sparring-input');
  const btnSendSparring = document.getElementById('btn-send-sparring');
  const chatFeed = document.getElementById('sparring-chat-feed');

  async function handleSendSparring() {
    const question = sparringInput.value.trim();
    if (!question) return;

    // Append user message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-msg user-msg';
    userMsgDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(question)}`;
    chatFeed.appendChild(userMsgDiv);

    sparringInput.value = '';
    btnSendSparring.disabled = true;

    // Append thinking indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'chat-msg ai-msg thinking';
    thinkingDiv.innerHTML = `<em>AI Partner is thinking...</em>`;
    chatFeed.appendChild(thinkingDiv);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    const userCode = monacoEditorInstance ? monacoEditorInstance.getValue() : '';
    const userJournal = journalInput.value.trim();

    try {
      const aiReply = await ai.askSparringPartner(problem, userCode, question, userJournal);
      thinkingDiv.remove();

      const aiMsgDiv = document.createElement('div');
      aiMsgDiv.className = 'chat-msg ai-msg';
      aiMsgDiv.innerHTML = `<strong>AI Partner:</strong> ${window.marked ? window.marked.parse(aiReply) : escapeHtml(aiReply)}`;
      chatFeed.appendChild(aiMsgDiv);
    } catch (err) {
      thinkingDiv.remove();
      const errDiv = document.createElement('div');
      errDiv.className = 'chat-msg ai-msg error';
      errDiv.innerHTML = `⚠️ Error: ${err.message}`;
      chatFeed.appendChild(errDiv);
    } finally {
      btnSendSparring.disabled = false;
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }
  }

  if (btnSendSparring) btnSendSparring.addEventListener('click', handleSendSparring);
  if (sparringInput) {
    sparringInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSendSparring();
    });
  }

  // Run Local Unit Tests Function
  async function runLocalUnitTests() {
    const userCode = monacoEditorInstance ? monacoEditorInstance.getValue() : '';
    const consoleOutput = document.getElementById('test-results-container');
    switchRightTab('test-output');

    consoleOutput.innerHTML = `<div class="console-loading">⚡ Running unit tests in sandboxed runner...</div>`;

    let evalOutput = { success: false, results: [] };
    if (problem.language === 'python') {
      evalOutput = await evaluatePython(userCode, problem.tests);
    } else if (problem.language === 'javascript') {
      evalOutput = await evaluateJavaScript(userCode, problem.tests);
    } else {
      evalOutput = { success: true, message: 'No executable test suite for this language.' };
    }

    if (evalOutput.error) {
      consoleOutput.innerHTML = `<div class="eval-error-box">⚠️ ${evalOutput.error}</div>`;
      return;
    }

    if (!evalOutput.results || evalOutput.results.length === 0) {
      consoleOutput.innerHTML = `<div class="info-alert">${evalOutput.message || 'All local checks complete.'}</div>`;
      return;
    }

    const allPassed = evalOutput.success;
    consoleOutput.innerHTML = `
      <div class="test-summary-header ${allPassed ? 'pass' : 'fail'}">
        ${allPassed ? '✓ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
      </div>
      <table class="test-results-table">
        <thead>
          <tr>
            <th>Test #</th>
            <th>Status</th>
            <th>Input</th>
            <th>Expected</th>
            <th>Actual Output</th>
          </tr>
        </thead>
        <tbody>
          ${evalOutput.results.map(r => `
            <tr class="${r.passed ? 'pass-row' : 'fail-row'}">
              <td>${r.index}</td>
              <td>${r.passed ? '✓ PASS' : '❌ FAIL'}</td>
              <td><code>${escapeHtml(r.input)}</code></td>
              <td><code>${escapeHtml(r.expected)}</code></td>
              <td><code>${escapeHtml(r.actual)}</code></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const btnRunTests = document.getElementById('btn-run-tests');
  if (btnRunTests) btnRunTests.addEventListener('click', runLocalUnitTests);

  const btnRunConsole = document.getElementById('btn-run-tests-console');
  if (btnRunConsole) btnRunConsole.addEventListener('click', runLocalUnitTests);

  // Hint unlock handlers
  container.querySelectorAll('.btn-unlock-hint').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tier = parseInt(btn.getAttribute('data-tier'), 10);
      if (tier !== hintsUnlocked + 1) return;

      btn.disabled = true;
      btn.textContent = 'Unlocking...';

      let hintText = problem.hints?.[tier - 1] || '';

      if (isLLMConfigured()) {
        try {
          const userJournalText = journalInput.value.trim();
          hintText = await ai.getHint(problem, tier, userJournalText);
        } catch (err) {
          console.warn('AI hint fetch failed:', err);
        }
      }

      hintsUnlocked = tier;
      unlockedHintTexts[tier] = hintText;

      const contentElem = document.getElementById(`hint-content-${tier}`);
      const cardElem = document.getElementById(`hint-tier-${tier}`);

      if (contentElem && cardElem) {
        contentElem.innerHTML = window.marked ? window.marked.parse(hintText) : formatMarkdownFallback(hintText);
        cardElem.classList.remove('locked');
        cardElem.classList.add('unlocked');
        btn.textContent = 'Unlocked';
      }

      const nextBtn = container.querySelector(`.btn-unlock-hint[data-tier="${tier + 1}"]`);
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  // Skip handler
  document.getElementById('btn-skip').addEventListener('click', () => {
    if (confirm('Skip this problem? This logs an incomplete attempt (S=0.1) and updates your rating.')) {
      clearInterval(timerInterval);
      const userReasoning = journalInput.value.trim() || 'Skipped without complete solution.';
      const result = skillRating.recordAttemptResult({
        problem,
        solved: false,
        hintsUnlockedCount: hintsUnlocked,
        isSkip: true,
        timeTakenSeconds: secondsElapsed,
        userReasoning,
        retroNote: 'Skipped attempt.'
      });

      router.navigate('result', {
        problemId: problem.id,
        attempt: result.attempt,
        evalOutput: { success: false, error: 'User opted to skip.' }
      });
    }
  });

  // Final Submit handler
  submitBtn.addEventListener('click', async () => {
    const userReasoning = journalInput.value.trim();
    if (userReasoning.split(/\s+/).length < 20) return;

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Evaluating Final Submission...';

    clearInterval(timerInterval);

    const userCode = monacoEditorInstance ? monacoEditorInstance.getValue() : '';

    let evalOutput = { success: false, results: [] };
    let solved = false;
    let aiQualityScore = null;

    try {
      if (problem.evalMode === 'exact-test') {
        if (problem.language === 'python') {
          evalOutput = await evaluatePython(userCode, problem.tests);
        } else if (problem.language === 'javascript') {
          evalOutput = await evaluateJavaScript(userCode, problem.tests);
        } else {
          evalOutput = { success: true, message: 'No automatic evaluator for language.' };
        }
        solved = Boolean(evalOutput.success);
      } else if (problem.evalMode === 'ai-graded') {
        if (isLLMConfigured()) {
          const gradeRes = await ai.gradeSubmission(problem, userCode, userReasoning);
          aiQualityScore = gradeRes.qualityScore || 3;
          solved = aiQualityScore >= 3;
          evalOutput = {
            success: solved,
            aiGrade: gradeRes
          };
        } else {
          solved = true;
          aiQualityScore = 4;
          evalOutput = {
            success: true,
            message: 'AI endpoint unconfigured. Solution evaluated based on reasoning journal.'
          };
        }
      } else {
        solved = true;
        evalOutput = { success: true, message: 'Self-reported evaluation completed.' };
      }
    } catch (err) {
      evalOutput = { success: false, error: 'Evaluation error: ' + err.message };
      solved = false;
    }

    const ratingResult = skillRating.recordAttemptResult({
      problem,
      solved,
      hintsUnlockedCount: hintsUnlocked,
      aiQualityScore,
      isSkip: false,
      timeTakenSeconds: secondsElapsed,
      userReasoning
    });

    router.navigate('result', {
      problemId: problem.id,
      attempt: ratingResult.attempt,
      evalOutput
    });
  });

  document.getElementById('btn-back').addEventListener('click', () => {
    if (confirm('Leave workspace? Current timer and journal draft will be reset.')) {
      clearInterval(timerInterval);
      router.navigate('picker');
    }
  });
}

function initMonacoEditor(initialCode, language) {
  const container = document.getElementById('monaco-container');
  if (!container) return;

  const monacoLang = language === 'python' ? 'python' : 'javascript';

  if (window.monaco) {
    monacoEditorInstance = window.monaco.editor.create(container, {
      value: initialCode,
      language: monacoLang,
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false }
    });
  } else if (window.require) {
    window.require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    window.require(['vs/editor/editor.main'], function () {
      monacoEditorInstance = window.monaco.editor.create(container, {
        value: initialCode,
        language: monacoLang,
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
      });
    });
  } else {
    container.innerHTML = `<textarea id="monaco-fallback" class="fallback-code-editor">${initialCode}</textarea>`;
    monacoEditorInstance = {
      getValue: () => document.getElementById('monaco-fallback').value
    };
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatMarkdownFallback(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1$</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}
