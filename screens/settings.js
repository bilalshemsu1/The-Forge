import { storage } from '../storage.js';
import { getLLMConfig } from '../ai.js';

function escapeAttr(str) {
  if (typeof str !== 'string') return String(str || '');
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderSettings(container, router) {
  const currentConfig = getLLMConfig();

  container.innerHTML = `
    <div class="settings-screen">
      <div class="settings-header card">
        <h2>System Settings & LLM Configuration</h2>
        <p class="subtitle">Configure local storage persistence and OpenAI-compatible chat completions endpoint.</p>
      </div>

      <!-- LLM Configuration -->
      <div class="card settings-card">
        <h3>AI Integration Endpoint</h3>
        <p class="setting-desc">The Forge uses an OpenAI-compatible API endpoint as a sparring partner and grader. Your API key is stored strictly locally in your browser's <code>localStorage</code> and never transmitted elsewhere.</p>

        <form id="llm-settings-form" class="settings-form">
          <div class="form-group">
            <label for="llm-url">API Endpoint URL</label>
            <input
              type="url"
              id="llm-url"
              class="input-text"
              value="${escapeAttr(currentConfig.url)}"
              placeholder="https://api.openai.com/v1/chat/completions"
              required
            />
          </div>

          <div class="form-group">
            <label for="llm-key">API Key</label>
            <input
              type="password"
              id="llm-key"
              class="input-text"
              value="${escapeAttr(currentConfig.apiKey)}"
              placeholder="Paste your API key here..."
            />
          </div>

          <div class="form-group">
            <label for="llm-model">Model Name</label>
            <input
              type="text"
              id="llm-model"
              class="input-text"
              value="${escapeAttr(currentConfig.model)}"
              placeholder="auto"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save LLM Configuration</button>
            <span id="llm-saved-msg" class="saved-msg" style="display:none;">Saved!</span>
          </div>
        </form>
      </div>

      <!-- Data Export & Import -->
      <div class="card settings-card">
        <h3>Data Backup & Migration</h3>
        <p class="setting-desc">Local-first data persistence. Export your entire skill history, problem bank, and ratings as JSON for local backup or migration.</p>

        <div class="backup-actions">
          <button id="btn-export-data" class="btn btn-secondary">
            📥 Export All Data (JSON)
          </button>
          
          <label for="import-file-input" class="btn btn-secondary btn-file-label">
            📤 Import Backup Data (JSON)
            <input type="file" id="import-file-input" accept=".json" style="display:none;" />
          </label>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card settings-card danger-zone card-danger">
        <h3>Danger Zone</h3>
        <p class="setting-desc">Wipe all local progress, attempt history, custom problems, and skill ratings.</p>

        <button id="btn-reset-all" class="btn btn-danger">
          ⚠️ Reset All Progress & Data
        </button>
      </div>
    </div>
  `;

  document.getElementById('llm-settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('llm-url').value.trim();
    const apiKey = document.getElementById('llm-key').value.trim();
    const model = document.getElementById('llm-model').value.trim() || 'auto';

    storage.set('llm_settings', { url, apiKey, model });

    const msg = document.getElementById('llm-saved-msg');
    msg.style.display = 'inline';
    setTimeout(() => { msg.style.display = 'none'; }, 2000);
  });

  document.getElementById('btn-export-data').addEventListener('click', () => {
    const jsonStr = storage.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-forge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = storage.importData(evt.target.result);
      if (res.success) {
        alert(`Successfully imported ${res.count} storage entries! App will reload.`);
        window.location.reload();
      } else {
        alert('Import failed: ' + res.error);
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-reset-all').addEventListener('click', () => {
    const confirmation = prompt('TYPE "DELETE" TO CONFIRM: This will permanently erase all ratings, streak, and history.');
    if (confirmation === 'DELETE') {
      storage.clearAll();
      alert('All storage reset. App will reload.');
      window.location.reload();
    }
  });
}
