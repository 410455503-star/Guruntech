function renderSidebar() {
  const state = store.getState();
  const currentUser = state.currentUser;
  const resources = state.resources || [];
  const documents = state.documents || [];
  const risks = state.risks || [];
  const issues = state.issues || [];
  const notifications = state.notifications || [];
  
  const html = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-cubes"></i>
        <span>固润工程项目管理</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">核心功能</div>
        <div class="nav-item ${state.currentRoute === 'dashboard' ? 'active' : ''}" data-route="dashboard">
          <i class="fas fa-home"></i>
          <span>仪表盘</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'projects' ? 'active' : ''}" data-route="projects">
          <i class="fas fa-folder-open"></i>
          <span>项目管理</span>
          <span class="nav-badge">${state.statistics.activeProjects}</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'tasks' ? 'active' : ''}" data-route="tasks">
          <i class="fas fa-tasks"></i>
          <span>任务管理</span>
          <span class="nav-badge">${state.statistics.inProgressTasks}</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'gantt' ? 'active' : ''}" data-route="gantt">
          <i class="fas fa-chart-bar"></i>
          <span>甘特图</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'milestones' ? 'active' : ''}" data-route="milestones">
          <i class="fas fa-flag"></i>
          <span>里程碑</span>
        </div>
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">资源与协作</div>
        <div class="nav-item ${state.currentRoute === 'resources' ? 'active' : ''}" data-route="resources">
          <i class="fas fa-tools"></i>
          <span>资源管理</span>
          <span class="nav-badge">${resources.length}</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'documents' ? 'active' : ''}" data-route="documents">
          <i class="fas fa-file-alt"></i>
          <span>文档管理</span>
          <span class="nav-badge">${documents.length}</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'members' ? 'active' : ''}" data-route="members">
          <i class="fas fa-users"></i>
          <span>人员管理</span>
        </div>
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">风险与问题</div>
        <div class="nav-item ${state.currentRoute === 'risks' ? 'active' : ''}" data-route="risks">
          <i class="fas fa-exclamation-triangle"></i>
          <span>风险管理</span>
          <span class="nav-badge">${risks.length}</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'issues' ? 'active' : ''}" data-route="issues">
          <i class="fas fa-bug"></i>
          <span>问题追踪</span>
          <span class="nav-badge">${issues.length}</span>
        </div>
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">分析与报告</div>
        <div class="nav-item ${state.currentRoute === 'reports' ? 'active' : ''}" data-route="reports">
          <i class="fas fa-chart-pie"></i>
          <span>统计报表</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'notifications' ? 'active' : ''}" data-route="notifications">
          <i class="fas fa-bell"></i>
          <span>通知中心</span>
          <span class="nav-badge">${notifications.filter(n => !n.read).length}</span>
        </div>
        <div class="nav-item" data-action="settings">
          <i class="fas fa-cog"></i>
          <span>系统设置</span>
        </div>
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <div class="sidebar-user" data-action="profile">
        <div class="avatar">
          ${getInitials(currentUser?.name || 'Admin')}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; color: white; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${currentUser?.name || 'Admin'}
          </div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${getRoleName(currentUser?.role)}
          </div>
        </div>
        <i class="fas fa-sign-out-alt" style="color: rgba(255, 255, 255, 0.45); cursor: pointer;" data-action="logout"></i>
      </div>
    </div>
  `;
  
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = html;
    attachSidebarEvents();
  }
}

function attachSidebarEvents() {
  const navItems = document.querySelectorAll('.sidebar .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const route = item.dataset.route;
      const action = item.dataset.action;
      
      if (route) {
        store.setState({ currentRoute: route });
        router.navigate(route);
        renderSidebar();
        renderHeader();
        renderContent();
      } else if (action) {
        handleSidebarAction(action);
      }
    });
  });
  
  const sidebarUser = document.querySelector('.sidebar-user');
  if (sidebarUser) {
    sidebarUser.addEventListener('click', (e) => {
      const action = e.target.dataset.action || e.target.closest('.sidebar-user').dataset.action;
      if (action) {
        handleSidebarAction(action);
      }
    });
  }
}

function handleSidebarAction(action) {
  switch (action) {
    case 'profile':
      showProfileModal();
      break;
    case 'logout':
      if (confirm('确定要退出登录吗？')) {
        handleLogout();
      }
      break;
    case 'settings':
      store.setState({ currentRoute: 'settings' });
      router.navigate('settings');
      renderSidebar();
      renderHeader();
      renderContent();
      break;
  }
}

function getInitials(name) {
  if (!name) return 'A';
  return name.charAt(0).toUpperCase();
}

function getRoleName(role) {
  const roleMap = {
    admin: '管理员',
    manager: '项目经理',
    member: '成员'
  };
  return roleMap[role] || '成员';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderSidebar };
}
