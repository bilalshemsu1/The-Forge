import { storage } from '../storage.js';

export function renderHistory(container, router) {
  const history = storage.get('attempt_history', []);
  let categoryFilter = 'all';
  let outcomeFilter = 'all';

  function renderHistoryList() {
    const listContainer = document.getElementById('history-list-container');
    
    let filtered = history;
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(h => h.category === categoryFilter);
    }
    if (outcomeFilter === 'solved') {
      filtered = filtered.filter(h => h.solved);
    } else if (outcomeFilter === 'failed') {
      filtered = filtered.filter(h => !h.solved);
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state card">
          <p>No attempt logs match the selected filters.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(item => `
      <div class="history-card card ${item.solved ? 'pass-card' : 'fail-card'}">
        <div class="history-header">
          <div class="header-left">
            <span class="status-indicator ${item.solved ? 'pass' : 'fail'}">
              ${item.solved ? '✓ SOLVED' : (item.isSkip ? '⏭️ SKIPPED' : '❌ FAILED')}
            </span>
            <h3>${escapeHtml(item.problemTitle)}</h3>
            <span class="category-badge cat-${escapeHtml(item.category)}">${escapeHtml(item.category)}</span>
          </div>
          <div class="header-right">
            <span class="delta-tag ${item.ratingDelta >= 0 ? 'pos' : 'neg'}">
              ${item.ratingDelta >= 0 ? '+' : ''}${item.ratingDelta} Elo
            </span>
            <span class="timestamp">${new Date(item.timestamp).toLocaleString()}</span>
          </div>
        </div>

        <div class="history-metrics">
          <div class="metric">
            <span class="lbl">Difficulty:</span>
            <span class="val">${item.difficulty}/10</span>
          </div>
          <div class="metric">
            <span class="lbl">Time Spent:</span>
            <span class="val">${Math.floor(item.timeTakenSeconds / 60)}m ${item.timeTakenSeconds % 60}s</span>
          </div>
          <div class="metric">
            <span class="lbl">Hints Unlocked:</span>
            <span class="val">${item.hintsUnlockedCount} / 3</span>
          </div>
          <div class="metric">
            <span class="lbl">Rating After:</span>
            <span class="val">${item.ratingAfter} Elo</span>
          </div>
        </div>

        <div class="history-reasoning">
          <strong>Reasoning Journal:</strong>
          <p class="quote">"${escapeHtml(item.userReasoning || 'N/A')}"</p>
        </div>

        ${item.retroNote ? `
          <div class="history-retro">
            <strong>Retrospective Note:</strong>
            <p class="retro-quote">💡 "${escapeHtml(item.retroNote)}"</p>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  container.innerHTML = `
    <div class="history-screen">
      <div class="history-header card">
        <h2>Attempt History & Performance Log</h2>
        <p class="subtitle">Complete audit trail of all practice sessions, reasoning journals, and rating updates.</p>

        <div class="filters-row">
          <div class="filter-group">
            <label for="filter-history-category">Category</label>
            <select id="filter-history-category" class="input-select">
              <option value="all">All Categories</option>
              <option value="system-design">System Design</option>
              <option value="debugging">Debugging</option>
              <option value="algorithm">Algorithm</option>
              <option value="reverse-engineering">Reverse Engineering</option>
              <option value="read-and-reconstruct">Read & Reconstruct</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-history-outcome">Outcome</label>
            <select id="filter-history-outcome" class="input-select">
              <option value="all">All Outcomes</option>
              <option value="solved">Solved Only</option>
              <option value="failed">Failed / Skipped</option>
            </select>
          </div>
        </div>
      </div>

      <div id="history-list-container" class="history-grid"></div>
    </div>
  `;

  document.getElementById('filter-history-category').addEventListener('change', (e) => {
    categoryFilter = e.target.value;
    renderHistoryList();
  });

  document.getElementById('filter-history-outcome').addEventListener('change', (e) => {
    outcomeFilter = e.target.value;
    renderHistoryList();
  });

  renderHistoryList();
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
