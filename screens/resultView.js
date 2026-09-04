import { problemBank } from '../problemBank.js';
import { storage } from '../storage.js';

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function renderResultView(container, router, params) {
  let attempt = params?.attempt;
  let evalOutput = params?.evalOutput;
  let problem = problemBank.getProblemById(params?.problemId);

  // Fallback to recent history attempt if user refreshed result page
  if (!attempt) {
    const history = storage.get('attempt_history', []);
    if (history.length > 0) {
      attempt = history[0];
      problem = problemBank.getProblemById(attempt.problemId);
    }
  }

  if (!attempt || !problem) {
    container.innerHTML = `
      <div class="empty-state card">
        <h2>No Result Data</h2>
        <p>Attempt result unavailable.</p>
        <button id="btn-back-dashboard" class="btn btn-primary">Return to Dashboard</button>
      </div>
    `;
    document.getElementById('btn-back-dashboard')?.addEventListener('click', () => router.navigate('dashboard'));
    return;
  }

  const isSolved = attempt.solved;
  const ratingDelta = attempt.ratingDelta;

  container.innerHTML = `
    <div class="result-screen">
      <div class="result-card card ${isSolved ? 'result-pass' : 'result-fail'}">
        <div class="result-header">
          <div class="outcome-badge ${isSolved ? 'pass' : 'fail'}">
            ${isSolved ? '🎉 SOLUTION VERIFIED' : (attempt.isSkip ? '⏭️ SKIPPED' : '❌ ATTEMPT FAILED')}
          </div>
          <h1>${escapeHtml(problem.title)}</h1>
          <p class="subtitle">Category: ${escapeHtml(problem.category)} | Difficulty: ${problem.difficulty}/10</p>
        </div>

        <div class="rating-update-box">
          <div class="rating-stat">
            <span class="stat-label">Previous Rating</span>
            <span class="stat-val">${attempt.ratingBefore} Elo</span>
          </div>
          <div class="rating-arrow">➔</div>
          <div class="rating-stat highlight">
            <span class="stat-label">New Skill Rating</span>
            <span class="stat-val">${attempt.ratingAfter} Elo</span>
          </div>
          <div class="delta-tag ${ratingDelta >= 0 ? 'pos' : 'neg'}">
            ${ratingDelta >= 0 ? '+' : ''}${ratingDelta} Elo
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-box">
            <span class="label">Time Taken</span>
            <span class="val">${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s</span>
          </div>
          <div class="metric-box">
            <span class="label">Hints Used</span>
            <span class="val">${attempt.hintsUnlockedCount} / 3</span>
          </div>
          <div class="metric-box">
            <span class="label">Performance Score (S)</span>
            <span class="val">${(attempt.actualScore * 100).toFixed(0)}%</span>
          </div>
        </div>

        <!-- Feedback & Evaluation Detail Section -->
        <div class="feedback-section">
          <h3>Evaluation Breakdown</h3>
          
          ${evalOutput?.error ? `
            <div class="eval-error-box">
              ⚠️ ${escapeHtml(evalOutput.error)}
            </div>
          ` : ''}

          ${evalOutput?.aiGrade ? `
            <div class="ai-critique-box card">
              <div class="critique-header">
                <h4>AI Senior Engineering Review</h4>
                <span class="quality-score">Quality Score: ${evalOutput.aiGrade.qualityScore} / 5</span>
              </div>
              
              <div class="critique-group">
                <h5>Strengths:</h5>
                <ul>
                  ${(evalOutput.aiGrade.strengths || []).map(s => `<li>✓ ${escapeHtml(s)}</li>`).join('')}
                </ul>
              </div>

              <div class="critique-group">
                <h5>Gaps & Risks:</h5>
                <ul>
                  ${(evalOutput.aiGrade.gaps || []).map(g => `<li>⚠️ ${escapeHtml(g)}</li>`).join('')}
                </ul>
              </div>

              ${evalOutput.aiGrade.followUpQuestion ? `
                <div class="followup-question-box">
                  <h5>Open Thread Question to Consider:</h5>
                  <p>💬 "${escapeHtml(evalOutput.aiGrade.followUpQuestion)}"</p>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${evalOutput?.results && evalOutput.results.length > 0 ? `
            <div class="test-results-table">
              <h4>Test Case Results</h4>
              <table>
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
            </div>
          ` : ''}
        </div>

        <!-- User Reasoning & Retrospective Note -->
        <div class="retro-section card">
          <h4>Reasoning Submitted:</h4>
          <p class="user-reasoning-quote">"${escapeHtml(attempt.userReasoning)}"</p>

          <div class="retro-note-form">
            <label for="retro-note-input">Retrospective Note (What made this hard / what would you do differently?):</label>
            <textarea id="retro-note-input" class="input-textarea" placeholder="Add personal retrospective insights to save in history log...">${escapeHtml(attempt.retroNote || '')}</textarea>
            <button id="btn-save-retro" class="btn btn-secondary btn-sm">Save Retrospective Note</button>
            <span id="retro-saved-msg" class="saved-msg" style="display:none;">Saved!</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="result-actions">
          <button id="btn-next-problem" class="btn btn-primary btn-large">Next Challenge →</button>
          <button id="btn-view-history" class="btn btn-secondary btn-large">View History Log</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-save-retro').addEventListener('click', () => {
    const text = document.getElementById('retro-note-input').value.trim();
    const history = storage.get('attempt_history', []);
    const item = history.find(h => h.id === attempt.id);
    if (item) {
      item.retroNote = text;
      storage.set('attempt_history', history);
      const msg = document.getElementById('retro-saved-msg');
      msg.style.display = 'inline';
      setTimeout(() => { msg.style.display = 'none'; }, 2000);
    }
  });

  document.getElementById('btn-next-problem').addEventListener('click', () => router.navigate('picker'));
  document.getElementById('btn-view-history').addEventListener('click', () => router.navigate('history'));
}
