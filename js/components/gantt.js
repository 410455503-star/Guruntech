// 甘特图状态管理
let ganttState = {
  zoomLevel: 1,
  collapsedTasks: new Set(),
  collapsedProjects: new Set(),
  viewMode: 'day', // day, week, month, quarter
  selectedProjectId: '' // 用于筛选项目
};

window.ganttState = ganttState;

// 防止重复绑定标记（在 gantt DOM 被销毁重建时需重置）
var _ganttScrollBound = false;
var _ganttObserverBound = false;
var _ganttSyncingScroll = false;
var _ganttRowHeightSyncing = false;
var _ganttRowHeightSyncTimer = null;
var _ganttMutationObserver = null;
window._ganttDelayTimers = window._ganttDelayTimers || [];

// 进度条拖拽状态
let progressDragState = {
  isDragging: false,
  taskId: null,
  barElement: null,
  startX: 0,
  currentProgress: 0
};

function renderGantt() {
  // DOM 将被完全重建：重置所有绑定标记、断开旧 Observer、清理所有定时器
  _ganttScrollBound = false;
  _ganttObserverBound = false;
  _ganttSyncingScroll = false;
  _ganttRowHeightSyncing = false;
  if (_ganttRowHeightSyncTimer) {
    cancelAnimationFrame(_ganttRowHeightSyncTimer);
    _ganttRowHeightSyncTimer = null;
  }
  // 清理延迟行高同步定时器，防止旧定时器在新 DOM 上触发 scrollTop 弹跳
  if (window._ganttDelayTimers) {
    window._ganttDelayTimers.forEach(function(t) { clearTimeout(t); });
    window._ganttDelayTimers = [];
  }
  if (_ganttMutationObserver) {
    _ganttMutationObserver.disconnect();
    _ganttMutationObserver = null;
  }
  if (window._ganttResizeObserver) {
    window._ganttResizeObserver.disconnect();
    window._ganttResizeObserver = null;
  }
  
  const state = store.getState();
  const allProjects = state.projects.filter(p => p.status === 'active' || p.status === 'planning');
  
  // 根据筛选条件过滤项目
  const projects = ganttState.selectedProjectId 
    ? allProjects.filter(p => p.id === ganttState.selectedProjectId)
    : allProjects;
  
  const tasks = state.tasks.filter(t => t.status !== 'cancelled');
  
  // 过滤任务只显示选中项目的任务
  const filteredTasks = ganttState.selectedProjectId
    ? tasks.filter(t => t.projectId === ganttState.selectedProjectId)
    : tasks;
  
  console.log('甘特图数据:', { projects: projects.length, tasks: filteredTasks.length });
  
  // 计算关键路径（仅含有 dependsOn 字段的任务才有意义，其他任务按时长排）
  updateCriticalPath(filteredTasks);
  
  const allDates = [];
  projects.forEach(project => {
    if (project.startDate) {
      try {
        const date = new Date(project.startDate);
        if (!isNaN(date.getTime())) allDates.push(date);
      } catch (e) {}
    }
    if (project.endDate) {
      try {
        const date = new Date(project.endDate);
        if (!isNaN(date.getTime())) allDates.push(date);
      } catch (e) {}
    }
  });
  filteredTasks.forEach(task => {
    if (task.startDate) {
      try {
        const date = new Date(task.startDate);
        if (!isNaN(date.getTime())) allDates.push(date);
      } catch (e) {}
    }
    if (task.dueDate) {
      try {
        const date = new Date(task.dueDate);
        if (!isNaN(date.getTime())) allDates.push(date);
      } catch (e) {}
    }
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
  
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const adjustedMinDate = todayMidnight < minDate ? todayMidnight : minDate;
  const adjustedMaxDate = todayMidnight > maxDate ? todayMidnight : maxDate;
  
  const startMonth = new Date(adjustedMinDate.getFullYear(), adjustedMinDate.getMonth(), 1);
  const endMonth = new Date(adjustedMaxDate.getFullYear(), adjustedMaxDate.getMonth() + 1, 0);
  
  const timelineData = generateTimelineData(startMonth, endMonth, ganttState.viewMode);
  
  const html = `
  <div class="gantt-page-wrapper" style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
    <div class="page-header" style="margin-bottom: 16px; flex-shrink: 0;">
      <div>
        <h1 class="page-title">甘特图</h1>
        <p class="page-description">项目时间线和任务进度可视化 (共 ${filteredTasks.length} 个任务)</p>
      </div>
      <div class="action-bar" style="display: flex; gap: 16px; align-items: center;">
        <select class="form-input" style="width: 250px;" onchange="window.changeGanttProjectFilter(this.value)">
          <option value="">全部项目</option>
          ${allProjects.map(p => `<option value="${p.id}" ${ganttState.selectedProjectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
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
        <button class="btn btn-primary" onclick="window.scrollGanttToToday && window.scrollGanttToToday(true)" title="跳转到今日" style="background: linear-gradient(135deg, #10b981, #059669); border: none;">
          <i class="fas fa-crosshairs"></i>
          今日
        </button>
      </div>
    </div>
    
    <div class="gantt-container">
      <!-- 固定任务信息列 -->
      <div class="gantt-left-col">
        <div class="gantt-header-left">
          任务名称
        </div>
        <div class="gantt-body-left">
          ${renderGanttRowsLeft(projects, filteredTasks)}
        </div>
      </div>
      
      <!-- 可滚动时间线列 -->
      <div class="gantt-right-col" style="position: relative;">
        <div class="gantt-header-right">
          ${renderGanttTimeline(timelineData, startMonth, today)}
        </div>
        <div class="gantt-body-right" id="gantt-body-right-scroll">
          ${renderGanttRowsRight(projects, filteredTasks, timelineData, startMonth)}
          <!-- 依赖关系箭头 SVG 层（由 JS 动态绘制） -->
          <svg id="gantt-dependency-arrows" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 8;"></svg>
        </div>
        <!-- 今日线：放在 right-col 层级，延伸到内容底部 -->
        ${renderTodayLine(timelineData, today)}
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
      current = DateUtils.getStartOfWeek(current);
      while (current <= endMonth) {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        // 计算当月第几周：基于当月1号的星期偏移
        const firstDayOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
        const firstDayOffset = (firstDayOfMonth.getDay() + 6) % 7; // 周一=0
        const weekNum = Math.ceil((current.getDate() + firstDayOffset) / 7);
        units.push({
          date: new Date(current),
          label: `W${weekNum}`,
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
      <div class="${dayClass}" style="min-width: ${unit.width * ganttState.zoomLevel}px; position: relative;">
        ${unit.label}
        ${isToday ? '<div class="gantt-today-cell" style="position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(16,185,129,0.12);z-index:0;"></div>' : ''}
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

// 计算任务的汇总进度（基于子任务完成百分比自动计算）
function calculateRollupProgress(task, allTasks) {
  const subtasks = allTasks.filter(t => t.parentId === task.id);
  if (subtasks.length === 0) {
    return task.progress || 0;
  }
  const completedSubtasks = subtasks.filter(t => t.status === 'completed').length;
  const inProgressSubtasks = subtasks.filter(t => t.status === 'in_progress');
  const inProgressWeight = inProgressSubtasks.reduce((sum, t) => sum + (t.progress || 0), 0) / 100;
  return Math.round(((completedSubtasks + inProgressWeight) / subtasks.length) * 100);
}

// 递归渲染任务树（支持无限级子任务）
function renderTaskTree(task, allTasks, depth = 0) {
  const subtasks = allTasks.filter(t => t.parentId === task.id);
  const assignee = store.getUserById(task.assigneeId);
  const isCollapsed = ganttState.collapsedTasks.has(task.id);
  const hasChildren = subtasks.length > 0;
  const rollupProgress = calculateRollupProgress(task, allTasks);
  const indent = depth * 24;
  
  let html = `
    <div class="gantt-row-left ${hasChildren ? 'gantt-parent-task' : ''}" data-task-id="${task.id}" style="position: relative;">
      <div class="gantt-task-info-left">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div class="gantt-task-name-row" style="display: flex; align-items: center; gap: 6px; min-height: 22px;">
            <span style="width: ${indent}px; display: inline-block;"></span>
            ${hasChildren ? `
              <button class="gantt-toggle-btn" onclick="window.toggleParentTask && window.toggleParentTask('${task.id}')">
                <i class="fas fa-chevron-${isCollapsed ? 'right' : 'down'}"></i>
              </button>
            ` : '<span style="width: 20px;"></span>'}
            <i class="fas ${hasChildren ? 'fa-folder' : 'fa-file-text'}" style="color: ${hasChildren ? 'var(--primary-color)' : 'var(--text-secondary)'}; font-size: 13px;"></i>
            <span class="gantt-task-name" style="font-size: 13px;">${task.name}</span>
            ${hasChildren ? `<span class="text-muted" style="font-size: 11px;">(${subtasks.length}个)</span>` : ''}
            <!-- 汇总进度：放在第一行任务名称右侧 -->
            ${hasChildren ? `<span style="display: inline-flex; align-items: center; gap: 3px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; padding: 0 6px; border-radius: 10px; font-size: 10px; font-weight: 600; flex-shrink: 0; line-height: 18px; margin-left: auto;" title="汇总进度: ${rollupProgress}%"><i class="fas fa-chart-pie" style="font-size: 9px;"></i> ${rollupProgress}%</span>` : ''}
          </div>
          <div class="gantt-task-meta-row" style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); flex-wrap: nowrap; overflow: hidden; min-height: 18px; line-height: 1.2; margin-left: ${indent + (hasChildren ? 24 : 0)}px;">
            <!-- 负责人：限制最大宽度，超出省略（56px可容纳3-4个中文字） -->
            <span style="display: flex; align-items: center; gap: 3px; max-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${assignee?.name || '未分配'}">
              <i class="fas fa-user" style="font-size: 10px; flex-shrink: 0;"></i>
              <span>${assignee?.name || '未分配'}</span>
            </span>
            <span style="color: var(--border-color); flex-shrink: 0;">|</span>
            <!-- 短日期格式 -->
            <span style="display: flex; align-items: center; gap: 3px; flex-shrink: 0;">
              <i class="fas fa-calendar-alt" style="font-size: 10px;"></i> ${formatGanttDate(task.startDate)}
            </span>
            <span style="flex-shrink: 0;">→</span>
            <span style="display: flex; align-items: center; gap: 3px; flex-shrink: 0;">
              <i class="fas fa-calendar-check" style="font-size: 10px;"></i> ${formatGanttDate(task.dueDate)}
            </span>
            <!-- 优先级：紧凑标签 -->
            <span class="tag tag-${getPriorityTagColor(task.priority)}" style="padding: 0 5px; font-size: 10px; border-radius: 8px; flex-shrink: 0;">${getPriorityName(task.priority)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  if (!isCollapsed && hasChildren) {
    subtasks.forEach(subtask => {
      html += renderTaskTree(subtask, allTasks, depth + 1);
    });
  }
  
  return html;
}

// 渲染甘特图左侧任务信息
function renderGanttRowsLeft(projects, tasks) {
  let html = '';
  
  projects.forEach(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const isProjectCollapsed = ganttState.collapsedProjects.has(project.id);
    
    html += `
      <div class="gantt-row-left" style="background: rgba(24, 144, 255, 0.05); position: relative;">
        <div class="gantt-task-info-left" style="font-weight: 600; background: rgba(24, 144, 255, 0.1);">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div class="gantt-task-name-row" style="display: flex; align-items: center; gap: 6px; min-height: 22px;">
              <button class="gantt-toggle-btn" onclick="window.toggleGanttProject && window.toggleGanttProject('${project.id}')" style="padding: 1px 3px;">
                <i class="fas fa-chevron-${isProjectCollapsed ? 'right' : 'down'}"></i>
              </button>
              <i class="fas fa-folder${isProjectCollapsed ? '' : '-open'}" style="color: var(--primary-color); font-size: 13px;"></i>
              <span class="gantt-task-name" style="font-size: 13px;">${project.name}</span>
            </div>
            <div class="gantt-task-meta-row" style="display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--text-secondary); flex-wrap: nowrap; overflow: hidden; min-height: 18px; line-height: 1.2;">
              <span style="display: flex; align-items: center; gap: 3px;"><i class="fas fa-calendar" style="font-size: 10px;"></i> ${formatGanttDate(project.startDate)} → ${formatGanttDate(project.endDate)}</span>
              <span style="display: flex; align-items: center; gap: 3px;"><i class="fas fa-users" style="font-size: 10px;"></i> ${project.members.length}人</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    if (!isProjectCollapsed) {
      const parentTasks = projectTasks.filter(t => !t.parentId);
      parentTasks.forEach(parentTask => {
        html += renderTaskTree(parentTask, projectTasks, 0);
      });
    }
  });
  
  return html;
}

// 递归渲染任务树的进度条（支持无限级子任务和汇总进度）
function renderTaskTreeRight(task, allTasks, timelineData, startMonth) {
  const subtasks = allTasks.filter(t => t.parentId === task.id);
  const isCollapsed = ganttState.collapsedTasks.has(task.id);
  const hasChildren = subtasks.length > 0;
  const rollupProgress = hasChildren ? calculateRollupProgress(task, allTasks) : (task.progress || 0);
  
  const isCritical = ganttCriticalPathIds.has(task.id);
  const criticalStyle = isCritical ? 'box-shadow: 0 0 0 2px #ef4444 inset, 0 2px 8px rgba(239,68,68,0.25); position: relative;' : '';
  const criticalBadge = isCritical ? `<span title="关键路径" style="position: absolute; top: -8px; right: 2px; background: #ef4444; color: #fff; font-size: 10px; padding: 1px 5px; border-radius: 6px; font-weight: 700; z-index: 5; letter-spacing: 0.5px;">关键</span>` : '';

    let html = `
    <div class="gantt-row-right ${hasChildren ? 'gantt-parent-task' : ''}" data-task-id="${task.id}" style="position: relative;">
      <div class="gantt-task-bar-container" style="${criticalStyle}">
        ${criticalBadge}
        <div class="gantt-bg-row">${renderWeekendBackground()}</div>
        ${task.startDate && task.dueDate ? 
          renderGanttBar(task.startDate, task.dueDate, rollupProgress, timelineData, startMonth, hasChildren ? 'primary' : getTaskBarColor(task.status), task.id, task.name) 
          : ''}
        ${hasChildren ? `<span style="position: absolute; right: 8px; font-size: 11px; color: #3b82f6; font-weight: 600;">汇总 ${rollupProgress}%</span>` : ''}
      </div>
    </div>
  `;
  
  if (!isCollapsed && hasChildren) {
    subtasks.forEach(subtask => {
      html += renderTaskTreeRight(subtask, allTasks, timelineData, startMonth);
    });
  }
  
  return html;
}

// 生成周末背景单元格（仅在日视图模式下）
function renderWeekendBackground() {
  let bgHtml = '';
  const timelineData = getCurrentTimelineData();
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
}

// 获取当前时间线数据
function getCurrentTimelineData() {
  const state = store.getState();
  const allProjects = state.projects.filter(p => p.status === 'active' || p.status === 'planning');
  const projects = ganttState.selectedProjectId 
    ? allProjects.filter(p => p.id === ganttState.selectedProjectId)
    : allProjects;
  const tasks = state.tasks.filter(t => t.status !== 'cancelled');
  const filteredTasks = ganttState.selectedProjectId
    ? tasks.filter(t => t.projectId === ganttState.selectedProjectId)
    : tasks;
  
  const allDates = [];
  projects.forEach(project => {
    allDates.push(new Date(project.startDate));
    allDates.push(new Date(project.endDate));
  });
  filteredTasks.forEach(task => {
    if (task.startDate) allDates.push(new Date(task.startDate));
    if (task.dueDate) allDates.push(new Date(task.dueDate));
  });
  
  if (allDates.length === 0) return [];
  
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
  
  return generateTimelineData(startMonth, endMonth, ganttState.viewMode);
}

// 渲染甘特图右侧时间线
function renderGanttRowsRight(projects, tasks, timelineData, startMonth) {
  let html = '';
  
  projects.forEach(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const isProjectCollapsed = ganttState.collapsedProjects.has(project.id);
    
    html += `
      <div class="gantt-row-right" style="background: rgba(24, 144, 255, 0.05);">
        <div class="gantt-task-bar-container">
          <div class="gantt-bg-row">${renderWeekendBackground()}</div>
          ${renderGanttBar(project.startDate, project.endDate, project.progress, timelineData, startMonth, 'primary', 'project-' + project.id, project.name)}
        </div>
      </div>
    `;
    
    if (!isProjectCollapsed) {
      const parentTasks = projectTasks.filter(t => !t.parentId);
      parentTasks.forEach(parentTask => {
        html += renderTaskTreeRight(parentTask, projectTasks, timelineData, startMonth);
      });
    }
  });
  
  return html;
}

// 根据时间线数据渲染任务条
// Bug Fix #3: 修复 startIndex 计算逻辑，引入 startIndexFound 标志位避免 index=0 误判
// 优化：任务名称显示在条上，添加阴影和圆角
function renderGanttBar(startDateStr, endDateStr, progress, timelineData, startMonth, colorType, taskId, taskName) {
  if (!timelineData || timelineData.length === 0) return '';
  if (!startDateStr || !endDateStr) return '';
  
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '';
  
  let startIndex = 0;
  let endIndex = timelineData.length - 1;
  let startIndexFound = false;
  
  for (let i = 0; i < timelineData.length; i++) {
    const unit = timelineData[i];
    const unitStart = unit.startDate || unit.date;
    const unitEnd = unit.endDate || unit.date;
    
    const taskStartMs = startDate.getTime();
    const taskEndMs = endDate.getTime();
    const unitStartMs = new Date(unitStart).getTime();
    const unitEndMs = new Date(unitEnd).getTime();
    
    // 找到第一个"任务开始日期 <= 单元结束日期"的格子作为起始格
    if (!startIndexFound && taskStartMs <= unitEndMs) {
      startIndex = i;
      startIndexFound = true;
    }
    // 找到最后一个"任务结束日期 >= 单元开始日期"的格子作为终止格
    if (taskEndMs >= unitStartMs) {
      endIndex = i;
    }
  }
  
  // 如果任务完全在时间轴范围之外，不渲染
  if (!startIndexFound) return '';
  
  const startOffset = timelineData.slice(0, startIndex).reduce((sum, unit) => sum + (unit.width * ganttState.zoomLevel), 0);
  const barWidth = timelineData.slice(startIndex, endIndex + 1).reduce((sum, unit) => sum + (unit.width * ganttState.zoomLevel), 0);
  
  const colorClass = getBarColorClass(colorType);
  const gradientColors = {
    primary: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
    success: 'linear-gradient(135deg, #10b981, #059669)',
    danger: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #06b6d4, #0891b2)'
  };
  const bgGradient = gradientColors[colorType] || gradientColors.primary;
  
  // 任务名称标签：宽度足够时显示在条上
  const nameLabel = (taskName && barWidth > 70)
    ? `<span class="gantt-bar-label" style="position:absolute;left:6px;top:0;line-height:28px;color:#fff;font-size:11px;font-weight:600;text-shadow:0 1px 2px rgba(0,0,0,0.35);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:${barWidth - 44}px;z-index:2;">${taskName}</span>`
    : '';
  
  // 获取任务详情用于 tooltip（仅任务，非项目行）
  const isProjectBar = taskId && taskId.toString().startsWith('project-');
  const tooltipAttrs = (!isProjectBar && taskId) ? `data-gantt-tooltip="${taskId}"` : '';

  return `
    <div class="gantt-task-bar ${colorClass}" ${tooltipAttrs} data-task-id="${taskId || ''}"
      style="left:${startOffset}px;width:${Math.max(barWidth, 20)}px;height:28px;border-radius:7px;background:${bgGradient};box-shadow:0 2px 8px rgba(0,0,0,0.18);position:relative;cursor:pointer;transition:box-shadow 0.15s,transform 0.1s;"
      onmouseenter="window.showGanttTooltip && window.showGanttTooltip(event,'${taskId || ''}');this.style.boxShadow='0 4px 16px rgba(0,0,0,0.28)';"
      onmouseleave="window.hideGanttTooltip && window.hideGanttTooltip();this.style.boxShadow='0 2px 8px rgba(0,0,0,0.18)';"
      onclick="window.editTaskDates && window.editTaskDates('${taskId || ''}');"
    >
      <div class="gantt-task-bar-progress" style="width:${progress}%;border-radius:7px 0 0 7px;background:rgba(255,255,255,0.18);"></div>
      ${nameLabel}
      <span class="gantt-task-bar-text" style="position:absolute;right:6px;top:0;line-height:28px;color:#fff;font-size:11px;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,0.3);z-index:2;">${progress}%</span>
      <div class="gantt-progress-handle" data-task-id="${taskId || ''}" data-progress="${progress}"
        style="position:absolute;left:${progress}%;top:-5px;width:10px;height:38px;cursor:ew-resize;background:rgba(255,255,255,0.95);border-radius:5px;border:1.5px solid rgba(0,0,0,0.15);transform:translateX(-50%);z-index:10;box-shadow:0 1px 4px rgba(0,0,0,0.2);"
      ></div>
    </div>
  `;
}

// 渲染今日线
function renderTodayLine(timelineData, today) {
  if (!timelineData || timelineData.length === 0) return '';
  
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  
  let todayOffset = 0;
  let found = false;
  
  for (let i = 0; i < timelineData.length; i++) {
    const unit = timelineData[i];
    const unitDate = unit.startDate || unit.date;
    const unitYear = unitDate.getFullYear();
    const unitMonth = unitDate.getMonth();
    const unitDay = unitDate.getDate();
    
    const unitWidth = unit.width * ganttState.zoomLevel;
    
    if (unit.type === 'day') {
      if (unitYear === todayYear && unitMonth === todayMonth && unitDay === todayDay) {
        todayOffset += unitWidth / 2;
        found = true;
        break;
      }
    } else {
      const endDate = unit.endDate || new Date(unitYear, unitMonth, unitDay + 1);
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endDay = endDate.getDate();
      
      // 关键修复：endDay + 1 确保包含最后一天（如周日、月末最后一天、季度末最后一天）
      const isTodayInRange = compareDates(todayYear, todayMonth, todayDay, unitYear, unitMonth, unitDay) >= 0 &&
                            compareDates(todayYear, todayMonth, todayDay, endYear, endMonth, endDay + 1) < 0;
      
      if (isTodayInRange) {
        const startMs = new Date(unitYear, unitMonth, unitDay).getTime();
        const endMs = new Date(endYear, endMonth, endDay + 1).getTime();
        const todayMs = new Date(todayYear, todayMonth, todayDay).getTime();
        
        const duration = endMs - startMs;
        if (duration > 0) {
          const ratio = (todayMs - startMs) / duration;
          todayOffset += ratio * unitWidth;
        } else {
          todayOffset += unitWidth / 2;
        }
        found = true;
        break;
      }
    }
    todayOffset += unitWidth;
  }
  
  if (!found) {
    const firstUnit = timelineData[0];
    const lastUnit = timelineData[timelineData.length - 1];
    
    const firstDate = firstUnit.startDate || firstUnit.date;
    const lastDate = lastUnit.endDate || lastUnit.date;
    
    const firstYear = firstDate.getFullYear();
    const firstMonth = firstDate.getMonth();
    const firstDay = firstDate.getDate();
    
    const lastYear = lastDate.getFullYear();
    const lastMonth = lastDate.getMonth();
    const lastDay = lastDate.getDate();
    
    const isTodayBefore = compareDates(todayYear, todayMonth, todayDay, firstYear, firstMonth, firstDay) < 0;
    const isTodayAfter = compareDates(todayYear, todayMonth, todayDay, lastYear, lastMonth, lastDay) >= 0;
    
    if (isTodayBefore) {
      todayOffset = 10;
      found = true;
    } else if (isTodayAfter) {
      const totalWidth = timelineData.reduce((sum, unit) => sum + unit.width * ganttState.zoomLevel, 0);
      todayOffset = totalWidth - 10;
      found = true;
    }
  }
  
  if (!found) return '';
  
  return `
    <div class="gantt-today-line" data-base-left="${todayOffset}" style="left: ${todayOffset}px;">
      <div class="gantt-today-line-indicator"></div>
      <div class="gantt-today-line-pulse"></div>
    </div>
  `;
}

// 同步今日线水平位置（与 rightBody 横向滚动联动）
function syncTodayLineScroll() {
  var todayLine = document.querySelector('.gantt-today-line');
  var rightBody = document.querySelector('.gantt-body-right');
  if (todayLine && rightBody) {
    var baseLeft = parseFloat(todayLine.getAttribute('data-base-left') || '0');
    var scrollLeft = rightBody.scrollLeft || 0;
    // 保持今日线在屏幕上的固定位置（不被滚动推动）
    // 公式: 实际left值 = 基准left值 - 滚动偏移量
    todayLine.style.left = (baseLeft - (rightBody.scrollLeft || 0)) + 'px';
  }
}

// 日期比较辅助函数
function compareDates(y1, m1, d1, y2, m2, d2) {
  if (y1 !== y2) return y1 - y2;
  if (m1 !== m2) return m1 - m2;
  return d1 - d2;
}

// 将时间轴滚动到今日线位置（居中显示）
function scrollGanttToToday(smooth = true) {
  setTimeout(() => {
    try {
      const timelineData = getCurrentTimelineData();
      if (!timelineData || timelineData.length === 0) return;
      
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayMs = todayDate.getTime();
      
      let todayOffset = 0;
      let found = false;
      
      for (let i = 0; i < timelineData.length; i++) {
        const unit = timelineData[i];
        const unitStartDate = new Date((unit.startDate || unit.date).getFullYear(), 
                                       (unit.startDate || unit.date).getMonth(), 
                                       (unit.startDate || unit.date).getDate());
        const unitEndDate = new Date(unit.endDate 
          ? unit.endDate.getFullYear() : unit.date.getFullYear(), 
          unit.endDate ? unit.endDate.getMonth() : unit.date.getMonth(), 
          (unit.endDate ? unit.endDate.getDate() : unit.date.getDate()) + 1);
        
        const unitStartMs = unitStartDate.getTime();
        const unitEndMs = unitEndDate.getTime();
        const unitWidth = unit.width * ganttState.zoomLevel;
        
        if (todayMs >= unitStartMs && todayMs < unitEndMs) {
          if (unit.type === 'day') {
            todayOffset += unitWidth / 2;
          } else {
            const unitDuration = unitEndMs - unitStartMs;
            if (unitDuration > 0) {
              const ratio = (todayMs - unitStartMs) / unitDuration;
              todayOffset += ratio * unitWidth;
            } else {
              todayOffset += unitWidth / 2;
            }
          }
          found = true;
          break;
        }
        todayOffset += unitWidth;
      }
      
      if (!found) {
        const firstUnit = timelineData[0];
        const firstDate = new Date((firstUnit.startDate || firstUnit.date).getFullYear(), 
                                   (firstUnit.startDate || firstUnit.date).getMonth(), 
                                   (firstUnit.startDate || firstUnit.date).getDate());
        const firstDateMs = firstDate.getTime();
        
        if (todayMs < firstDateMs) {
          todayOffset = 0;
        } else {
          const totalWidth = timelineData.reduce((sum, unit) => sum + unit.width * ganttState.zoomLevel, 0);
          todayOffset = totalWidth;
        }
      }
      
      const rightBody = document.querySelector('.gantt-body-right');
      const rightHeader = document.querySelector('.gantt-header-right');
      
      if (!rightBody) {
        console.warn('scrollGanttToToday: 未找到 .gantt-body-right 元素');
        return;
      }
      
      const containerWidth = rightBody.offsetWidth;
      const scrollTarget = Math.max(0, todayOffset - containerWidth / 2);
      
      if (smooth) {
        rightBody.scrollTo({ left: scrollTarget, behavior: 'smooth' });
      } else {
        rightBody.scrollLeft = scrollTarget;
      }
      
      if (rightHeader) {
        rightHeader.scrollLeft = rightBody.scrollLeft;
      }
      
      console.log('滚动到今日位置:', todayOffset, '日期:', todayDate.toLocaleDateString());
    } catch (error) {
      console.error('scrollGanttToToday error:', error);
    }
  }, 150);
}

window.scrollGanttToToday = scrollGanttToToday;

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

// 甘特图专用短日期格式：MM-DD（省略年份，节省空间）
function formatGanttDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return month + '-' + day;
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

function toggleGanttProject(projectId) {
  if (ganttState.collapsedProjects.has(projectId)) {
    ganttState.collapsedProjects.delete(projectId);
  } else {
    ganttState.collapsedProjects.add(projectId);
  }
  renderContent();
}

function changeGanttProjectFilter(projectId) {
  ganttState.selectedProjectId = projectId;
  renderContent();
}

// 暴露到全局作用域
window.changeGanttView = changeGanttView;
window.toggleParentTask = toggleParentTask;
window.zoomInGantt = zoomInGantt;
window.zoomOutGantt = zoomOutGantt;
window.toggleGanttProject = toggleGanttProject;
window.changeGanttProjectFilter = changeGanttProjectFilter;

// 同步甘特图左右行高（核心修复函数 - 增强版）
// Bug Fix #4: 渲染后同步左右侧行高，解决内容不一致导致的行高错位问题

function syncGanttRowHeights(forceReflow) {
  // 防止因写 style.height 触发重排/scroll 引发的递归调用
  if (_ganttRowHeightSyncing) return 0;
  _ganttRowHeightSyncing = true;

  const leftRows = document.querySelectorAll('.gantt-body-left > .gantt-row-left');
  const rightRows = document.querySelectorAll('.gantt-body-right > .gantt-row-right');

  if (!leftRows.length || !rightRows.length) {
    _ganttRowHeightSyncing = false;
    return 0;
  }

  let syncCount = 0;
  const minPairCount = Math.min(leftRows.length, rightRows.length);

  // ── 核心修复：不再整体清空 style.height ──
  // 原来的做法：先全部清空 style.height → scrollHeight 瞬间缩小 → 浏览器强制压缩 scrollTop → 弹跳
  // 新做法：直接读取当前的 offsetHeight（如果已有 style.height 则读其设置值），
  //         仅当左右高度真的不一致时才写入更大值，不主动缩小任何行。
  // 保存滚动位置，写入前后恢复，防止任何因重排引起的 scrollTop 修正
  const leftBody = document.querySelector('.gantt-body-left');
  const rightBody = document.querySelector('.gantt-body-right');
  const savedLeftTop = leftBody ? leftBody.scrollTop : 0;
  const savedRightTop = rightBody ? rightBody.scrollTop : 0;

  // 第一遍：批量读取自然高度
  // 只清空那些"已有 style.height 但实际高度可能已经改变"的行，且每次只清一行读一行（不影响其他行）
  const heights = [];
  for (let i = 0; i < minPairCount; i++) {
    // 临时清空这一对行的高度，读取自然高度后立即恢复（范围最小化）
    const prevLeftH = leftRows[i].style.height;
    const prevRightH = rightRows[i].style.height;
    leftRows[i].style.height = '';
    rightRows[i].style.height = '';
    heights.push({
      leftH: leftRows[i].offsetHeight,
      rightH: rightRows[i].offsetHeight,
      prevMaxH: Math.max(parseFloat(prevLeftH) || 0, parseFloat(prevRightH) || 0)
    });
    // 恢复，避免所有行同时没有高度导致 scrollHeight 骤降
    leftRows[i].style.height = prevLeftH;
    rightRows[i].style.height = prevRightH;
  }

  // 第二遍：批量写入（仅写需要调整的行）
  for (let i = 0; i < minPairCount; i++) {
    const { leftH, rightH } = heights[i];
    const maxH = Math.max(leftH, rightH);
    if (Math.abs(leftH - rightH) > 1 || forceReflow) {
      leftRows[i].style.height = maxH + 'px';
      rightRows[i].style.height = maxH + 'px';
      syncCount++;
    }
  }

  // 恢复 scrollTop，防止批量写入引起的 scrollTop 被浏览器修正
  // 注意：此处不能用互斥锁阻止 scroll 回调，因为 scroll 事件是异步的；
  //       直接写入即可，双向同步逻辑靠 _ganttScrollSource 防止死循环。
  if (leftBody && leftBody.scrollTop !== savedLeftTop) {
    leftBody.scrollTop = savedLeftTop;
  }
  if (rightBody && rightBody.scrollTop !== savedRightTop) {
    rightBody.scrollTop = savedRightTop;
  }

  _ganttRowHeightSyncing = false;
  return syncCount;
}

// 带防抖的持续同步函数（RAF级别防抖）
function _debouncedSyncRowHeights() {
  if (_ganttRowHeightSyncTimer) return;
  _ganttRowHeightSyncTimer = requestAnimationFrame(() => {
    _ganttRowHeightSyncTimer = null;
    syncGanttRowHeights();
  });
}

// 启动行高持续同步监听
// 注意：通过 _ganttObserverBound 确保整个生命周期只绑定一次 scroll/resize
function startGanttRowHeightObserver() {
  const leftBody = document.querySelector('.gantt-body-left');
  const rightBody = document.querySelector('.gantt-body-right');
  if (!leftBody || !rightBody) return;

  // 1. MutationObserver：监听 DOM 结构变化（展开/折叠/筛选等会改变行数）
  //    注意：只监听 childList，不监听 attributes，避免行高写入 style 时自触发
  if (!_ganttMutationObserver) {
    _ganttMutationObserver = new MutationObserver((mutations) => {
      const hasStructuralChange = mutations.some(m => m.type === 'childList');
      if (hasStructuralChange) {
        _debouncedSyncRowHeights();
      }
    });
    _ganttMutationObserver.observe(leftBody, { childList: true, subtree: true, attributes: false });
    _ganttMutationObserver.observe(rightBody, { childList: true, subtree: true, attributes: false });
  }

  // 2. scroll 时同步行高（仅在第一次绑定时添加，防止重复累积）
  //    注意：不在这里同步 scrollTop，scrollTop 同步由 syncGanttScroll 负责
  if (!_ganttObserverBound) {
    _ganttObserverBound = true;

    // 3. ResizeObserver：容器/窗口大小变化时重新同步行高
    if (!window._ganttResizeObserver) {
      window._ganttResizeObserver = new ResizeObserver(() => {
        _debouncedSyncRowHeights();
      });
      var ganttContainer = document.querySelector('.gantt-container');
      if (ganttContainer) {
        window._ganttResizeObserver.observe(ganttContainer);
      }
    }
  }

  // 4. 延迟同步：仅在首次渲染后同步一次，捕获字体/CSS异步应用等布局变化
  //    注意：不再用多重长延迟定时器，因为每次调用会导致行高清空→scrollTop弹跳
  //    只需在渲染后 100ms 和 400ms 各一次即可完成布局稳定
  if (!window._ganttDelayTimers) window._ganttDelayTimers = [];
  // 清理上次残留的延迟定时器（防止切换视图时旧定时器在新页面触发）
  window._ganttDelayTimers.forEach(function(t) { clearTimeout(t); });
  window._ganttDelayTimers = [
    setTimeout(function() { syncGanttRowHeights(); }, 100),
    setTimeout(function() { syncGanttRowHeights(); }, 400)
  ];

  // 5. 字体文档加载完成后再次同步
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
      var t = setTimeout(function() { syncGanttRowHeights(); }, 100);
      (window._ganttDelayTimers || []).push(t);
    });
  }
}

// 竖向/横向滚动互斥锁（模块级，防止多闭包失效）

function syncGanttScroll() {
  setTimeout(function() {
    var leftBody = document.querySelector('.gantt-body-left');
    var rightBody = document.querySelector('.gantt-body-right');
    var rightHeader = document.querySelector('.gantt-header-right');
    var ganttContainer = document.querySelector('.gantt-container');

    if (!leftBody || !rightBody) {
      setTimeout(syncGanttScroll, 100);
      return;
    }

    syncGanttRowHeights(true);
    startGanttRowHeightObserver();

    // 防止每次 renderContent() 后重复绑定事件
    if (_ganttScrollBound) {
      scrollGanttToToday(false);
      return;
    }
    _ganttScrollBound = true;

    // ══════════════════════════════════════════════════════════
    // 滚动同步架构（最终简化版）
    // ──────────────────────────────────────────────────────────
    // 设计原则：rightBody 是唯一权威滚动源，leftBody 和 rightHeader 完全被动跟随。
    //
    // leftBody:    overflow:hidden — 不产生 scroll 事件，scrollTop 仍可 JS 写入
    // rightHeader: overflow:hidden — 不产生 scroll 事件，scrollLeft 仍可 JS 写入
    // rightBody:   overflow:auto  — 唯一与用户交互的可见滚动容器
    //
    // 鼠标在左侧区域滚轮时，wheel 事件冒泡到 gantt-container，
    // 被下方的 wheel 监听器拦截并转发给 rightBody，再由 scroll 事件同步左侧和 header。
    // ══════════════════════════════════════════════════════════

    // ① rightBody scroll → 无条件同步左侧竖向 + header 横向 + 今日线
    //    无需防死循环（leftBody/rightHeader 均 overflow:hidden，不产生 scroll 事件）
    rightBody.addEventListener('scroll', function() {
      leftBody.scrollTop = rightBody.scrollTop;
      if (rightHeader) {
        rightHeader.scrollLeft = rightBody.scrollLeft;
      }
      // 同步今日线水平位置
      syncTodayLineScroll();
    }, { passive: true });

    // ② wheel 事件拦截 — 当鼠标在左侧任务列上滚动时，将 wheel 事件转发给 rightBody
    //    （leftBody overflow:hidden 不响应滚轮，需手动转发）
    if (ganttContainer) {
      ganttContainer.addEventListener('wheel', function(e) {
        // 只处理鼠标在左侧列（.gantt-left-col）上的滚轮事件
        var leftCol = document.querySelector('.gantt-left-col');
        if (!leftCol || !leftCol.contains(e.target)) return;
        // 阻止默认滚动（因为左侧 overflow:hidden，默认行为是页面滚动）
        e.preventDefault();
        // 将竖向滚动量转发给 rightBody
        rightBody.scrollTop += e.deltaY;
      }, { passive: false });
    }

    scrollGanttToToday(false);
    // 初始渲染后同步今日线位置
    setTimeout(syncTodayLineScroll, 200);
  }, 100);
}

window.syncGanttScroll = syncGanttScroll;
window.syncGanttRowHeights = syncGanttRowHeights;
window.syncTodayLineScroll = syncTodayLineScroll;
window.startGanttRowHeightObserver = startGanttRowHeightObserver;

// ============ 进度条拖拽功能 ============

// 开始拖拽进度
function startProgressDrag(event) {
  const handle = event.target.closest('.gantt-progress-handle');
  if (!handle) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const taskId = handle.getAttribute('data-task-id');
  if (!taskId || taskId.startsWith('project-')) {
    store.addNotification({
      type: 'info',
      title: '提示',
      message: '项目进度暂不支持拖拽调整'
    });
    return;
  }
  
  // 父任务（有子任务）的进度是自动汇总计算的，不允许拖拽
  const state = store.getState();
  const hasChildren = state.tasks && state.tasks.some(t => t.parentId === taskId);
  if (hasChildren) {
    store.addNotification({
      type: 'info',
      title: '提示',
      message: '该任务的进度由子任务自动汇总，不支持手动拖拽调整'
    });
    return;
  }
  
  const barElement = handle.closest('.gantt-task-bar');
  
  progressDragState = {
    isDragging: true,
    taskId: taskId,
    barElement: barElement,
    startX: event.clientX,
    currentProgress: parseInt(handle.getAttribute('data-progress')) || 0
  };
  
  document.addEventListener('mousemove', handleProgressDrag);
  document.addEventListener('mouseup', endProgressDrag);
  
  // 添加拖拽中的样式
  if (barElement) {
    barElement.style.cursor = 'grabbing';
    barElement.style.opacity = '0.8';
  }
}

// 处理拖拽
function handleProgressDrag(event) {
  if (!progressDragState.isDragging) return;
  
  const { barElement, currentProgress, taskId } = progressDragState;
  if (!barElement) return;
  
  // 计算进度条容器的宽度
  const containerWidth = barElement.offsetWidth;
  const deltaX = event.clientX - progressDragState.startX;
  const deltaProgress = Math.round((deltaX / containerWidth) * 100);
  
  let newProgress = Math.max(0, Math.min(100, currentProgress + deltaProgress));
  
  // 更新进度条显示
  const progressFill = barElement.querySelector('.gantt-task-bar-progress');
  const progressText = barElement.querySelector('.gantt-task-bar-text');
  const progressHandle = barElement.querySelector('.gantt-progress-handle');
  
  if (progressFill) {
    progressFill.style.width = newProgress + '%';
  }
  if (progressText) {
    progressText.textContent = newProgress + '%';
  }
  if (progressHandle) {
    progressHandle.style.left = newProgress + '%';
    progressHandle.setAttribute('data-progress', newProgress);
  }
}

// 结束拖拽
function endProgressDrag(event) {
  if (!progressDragState.isDragging) return;
  
  const { taskId, barElement, currentProgress } = progressDragState;
  
  // 移除拖拽样式
  if (barElement) {
    barElement.style.cursor = '';
    barElement.style.opacity = '';
  }
  
  // 计算最终进度
  const containerWidth = barElement?.offsetWidth || 0;
  const deltaX = event.clientX - progressDragState.startX;
  const deltaProgress = Math.round((deltaX / containerWidth) * 100);
  const newProgress = Math.max(0, Math.min(100, currentProgress + deltaProgress));

  // 清理状态
  document.removeEventListener('mousemove', handleProgressDrag);
  document.removeEventListener('mouseup', endProgressDrag);
  
  progressDragState = {
    isDragging: false,
    taskId: null,
    barElement: null,
    startX: 0,
    currentProgress: 0
  };

  // 保存到store
  if (taskId && !taskId.startsWith('project-') && newProgress !== currentProgress) {
    store.updateTask(taskId, { progress: newProgress });
    
    // 如果进度100%，自动标记为完成
    if (newProgress === 100) {
      store.updateTaskStatus(taskId, 'completed');
    } else if (currentProgress === 100 && newProgress < 100) {
      // 如果从100%降下来，且当前状态是completed，则改为in_progress
      const task = store.getTaskById(taskId);
      if (task && task.status === 'completed') {
        store.updateTaskStatus(taskId, 'in_progress');
      }
    }
  }
  
  // 重新渲染内容以同步状态
  renderContent();
}

// 初始化进度条拖拽事件
function initProgressDrag() {
  document.addEventListener('mousedown', startProgressDrag);
}

// 页面加载后初始化拖拽
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProgressDrag);
} else {
  initProgressDrag();
}

// 暴露给window以便外部调用
window.initProgressDrag = initProgressDrag;

// 重新渲染内容函数（调用app.js的renderContent函数）
// window.renderContent 由 app.js 末尾直接赋值暴露，不会产生循环引用
function renderContent() {
  if (typeof window.renderContent === 'function') {
    window.renderContent();
  }
}

// ============================================================
// 功能扩展 #1: 点击任务条编辑日期
// ============================================================

function updateProgressDisplay(value) {
  const progressValue = document.getElementById('progressValue');
  const progressBar = document.getElementById('progressBar');
  const progressInput = document.getElementById('editTaskProgress');
  if (progressValue) progressValue.textContent = value + '%';
  if (progressBar) progressBar.style.width = value + '%';
  if (progressInput) progressInput.value = value;
}

function setProgress(value) {
  updateProgressDisplay(value);
}

window.updateProgressDisplay = updateProgressDisplay;
window.setProgress = setProgress;

function editTaskDates(taskId) {
  if (!taskId || taskId.startsWith('project-')) return;
  
  const task = store.getTaskById(taskId);
  if (!task) return;
  
  const startDate = task.startDate ? DateUtils.formatDate(task.startDate) : '';
  const dueDate = task.dueDate ? DateUtils.formatDate(task.dueDate) : '';
  const progress = task.progress || 0;
  
  const modalContent = `
    <div class="modal-content" style="background: #ffffff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); width: 440px; max-width: 90vw; overflow: hidden;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(135deg, #3b82f6, #2563eb); display: block;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">编辑任务</h3>
        <div style="margin-top: 6px; font-size: 14px; color: rgba(255,255,255,0.95); font-weight: 500;">${escapeHtml(task.name || '')}</div>
      </div>
      <div class="modal-body" style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #334155;">任务名称</label>
          <input type="text" value="${escapeHtml(task.name || '')}" disabled 
            style="width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f8fafc; color: #94a3b8; font-weight: 500;" />
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #334155;">开始日期</label>
            <input type="date" id="editTaskStartDate" value="${startDate}" 
              style="width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;" 
              onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'" />
          </div>
          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #334155;">结束日期</label>
            <input type="date" id="editTaskDueDate" value="${dueDate}" 
              style="width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;" 
              onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'" />
          </div>
        </div>
        
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <label style="font-size: 14px; font-weight: 500; color: #334155;">进度</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="range" id="editTaskProgress" min="0" max="100" value="${progress}" 
                style="width: 120px; height: 6px; -webkit-appearance: none; appearance: none; background: #e2e8f0; border-radius: 3px; cursor: pointer;" 
                oninput="window.updateProgressDisplay(this.value)" />
              <span id="progressValue" style="font-size: 14px; font-weight: 600; color: #3b82f6; min-width: 40px; text-align: right;">${progress}%</span>
            </div>
          </div>
          <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div id="progressBar" style="height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 4px; width: ${progress}%; transition: width 0.2s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <button onclick="window.setProgress(0)" style="font-size: 12px; color: #64748b; background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; hover:background:#f1f5f9;">0%</button>
            <button onclick="window.setProgress(25)" style="font-size: 12px; color: #64748b; background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; hover:background:#f1f5f9;">25%</button>
            <button onclick="window.setProgress(50)" style="font-size: 12px; color: #64748b; background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; hover:background:#f1f5f9;">50%</button>
            <button onclick="window.setProgress(75)" style="font-size: 12px; color: #64748b; background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; hover:background:#f1f5f9;">75%</button>
            <button onclick="window.setProgress(100)" style="font-size: 12px; color: #64748b; background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; hover:background:#f1f5f9;">100%</button>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="closeModal('editTaskDatesModal')" style="padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">取消</button>
          <button class="btn btn-primary" onclick="window.saveTaskDates('${taskId}')" style="padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; background: linear-gradient(135deg, #3b82f6, #2563eb);">保存</button>
        </div>
      </div>
    </div>
  `;
  
  showModal('editTaskDatesModal', modalContent);
}

function saveTaskDates(taskId) {
  const startDateInput = document.getElementById('editTaskStartDate');
  const dueDateInput = document.getElementById('editTaskDueDate');
  const progressInput = document.getElementById('editTaskProgress');
  
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : null;
  const progress = parseInt(progressInput.value) || 0;
  
  if (startDate && dueDate && startDate > dueDate) {
    store.addNotification({
      type: 'error',
      title: '日期错误',
      message: '开始日期不能晚于结束日期'
    });
    return;
  }
  
  const updates = { progress };
  if (startDate) updates.startDate = startDate;
  if (dueDate) updates.dueDate = dueDate;
  
  store.updateTask(taskId, updates);
  
  if (progress === 100) {
    store.updateTaskStatus(taskId, 'completed');
  } else if (progress < 100) {
    const task = store.getTaskById(taskId);
    if (task && task.status === 'completed') {
      store.updateTaskStatus(taskId, 'in_progress');
    }
  }
  
  closeModal('editTaskDatesModal');
  renderContent();
  
  setTimeout(() => {
    scrollToTask(taskId);
  }, 500);
  
  store.addNotification({
    type: 'success',
    title: '修改成功',
    message: '任务信息已更新'
  });
}

function scrollToTask(taskId) {
  const leftBody = document.querySelector('.gantt-body-left');
  const rightBody = document.querySelector('.gantt-body-right');
  
  const allRows = document.querySelectorAll(`[data-task-id="${taskId}"]`);
  const leftRow = document.querySelector(`.gantt-body-left [data-task-id="${taskId}"]`);
  const rightRow = document.querySelector(`.gantt-body-right [data-task-id="${taskId}"]`);
  
  if (leftRow && leftBody) {
    const rowTop = leftRow.offsetTop;
    const bodyHeight = leftBody.offsetHeight;
    const scrollPosition = rowTop - bodyHeight / 2;
    
    leftBody.scrollTop = Math.max(0, scrollPosition);
    
    if (rightBody) {
      rightBody.scrollTop = Math.max(0, scrollPosition);
    }
    
    leftRow.style.backgroundColor = '#fef3c7';
    leftRow.style.borderLeft = '3px solid #f59e0b';
    if (rightRow) {
      rightRow.style.backgroundColor = '#fef3c7';
      rightRow.style.borderLeft = '3px solid #f59e0b';
    }
    
    setTimeout(() => {
      leftRow.style.backgroundColor = '';
      leftRow.style.borderLeft = '';
      if (rightRow) {
        rightRow.style.backgroundColor = '';
        rightRow.style.borderLeft = '';
      }
    }, 2000);
  }
}

// formatDate 已由 DateUtils.formatDate 提供，不再重复定义

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.scrollToTask = scrollToTask;

window.editTaskDates = editTaskDates;
window.saveTaskDates = saveTaskDates;

// ============================================================
// 功能扩展 #2: 任务条悬浮 Tooltip 详情面板
// ============================================================

let ganttTooltipTimer = null;
let ganttTooltipEl = null;

function getOrCreateTooltipEl() {
  if (!ganttTooltipEl || !document.body.contains(ganttTooltipEl)) {
    const el = document.createElement('div');
    el.id = 'gantt-tooltip';
    el.style.cssText = `
      position: fixed; z-index: 9999; pointer-events: none;
      background: var(--bg-white, #fff); color: var(--text-primary, #18191b);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 12px; padding: 12px 16px; min-width: 220px; max-width: 300px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      font-size: 13px; line-height: 1.6;
      opacity: 0; transition: opacity 0.15s ease; display: none;
    `;
    document.body.appendChild(el);
    ganttTooltipEl = el;
  }
  return ganttTooltipEl;
}

function showGanttTooltip(event, taskId) {
  if (!taskId || taskId.startsWith('project-')) return;
  if (progressDragState.isDragging) return;

  clearTimeout(ganttTooltipTimer);
  ganttTooltipTimer = setTimeout(() => {
    const task = store.getTaskById ? store.getTaskById(taskId) : null;
    if (!task) return;
    
    const assignee = store.getUserById ? store.getUserById(task.assigneeId) : null;
    const priorityMap = { urgent: '🔴 紧急', high: '🟠 高', medium: '🟡 中', low: '🟢 低' };
    const statusMap = { todo: '待开始', in_progress: '进行中', completed: '已完成', cancelled: '已取消', paused: '暂停', terminated: '终止', delayed: '滞后', overdue: '逾期' };
    const statusColor = { todo: '#6b7280', in_progress: '#f59e0b', completed: '#10b981', cancelled: '#ef4444', paused: '#94a3b8', terminated: '#6b7280', delayed: '#ef4444', overdue: '#dc2626' };

    const el = getOrCreateTooltipEl();
    el.innerHTML = `
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: var(--text-primary, #18191b); border-bottom: 1px solid var(--border-light, #f1f5f9); padding-bottom: 8px;">
        ${task.name}
      </div>
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: center;">
        <span style="color: var(--text-secondary, #64748b);">状态</span>
        <span style="background: ${statusColor[task.status] || '#6b7280'}22; color: ${statusColor[task.status] || '#6b7280'}; padding: 1px 8px; border-radius: 10px; font-size: 12px; font-weight: 600;">${statusMap[task.status] || task.status}</span>
        <span style="color: var(--text-secondary, #64748b);">优先级</span>
        <span>${priorityMap[task.priority] || task.priority || '-'}</span>
        <span style="color: var(--text-secondary, #64748b);">负责人</span>
        <span>${assignee ? assignee.name : '未分配'}</span>
        <span style="color: var(--text-secondary, #64748b);">开始日期</span>
        <span>${DateUtils.formatDate(task.startDate) || '-'}</span>
        <span style="color: var(--text-secondary, #64748b);">截止日期</span>
        <span>${DateUtils.formatDate(task.dueDate) || '-'}</span>
        <span style="color: var(--text-secondary, #64748b);">进度</span>
        <span>
          <div style="background: #e2e8f0; border-radius: 4px; height: 6px; width: 80px; display: inline-block; vertical-align: middle; margin-right: 6px;">
            <div style="background: #3b82f6; width: ${task.progress || 0}%; height: 100%; border-radius: 4px;"></div>
          </div>${task.progress || 0}%
        </span>
        ${task.description ? `<span style="color: var(--text-secondary, #64748b); align-self: start;">描述</span><span style="color: var(--text-secondary, #64748b); font-size: 12px;">${task.description.slice(0, 60)}${task.description.length > 60 ? '…' : ''}</span>` : ''}
      </div>
      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-light, #f1f5f9); font-size: 12px; color: #3b82f6; cursor: pointer;" onclick="router.navigate('tasks')">
        <i class="fas fa-external-link-alt"></i> 查看任务详情
      </div>
    `;
    
    const rect = event.target.closest('.gantt-task-bar')?.getBoundingClientRect() || {};
    const tooltipW = 300;
    let left = (rect.left || event.clientX) + 8;
    let top = (rect.bottom || event.clientY) + 8;
    if (left + tooltipW > window.innerWidth - 16) {
      left = (rect.left || event.clientX) - tooltipW - 8;
    }
    if (top + 240 > window.innerHeight - 16) {
      top = (rect.top || event.clientY) - 240 - 8;
    }
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.display = 'block';
    requestAnimationFrame(() => { el.style.opacity = '1'; });
  }, 300);
}

function hideGanttTooltip() {
  clearTimeout(ganttTooltipTimer);
  if (ganttTooltipEl) {
    ganttTooltipEl.style.opacity = '0';
    setTimeout(() => {
      if (ganttTooltipEl) ganttTooltipEl.style.display = 'none';
    }, 150);
  }
}

window.showGanttTooltip = showGanttTooltip;
window.hideGanttTooltip = hideGanttTooltip;

// ============================================================
// 功能扩展 #2: 关键路径计算与高亮
// ============================================================

// 计算关键路径任务 ID 集合
// 关键路径算法: 正向计算最早完成时间(ES/EF), 反向计算最晚完成时间(LS/LF), 浮动时间=0的任务为关键任务
function getTaskDeps(task) {
  return task.dependsOn || task.dependencies || [];
}

function computeCriticalPath(tasks) {
  if (!tasks || tasks.length === 0) return new Set();
  
  const taskMap = {};
  tasks.forEach(t => { taskMap[t.id] = t; });
  
  // 以天为单位的日期转换
  const toDay = d => {
    if (!d) return 0;
    const date = new Date(d);
    return isNaN(date.getTime()) ? 0 : Math.floor(date.getTime() / 86400000);
  };
  
  // 构建节点
  const nodes = {};
  tasks.forEach(t => {
    const start = toDay(t.startDate);
    const end = toDay(t.dueDate);
    const deps = getTaskDeps(t);
    nodes[t.id] = {
      id: t.id,
      duration: Math.max(1, end - start),
      ES: start, EF: end,
      LS: start, LF: end,
      dependsOn: Array.isArray(deps) ? deps.filter(d => taskMap[d]) : [],
      dependedBy: []
    };
  });
  
  // 反向建图：谁依赖我
  tasks.forEach(t => {
    const deps = getTaskDeps(t);
    if (Array.isArray(deps)) {
      deps.forEach(depId => {
        if (nodes[depId]) nodes[depId].dependedBy.push(t.id);
      });
    }
  });
  
  // 拓扑排序（Kahn's algorithm）
  const inDegree = {};
  tasks.forEach(t => { inDegree[t.id] = nodes[t.id].dependsOn.length; });
  const queue = tasks.filter(t => inDegree[t.id] === 0).map(t => t.id);
  const sorted = [];
  
  while (queue.length > 0) {
    const id = queue.shift();
    sorted.push(id);
    nodes[id].dependedBy.forEach(nextId => {
      inDegree[nextId]--;
      if (inDegree[nextId] === 0) queue.push(nextId);
    });
  }
  
  // 若有环或无依赖数据，回退到最长持续时间链
  if (sorted.length < tasks.length) {
    // 直接按持续时间排序，最长的3个认为是关键路径
    const byDuration = [...tasks].sort((a, b) => {
      const dA = toDay(a.dueDate) - toDay(a.startDate);
      const dB = toDay(b.dueDate) - toDay(b.startDate);
      return dB - dA;
    });
    return new Set(byDuration.slice(0, Math.min(3, tasks.length)).map(t => t.id));
  }
  
  // 正向计算 EF
  sorted.forEach(id => {
    const node = nodes[id];
    node.dependsOn.forEach(depId => {
      if (nodes[depId]) {
        node.ES = Math.max(node.ES, nodes[depId].EF);
      }
    });
    node.EF = node.ES + node.duration;
  });
  
  // 找最大 EF
  const maxEF = Math.max(...Object.values(nodes).map(n => n.EF));
  
  // 反向计算 LF/LS
  sorted.forEach(id => {
    nodes[id].LF = maxEF;
    nodes[id].LS = maxEF - nodes[id].duration;
  });
  
  for (let i = sorted.length - 1; i >= 0; i--) {
    const id = sorted[i];
    const node = nodes[id];
    node.dependedBy.forEach(nextId => {
      if (nodes[nextId]) {
        node.LF = Math.min(node.LF, nodes[nextId].LS);
      }
    });
    node.LS = node.LS - node.duration;
  }
  
  // 浮动时间 = LS - ES，等于0的为关键任务
  const criticalIds = new Set();
  sorted.forEach(id => {
    const node = nodes[id];
    if ((node.LS - node.ES) <= 0) {
      criticalIds.add(id);
    }
  });
  
  return criticalIds;
}

// 全局缓存关键路径（每次渲染时重新计算）
let ganttCriticalPathIds = new Set();

// 在 renderGantt 调用时初始化关键路径
function updateCriticalPath(tasks) {
  ganttCriticalPathIds = computeCriticalPath(tasks);
}

window.ganttCriticalPathIds = ganttCriticalPathIds;
window.updateCriticalPath = updateCriticalPath;

// ============================================================
// 功能扩展 #3: 任务依赖关系箭头连线（DOM 绘制，基于任务条位置）
// ============================================================

function drawDependencyArrows() {
  setTimeout(() => {
    const svg = document.getElementById('gantt-dependency-arrows');
    if (!svg) return;
    svg.innerHTML = '';

    const state = store.getState();
    const tasks = state.tasks ? state.tasks.filter(t => t.status !== 'cancelled') : [];
    const hasDeps = tasks.some(t => {
      const deps = getTaskDeps(t);
      return Array.isArray(deps) && deps.length > 0;
    });
    if (!hasDeps) return;

    const scrollContainer = document.getElementById('gantt-body-right-scroll') || document.querySelector('.gantt-body-right');
    if (!scrollContainer) return;
    const containerRect = scrollContainer.getBoundingClientRect();

    // 建立 taskId -> 任务条 DOM 元素 的映射
    const barEls = {};
    scrollContainer.querySelectorAll('[data-gantt-tooltip]').forEach(el => {
      const id = el.getAttribute('data-gantt-tooltip');
      if (id) barEls[id] = el;
    });

    const isDark = document.body.classList.contains('dark-mode');
    const arrowColor = isDark ? '#818cf8' : '#6366f1';
    const criticalColor = '#ef4444';

    tasks.forEach(task => {
      const taskDeps = getTaskDeps(task);
      if (!Array.isArray(taskDeps) || taskDeps.length === 0) return;
      const toBar = barEls[task.id];
      if (!toBar) return;
      const toRect = toBar.getBoundingClientRect();

      taskDeps.forEach(depId => {
        const fromBar = barEls[depId];
        if (!fromBar) return;
        const fromRect = fromBar.getBoundingClientRect();

        // 坐标转换：相对 scrollContainer 的 scrollLeft/Top 补偿
        const scrollLeft = scrollContainer.scrollLeft;
        const scrollTop = scrollContainer.scrollTop;

        const x1 = fromRect.right - containerRect.left + scrollLeft;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top + scrollTop;
        const x2 = toRect.left - containerRect.left + scrollLeft;
        const y2 = toRect.top + toRect.height / 2 - containerRect.top + scrollTop;

        const isCrit = ganttCriticalPathIds.has(task.id) && ganttCriticalPathIds.has(depId);
        const color = isCrit ? criticalColor : arrowColor;
        const strokeWidth = isCrit ? 2 : 1.5;

        // 贝塞尔曲线连线
        const dx = Math.abs(x2 - x1) * 0.5;
        const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', strokeWidth);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', isCrit ? '0' : '4,3');
        path.setAttribute('opacity', '0.75');
        path.setAttribute('marker-end', `url(#arrow-${isCrit ? 'critical' : 'normal'})`);
        svg.appendChild(path);
      });
    });

    // 添加箭头 marker 定义
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    ['normal', 'critical'].forEach(type => {
      const color = type === 'critical' ? criticalColor : arrowColor;
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', `arrow-${type}`);
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '6');
      marker.setAttribute('markerHeight', '6');
      marker.setAttribute('orient', 'auto-start-reverse');
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      polyline.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      polyline.setAttribute('fill', color);
      marker.appendChild(polyline);
      defs.appendChild(marker);
    });
    svg.insertBefore(defs, svg.firstChild);

    // 滚动时重绘箭头
    if (!scrollContainer._arrowScrollBound) {
      scrollContainer._arrowScrollBound = true;
      scrollContainer.addEventListener('scroll', () => {
        requestAnimationFrame(drawDependencyArrows);
      });
    }
  }, 300);
}

window.drawDependencyArrows = drawDependencyArrows;
