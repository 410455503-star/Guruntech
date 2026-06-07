// --- 全局辅助函数 ---
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
    cancelled: '已取消',
    paused: '暂停',
    terminated: '终止'
  };
  return names[status] || status;
}

function getInitials(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

function renderDashboard() {
  const state = store.getState();
  const stats = state.statistics;
  const recentProjects = state.projects.slice(0, 5);
  const recentTasks = state.tasks.slice(0, 6);

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const milestoneRate = stats.totalMilestones > 0 ? Math.round((stats.completedMilestones / stats.totalMilestones) * 100) : 0;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">欢迎回来，${state.currentUser?.name || 'Admin'}</h1>
        <p class="page-description">固润科技项目总览，全生命周期管理项目</p>
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
        <div class="stat-card-trend ${stats.activeProjects > 0 ? 'up' : ''}" style="margin-top: 8px;">
          ${stats.activeProjects > 0 ? '<i class="fas fa-arrow-up"></i>' : ''}
          <span>${stats.activeProjects > 0 ? stats.activeProjects + ' 个进行中' : '暂无活跃项目'}</span>
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
          <i class="fas fa-chart-line"></i>
          <span>占总项目 ${stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0}%</span>
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
        <div class="stat-card-trend ${completionRate >= 50 ? 'up' : ''}" style="margin-top: 8px;">
          ${completionRate >= 50 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-spinner"></i>'}
          <span>完成率 ${completionRate}%</span>
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
        <div class="stat-card-trend ${stats.overdueTasks > 0 ? 'down' : 'up'}" style="margin-top: 8px;">
          ${stats.overdueTasks > 0 ? '<i class="fas fa-exclamation-circle"></i><span>需要关注</span>' : '<i class="fas fa-check-circle"></i><span>全部正常</span>'}
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
          <i class="fas fa-users"></i>
          <span>${state.users.length} 名成员</span>
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
          <i class="fas fa-cubes"></i>
          <span>${stats.totalResources > 0 ? stats.totalResources + ' 项资源' : '-'}</span>
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
        <div class="stat-card-trend ${milestoneRate >= 50 ? 'up' : ''}" style="margin-top: 8px;">
          ${milestoneRate >= 50 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-spinner"></i>'}
          <span>${stats.completedMilestones || 0} 已完成 (${milestoneRate}%)</span>
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
          <i class="fas fa-folder"></i>
          <span>${state.documents.length > 0 ? state.documents.length + ' 份文档' : '-'}</span>
        </div>
      </div>
    </div>

    ${renderPhaseDistribution(state.projects)}
    
    <div class="quick-actions" style="margin-top: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
      <div class="quick-action-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="showCreateProjectModal()">
        <i class="fas fa-plus-circle" style="font-size: 22px; color: #fff; margin-bottom: 6px; display: block;"></i>
        <div style="color: #fff; font-weight: 500; font-size: 12px;">新建项目</div>
      </div>
      <div class="quick-action-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 12px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="showCreateTaskModal()">
        <i class="fas fa-tasks" style="font-size: 22px; color: #fff; margin-bottom: 6px; display: block;"></i>
        <div style="color: #fff; font-weight: 500; font-size: 12px;">新建任务</div>
      </div>
      <div class="quick-action-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 12px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="router.navigate('dailyLog'); renderContent();">
        <i class="fas fa-book" style="font-size: 22px; color: #fff; margin-bottom: 6px; display: block;"></i>
        <div style="color: #fff; font-weight: 500; font-size: 12px;">施工日志</div>
      </div>
      <div class="quick-action-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 12px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="router.navigate('afterSale'); renderContent();">
        <i class="fas fa-headset" style="font-size: 22px; color: #fff; margin-bottom: 6px; display: block;"></i>
        <div style="color: #fff; font-weight: 500; font-size: 12px;">售后工单</div>
      </div>
    </div>
    
    <div class="grid" style="grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px;">
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
          <h3 style="font-size: 18px; font-weight: 600;">项目健康概览</h3>
          <button class="btn btn-secondary btn-sm" onclick="router.navigate('projects'); renderContent();">
            查看全部
          </button>
        </div>
        ${renderProjectHealthOverview(state.projects)}
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
        <p class="text-muted">点击"新建项目"创建第一个污水处理工程项目</p>
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
            ${(project.members || []).slice(0, 3).map(memberId => {
              const member = store.getUserById(memberId);
              return `<div class="project-card-member">${getInitials(member?.name)}</div>`;
            }).join('')}
            ${(project.members || []).length > 3 ? `<div class="project-card-member">+${(project.members || []).length - 3}</div>` : ''}
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
  const state = store.getState();
  const notifications = state.notifications || [];
  
  if (notifications.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-bell" style="font-size: 48px;"></i>
        <h3>暂无动态</h3>
        <p class="text-muted">系统通知和操作记录将显示在这里</p>
      </div>
    `;
  }
  
  function getRelativeTime(isoTime) {
    const now = new Date();
    const time = new Date(isoTime);
    const diffMs = now - time;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return diffMin + '分钟前';
    if (diffHour < 24) return diffHour + '小时前';
    if (diffDay < 30) return diffDay + '天前';
    return DateUtils.formatDate(isoTime);
  }
  
  return notifications.slice(0, 5).map(notification => `
    <div class="timeline-item">
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="timeline-date">${getRelativeTime(notification.time)}</div>
        <div class="timeline-title">
          <strong>${notification.title}</strong>
        </div>
        <div class="timeline-description">${notification.message}</div>
      </div>
    </div>
  `).join('');
}

function renderProjectHealthOverview(projects) {
  if (!projects || projects.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-heartbeat" style="font-size: 48px;"></i>
        <h3>暂无项目数据</h3>
        <p class="text-muted">创建项目后会在此显示健康状态</p>
      </div>
    `;
  }

  function getHealthStatus(project) {
    const progress = store.getProjectProgress(project.id);
    if (project.status === 'completed') return { status: 'completed', label: '已完成', color: 'blue' };
    if (project.status === 'terminated') return { status: 'terminated', label: '已终止', color: 'red' };
    if (project.status === 'paused') return { status: 'paused', label: '已暂停', color: 'yellow' };

    const now = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const totalDuration = end - start;
    
    if (totalDuration <= 0) return { status: 'behind', label: '风险', color: 'red' };
    
    const elapsed = now - start;
    const timePercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

    if (project.status === 'planning' && elapsed > 0) {
      return { status: 'behind', label: '风险', color: 'red' };
    }

    if (progress >= 100) return { status: 'on_track', label: '正常', color: 'green' };
    if (progress >= timePercentage - 10) return { status: 'on_track', label: '正常', color: 'green' };
    if (progress >= timePercentage - 30) return { status: 'at_risk', label: '滞后', color: 'yellow' };
    return { status: 'behind', label: '风险', color: 'red' };
  }

  const healthColorMap = {
    green: 'var(--success-color)',
    yellow: 'var(--warning-color)',
    red: 'var(--danger-color)',
    blue: 'var(--primary-color)'
  };

  return `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border-color);">
            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: var(--text-secondary);">项目名称</th>
            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: var(--text-secondary);">进度</th>
            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: var(--text-secondary);">截止日期</th>
            <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: var(--text-secondary);">健康状态</th>
          </tr>
        </thead>
        <tbody>
          ${projects.slice(0, 8).map(project => {
            const progress = store.getProjectProgress(project.id);
            const health = getHealthStatus(project);
            return `
              <tr style="border-bottom: 1px solid var(--border-color); cursor: pointer;" 
                  onclick="store.setState({ currentRoute: 'projects', currentProjectId: '${project.id}' }); router.navigate('projects/${project.id}'); renderContent();">
                <td style="padding: 14px 16px;">
                  <div style="font-weight: 500;">${project.name}</div>
                </td>
                <td style="padding: 14px 16px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="progress-bar" style="width: 100px; height: 6px;">
                      <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                    </div>
                    <span style="font-size: 13px; font-weight: 600;">${progress}%</span>
                  </div>
                </td>
                <td style="padding: 14px 16px; color: var(--text-secondary);">
                  ${DateUtils.formatDate(project.endDate)}
                </td>
                <td style="padding: 14px 16px;">
                  <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; 
                    background: ${healthColorMap[health.color]}15; color: ${healthColorMap[health.color]};">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${healthColorMap[health.color]};"></span>
                    ${health.label}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderPhaseDistribution(projects) {
  const phaseConfig = {
    civil: { label: '土建施工', icon: 'fa-hard-hat', color: '#f59e0b' },
    mechanical: { label: '机电安装', icon: 'fa-cogs', color: '#3b82f6' },
    commissioning: { label: '工艺调试', icon: 'fa-flask', color: '#8b5cf6' },
    'trial-run': { label: '试运行', icon: 'fa-play-circle', color: '#10b981' }
  };

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');
  const phaseCounts = {};
  activeProjects.forEach(p => {
    const phase = p.phase || 'unknown';
    phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
  });

  const phases = Object.entries(phaseConfig);

  if (activeProjects.length === 0) {
    return `
      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h3 style="font-size: 18px; font-weight: 600;">在建阶段分布</h3>
        </div>
        <div class="empty-state" style="padding: 32px;">
          <i class="fas fa-layer-group" style="font-size: 40px;"></i>
          <p class="text-muted" style="margin-top: 12px;">暂无在建项目，创建项目后可查看阶段分布</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="card" style="margin-top: 24px;">
      <div class="card-header">
        <h3 style="font-size: 18px; font-weight: 600;">在建阶段分布</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 16px 0;">
        ${phases.map(([key, config]) => {
          const count = phaseCounts[key] || 0;
          const percentage = activeProjects.length > 0 ? Math.round((count / activeProjects.length) * 100) : 0;
          return `
            <div style="text-align: center; padding: 20px 12px; border-radius: 12px; background: ${config.color}10; border: 1px solid ${config.color}30;">
              <div style="font-size: 28px; color: ${config.color}; margin-bottom: 8px;">
                <i class="fas ${config.icon}"></i>
              </div>
              <div style="font-size: 24px; font-weight: 700; color: ${config.color}; margin-bottom: 4px;">${count}</div>
              <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">${config.label}</div>
              <div style="height: 4px; background: var(--border-color); border-radius: 2px; overflow: hidden;">
                <div style="height: 100%; width: ${percentage}%; background: ${config.color}; border-radius: 2px;"></div>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${percentage}%</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderDashboard };
}
