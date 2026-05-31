// 甘特图状态管理
let ganttState = {
  zoomLevel: 1,
  collapsedTasks: new Set(),
  viewMode: 'day' // day, week, month, quarter
};

function renderGantt() {
  const state = store.getState();
  const projects = state.projects.filter(p => p.status === 'active' || p.status === 'planning');
  const tasks = state.tasks.filter(t => t.status !== 'cancelled');
  
  console.log('甘特图数据:', { projects: projects.length, tasks: tasks.length });
  
  const allDates = [];
  projects.forEach(project => {
    allDates.push(new Date(project.startDate));
    allDates.push(new Date(project.endDate));
  });
  tasks.forEach(task => {
    if (task.startDate) allDates.push(new Date(task.startDate));
    if (task.dueDate) allDates.push(new Date(task.dueDate));
  });
  
  if (allDates.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-chart-bar" style="font-size: 64px;"></i>
        <h3>暂无数据</h3>
        <p class="text-muted">创建项目或任务后即可查看甘特图</p>
      </div>
    `;
  }
  
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  
  const startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
  
  const timelineData = generateTimelineData(startMonth, endMonth, ganttState.viewMode);
  const today = new Date();
  
  const html = `
  <div class="page-header" style="margin-bottom: 16px;">
    <div>
      <h1 class="page-title">甘特图</h1>
      <p class="page-description">项目时间线和任务进度可视化 (共 ${tasks.length} 个任务)</p>
    </div>
    <div class="action-bar">
      <div class="view-toggle" style="margin-right: 12px; background: var(--bg-light); border: 2px solid var(--border-color); border-radius: 8px; padding: 4px;">
        <button class="${ganttState.viewMode === 'day' ? 'active' : ''}" onclick="window.changeGanttView && window.changeGanttView('day')" title="日视图" style="border-radius: 6px; padding: 8px 20px; font-weight: 600;">
          <i class="fas fa-calendar-day" style="margin-right: 6px;"></i>日
        </button>
        <button class="${ganttState.viewMode === 'week' ? 'active' : ''}" onclick="window.changeGanttView && window.changeGanttView('week')" title="周视图" style="border-radius: 6px; padding: 8px 20px; font-weight: 600;">
          <i class="fas fa-calendar-week" style="margin-right: 6px;"></i>周
        </button>
        <button class="${ganttState.viewMode === 'month' ? 'active' : ''}" onclick="window.changeGanttView && window.changeGanttView('month')" title="月视图" style="border-radius: 6px; padding: 8px 20px; font-weight: 600;">
          <i class="fas fa-calendar-alt" style="margin-right: 6px;"></i>月
        </button>
        <button class="${ganttState.viewMode === 'quarter' ? 'active' : ''}" onclick="window.changeGanttView && window.changeGanttView('quarter')" title="季度视图" style="border-radius: 6px; padding: 8px 20px; font-weight: 600;">
          <i class="fas fa-layer-group" style="margin-right: 6px;"></i>季
        </button>
      </div>
      <button class="btn btn-secondary" onclick="window.zoomInGantt && window.zoomInGantt()">
        <i class="fas fa-search-plus"></i>
        放大
      </button>
      <button class="btn btn-secondary" onclick="window.zoomOutGantt && window.zoomOutGantt()">
        <i class="fas fa-search-minus"></i>
        缩小
      </button>
    </div>
  </div>
  
  <div class="gantt-container" style="flex: 1; overflow: hidden;">
    <!-- 固定任务信息列 -->
    <div class="gantt-left-col">
      <div class="gantt-header-left">
        任务名称
      </div>
      <div class="gantt-body-left">
        ${renderGanttRowsLeft(projects, tasks)}
      </div>
    </div>
    
    <!-- 可滚动时间线列 -->
    <div class="gantt-right-col">
      <div class="gantt-header-right">
        ${renderGanttTimeline(timelineData, startMonth, today)}
      </div>
      <div class="gantt-body-right">
        ${renderGanttRowsRight(projects, tasks, timelineData, startMonth)}
      </div>
    </div>
  </div>
  `;
  
  return html;
}

// 生成时间线数据
function generateTimelineData(startMonth, endMonth, viewMode) {
  const units = [];
  let current = new Date(startMonth);
  
  switch (viewMode) {
    case 'day':
      while (current <= endMonth) {
        units.push({
          date: new Date(current),
          label: current.getDate(),
          weekLabel: `${DateUtils.getMonthName(current.getMonth(), true)} ${current.getFullYear()}`,
          type: 'day',
          width: 40
        });
        current.setDate(current.getDate() + 1);
      }
      break;
    case 'week':
      while (current.getDay() !== 1) {
        current.setDate(current.getDate() - 1);
      }
      while (current <= endMonth) {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        units.push({
          date: new Date(current),
          label: `W${Math.ceil((current.getDate() + 6) / 7)}`,
          weekLabel: `${DateUtils.getMonthName(current.getMonth(), true)} ${current.getFullYear()}`,
          startDate: new Date(current),
          endDate: weekEnd,
          type: 'week',
          width: 100
        });
        current.setDate(current.getDate() + 7);
      }
      break;
    case 'month':
      while (current <= endMonth) {
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        units.push({
          date: new Date(current),
          label: DateUtils.getMonthName(current.getMonth(), true),
          weekLabel: `${current.getFullYear()}`,
          startDate: new Date(current.getFullYear(), current.getMonth(), 1),
          endDate: monthEnd,
          type: 'month',
          width: 150
        });
        current.setMonth(current.getMonth() + 1);
      }
      break;
    case 'quarter':
      current = new Date(startMonth.getFullYear(), Math.floor(startMonth.getMonth() / 3) * 3, 1);
      while (current <= endMonth) {
        const quarter = Math.floor(current.getMonth() / 3) + 1;
        const quarterEnd = new Date(current.getFullYear(), current.getMonth() + 3, 0);
        units.push({
          date: new Date(current),
          label: `Q${quarter}`,
          weekLabel: `${current.getFullYear()}`,
          startDate: new Date(current),
          endDate: quarterEnd,
          type: 'quarter',
          width: 200
        });
        current.setMonth(current.getMonth() + 3);
      }
      break;
  }
  
  return units;
}

// 切换甘特图视图
function changeGanttView(mode) {
  ganttState.viewMode = mode;
  renderContent();
}

// 切换父任务折叠状态
function toggleParentTask(taskId) {
  if (ganttState.collapsedTasks.has(taskId)) {
    ganttState.collapsedTasks.delete(taskId);
  } else {
    ganttState.collapsedTasks.add(taskId);
  }
  renderContent();
}

function renderGanttTimeline(timelineData, startMonth, today) {
  let monthHtml = '';
  let dayHtml = '';
  
  let currentLabel = timelineData[0]?.weekLabel || '';
  let currentUnits = 0;
  
  timelineData.forEach((unit, index) => {
    const isToday = DateUtils.isSameDay(unit.date, today);
    const dayOfWeek = unit.date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    
    if (unit.weekLabel !== currentLabel) {
      monthHtml += `<div class="gantt-timeline-month" style="min-width: ${currentUnits * (unit.width * ganttState.zoomLevel)}px;">${currentLabel}</div>`;
      currentLabel = unit.weekLabel;
      currentUnits = 0;
    }
    
    currentUnits++;
    
    let dayClass = 'gantt-timeline-day';
    if (isToday) dayClass += ' today';
    
    // 只在日视图模式下才添加周末标记
    if (ganttState.viewMode === 'day') {
      if (isWeekend) dayClass += ' weekend';
      if (isSaturday) dayClass += ' saturday';
      if (isSunday) dayClass += ' sunday';
    }
    
    dayHtml += `
      <div class="${dayClass}" style="min-width: ${unit.width * ganttState.zoomLevel}px;">
        ${unit.label}
      </div>
    `;
  });
  
  if (timelineData.length > 0) {
    monthHtml += `<div class="gantt-timeline-month" style="min-width: ${currentUnits * (timelineData[timelineData.length-1].width * ganttState.zoomLevel)}px;">${currentLabel}</div>`;
  }
  
  return `
    <div class="gantt-timeline-months">
      ${monthHtml}
    </div>
    <div class="gantt-timeline-days">
      ${dayHtml}
    </div>
  `;
}

function renderGanttRows(projects, tasks, timelineData, startMonth) {
  let html = '';
  
  projects.forEach(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    // 渲染项目行
    html += `
      <div class="gantt-row" style="background: rgba(24, 144, 255, 0.05);">
        <div class="gantt-task-info" style="font-weight: 600; background: rgba(24, 144, 255, 0.1);">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-folder" style="color: var(--primary-color);"></i>
              <span class="gantt-task-name">${project.name}</span>
            </div>
            <div style="display: flex; gap: 16px; font-size: 12px; color: var(--text-secondary);">
              <span><i class="fas fa-calendar"></i> ${DateUtils.formatDate(project.startDate)} - ${DateUtils.formatDate(project.endDate)}</span>
              <span><i class="fas fa-users"></i> ${project.members.length} 人</span>
            </div>
          </div>
        </div>
        <div class="gantt-task-bar-container">
          ${renderGanttBar(project.startDate, project.endDate, project.progress, timelineData, startMonth, 'primary')}
        </div>
      </div>
    `;
    
    // 父任务
    const parentTasks = projectTasks.filter(t => !t.parentId);
    parentTasks.forEach(parentTask => {
      const subtasks = projectTasks.filter(t => t.parentId === parentTask.id);
      const assignee = store.getUserById(parentTask.assigneeId);
      const isCollapsed = ganttState.collapsedTasks.has(parentTask.id);
      
      // 渲染父任务
      html += `
        <div class="gantt-row ${subtasks.length > 0 ? 'gantt-parent-task' : ''}">
          <div class="gantt-task-info">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${subtasks.length > 0 ? `
                  <button class="gantt-toggle-btn" onclick="window.toggleParentTask && window.toggleParentTask('${parentTask.id}')">
                    <i class="fas fa-chevron-${isCollapsed ? 'right' : 'down'}"></i>
                  </button>
                ` : '<span style="width: 24px;"></span>'}
                <i class="fas fa-tasks" style="color: ${subtasks.length > 0 ? 'var(--primary-color)' : 'var(--text-secondary)'};"></i>
                <span class="gantt-task-name">${parentTask.name}</span>
                ${subtasks.length > 0 ? `<span class="text-muted" style="font-size: 12px;">(${subtasks.length} 个子任务)</span>` : ''}
              </div>
              <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap; margin-left: ${subtasks.length > 0 ? '28px' : '0'};">
                <span><i class="fas fa-user"></i> ${assignee?.name || '未分配'}</span>
                <span><i class="fas fa-calendar-alt"></i> ${DateUtils.formatDate(parentTask.startDate)}</span>
                <span><i class="fas fa-calendar-check"></i> ${DateUtils.formatDate(parentTask.dueDate)}</span>
                <span class="tag tag-${getPriorityTagColor(parentTask.priority)}" style="padding: 2px 8px; font-size: 11px;">${getPriorityName(parentTask.priority)}</span>
              </div>
            </div>
          </div>
          <div class="gantt-task-bar-container">
            ${parentTask.startDate && parentTask.dueDate ? 
              renderGanttBar(parentTask.startDate, parentTask.dueDate, parentTask.progress, timelineData, startMonth, getTaskBarColor(parentTask.status)) 
              : ''}
          </div>
        </div>
      `;
      
      // 子任务
      if (!isCollapsed) {
        subtasks.forEach(subtask => {
          const subtaskAssignee = store.getUserById(subtask.assigneeId);
          
          html += `
            <div class="gantt-row gantt-subtask">
              <div class="gantt-task-info">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 40px; display: inline-block;"></span>
                    <i class="fas fa-level-down-alt" style="color: var(--text-tertiary);"></i>
                    <span class="gantt-task-name">${subtask.name}</span>
                  </div>
                  <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap; margin-left: 40px;">
                    <span><i class="fas fa-user"></i> ${subtaskAssignee?.name || '未分配'}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${DateUtils.formatDate(subtask.startDate)}</span>
                    <span><i class="fas fa-calendar-check"></i> ${DateUtils.formatDate(subtask.dueDate)}</span>
                    <span class="tag tag-${getPriorityTagColor(subtask.priority)}" style="padding: 2px 8px; font-size: 11px;">${getPriorityName(subtask.priority)}</span>
                  </div>
                </div>
              </div>
              <div class="gantt-task-bar-container">
                ${subtask.startDate && subtask.dueDate ? 
                  renderGanttBar(subtask.startDate, subtask.dueDate, subtask.progress, timelineData, startMonth, getTaskBarColor(subtask.status)) 
                  : ''}
              </div>
            </div>
          `;
        });
      }
    });
  });
  
  return html;
}

// 渲染甘特图左侧任务信息
function renderGanttRowsLeft(projects, tasks) {
  let html = '';
  
  projects.forEach(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    html += `
      <div class="gantt-row-left" style="background: rgba(24, 144, 255, 0.05);">
        <div class="gantt-task-info-left" style="font-weight: 600; background: rgba(24, 144, 255, 0.1);">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-folder" style="color: var(--primary-color);"></i>
              <span class="gantt-task-name">${project.name}</span>
            </div>
            <div style="display: flex; gap: 16px; font-size: 12px; color: var(--text-secondary);">
              <span><i class="fas fa-calendar"></i> ${DateUtils.formatDate(project.startDate)} - ${DateUtils.formatDate(project.endDate)}</span>
              <span><i class="fas fa-users"></i> ${project.members.length} 人</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const parentTasks = projectTasks.filter(t => !t.parentId);
    parentTasks.forEach(parentTask => {
      const subtasks = projectTasks.filter(t => t.parentId === parentTask.id);
      const assignee = store.getUserById(parentTask.assigneeId);
      const isCollapsed = ganttState.collapsedTasks.has(parentTask.id);
      
      html += `
        <div class="gantt-row-left ${subtasks.length > 0 ? 'gantt-parent-task' : ''}">
          <div class="gantt-task-info-left">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${subtasks.length > 0 ? `
                  <button class="gantt-toggle-btn" onclick="window.toggleParentTask && window.toggleParentTask('${parentTask.id}')">
                    <i class="fas fa-chevron-${isCollapsed ? 'right' : 'down'}"></i>
                  </button>
                ` : '<span style="width: 24px;"></span>'}
                <i class="fas fa-tasks" style="color: ${subtasks.length > 0 ? 'var(--primary-color)' : 'var(--text-secondary)'};"></i>
                <span class="gantt-task-name">${parentTask.name}</span>
                ${subtasks.length > 0 ? `<span class="text-muted" style="font-size: 12px;">(${subtasks.length} 个子任务)</span>` : ''}
              </div>
              <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap; margin-left: ${subtasks.length > 0 ? '28px' : '0'};">
                <span><i class="fas fa-user"></i> ${assignee?.name || '未分配'}</span>
                <span><i class="fas fa-calendar-alt"></i> ${DateUtils.formatDate(parentTask.startDate)}</span>
                <span><i class="fas fa-calendar-check"></i> ${DateUtils.formatDate(parentTask.dueDate)}</span>
                <span class="tag tag-${getPriorityTagColor(parentTask.priority)}" style="padding: 2px 8px; font-size: 11px;">${getPriorityName(parentTask.priority)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      
      if (!isCollapsed) {
        subtasks.forEach(subtask => {
          const subtaskAssignee = store.getUserById(subtask.assigneeId);
          
          html += `
            <div class="gantt-row-left gantt-subtask">
              <div class="gantt-task-info-left">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 40px; display: inline-block;"></span>
                    <i class="fas fa-level-down-alt" style="color: var(--text-tertiary);"></i>
                    <span class="gantt-task-name">${subtask.name}</span>
                  </div>
                  <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap; margin-left: 40px;">
                    <span><i class="fas fa-user"></i> ${subtaskAssignee?.name || '未分配'}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${DateUtils.formatDate(subtask.startDate)}</span>
                    <span><i class="fas fa-calendar-check"></i> ${DateUtils.formatDate(subtask.dueDate)}</span>
                    <span class="tag tag-${getPriorityTagColor(subtask.priority)}" style="padding: 2px 8px; font-size: 11px;">${getPriorityName(subtask.priority)}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      }
    });
  });
  
  return html;
}

// 渲染甘特图右侧时间线
function renderGanttRowsRight(projects, tasks, timelineData, startMonth) {
  let html = '';
  
  // 生成周末背景单元格（仅在日视图模式下）
  const renderWeekendBackground = () => {
    let bgHtml = '';
    timelineData.forEach(unit => {
      let bgClass = 'gantt-bg-cell';
      
      // 只在日视图模式下才添加周末背景
      if (ganttState.viewMode === 'day') {
        const dayOfWeek = unit.date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isSaturday = dayOfWeek === 6;
        const isSunday = dayOfWeek === 0;
        
        if (isWeekend) bgClass += ' weekend-bg';
        if (isSaturday) bgClass += ' saturday-bg';
        if (isSunday) bgClass += ' sunday-bg';
      }
      
      bgHtml += `<div class="${bgClass}" style="min-width: ${unit.width * ganttState.zoomLevel}px;"></div>`;
    });
    return bgHtml;
  };
  
  projects.forEach(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    
    html += `
      <div class="gantt-row-right" style="background: rgba(24, 144, 255, 0.05);">
        <div class="gantt-task-bar-container">
          <div class="gantt-bg-row">${renderWeekendBackground()}</div>
          ${renderGanttBar(project.startDate, project.endDate, project.progress, timelineData, startMonth, 'primary')}
        </div>
      </div>
    `;
    
    const parentTasks = projectTasks.filter(t => !t.parentId);
    parentTasks.forEach(parentTask => {
      const subtasks = projectTasks.filter(t => t.parentId === parentTask.id);
      const isCollapsed = ganttState.collapsedTasks.has(parentTask.id);
      
      html += `
        <div class="gantt-row-right ${subtasks.length > 0 ? 'gantt-parent-task' : ''}">
          <div class="gantt-task-bar-container">
            <div class="gantt-bg-row">${renderWeekendBackground()}</div>
            ${parentTask.startDate && parentTask.dueDate ? 
              renderGanttBar(parentTask.startDate, parentTask.dueDate, parentTask.progress, timelineData, startMonth, getTaskBarColor(parentTask.status)) 
              : ''}
          </div>
        </div>
      `;
      
      if (!isCollapsed) {
        subtasks.forEach(subtask => {
          html += `
            <div class="gantt-row-right gantt-subtask">
              <div class="gantt-task-bar-container">
                <div class="gantt-bg-row">${renderWeekendBackground()}</div>
                ${subtask.startDate && subtask.dueDate ? 
                  renderGanttBar(subtask.startDate, subtask.dueDate, subtask.progress, timelineData, startMonth, getTaskBarColor(subtask.status)) 
                  : ''}
              </div>
            </div>
          `;
        });
      }
    });
  });
  
  return html;
}

// 根据时间线数据渲染任务条
function renderGanttBar(startDateStr, endDateStr, progress, timelineData, startMonth, colorType) {
  if (!timelineData || timelineData.length === 0) return '';
  
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  let startIndex = 0;
  let endIndex = timelineData.length - 1;
  
  for (let i = 0; i < timelineData.length; i++) {
    const unit = timelineData[i];
    const unitStart = unit.startDate || unit.date;
    const unitEnd = unit.endDate || unit.date;
    
    if (startDate <= unitEnd && startIndex === 0) {
      startIndex = i;
    }
    if (endDate >= unitStart) {
      endIndex = i;
    }
  }
  
  const startOffset = timelineData.slice(0, startIndex).reduce((sum, unit) => sum + (unit.width * ganttState.zoomLevel), 0);
  const barWidth = timelineData.slice(startIndex, endIndex + 1).reduce((sum, unit) => sum + (unit.width * ganttState.zoomLevel), 0);
  
  const colorClass = getBarColorClass(colorType);
  
  return `
    <div class="gantt-task-bar ${colorClass}" style="left: ${startOffset}px; width: ${Math.max(barWidth, 20)}px;">
      <div class="gantt-task-bar-progress" style="width: ${progress}%;"></div>
      <span class="gantt-task-bar-text">${progress}%</span>
    </div>
  `;
}

function getBarColorClass(colorType) {
  const colorMap = {
    'primary': 'primary',
    'warning': 'warning',
    'success': 'success',
    'danger': 'danger',
    'info': 'info'
  };
  return colorMap[colorType] || 'primary';
}

function getTaskBarColor(status) {
  const colors = {
    todo: 'primary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  };
  return colors[status] || 'primary';
}

function getStatusName(status) {
  const statusMap = {
    planning: '筹备中',
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    terminated: '已终止'
  };
  return statusMap[status] || status;
}

function getTaskStatusName(status) {
  const statusMap = {
    todo: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
}

function getPriorityName(priority) {
  const priorityMap = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  };
  return priorityMap[priority] || priority;
}

function getStatusTagColor(status) {
  const colorMap = {
    planning: 'primary',
    active: 'warning',
    completed: 'success',
    paused: 'secondary',
    terminated: 'danger',
    todo: 'primary',
    in_progress: 'warning',
    cancelled: 'danger'
  };
  return colorMap[status] || 'secondary';
}

function getPriorityTagColor(priority) {
  const colorMap = {
    urgent: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'success'
  };
  return colorMap[priority] || 'secondary';
}

function zoomInGantt() {
  ganttState.zoomLevel = Math.min(ganttState.zoomLevel * 1.2, 3);
  renderContent();
}

function zoomOutGantt() {
  ganttState.zoomLevel = Math.max(ganttState.zoomLevel / 1.2, 0.5);
  renderContent();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderGantt };
}

// 暴露到全局作用域
window.changeGanttView = changeGanttView;
window.toggleParentTask = toggleParentTask;
window.zoomInGantt = zoomInGantt;
window.zoomOutGantt = zoomOutGantt;

// 同步甘特图左右滚动
function syncGanttScroll() {
  setTimeout(() => {
    const leftBody = document.querySelector('.gantt-body-left');
    const rightBody = document.querySelector('.gantt-body-right');
    const rightHeader = document.querySelector('.gantt-header-right');
    
    if (leftBody && rightBody) {
      let isSyncing = false;
      
      leftBody.addEventListener('scroll', () => {
        if (!isSyncing) {
          isSyncing = true;
          rightBody.scrollTop = leftBody.scrollTop;
          isSyncing = false;
        }
      });
      
      rightBody.addEventListener('scroll', () => {
        if (!isSyncing) {
          isSyncing = true;
          leftBody.scrollTop = rightBody.scrollTop;
          if (rightHeader) {
            rightHeader.scrollLeft = rightBody.scrollLeft;
          }
          isSyncing = false;
        }
      });
      
      if (rightHeader) {
        rightHeader.addEventListener('scroll', () => {
          if (!isSyncing) {
            isSyncing = true;
            rightBody.scrollLeft = rightHeader.scrollLeft;
            isSyncing = false;
          }
        });
      }
    }
  }, 100);
}

window.syncGanttScroll = syncGanttScroll;
