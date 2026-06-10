const Storage = {
  PREFIX: 'engineering_pm_',
  
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, serializedValue);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },
  
  has(key) {
    return localStorage.getItem(this.PREFIX + key) !== null;
  },
  
  getAllKeys() {
    const keys = [];
    const items = Object.keys(localStorage);
    items.forEach(item => {
      if (item.startsWith(this.PREFIX)) {
        keys.push(item.replace(this.PREFIX, ''));
      }
    });
    return keys;
  },
  
  setSession(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(this.PREFIX + key, serializedValue);
      return true;
    } catch (error) {
      console.error('Session storage set error:', error);
      return false;
    }
  },
  
  getSession(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Session storage get error:', error);
      return defaultValue;
    }
  },
  
  removeSession(key) {
    try {
      sessionStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (error) {
      console.error('Session storage remove error:', error);
      return false;
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
