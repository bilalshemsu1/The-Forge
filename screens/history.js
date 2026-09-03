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
            <h3>${item.problemTitle}</h3>
            <span class="category-badge cat-${item.category}">${item.category}</span>
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
          <p class="quote">"${item.userReasoning || 'N/A'}"</p>
        </div>

        ${item.retroNote ? `
          <div class="history-retro">
            <strong>Retrospective Note:</strong>
            <p class="retro-quote">💡 "${item.retroNote}"</p>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  container.innerHTML = `
    <div class="history-screen">
      <div class="history-header card">
        <h2>Practice History & Progress Timeline</h2>
        <p class="subtitle">Review past problem attempts, time metrics, and retrospective notes.</p>

        <div class="filters-row">
          <div class="filter-group">
            <label for="hist-category">Category</label>
            <select id="hist-category" class="input-select">
              <option value="all">All Categories</option>
              <option value="system-design">System Design</option>
              <option value="debugging">Debugging</option>
              <option value="algorithm">Algorithm</option>
              <option value="reverse-engineering">Reverse Engineering</option>
              <option value="read-and-reconstruct">Read & Reconstruct</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="hist-outcome">Outcome</label>
            <select id="hist-outcome" class="input-select">
              <option value="all">All Outcomes</option>
              <option value="solved">Solved Only</option>
              <option value="failed">Failed / Skipped Only</option>
            </select>
          </div>
        </div>
      </div>

      <div id="history-list-container" class="history-feed"></div>
    </div>
  `;

  document.getElementById('hist-category').addEventListener('change', (e) => {
    categoryFilter = e.target.value;
    renderHistoryList();
  });

  document.getElementById('hist-outcome').addEventListener('change', (e) => {
    outcomeFilter = e.target.value;
    renderHistoryList();
  });

  renderHistoryList();
}
