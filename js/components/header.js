function renderHeader() {
  const state = store.getState();
  const currentUser = state.currentUser;
  const routeNames = {
    dashboard: '仪表盘',
    projects: '项目管理',
    tasks: '任务管理',
    gantt: '甘特图',
    video: '视频监控',
    milestones: '里程碑',
    progress: '进度计划',
    dailyLog: '施工日志',
    budget: '预算管理',
    payment: '费用管理',
    materials: '材料管理',
    afterSale: '售后工单',
    resources: '设备管理',
    documents: '文档管理',
    members: '人员管理',
    temporaryWorkers: '临时用工',
    risks: '风险管理',
    issues: '问题追踪',
    reports: '统计报表',
    notifications: '通知中心',
    settings: '系统设置'
  };
  
  const pageTitle = routeNames[state.currentRoute] || state.currentRoute || '仪表盘';
  const unreadNotifications = state.notifications.filter(n => !n.read).length;
  
  // 构建面包屑导航
  const breadcrumb = [{ label: '首页', active: false }];
  const projectRoutes = ['projects', 'tasks', 'gantt', 'milestones', 'progress', 'dailyLog', 'budget', 'payment', 'materials'];
  
  if (state.currentRoute !== 'dashboard') {
    if (state.currentProjectId && projectRoutes.includes(state.currentRoute)) {
      const project = (state.projects || []).find(p => p.id === state.currentProjectId);
      breadcrumb.push({ label: '项目管理', active: false });
      breadcrumb.push({ label: project ? project.name : '项目详情', active: false });
      breadcrumb.push({ label: pageTitle, active: true });
    } else {
      breadcrumb.push({ label: pageTitle, active: true });
    }
  } else {
    breadcrumb.push({ label: pageTitle, active: true });
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
  
  const html = `
    <div class="header-left">
      <button class="mobile-menu-btn" id="mobileMenuBtn">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="header-title-group">
        <h1 class="header-title">${pageTitle}</h1>
        <div class="header-breadcrumb">
          ${breadcrumb.map((part, index) => {
            return index > 0
              ? `<i class="fas fa-chevron-right breadcrumb-separator"></i><span class="breadcrumb-item${part.active ? ' active' : ''}">${part.label}</span>`
              : `<span class="breadcrumb-item${part.active ? ' active' : ''}">${part.label}</span>`;
          }).join('')}
        </div>
      </div>
      <div class="header-search">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索项目、任务、文档..." id="globalSearch">
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
      <div class="header-user-info" id="headerUserBtn">
        <div class="header-avatar">
          ${getInitials(currentUser?.name)}
        </div>
        <div class="header-user-details">
          <div class="header-user-name">${currentUser?.name}</div>
          <div class="header-user-role">${getRoleName(currentUser?.role)}</div>
        </div>
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
  
  const headerUserBtn = document.getElementById('headerUserBtn');
  if (headerUserBtn) {
    headerUserBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showUserDropdown();
    });
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
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">搜索结果: "${query}"</h3>
        <button class="btn btn-secondary btn-sm" onclick="closeModal('searchModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 20px 24px; max-height: 60vh; overflow-y: auto;">
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
  `;
  
  showModal('searchModal', contentHtml);
}

function showHelpModal() {
  const modules = [
    { icon: 'fa-home', name: '仪表盘', desc: '查看项目整体概览、关键指标统计和最近动态' },
    { icon: 'fa-folder-open', name: '项目管理', desc: '创建、编辑和删除工程项目，配置项目基本信息' },
    { icon: 'fa-tasks', name: '任务管理', desc: '管理项目任务，支持看板视图和列表视图切换' },
    { icon: 'fa-chart-bar', name: '甘特图', desc: '以时间线形式展示任务进度、依赖关系，支持项目折叠筛选' },
    { icon: 'fa-flag', name: '里程碑', desc: '管理各项目关键节点，追踪里程碑完成状态' },
    { icon: 'fa-calendar-alt', name: '进度计划', desc: '制定和跟踪项目进度计划，支持按项目筛选' },
    { icon: 'fa-clipboard-list', name: '施工日志', desc: '记录每日施工情况、人员出勤和工作内容' },
    { icon: 'fa-coins', name: '费用管理', desc: '管理项目收支、预算控制和费用统计分析' },
    { icon: 'fa-boxes', name: '材料管理', desc: '管理材料采购、库存和物流跟踪' },
    { icon: 'fa-headset', name: '售后工单', desc: '处理客户售后问题，跟踪工单进度和处理日志' },
    { icon: 'fa-tools', name: '设备管理', desc: '管理项目设备、工具的采购、安装和投用状态' },
    { icon: 'fa-file-alt', name: '文档管理', desc: '上传和管理项目相关文档、图纸和合同' },
    { icon: 'fa-users', name: '人员管理', desc: '管理团队成员信息和权限分配' },
    { icon: 'fa-user-friends', name: '临时用工', desc: '管理临时工人信息，记录进场和完工状态' },
    { icon: 'fa-exclamation-triangle', name: '风险管理', desc: '识别和跟踪项目风险，设置预警级别' },
    { icon: 'fa-bug', name: '问题追踪', desc: '记录和跟踪项目问题，推动问题闭环解决' },
    { icon: 'fa-chart-pie', name: '统计报表', desc: '查看项目进度统计、费用汇总和工作量分析' }
  ];

  const tips = [
    { icon: 'fa-keyboard', title: '快捷操作', content: '使用侧边栏导航可快速切换各功能模块，侧边栏支持折叠以扩大工作区域' },
    { icon: 'fa-filter', title: '筛选功能', content: '大多数列表页面支持按项目筛选，顶部下拉框可选择具体项目或查看全部数据' },
    { icon: 'fa-save', title: '数据保存', content: '所有数据自动保存到本地存储，刷新页面不会丢失。建议定期导出重要报表' },
    { icon: 'fa-plus-circle', title: '新增数据', content: '各功能页面右上角都有"新增"按钮，点击可快速添加项目、任务、费用等记录' }
  ];

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">帮助中心</h3>
        <button class="btn btn-secondary btn-sm" onclick="closeModal('helpModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px 28px;">
        <!-- 简介 -->
        <div style="background: linear-gradient(135deg, #eff6ff, #eef2ff); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #dbeafe;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px;"><i class="fas fa-info-circle" style="color: #3b82f6; margin-right: 8px;"></i>固润科技项目管理系统</h4>
          <p style="margin: 0; color: #4b5563; font-size: 14px;">本系统涵盖项目管理全流程，从工程立项到售后维护，帮助团队高效协作、实时掌控项目进展。</p>
        </div>

        <!-- 功能模块 -->
        <h4 style="margin: 0 0 16px 0; font-size: 15px; color: #1f2937;"><i class="fas fa-th-large" style="color: #3b82f6; margin-right: 8px;"></i>功能模块</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          ${modules.map(m => `
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px; transition: all 0.15s ease;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: #eff6ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas ${m.icon}" style="color: #3b82f6; font-size: 15px;"></i>
              </div>
              <div style="min-width: 0;">
                <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 2px;">${m.name}</div>
                <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">${m.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 使用提示 -->
        <h4 style="margin: 0 0 16px 0; font-size: 15px; color: #1f2937;"><i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 8px;"></i>使用提示</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          ${tips.map(t => `
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; display: flex; gap: 12px;">
              <i class="fas ${t.icon}" style="color: #f59e0b; font-size: 18px; margin-top: 2px; flex-shrink: 0;"></i>
              <div>
                <div style="font-weight: 600; font-size: 14px; color: #92400e; margin-bottom: 4px;">${t.title}</div>
                <div style="font-size: 12px; color: #a16207; line-height: 1.5;">${t.content}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 底部信息 -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #9ca3af;">
            <i class="fas fa-headset" style="margin-right: 4px;"></i>技术支持：固润科技  |  版本 v2.0
          </p>
        </div>
      </div>
    </div>
  `;

  showModal('helpModal', contentHtml);
}

function showProfileModal() {
  const currentUser = store.getState().currentUser;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">个人资料</h3>
        <button class="btn btn-secondary btn-sm" onclick="closeModal('profileModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
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
      <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: right;">
        <button class="btn btn-primary" onclick="closeModal('profileModal')">关闭</button>
      </div>
    </div>
  `;
  
  showModal('profileModal', contentHtml);
}

function showUserDropdown() {
  const existingDropdown = document.getElementById('userDropdown');
  if (existingDropdown) {
    existingDropdown.remove();
    return;
  }
  
  const html = `
    <div class="user-dropdown" id="userDropdown">
      <div class="user-dropdown-item" id="userDropdownProfile">
        <i class="fas fa-user"></i>
        <span>个人资料</span>
      </div>
      <div class="user-dropdown-divider"></div>
      <div class="user-dropdown-item" id="userDropdownLogout" style="color: var(--danger-color);">
        <i class="fas fa-sign-out-alt"></i>
        <span>退出登录</span>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  
  const headerUserBtn = document.getElementById('headerUserBtn');
  const dropdown = document.getElementById('userDropdown');
  if (headerUserBtn && dropdown) {
    const rect = headerUserBtn.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + 8}px`;
    dropdown.style.right = `${window.innerWidth - rect.right}px`;
  }
  
  document.getElementById('userDropdownProfile')?.addEventListener('click', () => {
    closeUserDropdown();
    showProfileModal();
  });
  
  document.getElementById('userDropdownLogout')?.addEventListener('click', () => {
    closeUserDropdown();
    if (confirm('确定要退出登录吗？')) {
      store.logout();
      renderLogin();
    }
  });
  
  setTimeout(() => {
    document.addEventListener('click', closeUserDropdownOnOutsideClick);
  }, 0);
}

function closeUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.remove();
  }
  document.removeEventListener('click', closeUserDropdownOnOutsideClick);
}

function closeUserDropdownOnOutsideClick(e) {
  const dropdown = document.getElementById('userDropdown');
  const headerUserBtn = document.getElementById('headerUserBtn');
  
  if (dropdown && !dropdown.contains(e.target) && !headerUserBtn?.contains(e.target)) {
    closeUserDropdown();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderHeader };
}
