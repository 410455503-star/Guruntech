function renderDashboard() {
  const state = store.getState();
  const stats = state.statistics;
  const recentProjects = state.projects.slice(0, 5);
  const recentTasks = state.tasks.slice(0, 6);
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">欢迎回来，${state.currentUser?.name || 'Admin'}</h1>
        <p class="page-description">查看项目整体进展和关键指标</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showCreateProjectModal()">
          <i class="fas fa-plus"></i>
          新建项目
        </button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-folder-open"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.totalProjects}</div>
        <div class="stat-card-label">总项目数</div>
        <div class="stat-card-trend up" style="margin-top: 8px;">
          <i class="fas fa-arrow-up"></i>
          <span>+2 本月新增</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-play"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.activeProjects}</div>
        <div class="stat-card-label">进行中</div>
        <div class="stat-card-trend up" style="margin-top: 8px;">
          <i class="fas fa-arrow-up"></i>
          <span>+1 本周启动</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-tasks"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.totalTasks}</div>
        <div class="stat-card-label">总任务数</div>
        <div class="stat-card-trend" style="margin-top: 8px; color: var(--text-secondary);">
          <span>${stats.completedTasks} 已完成</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon red">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.overdueTasks}</div>
        <div class="stat-card-label">逾期任务</div>
        <div class="stat-card-trend ${stats.overdueTasks > 0 ? 'down' : ''}" style="margin-top: 8px;">
          ${stats.overdueTasks > 0 ? '<i class="fas fa-arrow-down"></i><span>需要关注</span>' : '<span>全部正常</span>'}
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon purple">
            <i class="fas fa-users"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.teamMembers}</div>
        <div class="stat-card-label">团队成员</div>
        <div class="stat-card-trend up" style="margin-top: 8px;">
          <i class="fas fa-arrow-up"></i>
          <span>+4 本月加入</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon orange">
            <i class="fas fa-box"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.totalResources || 0}</div>
        <div class="stat-card-label">资源设备</div>
        <div class="stat-card-trend" style="margin-top: 8px; color: var(--text-secondary);">
          <span>材料与设备</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon cyan">
            <i class="fas fa-flag"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.totalMilestones || 0}</div>
        <div class="stat-card-label">里程碑</div>
        <div class="stat-card-trend" style="margin-top: 8px; color: var(--text-secondary);">
          <span>${stats.completedMilestones || 0} 已完成</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon pink">
            <i class="fas fa-file-text"></i>
          </div>
        </div>
        <div class="stat-card-value">${state.documents.length}</div>
        <div class="stat-card-label">项目文档</div>
        <div class="stat-card-trend" style="margin-top: 8px; color: var(--text-secondary);">
          <span>资料管理</span>
        </div>
      </div>
    </div>
    
    <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 24px;">
      <div>
        <div class="card">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: 600;">项目进度</h3>
            <button class="btn btn-secondary btn-sm" onclick="router.navigate('projects'); renderContent();">
              查看全部
            </button>
          </div>
          ${renderProjectProgressList(recentProjects)}
        </div>
      </div>
      
      <div>
        <div class="card">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: 600;">最近任务</h3>
            <button class="btn btn-secondary btn-sm" onclick="router.navigate('tasks'); renderContent();">
              查看全部
            </button>
          </div>
          ${renderRecentTasks(recentTasks)}
        </div>
      </div>
    </div>
    
    <div style="margin-top: 24px;">
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 600;">团队动态</h3>
        </div>
        <div class="timeline">
          ${renderTeamActivities()}
        </div>
      </div>
    </div>
  `;
  
  return html;
}

function renderProjectProgressList(projects) {
  if (projects.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-folder-open" style="font-size: 48px;"></i>
        <h3>暂无项目</h3>
        <p class="text-muted">点击"新建项目"创建第一个项目</p>
      </div>
    `;
  }
  
  return projects.map(project => {
    const progress = store.getProjectProgress(project.id);
    return `
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div>
            <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 4px; cursor: pointer;" 
                onclick="store.setState({ currentRoute: 'projects', currentProjectId: '${project.id}' }); router.navigate('projects/${project.id}'); renderContent();">
              ${project.name}
            </h4>
            <p class="text-muted text-sm">${project.description}</p>
          </div>
          <span class="tag tag-${getStatusTagColor(project.status)}">${getStatusName(project.status)}</span>
        </div>
        <div class="project-card-progress">
          <div class="progress-label">
            <span class="text-sm">进度</span>
            <span class="progress-percentage">${progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${progress}%;"></div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
          <div class="project-card-members">
            ${project.members.slice(0, 3).map(memberId => {
              const member = store.getUserById(memberId);
              return `<div class="project-card-member">${getInitials(member?.name)}</div>`;
            }).join('')}
            ${project.members.length > 3 ? `<div class="project-card-member">+${project.members.length - 3}</div>` : ''}
          </div>
          <div class="project-card-date">
            <i class="fas fa-calendar"></i>
            ${DateUtils.formatDate(project.endDate)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentTasks(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-tasks" style="font-size: 48px;"></i>
        <h3>暂无任务</h3>
        <p class="text-muted">项目中的任务将显示在这里</p>
      </div>
    `;
  }
  
  return tasks.map(task => {
    const assignee = store.getUserById(task.assigneeId);
    const isOverdue = DateUtils.isPast(task.dueDate) && task.status !== 'completed';
    
    return `
      <div style="display: flex; align-items: start; gap: 12px; padding: 12px; border-radius: 8px; margin-bottom: 12px; background: var(--bg-light);">
        <div class="avatar avatar-sm">
          ${getInitials(assignee?.name)}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 500; margin-bottom: 4px; font-size: 14px;">${task.name}</div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
            <span class="tag tag-${getPriorityTagColor(task.priority)}">${getPriorityName(task.priority)}</span>
            <span class="${isOverdue ? 'text-danger' : 'text-muted'}">
              ${DateUtils.formatDate(task.dueDate)}
            </span>
          </div>
        </div>
        <span class="tag tag-${getStatusTagColor(task.status)}">${getTaskStatusName(task.status)}</span>
      </div>
    `;
  }).join('');
}

function renderTeamActivities() {
  const activities = [
    { user: '李娜', action: '完成了', target: '需求分析与设计任务', time: '2小时前', icon: 'check' },
    { user: '王强', action: '更新了', target: '土建工程进度至55%', time: '5小时前', icon: 'upload' },
    { user: '刘洋', action: '添加了', target: '新成员赵磊到新能源项目', time: '1天前', icon: 'user-plus' },
    { user: '张伟', action: '创建了', target: '系统集成测试任务', time: '2天前', icon: 'plus' },
  ];
  
  return activities.map(activity => `
    <div class="timeline-item">
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="timeline-date">${activity.time}</div>
        <div class="timeline-title">
          <strong>${activity.user}</strong> ${activity.action}
        </div>
        <div class="timeline-description">${activity.target}</div>
      </div>
    </div>
  `).join('');
}

function getStatusTagColor(status) {
  const colors = {
    planning: 'blue',
    active: 'green',
    completed: 'blue',
    paused: 'yellow',
    terminated: 'red'
  };
  return colors[status] || 'blue';
}

function getStatusName(status) {
  const names = {
    planning: '筹备中',
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    terminated: '已终止'
  };
  return names[status] || status;
}

function getPriorityTagColor(priority) {
  const colors = {
    urgent: 'red',
    high: 'yellow',
    medium: 'blue',
    low: 'green'
  };
  return colors[priority] || 'blue';
}

function getPriorityName(priority) {
  const names = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  };
  return names[priority] || priority;
}

function getTaskStatusName(status) {
  const names = {
    todo: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return names[status] || status;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderDashboard };
}
