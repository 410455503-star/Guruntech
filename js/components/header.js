function renderHeader() {
  const state = store.getState();
  const routeNames = {
    dashboard: '仪表盘',
    projects: '项目管理',
    tasks: '任务管理',
    gantt: '甘特图',
    members: '人员管理',
    reports: '统计报表',
    settings: '系统设置'
  };
  
  const pageTitle = routeNames[state.currentRoute] || '仪表盘';
  const unreadNotifications = state.notifications.filter(n => !n.read).length;
  
  const html = `
    <div class="header-left">
      <button class="mobile-menu-btn" id="mobileMenuBtn">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <h1 class="header-title">${pageTitle}</h1>
      <div class="header-search">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索项目、任务..." id="globalSearch">
      </div>
    </div>
    
    <div class="header-right">
      <div class="header-icon-btn" id="notificationBtn" style="position: relative;">
        <i class="fas fa-bell"></i>
        ${unreadNotifications > 0 ? `<span class="badge">${unreadNotifications > 9 ? '9+' : unreadNotifications}</span>` : ''}
      </div>
      <div class="header-icon-btn" id="darkModeBtn" title="${state.darkMode ? '切换到日间模式' : '切换到夜间模式'}">
        <i class="fas ${state.darkMode ? 'fa-sun' : 'fa-moon'}"></i>
      </div>
      <div class="header-icon-btn" id="helpBtn">
        <i class="fas fa-question-circle"></i>
      </div>
      <div class="header-icon-btn" id="fullscreenBtn">
        <i class="fas fa-expand"></i>
      </div>
    </div>
    
    <div class="notification-list" id="notificationList">
      <div class="notification-header">
        <span class="notification-title">通知</span>
        ${unreadNotifications > 0 ? `<button class="btn btn-sm btn-secondary" id="markAllRead">全部已读</button>` : ''}
      </div>
      <div class="notification-list-content" style="max-height: 400px; overflow-y: auto;">
        ${renderNotificationItems(state.notifications)}
      </div>
    </div>
  `;
  
  const header = document.getElementById('header');
  if (header) {
    header.innerHTML = html;
    attachHeaderEvents();
  }
}

function renderNotificationItems(notifications) {
  if (notifications.length === 0) {
    return `
      <div class="empty-state" style="padding: 32px;">
        <i class="fas fa-bell-slash" style="font-size: 32px;"></i>
        <h3>暂无通知</h3>
        <p class="text-muted">您目前没有新通知</p>
      </div>
    `;
  }
  
  return notifications.slice(0, 10).map(notif => `
    <div class="notification-item ${notif.read ? 'read' : ''}" data-id="${notif.id}">
      <div class="notification-icon ${notif.type}">
        <i class="fas fa-${getNotificationIcon(notif.type)}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-text">${notif.title}</div>
        <div class="notification-text" style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          ${notif.message}
        </div>
        <div class="notification-time">${DateUtils.formatRelativeTime(notif.time)}</div>
      </div>
    </div>
  `).join('');
}

function getNotificationIcon(type) {
  const icons = {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'times-circle'
  };
  return icons[type] || 'info-circle';
}

function attachHeaderEvents() {
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationList = document.getElementById('notificationList');
  
  if (notificationBtn && notificationList) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationList.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
      if (!notificationList.contains(e.target) && !notificationBtn.contains(e.target)) {
        notificationList.classList.remove('active');
      }
    });
    
    const markAllRead = document.getElementById('markAllRead');
    if (markAllRead) {
      markAllRead.addEventListener('click', () => {
        store.markAllNotificationsAsRead();
        renderHeader();
      });
    }
    
    const notificationItems = notificationList.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        store.markNotificationAsRead(id);
        renderHeader();
      });
    });
  }
  
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    let debounceFn = Validate.debounce((value) => {
      store.setState({ searchQuery: value });
      if (value.trim()) {
        performGlobalSearch(value);
      }
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
      debounceFn(e.target.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        performGlobalSearch(e.target.value);
      }
    });
  }
  
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }
  
  const darkModeBtn = document.getElementById('darkModeBtn');
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', toggleDarkMode);
  }
  
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', showHelpModal);
  }
}

function performGlobalSearch(query) {
  const projects = store.searchProjects(query);
  const tasks = store.searchTasks(query);
  
  showSearchResultsModal(query, projects, tasks);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function toggleDarkMode() {
  store.toggleDarkMode();
  const isDark = store.getState().darkMode;
  document.body.classList.toggle('dark-mode', isDark);
  renderHeader();
  renderContent();
}

function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.toggle('open');
    if (overlay) {
      overlay.classList.toggle('active');
    }
  }
}

function showSearchResultsModal(query, projects, tasks) {
  const html = `
    <div class="modal-overlay" id="searchModal">
      <div class="modal-content" style="max-width: 800px; max-height: 80vh;">
        <div class="modal-header">
          <h3 class="modal-title">搜索结果: "${query}"</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('searchModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
          ${projects.length > 0 ? `
            <h4 style="margin-bottom: 16px; color: var(--text-primary);">项目 (${projects.length})</h4>
            <div style="margin-bottom: 24px;">
              ${projects.map(p => `
                <div class="card mb-8 cursor-pointer" onclick="closeModal('searchModal'); store.setState({ currentRoute: 'projects', currentProjectId: '${p.id}' }); router.navigate('projects/${p.id}'); renderContent();">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <h5 style="font-weight: 600; margin-bottom: 4px;">${p.name}</h5>
                      <p class="text-muted text-sm">${p.description}</p>
                    </div>
                    <span class="tag tag-${getStatusTagColor(p.status)}">${getStatusName(p.status)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${tasks.length > 0 ? `
            <h4 style="margin-bottom: 16px; color: var(--text-primary);">任务 (${tasks.length})</h4>
            <div>
              ${tasks.map(t => `
                <div class="card mb-8 cursor-pointer" onclick="closeModal('searchModal'); store.setState({ currentRoute: 'tasks', currentProjectId: '${t.projectId}' }); renderContent();">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                      <h5 style="font-weight: 600; margin-bottom: 4px;">${t.name}</h5>
                      <p class="text-muted text-sm">${t.description}</p>
                    </div>
                    <span class="tag tag-${getPriorityTagColor(t.priority)}">${getPriorityName(t.priority)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${projects.length === 0 && tasks.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-search" style="font-size: 48px;"></i>
              <h3>未找到结果</h3>
              <p class="text-muted">没有找到与 "${query}" 相关的项目或任务</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function showHelpModal() {
  const html = `
    <div class="modal-overlay" id="helpModal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">帮助中心</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('helpModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="mb-24">
            <h4 style="margin-bottom: 12px;"><i class="fas fa-home" style="color: var(--primary-color); margin-right: 8px;"></i>仪表盘</h4>
            <p class="text-muted">查看项目整体概览、统计数据和最近动态</p>
          </div>
          
          <div class="mb-24">
            <h4 style="margin-bottom: 12px;"><i class="fas fa-folder-open" style="color: var(--primary-color); margin-right: 8px;"></i>项目管理</h4>
            <p class="text-muted">管理所有工程项目，包括创建、编辑、删除项目</p>
          </div>
          
          <div class="mb-24">
            <h4 style="margin-bottom: 12px;"><i class="fas fa-tasks" style="color: var(--primary-color); margin-right: 8px;"></i>任务管理</h4>
            <p class="text-muted">管理项目任务，支持看板视图和列表视图</p>
          </div>
          
          <div class="mb-24">
            <h4 style="margin-bottom: 12px;"><i class="fas fa-chart-bar" style="color: var(--primary-color); margin-right: 8px;"></i>甘特图</h4>
            <p class="text-muted">以时间线形式展示任务进度和依赖关系</p>
          </div>
          
          <div class="mb-24">
            <h4 style="margin-bottom: 12px;"><i class="fas fa-users" style="color: var(--primary-color); margin-right: 8px;"></i>人员管理</h4>
            <p class="text-muted">管理团队成员和权限分配</p>
          </div>
          
          <div>
            <h4 style="margin-bottom: 12px;"><i class="fas fa-chart-pie" style="color: var(--primary-color); margin-right: 8px;"></i>统计报表</h4>
            <p class="text-muted">查看项目进度统计和工作量分析</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function showProfileModal() {
  const currentUser = store.getState().currentUser;
  
  const html = `
    <div class="modal-overlay" id="profileModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">个人资料</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('profileModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="text-align: center; margin-bottom: 24px;">
            <div class="avatar avatar-lg" style="margin: 0 auto 16px;">
              ${getInitials(currentUser?.name)}
            </div>
            <h3 style="font-size: 20px; margin-bottom: 4px;">${currentUser?.name}</h3>
            <p class="text-muted">${getRoleName(currentUser?.role)}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input type="email" class="form-input" value="${currentUser?.email || ''}" readonly>
          </div>
          
          <div class="form-group">
            <label class="form-label">部门</label>
            <input type="text" class="form-input" value="${currentUser?.department || ''}" readonly>
          </div>
          
          <div class="form-group">
            <label class="form-label">电话</label>
            <input type="tel" class="form-input" value="${currentUser?.phone || ''}" readonly>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModal('profileModal')">关闭</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderHeader };
}
