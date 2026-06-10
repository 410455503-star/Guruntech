class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.params = {};
    this.beforeEach = null;
    this.afterEach = null;
    
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }
  
  addRoute(path, handler) {
    let regex;
    if (path === '*') {
      regex = /^.*$/;
    } else {
      const pattern = path.replace(/:\w+/g, '([^/]+)');
      regex = new RegExp(`^${pattern}$`);
    }
    this.routes[path] = {
      pattern: path,
      regex,
      handler
    };
    return this;
  }
  
  setBeforeEach(callback) {
    this.beforeEach = callback;
  }
  
  setAfterEach(callback) {
    this.afterEach = callback;
  }
  
  navigate(path, params = {}) {
    window.location.hash = path;
    this.params = params;
  }
  
  replace(path, params = {}) {
    const currentHash = window.location.hash.slice(1);
    window.location.hash = path;
    this.params = params;
    if (window.location.hash.slice(1) !== currentHash) {
      window.history.replaceState(null, '', window.location.href);
    }
  }
  
  back() {
    window.history.back();
  }
  
  forward() {
    window.history.forward();
  }
  
  handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const [path, queryString] = hash.split('?');
    const query = {};
    
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        query[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }
    
    let matched = false;
    
    for (const routePath in this.routes) {
      const route = this.routes[routePath];
      const match = path.match(route.regex);
      
      if (match) {
        const params = {};
        const paramNames = (routePath.match(/:\w+/g) || []).map(p => p.slice(1));
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        
        this.currentRoute = {
          path: routePath,
          fullPath: path,
          params,
          query
        };
        
        if (this.beforeEach) {
          const result = this.beforeEach(this.currentRoute);
          if (result === false) return;
        }
        
        route.handler(this.currentRoute);
        
        if (this.afterEach) {
          this.afterEach(this.currentRoute);
        }
        
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      this.handleNotFound(path);
    }
  }
  
  handleNotFound(path) {
    const notFoundHandler = this.routes['*'];
    if (notFoundHandler) {
      notFoundHandler.handler({
        path: '*',
        fullPath: path,
        params: {},
        query: {}
      });
    } else {
      console.warn(`Route not found: ${path}`);
    }
  }
  
  getCurrentRoute() {
    return this.currentRoute;
  }
  
  getQueryParam(key) {
    return this.currentRoute?.query[key];
  }
  
  getParam(key) {
    return this.currentRoute?.params[key];
  }
  
  init() {
    if (!window.location.hash) {
      this.navigate('dashboard');
    }
  }
}

const router = new Router();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = router;
}
