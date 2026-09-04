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

  // Clean up existing monaco instance disposable if re-entering
  if (monacoEditorInstance && typeof monacoEditorInstance.dispose === 'function') {
    try { monacoEditorInstance.dispose(); } catch (_) {}
    monacoEditorInstance = null;
  }

  if (!problem) {
    container.innerHTML = `
      <div class="empty-state card">
        <h2>Problem Not Found</h2>
        <p>The requested problem ID "${escapeHtml(problemId)}" does not exist in the bank.</p>
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
  let activeRightTab = 'editor';

  if (timerInterval) clearInterval(timerInterval);

  container.innerHTML = `
    <div class="problem-workspace">
      <!-- Top Workspace Toolbar -->
      <div class="workspace-header card">
        <div class="header-left">
          <button id="btn-back" class="btn btn-secondary btn-sm">← Bank</button>
          <span class="category-badge cat-${escapeHtml(problem.category)}">${escapeHtml(problem.category)}</span>
          <h2 class="problem-title-text">${escapeHtml(problem.title)}</h2>
        </div>
        <div class="header-right">
          <div class="timer-box">
            <span class="timer-label">Elapsed:</span>
            <span id="timer-display" class="timer-text">00:00</span>
          </div>
          <span class="meta-badge">Diff: ${problem.difficulty}/10</span>
          <span class="meta-badge">Eval: ${escapeHtml(problem.evalMode)}</span>
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

          <div id="tab-prompt-content" class="panel-body tab-content">
            <div class="prompt-markdown">
              ${window.marked ? window.marked.parse(problem.prompt) : formatMarkdownFallback(problem.prompt)}
            </div>

            <div class="spec-details-box">
              <h4>Technical Constraints & I/O Contract</h4>
              <ul>
                ${problem.details?.constraints ? `<li><strong>Constraints:</strong> <br/>${formatMarkdownFallback(problem.details.constraints)}</li>` : ''}
                ${problem.details?.inputFormat ? `<li><strong>Input Format:</strong> <code>${escapeHtml(problem.details.inputFormat)}</code></li>` : ''}
                ${problem.details?.outputFormat ? `<li><strong>Output Format:</strong> <code>${escapeHtml(problem.details.outputFormat)}</code></li>` : ''}
              </ul>
              
              ${problem.details?.sampleInput ? `
                <div class="sample-io">
                  <div><strong>Sample Input:</strong><pre><code>${escapeHtml(problem.details.sampleInput)}</code></pre></div>
                  <div><strong>Sample Output:</strong><pre><code>${escapeHtml(problem.details.sampleOutput)}</code></pre></div>
                </div>
              ` : ''}
            </div>
          </div>

          <div id="tab-hints-content" class="panel-body tab-content" style="display:none;">
            <div class="hint-ladder">
              <p class="hint-policy-note">⚠️ Unlocking hints reduces maximum Elo reward for this attempt.</p>

              <!-- Hint Tier 1 -->
              <div class="hint-card locked" id="hint-tier-1">
                <div class="hint-header">
                  <span>Tier 1: Socratic Guidance (-20% Elo)</span>
                  <button class="btn btn-warning btn-sm btn-unlock-hint" data-tier="1">Unlock Tier 1</button>
                </div>
                <div class="hint-body" id="hint-content-1">
                  <em>Locked. Click unlock to view conceptual guidance.</em>
                </div>
              </div>

              <!-- Hint Tier 2 -->
              <div class="hint-card locked" id="hint-tier-2">
                <div class="hint-header">
                  <span>Tier 2: Pseudocode & Invariants (-40% Elo)</span>
                  <button class="btn btn-warning btn-sm btn-unlock-hint" data-tier="2" disabled>Unlock Tier 2</button>
                </div>
                <div class="hint-body" id="hint-content-2">
                  <em>Locked. Requires Tier 1 unlock first.</em>
                </div>
              </div>

              <!-- Hint Tier 3 -->
              <div class="hint-card locked" id="hint-tier-3">
                <div class="hint-header">
                  <span>Tier 3: Reference Implementation (-70% Elo)</span>
                  <button class="btn btn-warning btn-sm btn-unlock-hint" data-tier="3" disabled>Unlock Tier 3</button>
                </div>
                <div class="hint-body" id="hint-content-3">
                  <em>Locked. Requires Tier 2 unlock first.</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Pane: Code Editor & Execution Workstation -->
        <div class="panel editor-panel card">
          <div class="panel-tab-bar">
            <button class="panel-tab active" data-right-tab="editor">Code Solution</button>
            <button class="panel-tab" data-right-tab="test-output">Console Output</button>
            <button class="panel-tab" data-right-tab="ai-sparring">AI Sparring Partner</button>
          </div>

          <div id="right-tab-editor" class="tab-content">
            <div class="editor-subbar">
              <span class="lang-tag">Target: ${escapeHtml(problem.language.toUpperCase())}</span>
              ${problem.evalMode === 'exact-test' ? `
                <button id="btn-run-tests-top" class="btn btn-secondary btn-sm">► Run Local Test Assertions</button>
              ` : ''}
            </div>
            <div id="monaco-container" class="monaco-editor-box"></div>
          </div>

          <div id="right-tab-test-output" class="tab-content" style="display:none;">
            <div class="console-actions">
              <button id="btn-run-tests-console" class="btn btn-secondary btn-sm">► Re-Run Suite</button>
            </div>
            <div id="test-results-container" class="test-results-panel">
              <div class="info-alert">Click "Run Test Assertions" to execute code against sandboxed unit tests.</div>
            </div>
          </div>

          <div id="right-tab-ai-sparring" class="tab-content" style="display:none;">
            <div class="sparring-box">
              <div id="sparring-chat-feed" class="sparring-feed">
                <div class="chat-msg ai-msg">
                  <strong>AI Partner:</strong> Ask me about complexity bounds, edge case invariants, or architectural strategies. I will provide Socratic hints without giving away the exact solution.
                </div>
              </div>
              <div class="sparring-input-bar">
                <input type="text" id="sparring-input" class="input-text" placeholder="Ask your sparring question..." />
                <button id="btn-send-sparring" class="btn btn-primary btn-sm">Send</button>
              </div>
            </div>
          </div>

          <!-- Reasoning Journal & Action Bar -->
          <div class="reasoning-journal-box">
            <div class="journal-header">
              <label for="reasoning-journal"><strong>Reasoning & Strategy Journal</strong> (Required before submission)</label>
              <button id="btn-ai-draft-journal" class="btn btn-outline btn-sm">✨ AI Draft Reasoning</button>
            </div>
            <textarea id="reasoning-journal" class="journal-textarea" placeholder="Explain your design strategy, invariants, complexity bounds, and edge cases (Minimum 20 words required)..."></textarea>
            <div class="journal-footer">
              <span id="journal-word-count" class="word-count-badge">0 / 20 words min</span>
              <span id="journal-warning" class="journal-warning-text">Explain your approach in at least 20 words to enable submission.</span>
            </div>
          </div>

          <div class="workspace-action-bar">
            <button id="btn-skip" class="btn btn-outline btn-sm">Skip Problem (Loss)</button>
            <div class="action-right">
              ${problem.evalMode === 'exact-test' ? `
                <button id="btn-run-tests" class="btn btn-secondary">► Run Tests</button>
              ` : ''}
            </div>
            <button id="btn-submit" class="btn btn-primary btn-large" disabled>Submit for Review →</button>
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

  // Left Pane Tab Switching
  container.querySelectorAll('.panel-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.panel-tab[data-tab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      document.getElementById('tab-prompt-content').style.display = target === 'prompt' ? 'block' : 'none';
      document.getElementById('tab-hints-content').style.display = target === 'hints' ? 'block' : 'none';
    });
  });

  // Right Pane Tab Switching
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

    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-msg user-msg';
    userMsgDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(question)}`;
    chatFeed.appendChild(userMsgDiv);

    sparringInput.value = '';
    btnSendSparring.disabled = true;

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
      errDiv.innerHTML = `⚠️ Error: ${escapeHtml(err.message)}`;
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
      consoleOutput.innerHTML = `<div class="eval-error-box">⚠️ ${escapeHtml(evalOutput.error)}</div>`;
      return evalOutput;
    }

    if (!evalOutput.results || evalOutput.results.length === 0) {
      consoleOutput.innerHTML = `<div class="info-alert">${escapeHtml(evalOutput.message || 'All local checks complete.')}</div>`;
      return evalOutput;
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
    return evalOutput;
  }

  const btnRunTests = document.getElementById('btn-run-tests');
  if (btnRunTests) btnRunTests.addEventListener('click', runLocalUnitTests);

  const btnRunTestsTop = document.getElementById('btn-run-tests-top');
  if (btnRunTestsTop) btnRunTestsTop.addEventListener('click', runLocalUnitTests);

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

  // Final Submit handler with Strict Gatekeeping
  submitBtn.addEventListener('click', async () => {
    const userReasoning = journalInput.value.trim();
    if (userReasoning.split(/\s+/).length < 20) return;

    const userCode = monacoEditorInstance ? monacoEditorInstance.getValue() : '';

    // Gate 1: Untouched Starter Code Check against true problem starterCode
    const normUser = (userCode || '').replace(/\s+/g, ' ').trim();
    const normStarter = (problem.starterCode || '').replace(/\s+/g, ' ').trim();
    if (!normUser || normUser === normStarter || normUser.includes('pass') && normUser.length < normStarter.length + 10) {
      alert('❌ Submission Blocked: You have not written a custom solution yet (code is identical to starter template). Please code your solution first.');
      return;
    }

    // Gate 2: Strict Test Assertions Verification for exact-test problems
    if (problem.evalMode === 'exact-test') {
      const evalRes = await runLocalUnitTests();
      if (!evalRes || !evalRes.success) {
        alert('❌ Submission Blocked: Solution failed unit test assertions. Please fix all failing tests before submitting.');
        return;
      }
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Evaluating Final Submission...';

    clearInterval(timerInterval);

    let evalOutput = { success: false, results: [] };
    let solved = false;
    let aiQualityScore = null;

    try {
      if (problem.evalMode === 'exact-test') {
        evalOutput = await runLocalUnitTests();
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
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatMarkdownFallback(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}
