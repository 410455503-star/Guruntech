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
        <i class="fas fa-water"></i>
        <span>固润科技项目管理系统</span>
      </div>
      <button class="sidebar-collapse-btn" id="sidebarCollapseBtn" title="折叠侧边栏">
        <i class="fas fa-chevron-left"></i>
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-group">
        <div class="nav-group-title">
          <i class="fas fa-star"></i>
          <span>核心功能</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'dashboard' ? 'active' : ''}" data-route="dashboard">
          <i class="fas fa-home"></i>
          <span>仪表盘</span>
        </div>
        
        <div class="nav-item ${state.currentRoute === 'projects' ? 'active' : ''}" data-route="projects">
          <i class="fas fa-folder-open"></i>
          <span>项目管理</span>
          ${state.statistics.activeProjects > 0 ? `<span class="nav-badge">${state.statistics.activeProjects}</span>` : ''}
        </div>
        <div class="nav-item ${state.currentRoute === 'tasks' ? 'active' : ''}" data-route="tasks">
          <i class="fas fa-tasks"></i>
          <span>任务管理</span>
          ${state.statistics.inProgressTasks > 0 ? `<span class="nav-badge">${state.statistics.inProgressTasks}</span>` : ''}
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
      
      <div class="nav-group-divider"></div>
      
      <div class="nav-group">
        <div class="nav-group-title">
          <i class="fas fa-calendar-alt"></i>
          <span>进度管理</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'progress' ? 'active' : ''}" data-route="progress">
          <i class="fas fa-route"></i>
          <span>进度计划</span>
          ${(state.progressReports || []).length > 0 ? `<span class="nav-badge">${(state.progressReports || []).length}</span>` : ''}
        </div>
        <div class="nav-item ${state.currentRoute === 'dailyLog' ? 'active' : ''}" data-route="dailyLog">
          <i class="fas fa-book"></i>
          <span>施工日志</span>
          ${(state.dailyLogs || []).length > 0 ? `<span class="nav-badge">${(state.dailyLogs || []).length}</span>` : ''}
        </div>
      </div>
      
      <div class="nav-group-divider"></div>
      
      <div class="nav-group">
        <div class="nav-group-title">
          <i class="fas fa-coins"></i>
          <span>成本管理</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'budget' ? 'active' : ''}" data-route="budget">
          <i class="fas fa-money-bill-wave"></i>
          <span>预算管理</span>
          ${(state.budgets || []).length > 0 ? `<span class="nav-badge">${(state.budgets || []).length}</span>` : ''}
        </div>
        <div class="nav-item ${state.currentRoute === 'payment' ? 'active' : ''}" data-route="payment">
          <i class="fas fa-credit-card"></i>
          <span>费用统计</span>
          ${(state.payments || []).length > 0 ? `<span class="nav-badge">${(state.payments || []).length}</span>` : ''}
        </div>
      </div>
      
      <div class="nav-group-divider"></div>
      
      <div class="nav-group">
        <div class="nav-group-title">
          <i class="fas fa-headset"></i>
          <span>售后与资源</span>
        </div>
        
        <div class="nav-item ${state.currentRoute === 'resources' ? 'active' : ''}" data-route="resources">
          <i class="fas fa-tools"></i>
          <span>设备（工具）管理</span>
          ${resources.length > 0 ? `<span class="nav-badge">${resources.length}</span>` : ''}
        </div>
        <div class="nav-item ${state.currentRoute === 'materials' ? 'active' : ''}" data-route="materials">
          <i class="fas fa-boxes"></i>
          <span>材料管理</span>
          ${(state.materials || []).length > 0 ? `<span class="nav-badge">${(state.materials || []).length}</span>` : ''}
        </div>
        <div class="nav-item ${state.currentRoute === 'documents' ? 'active' : ''}" data-route="documents">
          <i class="fas fa-file-alt"></i>
          <span>文档管理</span>
          ${documents.length > 0 ? `<span class="nav-badge">${documents.length}</span>` : ''}
        </div>
        <div class="nav-item ${state.currentRoute === 'members' ? 'active' : ''}" data-route="members">
          <i class="fas fa-users"></i>
          <span>人员管理</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'temporaryWorkers' ? 'active' : ''}" data-route="temporaryWorkers">
          <i class="fas fa-user-plus"></i>
          <span>临时用工</span>
          ${(state.temporaryWorkers || []).length > 0 ? `<span class="nav-badge">${(state.temporaryWorkers || []).length}</span>` : ''}
        </div>
        <div class="nav-item ${state.currentRoute === 'afterSale' ? 'active' : ''}" data-route="afterSale">
          <i class="fas fa-headset"></i>
          <span>售后管理</span>
          ${(state.afterSales || []).length > 0 ? `<span class="nav-badge">${(state.afterSales || []).length}</span>` : ''}
        </div>
      </div>
      
      <div class="nav-group-divider"></div>
      
      <div class="nav-group">
        <div class="nav-group-title">
          <i class="fas fa-shield-alt"></i>
          <span>风险与问题</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'risks' ? 'active' : ''}" data-route="risks">
          <i class="fas fa-exclamation-triangle"></i>
          <span>风险管理</span>
          ${risks.length > 0 ? `<span class="nav-badge">${risks.length}</span>` : ''}
        </div>
        <div class="nav-item ${state.currentRoute === 'issues' ? 'active' : ''}" data-route="issues">
          <i class="fas fa-bug"></i>
          <span>问题追踪</span>
          ${issues.length > 0 ? `<span class="nav-badge">${issues.length}</span>` : ''}
        </div>
      </div>
      
      <div class="nav-group-divider"></div>
      
      <div class="nav-group">
        <div class="nav-group-title">
          <i class="fas fa-chart-line"></i>
          <span>分析与设置</span>
        </div>
        <div class="nav-item ${state.currentRoute === 'reports' ? 'active' : ''}" data-route="reports">
          <i class="fas fa-chart-pie"></i>
          <span>统计报表</span>
        </div>
      </div>
    </nav>
    
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
  
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('collapsed');
        const icon = collapseBtn.querySelector('i');
        if (icon) {
          if (sidebar.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-right';
          } else {
            icon.className = 'fas fa-chevron-left';
          }
        }
      }
    });
  }
  
}

function handleSidebarAction(action) {
  // 暂时没有需要处理的侧边栏操作
}

function getInitials(name) {
  if (!name) return 'A';
  return name.charAt(0).toUpperCase();
}

function getRoleName(role) {
  const roleMap = {
    admin: '系统管理员',
    manager: '项目经理',
    member: '团队成员'
  };
  return roleMap[role] || '团队成员';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderSidebar };
}
