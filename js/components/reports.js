function renderReports() {
  const state = store.getState();
  const projects = state.projects || [];
  const tasks = state.tasks || [];
  const resources = state.resources || [];
  
  const html = `
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">项目报表</h1>
          <p class="page-description">查看项目日报、周报和月报</p>
        </div>
        <div class="action-bar">
          <div class="view-toggle">
            <button class="active" data-view="daily" title="日报">
              <i class="fas fa-calendar-day"></i>
              日报
            </button>
            <button data-view="weekly" title="周报">
              <i class="fas fa-calendar-week"></i>
              周报
            </button>
            <button data-view="monthly" title="月报">
              <i class="fas fa-calendar-alt"></i>
              月报
            </button>
          </div>
        </div>
      </div>
      
      <div class="grid" style="grid-template-columns: 1fr 3fr; gap: 24px;">
        <div>
          <div class="card">
            <div class="card-header" style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 600;">选择项目</h3>
            </div>
            <div class="project-select-list">
              ${projects.length > 0 ? projects.map(project => `
                <div class="project-select-item" data-project-id="${project.id}">
                  <div class="project-select-name">${project.name}</div>
                  <div class="project-select-status">${getStatusName(project.status)}</div>
                </div>
              `).join('') : '<div style="padding: 20px; color: var(--text-muted);">暂无项目</div>'}
            </div>
          </div>
          
          <div class="card" style="margin-top: 24px;">
            <div class="card-header" style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 600;">时间范围</h3>
            </div>
            <div class="date-range-picker">
              <div style="margin-bottom: 12px;">
                <label>开始日期</label>
                <input type="date" id="reportStartDate" value="${getDefaultStartDate()}">
              </div>
              <div>
                <label>结束日期</label>
                <input type="date" id="reportEndDate" value="${getToday()}">
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div class="card" id="reportContent">
            ${renderDailyReport(tasks, resources)}
          </div>
        </div>
      </div>
    </div>
  `;
  
  return html;
}

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function renderDailyReport(tasks, resources) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const taskList = tasks || [];
  const resourceList = resources || [];
  
  const todayTasks = taskList.filter(t => t.startDate <= todayStr && (!t.dueDate || t.dueDate >= todayStr) && t.status !== 'completed' && t.status !== 'cancelled');
  const completedToday = taskList.filter(t => t.status === 'completed');
  const inProgress = taskList.filter(t => t.status === 'in_progress');
  const todoTasks = taskList.filter(t => t.status === 'todo');
  
  const completedResources = resourceList.filter(r => r.status === 'installed').length;
  const installingResources = resourceList.filter(r => r.status === 'installing').length;
  
  return `
    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-size: 18px; font-weight: 600;">日报 - ${todayStr}</h3>
        <p class="text-muted">项目日报汇总</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="exportReport('daily')">
        <i class="fas fa-download"></i>
        导出
      </button>
    </div>
    
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="stat-card small">
        <div class="stat-card-value">${todayTasks.length}</div>
        <div class="stat-card-label">进行中任务</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">${completedToday.length}</div>
        <div class="stat-card-label">已完成任务</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">${completedResources}</div>
        <div class="stat-card-label">已安装设备</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">${installingResources}</div>
        <div class="stat-card-label">安装中设备</div>
      </div>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">今日任务进度</h4>
      <div class="task-progress-list">
        ${inProgress.length > 0 ? inProgress.slice(0, 5).map(task => {
          const assignee = store.getUserById(task.assigneeId);
          return `
            <div class="task-progress-item">
              <div class="task-progress-header">
                <span class="task-name">${task.name}</span>
                <span class="task-assignee">${assignee?.name || '未分配'}</span>
              </div>
              <div class="task-progress-bar">
                <div class="task-progress-fill" style="width: ${task.progress || 0}%;"></div>
              </div>
              <div class="task-progress-footer">
                <span>${task.progress || 0}%</span>
                <span class="text-muted">截止: ${task.dueDate || '未设置'}</span>
              </div>
            </div>
          `;
        }).join('') : '<div style="padding: 20px; color: var(--text-muted);">暂无进行中的任务</div>'}
      </div>
    </div>
    
    <div>
      <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">待办任务</h4>
      <div class="todo-list">
        ${todoTasks.length > 0 ? todoTasks.slice(0, 5).map(task => {
          const assignee = store.getUserById(task.assigneeId);
          return `
            <div class="todo-item">
              <div class="todo-name">${task.name}</div>
              <div class="todo-meta">
                <span class="tag tag-${getPriorityTagColor(task.priority)}">${getPriorityName(task.priority)}</span>
                <span class="text-muted">${assignee?.name || '未分配'}</span>
              </div>
            </div>
          `;
        }).join('') : '<div style="padding: 20px; color: var(--text-muted);">暂无待办任务</div>'}
      </div>
    </div>
  `;
}

function renderWeeklyReport(tasks, resources) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const taskList = tasks || [];
  
  const weeklyTasks = taskList.filter(t => {
    return t.startDate <= endOfWeek.toISOString().split('T')[0] && 
           (!t.dueDate || t.dueDate >= startOfWeek.toISOString().split('T')[0]);
  });
  
  const completedThisWeek = weeklyTasks.filter(t => t.status === 'completed').length;
  const inProgress = weeklyTasks.filter(t => t.status === 'in_progress').length;
  const avgProgress = weeklyTasks.length > 0 
    ? Math.round(weeklyTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / weeklyTasks.length) 
    : 0;
  
  const completedTasks = weeklyTasks.filter(t => t.status === 'completed');
  
  return `
    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-size: 18px; font-weight: 600;">周报 - ${startOfWeek.toISOString().split('T')[0]} 至 ${endOfWeek.toISOString().split('T')[0]}</h3>
        <p class="text-muted">项目周报汇总</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="exportReport('weekly')">
        <i class="fas fa-download"></i>
        导出
      </button>
    </div>
    
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="stat-card small">
        <div class="stat-card-value">${weeklyTasks.length}</div>
        <div class="stat-card-label">本周任务数</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">${completedThisWeek}</div>
        <div class="stat-card-label">本周完成</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">${inProgress}</div>
        <div class="stat-card-label">进行中</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">${avgProgress}%</div>
        <div class="stat-card-label">平均进度</div>
      </div>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">任务完成趋势</h4>
      <div class="chart-container" style="padding: 20px; color: var(--text-muted);">
        暂无图表数据
      </div>
    </div>
    
    <div>
      <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">本周完成任务</h4>
      <div class="completed-tasks">
        ${completedTasks.length > 0 ? completedTasks.slice(0, 5).map(task => `
          <div class="completed-task-item">
            <i class="fas fa-check-circle" style="color: var(--success-color); margin-right: 12px;"></i>
            <div>
              <div>${task.name}</div>
              <div class="text-muted text-sm">${task.dueDate || '未设置'}</div>
            </div>
          </div>
        `).join('') : '<div style="padding: 20px; color: var(--text-muted);">暂无完成的任务</div>'}
      </div>
    </div>
  `;
}

function renderMonthlyReport(tasks, resources) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const taskList = tasks || [];
  const resourceList = resources || [];
  
  const monthlyTasks = taskList.filter(t => {
    return t.startDate <= endOfMonth.toISOString().split('T')[0] && 
           (!t.dueDate || t.dueDate >= startOfMonth.toISOString().split('T')[0]);
  });
  
  const completedThisMonth = monthlyTasks.filter(t => t.status === 'completed').length;
  const newTasks = monthlyTasks.filter(t => {
    const created = new Date(t.createdAt);
    return created >= startOfMonth && created <= endOfMonth;
  }).length;
  
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
  const endOfMonthStr = endOfMonth.toISOString().split('T')[0];
  const totalBudget = resourceList.filter(r => r.purchaseDate && r.purchaseDate >= startOfMonthStr && r.purchaseDate <= endOfMonthStr).reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const spentBudget = resourceList.filter(r => r.status === 'installed' && r.installedDate && r.installedDate >= startOfMonthStr && r.installedDate <= endOfMonthStr).reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const budgetPercentage = totalBudget > 0 ? (spentBudget / totalBudget * 100) : 0;
  const installedCount = resourceList.filter(r => r.status === 'installed').length;
  const installingCount = resourceList.filter(r => r.status === 'installing' || r.status === 'using').length;
  const resourceTotal = resourceList.length;
  const installedPercent = resourceTotal > 0 ? (installedCount / resourceTotal * 100) : 0;
  const installingPercent = resourceTotal > 0 ? (installingCount / resourceTotal * 100) : 0;
  
  return `
    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h3 style="font-size: 18px; font-weight: 600;">月报 - ${now.getFullYear()}年${now.getMonth() + 1}月</h3>
        <p class="text-muted">项目月报汇总</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="exportReport('monthly')">
        <i class="fas fa-download"></i>
        导出
      </button>
    </div>
    
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="stat-card small">
        <div class="stat-card-value">${monthlyTasks.length}</div>
        <div class="stat-card-label">本月任务数</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">${completedThisMonth}</div>
        <div class="stat-card-label">本月完成</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">${newTasks}</div>
        <div class="stat-card-label">新增任务</div>
      </div>
      <div class="stat-card small">
        <div class="stat-card-value">¥${(spentBudget / 10000).toFixed(1)}万</div>
        <div class="stat-card-label">本月支出</div>
      </div>
    </div>
    
    <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <div>
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">预算使用情况</h4>
        <div class="budget-progress">
          <div class="budget-info">
            <span>总预算</span>
            <span>¥${(totalBudget / 10000).toFixed(1)}万</span>
          </div>
          <div class="budget-bar">
            <div class="budget-fill" style="width: ${budgetPercentage.toFixed(0)}%;"></div>
          </div>
          <div class="budget-info">
            <span>已使用</span>
            <span>¥${(spentBudget / 10000).toFixed(1)}万 (${budgetPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">资源安装状态</h4>
        <div class="resource-status">
          <div class="resource-status-item">
            <div class="resource-status-bar installed" style="width: ${installedPercent.toFixed(0)}%;"></div>
            <span>已安装 (${installedPercent.toFixed(0)}%)</span>
          </div>
          <div class="resource-status-item">
            <div class="resource-status-bar installing" style="width: ${installingPercent.toFixed(0)}%;"></div>
            <span>安装中 (${installingPercent.toFixed(0)}%)</span>
          </div>
        </div>
      </div>
    </div>
    
    <div>
      <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">本月任务完成明细</h4>
      <div class="monthly-task-table">
        ${monthlyTasks.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>任务名称</th>
                <th>负责人</th>
                <th>状态</th>
                <th>进度</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyTasks.slice(0, 8).map(task => {
                const assignee = store.getUserById(task.assigneeId);
                return `
                  <tr>
                    <td>${task.name}</td>
                    <td>${assignee?.name || '未分配'}</td>
                    <td><span class="tag tag-${getStatusTagColor(task.status)}">${getTaskStatusName(task.status)}</span></td>
                    <td>
                      <div class="mini-progress-bar">
                        <div class="mini-progress-fill" style="width: ${task.progress || 0}%;"></div>
                      </div>
                      <span style="margin-left: 8px;">${task.progress || 0}%</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : '<div style="padding: 20px; color: var(--text-muted);">暂无任务数据</div>'}
      </div>
    </div>
  `;
}

function exportReport(type) {
  const content = document.getElementById('reportContent').innerHTML;
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function getStatusTagColor(status) {
  const colors = {
    planning: 'blue',
    active: 'green',
    completed: 'blue',
    paused: 'yellow',
    terminated: 'red',
    todo: 'yellow',
    in_progress: 'green'
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

function getTaskStatusName(status) {
  const names = {
    todo: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
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

function attachReportEvents() {
  const viewButtons = document.querySelectorAll('.view-toggle button');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const view = btn.dataset.view;
      const state = store.getState();
      const content = document.getElementById('reportContent');
      const selectedItem = document.querySelector('.project-select-item.active');
      const projectId = selectedItem ? selectedItem.dataset.projectId : null;
      const tasks = projectId ? state.tasks.filter(t => t.projectId === projectId) : state.tasks;
      const resources = projectId ? state.resources.filter(r => r.projectId === projectId) : state.resources;
      
      if (view === 'daily') {
        content.innerHTML = renderDailyReport(tasks, resources);
      } else if (view === 'weekly') {
        content.innerHTML = renderWeeklyReport(tasks, resources);
      } else if (view === 'monthly') {
        content.innerHTML = renderMonthlyReport(tasks, resources);
      }
    });
  });
  
  const projectItems = document.querySelectorAll('.project-select-item');
  projectItems.forEach(item => {
    item.addEventListener('click', () => {
      projectItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const activeViewBtn = document.querySelector('.view-toggle button.active');
      const view = activeViewBtn ? activeViewBtn.dataset.view : 'daily';
      const state = store.getState();
      const content = document.getElementById('reportContent');
      const projectId = item.dataset.projectId;
      const tasks = state.tasks.filter(t => t.projectId === projectId);
      const resources = state.resources.filter(r => r.projectId === projectId);
      
      if (view === 'daily') {
        content.innerHTML = renderDailyReport(tasks, resources);
      } else if (view === 'weekly') {
        content.innerHTML = renderWeeklyReport(tasks, resources);
      } else if (view === 'monthly') {
        content.innerHTML = renderMonthlyReport(tasks, resources);
      }
    });
  });
}

function initCharts() {
  // 图表初始化函数（预留，暂时不做任何操作
  // 如果需要图表功能，可以在这里添加ECharts或其他图表库的初始化代码
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderReports, attachReportEvents, initCharts };
}