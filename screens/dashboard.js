import { skillRating, CATEGORIES } from '../skillRating.js';
import { problemBank } from '../problemBank.js';
import { storage } from '../storage.js';

export function renderDashboard(container, router) {
  const ratings = skillRating.getRatings();
  const streakInfo = skillRating.getStreakInfo();
  const history = storage.get('attempt_history', []);
  const ratingHistory = skillRating.getRatingHistory();
  const solvedCount = history.filter(h => h.solved).length;
  const suggestedProblem = problemBank.getSuggestedProblem(ratings);

  const categoryLabels = {
    'system-design': 'System Design',
    'debugging': 'Debugging',
    'algorithm': 'Algorithm',
    'reverse-engineering': 'Reverse Engineering',
    'read-and-reconstruct': 'Read & Reconstruct'
  };

  const categoryIcons = {
    'system-design': '⚙️',
    'debugging': '🪲',
    'algorithm': '🧮',
    'reverse-engineering': '🔍',
    'read-and-reconstruct': '📑'
  };

  const maxRating = Math.max(1600, ...Object.values(ratings));

  // Render SVG rating curve (Lichess style)
  const svgCurve = renderRatingCurveSVG(ratingHistory);

  container.innerHTML = `
    <div class="dashboard-screen">
      <!-- Instrument Header (Monkeytype inspired numeric hero) -->
      <div class="dashboard-header card">
        <div class="header-main">
          <h1>THE FORGE</h1>
          <p class="subtitle">Deliberate-Practice Engineering Simulator</p>
        </div>
        <div class="header-stats">
          <div class="stat-box">
            <span class="stat-value">${streakInfo.currentStreak}</span>
            <span class="stat-label">Day Streak</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">${solvedCount}</span>
            <span class="stat-label">Solved</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">${history.length}</span>
            <span class="stat-label">Attempts</span>
          </div>
        </div>
      </div>

      <!-- Growth Zone Target -->
      <div class="continue-banner card">
        <div class="continue-text">
          <span class="badge growth-badge">Growth Zone Target</span>
          <h2>${suggestedProblem ? suggestedProblem.title : 'Explore Problem Bank'}</h2>
          <p class="meta-line">
            ${suggestedProblem ? `${categoryLabels[suggestedProblem.category]} • Difficulty Level ${suggestedProblem.difficulty}/10 (${suggestedProblem.difficulty * 150 + 400} Elo)` : ''}
          </p>
        </div>
        <button id="btn-continue" class="btn btn-primary btn-large">
          ⚡ ${suggestedProblem ? 'Enter Practice Workspace' : 'Pick a Problem'}
        </button>
      </div>

      <!-- Domain Skill Ratings Grid -->
      <div class="ratings-section card">
        <div class="section-title-row">
          <h2>Domain Skill Ratings</h2>
          <span class="info-text">Elo Starting Baseline: 1000</span>
        </div>
        <div class="rating-bars">
          ${CATEGORIES.map(cat => {
            const val = ratings[cat] || 1000;
            const pct = Math.min(100, Math.max(10, (val / maxRating) * 100));
            return `
              <div class="rating-row">
                <div class="rating-cat">
                  <span class="cat-icon">${categoryIcons[cat]}</span>
                  <span class="cat-name">${categoryLabels[cat]}</span>
                </div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
                <div class="rating-value">${val} <span class="elo-unit">Elo</span></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Rating History Curve (Lichess style clean line graph) -->
      <div class="rating-graph-section card">
        <div class="section-title-row">
          <h2>Rating Progress History</h2>
          <span class="info-text">Lichess-style Elo curve</span>
        </div>
        <div class="svg-graph-container">
          ${svgCurve}
        </div>
      </div>

      <!-- Recent Logbook Feed -->
      <div class="recent-activity-section card">
        <h2>Logbook Activity</h2>
        ${history.length === 0 ? `
          <div class="empty-state">
            <p>No logged attempts yet. Launch your first practice workspace to begin tracking.</p>
          </div>
        ` : `
          <div class="history-list-preview">
            ${history.slice(0, 5).map(item => `
              <div class="history-item-mini">
                <span class="status-indicator ${item.solved ? 'pass' : 'fail'}">${item.solved ? '✓ PASS' : '✗ FAIL'}</span>
                <span class="item-title">${item.problemTitle}</span>
                <span class="item-delta ${item.ratingDelta >= 0 ? 'pos' : 'neg'}">${item.ratingDelta >= 0 ? '+' : ''}${item.ratingDelta} Elo</span>
                <span class="item-date">${new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  document.getElementById('btn-continue').addEventListener('click', () => {
    if (suggestedProblem) {
      router.navigate('problem', { id: suggestedProblem.id });
    } else {
      router.navigate('picker');
    }
  });
}

function renderRatingCurveSVG(ratingHistory) {
  if (!ratingHistory || ratingHistory.length < 2) {
    return `<div class="empty-graph-notice">Complete 2+ problem attempts to generate Elo rating curve graph.</div>`;
  }

  const width = 800;
  const height = 160;
  const padding = 20;

  const points = ratingHistory.slice(-20); // Last 20 rating changes
  const ratings = points.map(p => p.rating);
  const minR = Math.min(800, ...ratings) - 50;
  const maxR = Math.max(1600, ...ratings) + 50;

  const getX = (index) => padding + (index / (points.length - 1)) * (width - 2 * padding);
  const getY = (rating) => height - padding - ((rating - minR) / (maxR - minR)) * (height - 2 * padding);

  const pathCoords = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.rating).toFixed(1)}`).join(' ');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="rating-svg-chart">
      <!-- Gridlines -->
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#262d3a" stroke-dasharray="4 4" />
      <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="#262d3a" stroke-dasharray="4 4" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#262d3a" stroke-dasharray="4 4" />

      <!-- Rating Curve Line -->
      <path d="${pathCoords}" fill="none" stroke="#3b82f6" stroke-width="2.5" />

      <!-- Data Dots -->
      ${points.map((p, i) => `
        <circle cx="${getX(i).toFixed(1)}" cy="${getY(p.rating).toFixed(1)}" r="3.5" fill="#3b82f6" stroke="#0b0e14" stroke-width="1.5">
          <title>${p.problemTitle}: ${p.rating} Elo (${p.delta >= 0 ? '+' : ''}${p.delta})</title>
        </circle>
      `).join('')}
    </svg>
  `;
}
