function renderLogin() {
  const html = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          <i class="fas fa-cubes"></i>
          <h1>固润工程项目管理</h1>
        </div>
        
        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" id="username" class="form-input" placeholder="请输入用户名" required value="guruntech">
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <input type="password" id="password" class="form-input" placeholder="请输入密码" required>
          </div>
          
          <div class="form-group form-check">
            <input type="checkbox" id="rememberMe" class="form-check-input">
            <label for="rememberMe" class="form-check-label">记住我</label>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block" id="loginBtn">
            <i class="fas fa-sign-in-alt"></i>
            登 录
          </button>
        </form>
        
        <div class="login-footer">
          <p>默认密码: <span class="password-hint">123456</span></p>
        </div>
      </div>
      
      <div class="login-bg-decoration">
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
        <div class="bg-circle bg-circle-3"></div>
      </div>
    </div>
  `;
  
  document.body.innerHTML = html;
  attachLoginEvents();
}

function attachLoginEvents() {
  const form = document.getElementById('loginForm');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
      showLoginError('请输入用户名和密码');
      return;
    }
    
    const success = store.login(username, password);
    
    if (success) {
      showLoginSuccess();
      setTimeout(() => {
        initApp();
      }, 1500);
    } else {
      showLoginError('用户名或密码错误');
    }
  });
}

function showLoginError(message) {
  const existingAlert = document.querySelector('.login-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alert = document.createElement('div');
  alert.className = 'login-alert login-alert-error';
  alert.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  const card = document.querySelector('.login-card');
  card.insertBefore(alert, card.firstChild);
  
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

function showLoginSuccess() {
  const existingAlert = document.querySelector('.login-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  const alert = document.createElement('div');
  alert.className = 'login-alert login-alert-success';
  alert.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>登录成功，正在跳转...</span>
  `;
  
  const card = document.querySelector('.login-card');
  card.insertBefore(alert, card.firstChild);
}

function initApp() {
  document.body.innerHTML = `
    <div class="layout">
      <aside class="sidebar" id="sidebar"></aside>
      <div class="sidebar-overlay"></div>
      <main class="main-content">
        <header class="header" id="header"></header>
        <div id="content"></div>
      </main>
    </div>
    <div class="quick-actions">
      <button class="quick-action-btn" title="新建任务" onclick="showCreateTaskModal()">
        <i class="fas fa-plus"></i>
      </button>
    </div>
  `;
  
  renderSidebar();
  renderHeader();
  renderContent();
  
  const isDarkMode = store.getState().darkMode;
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
}

function handleLogout() {
  store.logout();
  renderLogin();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderLogin, handleLogout };
}