import { renderDashboard } from './screens/dashboard.js';
import { renderProblemPicker } from './screens/problemPicker.js';
import { renderProblemView } from './screens/problemView.js';
import { renderResultView } from './screens/resultView.js';
import { renderImportProblem } from './screens/importProblem.js';
import { renderSettings } from './screens/settings.js';
import { renderHistory } from './screens/history.js';
import { isLLMConfigured } from './ai.js';

class AppRouter {
  constructor() {
    this.currentRoute = 'dashboard';
    this.routeParams = {};
    this.container = document.getElementById('app-main-content');
    this.navLinks = document.querySelectorAll('.nav-link');
  }

  init() {
    // Check initial hash route
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.setupNavClickHandlers();

    // Check LLM config banner
    this.checkLLMBanner();

    // Initial render based on current location hash or default
    this.handleHashChange();
  }

  setupNavClickHandlers() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigate(route);
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
    
    // Parse query params if available
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
      if (route === this.currentRoute) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  renderScreen(route, params) {
    this.container.innerHTML = '';
    
    switch (route) {
      case 'dashboard':
        renderDashboard(this.container, this);
        break;
      case 'picker':
        renderProblemPicker(this.container, this);
        break;
      case 'problem':
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

    window.scrollTo(0, 0);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const router = new AppRouter();
  router.init();
});
