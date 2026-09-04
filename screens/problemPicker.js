import { problemBank } from '../problemBank.js';
import { skillRating, CATEGORIES } from '../skillRating.js';
import { storage } from '../storage.js';

export function renderProblemPicker(container, router) {
  const ratings = skillRating.getRatings();
  const history = storage.get('attempt_history', []);
  const solvedMap = new Map();
  history.forEach(h => {
    if (h.solved) solvedMap.set(h.problemId, true);
  });

  let currentCategory = 'all';
  let currentDifficulty = 'all';
  let searchTerm = '';

  function renderList() {
    const listContainer = document.getElementById('problem-list-container');
    const avgUserRating = Object.values(ratings).length > 0
      ? Math.round(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length)
      : DEFAULT_RATING;

    const userCatRating = currentCategory !== 'all' ? (ratings[currentCategory] || DEFAULT_RATING) : avgUserRating;

    const filtered = problemBank.filterProblems({
      category: currentCategory,
      difficulty: currentDifficulty,
      searchTag: searchTerm,
      userRating: userCatRating
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state card">
          <p>No problems found matching the selected filters.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(p => {
      const pRating = p.difficulty * 150 + 400;
      const isGrowthZone = pRating >= userCatRating && pRating <= userCatRating + 300;
      const isSolved = solvedMap.get(p.id);

      return `
        <div class="problem-card card ${isGrowthZone ? 'growth-card' : ''}" data-id="${p.id}">
          <div class="problem-card-header">
            <div class="title-row">
              <span class="category-badge cat-${p.category}">${p.category}</span>
              ${isGrowthZone ? '<span class="badge growth-badge">Growth Zone</span>' : ''}
              ${isSolved ? '<span class="badge solved-badge">✓ Solved</span>' : ''}
            </div>
            <h3>${p.title}</h3>
          </div>
          <div class="problem-card-body">
            <p class="prompt-snippet">${p.prompt.replace(/[#*`]/g, '').slice(0, 140)}...</p>
          </div>
          <div class="problem-card-footer">
            <div class="meta-item">
              <span class="meta-label">Difficulty:</span>
              <span class="meta-val">${p.difficulty}/10 (${pRating} Elo)</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Eval Mode:</span>
              <span class="meta-val">${p.evalMode}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Est. Time:</span>
              <span class="meta-val">${p.estimatedMinutes || 30} mins</span>
            </div>
            <button class="btn btn-secondary btn-sm select-btn">Attempt Problem →</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers
    listContainer.querySelectorAll('.problem-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.getAttribute('data-id');
        router.navigate('problem', { id });
      });
    });
  }

  container.innerHTML = `
    <div class="picker-screen">
      <div class="picker-header card">
        <h2>Problem Bank & Practice Zone</h2>
        <p class="subtitle">Problems are ordered by optimal difficulty gap for maximum cognitive skill growth.</p>

        <div class="filters-row">
          <div class="filter-group">
            <label for="filter-category">Category</label>
            <select id="filter-category" class="input-select">
              <option value="all">All Categories</option>
              <option value="system-design">System Design</option>
              <option value="debugging">Debugging</option>
              <option value="algorithm">Algorithm</option>
              <option value="reverse-engineering">Reverse Engineering</option>
              <option value="read-and-reconstruct">Read & Reconstruct</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="filter-difficulty">Difficulty</label>
            <select id="filter-difficulty" class="input-select">
              <option value="all">All Difficulties</option>
              <option value="1">Level 1 - Fundamental</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5 - Intermediate</option>
              <option value="6">Level 6</option>
              <option value="7">Level 7 - Advanced</option>
              <option value="8">Level 8</option>
              <option value="9">Level 9</option>
              <option value="10">Level 10 - Expert</option>
            </select>
          </div>

          <div class="filter-group filter-search">
            <label for="filter-search">Search / Tag</label>
            <input type="text" id="filter-search" class="input-text" placeholder="Search keywords or tags..." />
          </div>
        </div>
      </div>

      <div id="problem-list-container" class="problem-grid"></div>
    </div>
  `;

  document.getElementById('filter-category').addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderList();
  });

  document.getElementById('filter-difficulty').addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    renderList();
  });

  document.getElementById('filter-search').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderList();
  });

  renderList();
}
