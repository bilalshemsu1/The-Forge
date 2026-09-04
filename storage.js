/**
 * LocalStorage abstraction module for The Forge.
 * All persistence operations pass through this module.
 */
const PREFIX = 'forge_';

export const storage = {
  get(key, defaultValue = null) {
    const keyAliases = {
      'llm_settings': ['llm_settings', 'settings'],
      'settings': ['settings', 'llm_settings'],
      'skill_ratings': ['skill_ratings', 'ratings'],
      'ratings': ['ratings', 'skill_ratings'],
      'attempt_history': ['attempt_history', 'history'],
      'history': ['history', 'attempt_history'],
      'custom_problems': ['custom_problems', 'problems'],
      'problems': ['problems', 'custom_problems']
    };
    const candidates = keyAliases[key] || [key];
    try {
      for (const k of candidates) {
        const item = localStorage.getItem(PREFIX + k);
        if (item !== null && item !== undefined) {
          return JSON.parse(item);
        }
      }
      return defaultValue;
    } catch (err) {
      console.error(`Storage get error for key "${key}":`, err);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Storage set error for key "${key}":`, err);
      return false;
    }
  },

  list(prefixKey = '') {
    const results = {};
    const fullPrefix = PREFIX + prefixKey;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(fullPrefix)) {
          const rawKey = k.slice(PREFIX.length);
          results[rawKey] = this.get(rawKey);
        }
      }
    } catch (err) {
      console.error(`Storage list error for prefix "${prefixKey}":`, err);
    }
    return results;
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch (err) {
      console.error(`Storage remove error for key "${key}":`, err);
      return false;
    }
  },

  clearAll() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (err) {
      console.error('Storage clear error:', err);
      return false;
    }
  },

  exportData() {
    return JSON.stringify(this.list(), null, 2);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) throw new Error('Invalid JSON format');
      for (const [k, v] of Object.entries(data)) {
        this.set(k, v);
      }
      return { success: true, count: Object.keys(data).length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
