function getPhaseName(phase) {
  if (!phase) return '未设置';
  const phaseNames = {
    preparation: '前期准备',
    civil: '土建施工',
    mechanical: '机电安装',
    commissioning: '工艺调试',
    'trial-run': '试运行',
    acceptance: '竣工验收'
  };
  return phaseNames[phase] || phase;
}

function formatUserName(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    if (parts[0].length === 1 && parts[1].length >= 1) {
      return parts[1];
    }
  }
  return name;
}

function renderTasks() {
  const state = store.getState();
  const tasks = state.tasks;
  const projects = state.projects;

  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">任务管理</h1>
        <p class="page-description">管理所有项目任务</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-sm" style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; margin-right: 8px;" onclick="quickFilterMyTasks()">
          <i class="fas fa-user-check"></i>
          我的任务
        </button>
        <div class="view-toggle">
          <button class="active" data-view="kanban" title="看板视图">
            <i class="fas fa-columns"></i>
          </button>
          <button data-view="list" title="列表视图">
            <i class="fas fa-list"></i>
          </button>
        </div>
        <button class="btn btn-primary" onclick="showCreateTaskModal()">
          <i class="fas fa-plus"></i>
          新建任务
        </button>
        <button class="btn btn-secondary" onclick="showBPMNFlowModal()" title="BPMN流程依赖管理">
          <i class="fas fa-project-diagram"></i>
          流程依赖
        </button>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">
      <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: #dbeafe; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-tasks" style="color: #3b82f6; font-size: 16px;"></i>
          </div>
          <span style="font-size: 13px; color: #64748b; font-weight: 500;">总任务</span>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">${tasks.length}</div>
        <div style="font-size: 12px; color: #9ca3af;">共 ${tasks.length} 个</div>
      </div>
      <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: #d1fae5; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #10b981; font-size: 16px;"></i>
          </div>
          <span style="font-size: 13px; color: #64748b; font-weight: 500;">已完成</span>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #166534; margin-bottom: 8px;">${tasks.filter(t => t.status === 'completed').length}</div>
        <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
          <div style="width: ${tasks.length > 0 ? Math.round(tasks.filter(t => t.status === 'completed').length / tasks.length * 100) : 0}%; height: 100%; background: #10b981; border-radius: 2px;"></div>
        </div>
        <div style="font-size: 11px; color: #10b981; margin-top: 4px;">完成率 ${tasks.length > 0 ? Math.round(tasks.filter(t => t.status === 'completed').length / tasks.length * 100) : 0}%</div>
      </div>
      <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: #fef3c7; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-spinner" style="color: #f59e0b; font-size: 16px;"></i>
          </div>
          <span style="font-size: 13px; color: #64748b; font-weight: 500;">进行中</span>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${tasks.filter(t => t.status === 'in_progress').length}</div>
        <div style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
          <div style="width: ${tasks.length > 0 ? Math.round(tasks.filter(t => t.status === 'in_progress').length / tasks.length * 100) : 0}%; height: 100%; background: #f59e0b; border-radius: 2px;"></div>
        </div>
        <div style="font-size: 11px; color: #f59e0b; margin-top: 4px;">占比 ${tasks.length > 0 ? Math.round(tasks.filter(t => t.status === 'in_progress').length / tasks.length * 100) : 0}%</div>
      </div>
      <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: #fee2e2; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 16px;"></i>
          </div>
          <span style="font-size: 13px; color: #64748b; font-weight: 500;">已逾期</span>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">${tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length}</div>
        <div style="font-size: 12px; color: #ef4444;">${tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length > 0 ? '需要关注' : '状态良好'}</div>
      </div>
    </div>
    
    <div class="filter-bar" style="background: #ffffff; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: #64748b; font-weight: 500;">项目:</label>
          <select class="filter-select" id="taskProjectFilter" style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;">
            <option value="all">全部项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: #64748b; font-weight: 500;">优先级:</label>
          <select class="filter-select" id="taskPriorityFilter" style="width: 110px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;">
            <option value="all">全部</option>
            <option value="urgent">紧急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: #64748b; font-weight: 500;">负责人:</label>
          <select class="filter-select" id="taskAssigneeFilter" style="width: 140px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;">
            <option value="all">全部成员</option>
            <option value="me" style="font-weight: 600;">⭐ 我的任务</option>
            ${state.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: #64748b; font-weight: 500;">阶段:</label>
          <select class="filter-select" id="taskPhaseFilter" style="width: 130px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;">
            <option value="all">全部阶段</option>
            <option value="preparation">前期准备</option>
            <option value="civil">土建施工</option>
            <option value="mechanical">机电安装</option>
            <option value="commissioning">工艺调试</option>
            <option value="trial-run">试运行</option>
            <option value="acceptance">竣工验收</option>
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: #64748b; font-weight: 500;">时间:</label>
          <select class="filter-select" id="taskDateRangeFilter" style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;">
            <option value="all">全部</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="overdue">已逾期</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        <div id="customDateRange" style="display: none; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: #64748b; font-weight: 500;">日期:</label>
          <input type="date" id="taskStartDate" style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;">
          <span style="color: #94a3b8;">至</span>
          <input type="date" id="taskEndDate" style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;">
        </div>
        <button id="undoTaskAction" class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px; margin-left: auto; display: none;" onclick="undoLastAction()">
          <i class="fas fa-undo"></i> 撤销
        </button>
        <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px; margin-left: 8px;" onclick="clearTaskFilters()">
          <i class="fas fa-redo"></i> 重置
        </button>
      </div>
      <div id="bulkActionBar" style="display: none; align-items: center; gap: 12px; padding: 12px 16px; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); border-radius: 10px; margin-top: 16px; color: white;">
        <span style="font-weight: 600; font-size: 14px;">已选 <span id="selectedTaskCount">0</span> 个任务</span>
        <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white; border-radius: 6px;" onclick="bulkCompleteTasks()">
          <i class="fas fa-check"></i> 批量完成
        </button>
        <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white; border-radius: 6px;" onclick="bulkDeleteTasks()">
          <i class="fas fa-trash"></i> 批量删除
        </button>
        <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white; border-radius: 6px;" onclick="clearTaskSelection()">
          <i class="fas fa-times"></i> 取消选择
        </button>
      </div>
    </div>
    
    <div id="taskContent">
      ${renderKanbanBoard(tasks)}
    </div>
  `;

  return html;
}

function getFilteredTasks() {
  const projectId = document.getElementById('taskProjectFilter')?.value || 'all';
  const priority = document.getElementById('taskPriorityFilter')?.value || 'all';
  const assigneeId = document.getElementById('taskAssigneeFilter')?.value || 'all';
  const phase = document.getElementById('taskPhaseFilter')?.value || 'all';
  const dateRange = document.getElementById('taskDateRangeFilter')?.value || 'all';
  
  const filters = {};
  if (projectId !== 'all') filters.projectId = projectId;
  if (priority !== 'all') filters.priority = priority;
  if (assigneeId === 'me') {
    const state = store.getState();
    filters.assigneeId = state.currentUser?.id || '';
  } else if (assigneeId !== 'all') {
    filters.assigneeId = assigneeId;
  }
  
  let tasks = store.filterTasks(filters);

  if (phase !== 'all') {
    // 根据任务的 category 属性筛选（任务类别：土建施工、机电安装、工艺调试等）
    const phaseToCategory = {
      'preparation': '前期准备',
      'civil': '土建施工',
      'mechanical': '机电安装',
      'commissioning': '工艺调试',
      'trial-run': '试运行',
      'acceptance': '竣工验收'
    };
    const targetCategory = phaseToCategory[phase];
    tasks = tasks.filter(t => t.category === targetCategory);
  }

  // 时间范围筛选
  if (dateRange !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate, endDate;
    
    if (dateRange === 'today') {
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
    } else if (dateRange === 'week') {
      const dayOfWeek = today.getDay();
      const weekStart = new Date(today.getTime() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 24 * 60 * 60 * 1000);
      startDate = weekStart;
      endDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    } else if (dateRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (dateRange === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
    } else if (dateRange === 'overdue') {
      tasks = tasks.filter(t => store.isTaskOverdue(t));
      return tasks;
    } else if (dateRange === 'custom') {
      const customStart = document.getElementById('taskStartDate')?.value;
      const customEnd = document.getElementById('taskEndDate')?.value;
      if (customStart) startDate = new Date(customStart);
      if (customEnd) endDate = new Date(customEnd + 'T23:59:59');
    }
    
    if (startDate || endDate) {
      tasks = tasks.filter(t => {
        const taskDueDate = new Date(t.dueDate);
        if (startDate && taskDueDate < startDate) return false;
        if (endDate && taskDueDate > endDate) return false;
        return true;
      });
    }
  }

  return tasks;
}

function applyTaskFilters() {
  const filteredTasks = getFilteredTasks();
  const content = document.getElementById('taskContent');
  if (content) {
    content.innerHTML = renderKanbanBoard(filteredTasks);
    updateBulkActionBar();
  }
}

function quickChangeTaskStatus(taskId, newStatus) {
  const task = store.getTaskById(taskId);
  if (!task) return;
  
  if (newStatus === 'in_progress') {
    const dependencyCheck = store.checkTaskDependencies(taskId);
    if (!dependencyCheck.canStart) {
      const reasons = dependencyCheck.blockedBy.map(b => b.reason).join('\n\n');
      alert(`无法开始此任务，前置条件未满足：\n\n${reasons}`);
      return;
    }
  }
  
  const updateData = { status: newStatus };
  if (newStatus === 'completed') {
    updateData.progress = 100;
  } else if (newStatus === 'todo' && task.status === 'completed') {
    updateData.progress = 0;
  }
  
  store.updateTask(taskId, updateData);
  
  if (newStatus === 'completed') {
    showTaskCompleteCelebration(task.name);
  }
  
  renderContent();
}

function quickFilterMyTasks() {
  const assigneeFilter = document.getElementById('taskAssigneeFilter');
  if (assigneeFilter) {
    assigneeFilter.value = 'me';
    applyTaskFilters();
  }
}

function renderKanbanBoard(tasks) {
  const statusConfig = store.getTaskStatusConfig();
  
  // 定义列结构：滞后和逾期合并到进行中，取消合并到终止
  const columnConfig = [
    { id: 'todo', statuses: ['todo'] },
    { id: 'in_progress', statuses: ['in_progress', 'delayed', 'overdue'] },
    { id: 'paused', statuses: ['paused'] },
    { id: 'completed', statuses: ['completed'] },
    { id: 'terminated', statuses: ['terminated', 'cancelled'] }
  ];
  
  const columns = {};
  columnConfig.forEach(col => {
    const mainStatus = statusConfig.find(s => s.id === col.id);
    if (mainStatus) {
      // 获取该列包含的所有状态的任务
      const columnTasks = tasks.filter(t => col.statuses.includes(t.status));
      columns[col.id] = { 
        title: mainStatus.name, 
        class: col.id, 
        color: mainStatus.color, 
        tasks: columnTasks,
        subStatuses: col.statuses.filter(s => s !== col.id)
      };
    }
  });
  
  return `
    <div class="kanban-board">
      ${Object.entries(columns).map(([status, column]) => `
        <div class="kanban-column" data-status="${status}">
          <div class="kanban-column-header">
            <div class="kanban-column-title">
              ${column.title}
              <span class="kanban-column-count ${column.class}" style="background: ${column.color}20; color: ${column.color}; border-color: ${column.color}40;">${column.tasks.length}</span>
            </div>
          </div>
          <div class="kanban-cards" data-status="${status}" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)">
            ${column.tasks.map(task => renderKanbanCard(task)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderKanbanCard(task) {
  const assignee = store.getUserById(task.assigneeId);
  const project = store.getProjectById(task.projectId);
  const isOverdue = store.isTaskOverdue(task);
  const isDelayed = store.isTaskDelayed(task);
  const subtasks = store.getTasksByProject(task.projectId).filter(t => t.parentId === task.id);
  const parentTask = task.parentId ? store.getTaskById(task.parentId) : null;
  const isSelected = selectedTaskIds.has(task.id);
  const statusConfig = store.getTaskStatusById(task.status);
  
  const taskId = `task-${task.id}`;
  const statusColor = statusConfig ? statusConfig.color : '#6b7280';

  // 状态切换按钮，排除滞后和逾期（这两个状态由系统自动判断）
    const statusButtons = store.getTaskStatusConfig().filter(s => s.id !== task.status && s.id !== 'delayed' && s.id !== 'overdue').map(status => {
    const color = status.color;
    return `<button class="status-btn" style="background: ${color}12; color: ${color}; border-color: ${color}20; display: flex; align-items: center; gap: 4px; padding: 4px 8px; font-size: 11px;" onclick="event.stopPropagation(); quickChangeTaskStatus('${task.id}', '${status.id}')" title="切换为: ${status.name}">
      <i class="fas fa-${status.icon}"></i>
      <span>${status.name}</span>
    </button>`;
  }).join('');

  return `
    <div class="kanban-card ${task.parentId ? 'has-parent-task' : ''} ${isSelected ? 'selected' : ''} ${isOverdue ? 'task-overdue' : ''} ${isDelayed ? 'task-delayed' : ''} priority-${task.priority}" 
      draggable="true" data-task-id="${task.id}" ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)">
      <div class="kanban-card-header">
        <div class="kanban-card-title-wrapper">
          <input type="checkbox" class="task-select-checkbox" ${isSelected ? 'checked' : ''} 
            onclick="event.stopPropagation(); toggleTaskSelection('${task.id}', this.checked)">
          ${task.parentId ? `<div class="parent-task-indicator" title="父任务: ${parentTask?.name || ''}"><i class="fas fa-level-up-alt"></i></div>` : ''}
          <span class="kanban-card-title">${task.name}</span>
          ${isOverdue ? `<span class="status-badge badge-overdue"><i class="fas fa-exclamation-triangle"></i> 逾期</span>` : ''}
          ${isDelayed && !isOverdue ? `<span class="status-badge badge-delayed"><i class="fas fa-alarm-clock"></i> 滞后</span>` : ''}
        </div>
        <div class="kanban-card-priority ${task.priority}"></div>
      </div>
      
      <div class="kanban-card-status" style="color: ${statusColor};">
        <i class="fas fa-${statusConfig?.icon || 'circle'}"></i>
        <span>${statusConfig?.name || task.status}</span>
      </div>
      
      ${task.parentId ? `<div class="parent-task-name"><i class="fas fa-link"></i>${parentTask?.name || '未知父任务'}</div>` : ''}
      
      <div class="kanban-card-meta">
        <span><i class="fas fa-folder"></i>${project?.name || '未知项目'}</span>
        ${project?.phase ? `<span class="tag tag-phase">${getPhaseName(project.phase)}</span>` : ''}
      </div>
      
      ${subtasks.length > 0 ? `
        <div class="subtask-summary" onclick="toggleSubtasks('${task.id}')">
          <i class="fas fa-list-ol"></i>
          <span>子任务 ${subtasks.filter(t => t.status === 'completed').length}/${subtasks.length}</span>
          <i class="fas fa-chevron-down" id="subtask-toggle-${task.id}"></i>
        </div>
      ` : ''}
      
      <div class="kanban-card-progress">
        <div class="progress-label">
          <span>进度</span>
          <span>${task.progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${task.progress}%; background: linear-gradient(90deg, ${statusColor}, ${statusColor}80);"></div>
        </div>
      </div>
      
      <div class="kanban-card-footer">
        <div class="kanban-card-assignee">
          <i class="fas fa-user-circle"></i>
          <span>${assignee?.name ? formatUserName(assignee.name) : '未分配'}</span>
        </div>
        <div class="kanban-card-due ${isOverdue ? 'overdue' : ''}">
          <i class="fas fa-calendar"></i>
          ${DateUtils.formatDate(task.dueDate)}
        </div>
      </div>
      
      <div class="kanban-card-actions">
        <button class="btn btn-icon btn-sm" onclick="showAddSubtaskModal('${task.id}')" title="添加子任务">
          <i class="fas fa-plus-circle"></i>
        </button>
        <button class="btn btn-icon btn-sm" onclick="showEditTaskModal('${task.id}')" title="编辑任务">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-icon btn-sm btn-danger" onclick="confirmDeleteTask('${task.id}')" title="删除任务">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      
      ${subtasks.length > 0 ? `
        <div class="subtask-list-container" id="subtask-container-${task.id}">
          <div class="subtask-list">
            ${subtasks.map((subtask, index) => renderSubtaskItem(subtask, index, subtasks.length)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function toggleSubtasks(taskId) {
  const container = document.getElementById(`subtask-container-${taskId}`);
  const toggleIcon = document.getElementById(`subtask-toggle-${taskId}`);
  
  if (container) {
    if (container.classList.contains('show')) {
      container.classList.remove('show');
      if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
    } else {
      container.classList.add('show');
      if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
    }
  }
}

let draggedTask = null;
let taskHistory = [];
const MAX_HISTORY = 50;

function pushTaskHistory(action, taskId, oldValue, newValue) {
  taskHistory.unshift({
    id: Date.now(),
    action,
    taskId,
    oldValue,
    newValue,
    timestamp: new Date().toISOString()
  });
  
  if (taskHistory.length > MAX_HISTORY) {
    taskHistory.pop();
  }
  
  updateUndoButton();
}

function updateUndoButton() {
  const undoBtn = document.getElementById('undoTaskAction');
  if (undoBtn) {
    undoBtn.style.display = taskHistory.length > 0 ? 'inline-flex' : 'none';
  }
}

function undoLastAction() {
  if (taskHistory.length === 0) return;
  
  const lastAction = taskHistory.shift();
  
  if (lastAction.action === 'update') {
    store.updateTask(lastAction.taskId, lastAction.oldValue);
    store.addNotification({
      type: 'success',
      title: '操作已撤销',
      message: '任务状态已恢复'
    });
  } else if (lastAction.action === 'delete') {
    store.addTask(lastAction.oldValue);
    store.addNotification({
      type: 'success',
      title: '任务已恢复',
      message: '已恢复被删除的任务'
    });
  }
  
  updateUndoButton();
  renderContent();
}

function handleDragStart(e) {
  draggedTask = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedTask = null;
  document.querySelectorAll('.kanban-cards').forEach(card => {
    card.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  const cardsContainer = e.target.closest('.kanban-cards');
  if (cardsContainer) {
    cardsContainer.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  const cardsContainer = e.target.closest('.kanban-cards');
  if (cardsContainer && !cardsContainer.contains(e.relatedTarget)) {
    cardsContainer.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const cardsContainer = e.target.closest('.kanban-cards');
  if (cardsContainer && draggedTask) {
    const newStatus = cardsContainer.dataset.status;
    const taskId = draggedTask.dataset.taskId;
    const task = store.getTaskById(taskId);
    
    if (!task) {
      cardsContainer.classList.remove('drag-over');
      return;
    }
    
    if (newStatus === 'in_progress') {
      const dependencyCheck = store.checkTaskDependencies(taskId);
      if (!dependencyCheck.canStart) {
        const reasons = dependencyCheck.blockedBy.map(b => b.reason).join('\n\n');
        alert(`无法开始此任务，前置条件未满足：\n\n${reasons}`);
        cardsContainer.classList.remove('drag-over');
        return;
      }
    }
    
    pushTaskHistory('update', taskId, { status: task.status, progress: task.progress }, { status: newStatus });
    
    store.updateTaskStatus(taskId, newStatus);
    
    cardsContainer.classList.remove('drag-over');
    applyTaskFilters();
  }
}

function showCreateTaskModal(projectId = null) {
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建任务</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createTaskModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="createTaskForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">任务名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入任务名称">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">任务描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="description" placeholder="请输入任务描述"></textarea>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">所属项目 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}" ${projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">负责人 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId" required>
                <option value="">请选择负责人</option>
                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">开始日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="startDate">
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">截止日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate" required>
            </div>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">优先级 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority" required>
              <option value="">请选择优先级</option>
              <option value="urgent">紧急</option>
              <option value="high">高</option>
              <option value="medium" selected>中</option>
              <option value="low">低</option>
            </select>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">工程阶段</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
              <option value="">请选择工程阶段</option>
              <option value="前期准备">前期准备</option>
              <option value="土建施工">土建施工</option>
              <option value="机电安装">机电安装</option>
              <option value="工艺调试">工艺调试</option>
              <option value="试运行">试运行</option>
              <option value="竣工验收">竣工验收</option>
            </select>
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">进度 (%)</label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="progress" min="0" max="100" value="0" required>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('createTaskModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);" onclick="handleCreateTask()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createTaskModal', contentHtml);
}

function handleCreateTask() {
  const form = document.getElementById('createTaskForm');
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    projectId: formData.get('projectId'),
    assigneeId: formData.get('assigneeId'),
    startDate: formData.get('startDate'),
    dueDate: formData.get('dueDate'),
    priority: formData.get('priority'),
    status: formData.get('status') || 'todo',
    progress: parseInt(formData.get('progress')) || 0,
    category: formData.get('category') || null,
    parentId: formData.get('parentId') || null,
    dependencies: Array.from(formData.getAll('dependencies')),
    alertBeforeDays: parseInt(formData.get('alertBeforeDays')) || 0
  };
  
  const validation = Validate.validateTask(data);
  if (!validation.isValid) {
    alert(Object.values(validation.errors)[0]);
    return;
  }
  
  store.addTask(data);
  closeModal('createTaskModal');
  renderContent();
  store.addNotification({
    type: 'success',
    title: '任务创建成功',
    message: `任务"${data.name}"已成功创建`
  });
}

function showEditTaskModal(taskId) {
  const task = store.getTaskById(taskId);
  if (!task) return;
  
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑任务</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editTaskModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editTaskForm">
          <input type="hidden" name="id" value="${task.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">任务名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${task.name}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">任务描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description">${task.description || ''}</textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
                ${projects.map(p => `<option value="${p.id}" ${task.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">负责人 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId" required>
                ${users.map(u => `<option value="${u.id}" ${task.assigneeId === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">开始日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="startDate" value="${task.startDate}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">截止日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate" required value="${task.dueDate}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority" required>
                <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>紧急</option>
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">工程阶段</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
                <option value="" ${!task.category ? 'selected' : ''}>请选择工程阶段</option>
                <option value="前期准备" ${task.category === '前期准备' ? 'selected' : ''}>前期准备</option>
                <option value="土建施工" ${task.category === '土建施工' ? 'selected' : ''}>土建施工</option>
                <option value="机电安装" ${task.category === '机电安装' ? 'selected' : ''}>机电安装</option>
                <option value="工艺调试" ${task.category === '工艺调试' ? 'selected' : ''}>工艺调试</option>
                <option value="试运行" ${task.category === '试运行' ? 'selected' : ''}>试运行</option>
                <option value="竣工验收" ${task.category === '竣工验收' ? 'selected' : ''}>竣工验收</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                ${store.getTaskStatusConfig().filter(s => s.id !== 'delayed' && s.id !== 'overdue').map(status => `
                  <option value="${status.id}" ${task.status === status.id ? 'selected' : ''}>${status.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">进度 (%)</label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="progress" min="0" max="100" value="${task.progress}" required>
          </div>
        </form>
        
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h4 style="font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;">子任务</h4>
            <button style="padding: 6px 14px; font-size: 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;" onclick="showAddSubtaskModal('${task.id}')">
              <i class="fas fa-plus"></i> 添加子任务
            </button>
          </div>
          <div id="editTaskSubtasks-${task.id}">
            ${renderSubtasksForEdit(task.id)}
          </div>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editTaskModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditTask()">保存</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 8px; cursor: pointer;" onclick="closeModal('editTaskModal'); showStatusConfigModal()">
          <i class="fas fa-cog"></i> 管理状态
        </button>
      </div>
    </div>
  `;
  
  showModal('editTaskModal', contentHtml);
}

function handleEditTask() {
  const form = document.getElementById('editTaskForm');
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    projectId: formData.get('projectId'),
    assigneeId: formData.get('assigneeId'),
    startDate: formData.get('startDate'),
    dueDate: formData.get('dueDate'),
    priority: formData.get('priority'),
    status: formData.get('status'),
    progress: parseInt(formData.get('progress')) || 0,
    category: formData.get('category') || null
  };
  
  const validation = Validate.validateTask(data);
  if (!validation.isValid) {
    alert(Object.values(validation.errors)[0]);
    return;
  }
  
  const taskId = formData.get('id');
  store.updateTask(taskId, data);
  closeModal('editTaskModal');
  renderContent();
}

function confirmDeleteTask(taskId) {
  const task = store.getTaskById(taskId);
  if (!task) return;
  
  if (confirm(`确定要删除任务"${task.name}"吗？删除后可通过撤销按钮恢复。`)) {
    pushTaskHistory('delete', taskId, { ...task }, null);
    
    store.deleteTask(taskId);
    renderContent();
    store.addNotification({
      type: 'warning',
      title: '任务已删除',
      message: `任务"${task.name}"已被删除，可点击撤销按钮恢复`
    });
  }
}

function showAddSubtaskModal(parentTaskId) {
  const parentTask = store.getTaskById(parentTaskId);
  if (!parentTask) return;
  
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">添加子任务 - ${parentTask.name}</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addSubtaskModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="addSubtaskForm">
          <input type="hidden" name="parentId" value="${parentTaskId}">
          <input type="hidden" name="projectId" value="${parentTask.projectId}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">子任务名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入子任务名称">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">子任务描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" placeholder="请输入子任务描述"></textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">负责人</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId">
                <option value="">请选择负责人</option>
                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">截止日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority">
                <option value="low">低</option>
                <option value="medium" selected>中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="todo" selected>待开始</option>
                <option value="in_progress">进行中</option>
                <option value="paused">暂停</option>
                <option value="terminated">终止</option>
              </select>
            </div>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addSubtaskModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddSubtask()">添加</button>
      </div>
    </div>
  `;
  
  showModal('addSubtaskModal', contentHtml);
}

function handleAddSubtask() {
  const form = document.getElementById('addSubtaskForm');
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    projectId: formData.get('projectId'),
    parentId: formData.get('parentId'),
    assigneeId: formData.get('assigneeId') || null,
    dueDate: formData.get('dueDate') || null,
    priority: formData.get('priority') || 'medium',
    status: formData.get('status') || 'todo',
    progress: 0
  };
  
  if (!data.name) {
    alert('请输入子任务名称');
    return;
  }
  
  store.addTask(data);
  closeModal('addSubtaskModal');
  renderContent();
  store.addNotification({
    type: 'success',
    title: '子任务创建成功',
    message: `子任务"${data.name}"已成功添加`
  });
}

function getSubtasks(parentTaskId) {
  const state = store.getState();
  return state.tasks.filter(t => t.parentId === parentTaskId);
}

function renderSubtaskList(parentTaskId) {
  const subtasks = getSubtasks(parentTaskId);
  if (subtasks.length === 0) return '';
  
  return `
    <div class="subtask-list">
      <div class="subtask-list-header">
        <span>子任务 (${subtasks.length})</span>
      </div>
      <div class="subtask-list-items">
        ${subtasks.map((subtask, i) => renderSubtaskItem(subtask, i, subtasks.length)).join('')}
      </div>
    </div>
  `;
}

function renderSubtaskItem(subtask, index, total) {
  const assignee = store.getUserById(subtask.assigneeId);
  const isLast = index === total - 1;
  
  return `
    <div class="subtask-item ${subtask.status === 'completed' ? 'completed' : ''} ${isLast ? 'last' : ''}">
      <div class="subtask-tree-line"></div>
      <div class="subtask-content-wrapper">
        <input 
          type="checkbox" 
          class="subtask-checkbox" 
          ${subtask.status === 'completed' ? 'checked' : ''} 
          onchange="toggleSubtaskStatus('${subtask.id}')"
        >
        <div class="subtask-content">
          <div class="subtask-name">${subtask.name}</div>
          <div class="subtask-meta">
            ${subtask.dueDate ? `
              <i class="fas fa-calendar"></i>
              <span>${DateUtils.formatDate(subtask.dueDate)}</span>
            ` : ''}
            ${assignee ? `
              <i class="fas fa-user"></i>
              <span>${assignee.name}</span>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleSubtaskStatus(subtaskId) {
  const subtask = store.getTaskById(subtaskId);
  if (!subtask) return;
  
  const newStatus = subtask.status === 'completed' ? 'todo' : 'completed';
  store.updateTask(subtaskId, { 
    status: newStatus,
    progress: newStatus === 'completed' ? 100 : 0
  });
  renderContent();
}

function renderSubtasksForEdit(parentTaskId) {
  const subtasks = getSubtasks(parentTaskId);
  
  if (subtasks.length === 0) {
    return `
      <div style="text-align: center; padding: 20px; color: #9ca3af;">
        <i class="fas fa-list" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
        <div style="font-size: 13px;">暂无子任务</div>
        <div style="font-size: 12px; margin-top: 4px;">点击上方按钮添加子任务</div>
      </div>
    `;
  }
  
  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${subtasks.map(subtask => {
        const assignee = store.getUserById(subtask.assigneeId);
        const isCompleted = subtask.status === 'completed';
        return `
          <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f8fafc; border-radius: 8px;">
            <input 
              type="checkbox" 
              ${isCompleted ? 'checked' : ''} 
              onchange="toggleSubtaskStatusFromEdit('${subtask.id}', '${parentTaskId}')"
              style="width: 16px; height: 16px; cursor: pointer;"
            >
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 500; color: #334155; text-decoration: ${isCompleted ? 'line-through' : 'none'};">${subtask.name}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                ${subtask.dueDate ? `${DateUtils.formatDate(subtask.dueDate)} ` : ''}
                ${assignee ? `| ${assignee.name}` : ''}
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button style="padding: 4px 8px; font-size: 11px; background: #f1f5f9; color: #64748b; border: none; border-radius: 4px; cursor: pointer;" onclick="showEditSubtaskModal('${subtask.id}')" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button style="padding: 4px 8px; font-size: 11px; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; cursor: pointer;" onclick="confirmDeleteSubtask('${subtask.id}', '${parentTaskId}')" title="删除">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function toggleSubtaskStatusFromEdit(subtaskId, parentTaskId) {
  const subtask = store.getTaskById(subtaskId);
  if (!subtask) return;
  
  const newStatus = subtask.status === 'completed' ? 'todo' : 'completed';
  store.updateTask(subtaskId, { 
    status: newStatus,
    progress: newStatus === 'completed' ? 100 : 0
  });
  
  const container = document.getElementById(`editTaskSubtasks-${parentTaskId}`);
  if (container) {
    container.innerHTML = renderSubtasksForEdit(parentTaskId);
  }
}

function confirmDeleteSubtask(subtaskId, parentTaskId) {
  if (confirm('确定要删除这个子任务吗？')) {
    store.deleteTask(subtaskId);
    const container = document.getElementById(`editTaskSubtasks-${parentTaskId}`);
    if (container) {
      container.innerHTML = renderSubtasksForEdit(parentTaskId);
    }
    renderContent();
  }
}

function showEditSubtaskModal(subtaskId) {
  const subtask = store.getTaskById(subtaskId);
  if (!subtask) return;
  
  const users = store.getState().users;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑子任务</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editSubtaskModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editSubtaskForm">
          <input type="hidden" name="id" value="${subtask.id}">
          <input type="hidden" name="parentId" value="${subtask.parentId}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">子任务名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${subtask.name}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">子任务描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description">${subtask.description || ''}</textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">负责人</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId">
                <option value="">请选择负责人</option>
                ${users.map(u => `<option value="${u.id}" ${subtask.assigneeId === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">截止日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate" value="${subtask.dueDate || ''}">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
              <option value="todo" ${subtask.status === 'todo' ? 'selected' : ''}>待开始</option>
              <option value="in_progress" ${subtask.status === 'in_progress' ? 'selected' : ''}>进行中</option>
              <option value="completed" ${subtask.status === 'completed' ? 'selected' : ''}>已完成</option>
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editSubtaskModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditSubtask()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editSubtaskModal', contentHtml);
}

function handleEditSubtask() {
  const form = document.getElementById('editSubtaskForm');
  const formData = new FormData(form);
  
  const data = {
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
    assigneeId: formData.get('assigneeId') || null,
    dueDate: formData.get('dueDate') || null,
    status: formData.get('status'),
    parentId: formData.get('parentId')
  };
  
  if (!data.name) {
    alert('请输入子任务名称');
    return;
  }
  
  store.updateTask(data.id, data);
  closeModal('editSubtaskModal');
  renderContent();
  store.addNotification({
    type: 'success',
    title: '子任务更新成功',
    message: `子任务"${data.name}"已成功更新`
  });
}

// --- Task selection for bulk actions ---
const selectedTaskIds = new Set();

function toggleTaskSelection(taskId, checked) {
  if (checked) {
    selectedTaskIds.add(taskId);
  } else {
    selectedTaskIds.delete(taskId);
  }
  updateBulkActionBar();
}

function clearTaskSelection() {
  selectedTaskIds.clear();
  updateBulkActionBar();
  applyTaskFilters();
}

function clearTaskFilters() {
  const projectFilter = document.getElementById('taskProjectFilter');
  const priorityFilter = document.getElementById('taskPriorityFilter');
  const assigneeFilter = document.getElementById('taskAssigneeFilter');
  const phaseFilter = document.getElementById('taskPhaseFilter');
  const dateRangeFilter = document.getElementById('taskDateRangeFilter');
  const startDate = document.getElementById('taskStartDate');
  const endDate = document.getElementById('taskEndDate');
  const customDateRange = document.getElementById('customDateRange');
  
  if (projectFilter) projectFilter.value = 'all';
  if (priorityFilter) priorityFilter.value = 'all';
  if (assigneeFilter) assigneeFilter.value = 'all';
  if (phaseFilter) phaseFilter.value = 'all';
  if (dateRangeFilter) dateRangeFilter.value = 'all';
  if (startDate) startDate.value = '';
  if (endDate) endDate.value = '';
  if (customDateRange) customDateRange.style.display = 'none';
  
  applyTaskFilters();
}

function updateBulkActionBar() {
  const bar = document.getElementById('bulkActionBar');
  const countEl = document.getElementById('selectedTaskCount');
  if (bar && countEl) {
    if (selectedTaskIds.size > 0) {
      bar.style.display = 'flex';
      countEl.textContent = selectedTaskIds.size;
    } else {
      bar.style.display = 'none';
    }
  }
}

function bulkCompleteTasks() {
  if (selectedTaskIds.size === 0) return;
  if (!confirm(`确定要将 ${selectedTaskIds.size} 个任务标记为已完成吗？`)) return;
  
  selectedTaskIds.forEach(taskId => {
    store.updateTask(taskId, { status: 'completed', progress: 100 });
  });
  
  store.addNotification({
    type: 'success',
    title: '批量操作完成',
    message: `已批量完成 ${selectedTaskIds.size} 个任务`
  });
  
  selectedTaskIds.clear();
  renderContent();
}

function bulkDeleteTasks() {
  if (selectedTaskIds.size === 0) return;
  if (!confirm(`确定要删除 ${selectedTaskIds.size} 个任务吗？删除后可通过撤销按钮恢复。`)) return;
  
  selectedTaskIds.forEach(taskId => {
    const task = store.getTaskById(taskId);
    if (task) {
      pushTaskHistory('delete', taskId, { ...task }, null);
    }
    store.deleteTask(taskId);
  });
  
  store.addNotification({
    type: 'warning',
    title: '批量操作完成',
    message: `已批量删除 ${selectedTaskIds.size} 个任务，可点击撤销按钮恢复`
  });
  
  selectedTaskIds.clear();
  renderContent();
}

// --- Task completion celebration ---
function showTaskCompleteCelebration(taskName) {
  const existing = document.querySelector('.task-celebration-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'task-celebration-overlay';
  overlay.innerHTML = `
    <div class="task-celebration-box">
      <div class="task-celebration-icon">🎉</div>
      <div class="task-celebration-title">任务完成！</div>
      <div class="task-celebration-task-name">"${taskName}"</div>
      <div class="task-celebration-subtitle">太棒了，继续保持！</div>
    </div>
  `;
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
    z-index: 10000; animation: fadeIn 0.2s ease;
  `;
  
  const box = overlay.querySelector('.task-celebration-box');
  if (box) {
    box.style.cssText = `
      background: var(--bg-white); border-radius: 16px; padding: 40px 48px; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: celebrationPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
  }

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  }, 1800);
}

function showBPMNFlowModal() {
  const state = store.getState();
  const tasks = state.tasks.filter(t => t.status !== 'cancelled');
  const projects = state.projects;
  const flows = store.getSequenceFlows();
  
  const flowTypeOptions = [
    { value: 'FS', label: '完成-开始 (FS)' },
    { value: 'FF', label: '完成-完成 (FF)' },
    { value: 'SS', label: '开始-开始 (SS)' },
    { value: 'SF', label: '开始-完成 (SF)' }
  ];
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 85vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">BPMN流程依赖管理</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('bpmnFlowModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0;">
          <h4 style="margin-bottom: 12px; font-size: 16px; color: #1e293b;">添加流程依赖</h4>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">所属项目</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" id="flowProjectFilter" onchange="updateFlowTaskOptions()">
              <option value="all">全部项目</option>
              ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">源任务（前置）</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" id="flowSourceTask">
                <option value="">请选择源任务</option>
                ${tasks.map(t => {
                  const project = projects.find(p => p.id === t.projectId);
                  return `<option value="${t.id}" data-project="${t.projectId}">${t.name}${project ? ` (${project.name})` : ''}</option>`;
                }).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">依赖类型</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" id="flowType">
                ${flowTypeOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">目标任务（后置）</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" id="flowTargetTask">
                <option value="">请选择目标任务</option>
                ${tasks.map(t => {
                  const project = projects.find(p => p.id === t.projectId);
                  return `<option value="${t.id}" data-project="${t.projectId}">${t.name}${project ? ` (${project.name})` : ''}</option>`;
                }).join('')}
              </select>
            </div>
          </div>
          <div style="margin-top: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">条件表达式（可选）</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" id="flowCondition" placeholder="如: ctx.progress >= 80">
            <small style="color: #64748b; font-size: 12px; margin-top: 4px; display: block;">
              可用变量: ctx.task, ctx.progress, ctx.status, ctx.isCompleted, ctx.isOverdue
            </small>
          </div>
          <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); margin-top: 16px;" onclick="addBPMNFlow()">
            <i class="fas fa-plus"></i> 添加依赖
          </button>
        </div>
        
        <div>
          <h4 style="margin-bottom: 12px; font-size: 16px; color: #1e293b;">已配置的流程依赖</h4>
          ${flows.length === 0 ? `
            <div style="padding: 32px; text-align: center;">
              <i class="fas fa-project-diagram" style="font-size: 48px; color: #94a3b8;"></i>
              <p style="margin-top: 12px; color: #1e293b;">暂无流程依赖</p>
              <p style="color: #64748b;">点击上方按钮添加任务间的BPMN依赖关系</p>
            </div>
          ` : `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0;">
                  <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">源任务</th>
                  <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">依赖类型</th>
                  <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">目标任务</th>
                  <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">条件</th>
                  <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">操作</th>
                </tr>
              </thead>
              <tbody>
                ${flows.map(flow => {
                  const sourceTask = tasks.find(t => t.id === flow.sourceTaskId);
                  const targetTask = tasks.find(t => t.id === flow.targetTaskId);
                  const flowType = flowTypeOptions.find(f => f.value === flow.type);
                  return `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 12px;">${sourceTask?.name || '未知'}</td>
                      <td style="padding: 12px;"><span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; color: white; background: #3b82f6;">${flowType?.label || flow.type}</span></td>
                      <td style="padding: 12px;">${targetTask?.name || '未知'}</td>
                      <td style="padding: 12px;">${flow.condition || '-'}</td>
                      <td style="padding: 12px;">
                        <button style="padding: 6px 12px; border-radius: 8px; font-size: 12px; background: #ef4444; color: white; border: none; cursor: pointer;" onclick="removeBPMNFlow('${flow.id}')">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
        
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <h4 style="margin-bottom: 12px; font-size: 16px; color: #1e293b;">BPMN依赖类型说明</h4>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
              <div style="font-weight: 600; color: #3b82f6;">完成-开始 (FS)</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">源任务完成后，目标任务才能开始</div>
            </div>
            <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
              <div style="font-weight: 600; color: #10b981;">完成-完成 (FF)</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">源任务完成后，目标任务才能完成</div>
            </div>
            <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
              <div style="font-weight: 600; color: #f59e0b;">开始-开始 (SS)</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">源任务开始后，目标任务才能开始</div>
            </div>
            <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
              <div style="font-weight: 600; color: #ef4444;">开始-完成 (SF)</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">源任务开始后，目标任务才能完成</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  showModal('bpmnFlowModal', contentHtml);
}

function updateFlowTaskOptions() {
  const projectId = document.getElementById('flowProjectFilter')?.value || 'all';
  const sourceSelect = document.getElementById('flowSourceTask');
  const targetSelect = document.getElementById('flowTargetTask');
  
  if (!sourceSelect || !targetSelect) return;
  
  // 更新源任务选项
  Array.from(sourceSelect.options).forEach(option => {
    if (option.value === '') return; // 跳过"请选择"选项
    const taskProjectId = option.getAttribute('data-project');
    if (projectId === 'all' || taskProjectId === projectId) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  });
  
  // 更新目标任务选项
  Array.from(targetSelect.options).forEach(option => {
    if (option.value === '') return; // 跳过"请选择"选项
    const taskProjectId = option.getAttribute('data-project');
    if (projectId === 'all' || taskProjectId === projectId) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  });
  
  // 重置选择
  sourceSelect.value = '';
  targetSelect.value = '';
}

function addBPMNFlow() {
  const sourceTaskId = document.getElementById('flowSourceTask').value;
  const targetTaskId = document.getElementById('flowTargetTask').value;
  const flowType = document.getElementById('flowType').value;
  const condition = document.getElementById('flowCondition').value || null;
  
  if (!sourceTaskId || !targetTaskId) {
    alert('请选择源任务和目标任务');
    return;
  }
  
  if (sourceTaskId === targetTaskId) {
    alert('源任务和目标任务不能相同');
    return;
  }
  
  store.addSequenceFlow(sourceTaskId, targetTaskId, flowType, condition);
  
  store.addNotification({
    type: 'success',
    title: 'BPMN依赖添加成功',
    message: '流程依赖关系已成功创建'
  });
  
  closeModal('bpmnFlowModal');
}

function removeBPMNFlow(flowId) {
  if (!confirm('确定要删除此流程依赖吗？')) return;
  
  store.removeSequenceFlow(flowId);
  
  store.addNotification({
    type: 'success',
    title: 'BPMN依赖删除成功',
    message: '流程依赖关系已成功删除'
  });
  
  closeModal('bpmnFlowModal');
}

function showStatusConfigModal() {
  const statusConfig = store.getTaskStatusConfig();
  
  const categoryNames = {
    pending: '待处理',
    active: '进行中',
    closed: '已结束'
  };
  
  const categories = ['pending', 'active', 'closed'];
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 80vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">任务状态配置</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('statusConfigModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="showAddCustomStatusModal()">
            <i class="fas fa-plus"></i> 添加自定义状态
          </button>
        </div>
        
        ${categories.map(category => `
          <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1e293b;">${categoryNames[category]}</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              ${statusConfig.filter(s => s.category === category).map(status => `
                <div style="padding: 12px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; border-radius: 4px; background: ${status.color};"></div>
                    <div>
                      <div style="font-weight: 500; color: #374151;">${status.name}</div>
                      <div style="font-size: 12px; color: #6b7280;">${status.id}</div>
                    </div>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    ${status.editable ? `
                      <button style="padding: 6px 12px; font-size: 12px; background: #ffffff; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 6px; cursor: pointer;" onclick="showEditCustomStatusModal('${status.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button style="padding: 6px 12px; font-size: 12px; background: #ffffff; color: #ef4444; border: 1px solid #ef4444; border-radius: 6px; cursor: pointer;" onclick="confirmDeleteCustomStatus('${status.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                      </button>
                    ` : `
                      <span style="font-size: 11px; color: #9ca3af; padding: 2px 6px; background: #e5e7eb; border-radius: 4px;">系统默认</span>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
        
        <div style="padding: 16px; background: #fef3c7; border-radius: 8px; margin-top: 24px;">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <i class="fas fa-info-circle" style="color: #92400e; font-size: 16px;"></i>
            <div style="font-size: 13px; color: #92400e;">
              <div style="font-weight: 600; margin-bottom: 4px;">提示</div>
              <ul style="margin: 0; padding-left: 20px;">
                <li>系统默认状态（待开始、进行中、暂停、终止、已完成、已取消、滞后、逾期）不可删除或编辑</li>
                <li>自定义状态可以随时删除，删除后使用该状态的任务将自动转为"待开始"状态</li>
                <li>状态分类决定了状态在看板中的位置顺序</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('statusConfigModal')">关闭</button>
      </div>
    </div>
  `;
  
  showModal('statusConfigModal', contentHtml);
}

function showAddCustomStatusModal() {
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">添加自定义状态</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addCustomStatusModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="addCustomStatusForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入状态名称">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态标识</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="id" placeholder="自动生成，可自定义（英文）">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">显示颜色 <span style="color: red;">*</span></label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="color" style="width: 60px; height: 40px; border: 1.5px solid #e2e8f0; border-radius: 8px; cursor: pointer;" name="color" value="#3b82f6">
              <input type="text" style="flex: 1; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="colorHex" value="#3b82f6" placeholder="颜色值">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">图标</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="icon">
              <option value="circle">圆圈</option>
              <option value="play">播放</option>
              <option value="pause">暂停</option>
              <option value="stop">停止</option>
              <option value="check-circle">完成</option>
              <option value="times-circle">取消</option>
              <option value="exclamation-triangle">警告</option>
              <option value="alarm-clock">时钟</option>
              <option value="flag">旗帜</option>
              <option value="star">星标</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态分类 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
              <option value="pending">待处理</option>
              <option value="active">进行中</option>
              <option value="closed">已结束</option>
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addCustomStatusModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddCustomStatus()">添加</button>
      </div>
    </div>
  `;
  
  showModal('addCustomStatusModal', contentHtml);
  
  setTimeout(() => {
    const colorInput = document.querySelector('#addCustomStatusModal input[type="color"]');
    const colorHexInput = document.querySelector('#addCustomStatusModal input[name="colorHex"]');
    
    if (colorInput && colorHexInput) {
      colorInput.addEventListener('input', (e) => {
        colorHexInput.value = e.target.value;
      });
      colorHexInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          colorInput.value = val;
        }
      });
    }
  }, 100);
}

function handleAddCustomStatus() {
  const form = document.getElementById('addCustomStatusForm');
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    id: formData.get('id') || formData.get('name').toLowerCase().replace(/\s+/g, '_'),
    color: formData.get('color') || '#3b82f6',
    icon: formData.get('icon') || 'circle',
    category: formData.get('category') || 'active'
  };
  
  if (!data.name) {
    alert('请输入状态名称');
    return;
  }
  
  store.addCustomStatus(data);
  
  store.addNotification({
    type: 'success',
    title: '自定义状态添加成功',
    message: `状态"${data.name}"已成功添加`
  });
  
  closeModal('addCustomStatusModal');
  closeModal('statusConfigModal');
  renderContent();
}

function showEditCustomStatusModal(statusId) {
  const status = store.getTaskStatusById(statusId);
  if (!status) return;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑自定义状态</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editCustomStatusModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editCustomStatusForm">
          <input type="hidden" name="id" value="${status.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${status.name}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态标识</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #f3f4f6;" name="id" value="${status.id}" readonly>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">显示颜色 <span style="color: red;">*</span></label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <input type="color" style="width: 60px; height: 40px; border: 1.5px solid #e2e8f0; border-radius: 8px; cursor: pointer;" name="color" value="${status.color}">
              <input type="text" style="flex: 1; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="colorHex" value="${status.color}">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">图标</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="icon">
              <option value="circle" ${status.icon === 'circle' ? 'selected' : ''}>圆圈</option>
              <option value="play" ${status.icon === 'play' ? 'selected' : ''}>播放</option>
              <option value="pause" ${status.icon === 'pause' ? 'selected' : ''}>暂停</option>
              <option value="stop" ${status.icon === 'stop' ? 'selected' : ''}>停止</option>
              <option value="check-circle" ${status.icon === 'check-circle' ? 'selected' : ''}>完成</option>
              <option value="times-circle" ${status.icon === 'times-circle' ? 'selected' : ''}>取消</option>
              <option value="exclamation-triangle" ${status.icon === 'exclamation-triangle' ? 'selected' : ''}>警告</option>
              <option value="alarm-clock" ${status.icon === 'alarm-clock' ? 'selected' : ''}>时钟</option>
              <option value="flag" ${status.icon === 'flag' ? 'selected' : ''}>旗帜</option>
              <option value="star" ${status.icon === 'star' ? 'selected' : ''}>星标</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态分类 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
              <option value="pending" ${status.category === 'pending' ? 'selected' : ''}>待处理</option>
              <option value="active" ${status.category === 'active' ? 'selected' : ''}>进行中</option>
              <option value="closed" ${status.category === 'closed' ? 'selected' : ''}>已结束</option>
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editCustomStatusModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditCustomStatus()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editCustomStatusModal', contentHtml);
  
  setTimeout(() => {
    const colorInput = document.querySelector('#editCustomStatusModal input[type="color"]');
    const colorHexInput = document.querySelector('#editCustomStatusModal input[name="colorHex"]');
    
    if (colorInput && colorHexInput) {
      colorInput.addEventListener('input', (e) => {
        colorHexInput.value = e.target.value;
      });
      colorHexInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          colorInput.value = val;
        }
      });
    }
  }, 100);
}

function handleEditCustomStatus() {
  const form = document.getElementById('editCustomStatusForm');
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    color: formData.get('color') || '#3b82f6',
    icon: formData.get('icon') || 'circle',
    category: formData.get('category') || 'active'
  };
  
  if (!data.name) {
    alert('请输入状态名称');
    return;
  }
  
  store.updateCustomStatus(formData.get('id'), data);
  
  store.addNotification({
    type: 'success',
    title: '自定义状态更新成功',
    message: `状态"${data.name}"已成功更新`
  });
  
  closeModal('editCustomStatusModal');
  closeModal('statusConfigModal');
  renderContent();
}

function confirmDeleteCustomStatus(statusId) {
  const status = store.getTaskStatusById(statusId);
  if (!status) return;
  
  if (confirm(`确定要删除状态"${status.name}"吗？使用该状态的任务将自动转为"待开始"状态。`)) {
    store.deleteCustomStatus(statusId);
    
    store.addNotification({
      type: 'success',
      title: '自定义状态删除成功',
      message: `状态"${status.name}"已成功删除`
    });
    
    closeModal('statusConfigModal');
    renderContent();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderTasks };
}
