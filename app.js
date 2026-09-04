import { renderDashboard } from './screens/dashboard.js';
import { renderProblemPicker } from './screens/problemPicker.js';
import { renderProblemView } from './screens/problemView.js';
import { renderResultView } from './screens/resultView.js';
import { renderImportProblem } from './screens/importProblem.js';
import { renderSettings } from './screens/settings.js';
import { renderHistory } from './screens/history.js';
import { isLLMConfigured } from './ai.js';
import { storage } from './storage.js';

export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="check-circle-2" style="color:var(--accent-ember);width:16px;"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();
  setTimeout(() => toast.remove(), 3000);
}

class AppRouter {
  constructor() {
    this.currentRoute = 'dashboard';
    this.routeParams = {};
    this.container = document.getElementById('app-main-content');
    this.navLinks = document.querySelectorAll('.nav-item');
  }

  init() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.setupNavClickHandlers();
    this.checkLLMBanner();
    this.handleHashChange();
  }

  setupNavClickHandlers() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const route = link.getAttribute('data-route');
        if (route) {
          this.navigate(route);
        }
      });
    });
  }

  checkLLMBanner() {
    const banner = document.getElementById('llm-notice-banner');
    if (banner) {
      if (!isLLMConfigured()) {
        banner.style.display = 'flex';
      } else {
        banner.style.display = 'none';
      }
    }
  }

  navigate(route, params = {}) {
    this.routeParams = params;
    let hash = `#${route}`;
    if (params.id) {
      hash += `?id=${params.id}`;
    }
    window.location.hash = hash;
  }

  handleHashChange() {
    const rawHash = window.location.hash.replace('#', '') || 'dashboard';
    const [routePart, queryPart] = rawHash.split('?');
    
    this.currentRoute = routePart || 'dashboard';
    if (this.currentRoute === 'workspace') this.currentRoute = 'problem';
    
    const params = { ...this.routeParams };
    if (queryPart) {
      const urlParams = new URLSearchParams(queryPart);
      for (const [k, v] of urlParams.entries()) {
        params[k] = v;
      }
    }

    this.updateActiveNav();
    this.checkLLMBanner();
    this.renderScreen(this.currentRoute, params);
  }

  updateActiveNav() {
    this.navLinks.forEach(link => {
      const route = link.getAttribute('data-route');
      if (route === this.currentRoute || (this.currentRoute === 'problem' && route === 'picker')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const titleElem = document.getElementById('screen-title-text');
    if (titleElem) {
      const titleMap = {
        dashboard: 'DASHBOARD OVERVIEW',
        picker: 'PROBLEM BANK',
        problem: 'PRACTICE WORKSPACE',
        import: 'IMPORT PROBLEM SPEC',
        settings: 'SETTINGS & CONFIGURATION',
        history: 'HISTORY LOGBOOK'
      };
      titleElem.textContent = titleMap[this.currentRoute] || 'ENGINEERING SIMULATOR';
    }
  }

  renderScreen(route, params) {
    if (!this.container) this.container = document.getElementById('app-main-content');
    this.container.innerHTML = '';
    
    switch (route) {
      case 'dashboard':
        renderDashboard(this.container, this);
        break;
      case 'picker':
        renderProblemPicker(this.container, this);
        break;
      case 'problem':
      case 'workspace':
        renderProblemView(this.container, this, params);
        break;
      case 'result':
        renderResultView(this.container, this, params);
        break;
      case 'import':
        renderImportProblem(this.container, this);
        break;
      case 'settings':
        renderSettings(this.container, this);
        break;
      case 'history':
        renderHistory(this.container, this);
        break;
      default:
        renderDashboard(this.container, this);
        break;
    }

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo(0, 0);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const router = new AppRouter();
  router.init();
});
