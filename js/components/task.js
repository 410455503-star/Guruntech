function getPhaseName(phase) {
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
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-item">
        <label class="filter-label">所属项目:</label>
        <select class="filter-select" id="taskProjectFilter" onchange="applyTaskFilters()">
          <option value="all">全部项目</option>
          ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="filter-item">
        <label class="filter-label">优先级:</label>
        <select class="filter-select" id="taskPriorityFilter" onchange="applyTaskFilters()">
          <option value="all">全部</option>
          <option value="urgent">紧急</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
      <div class="filter-item">
        <label class="filter-label">负责人:</label>
        <select class="filter-select" id="taskAssigneeFilter" onchange="applyTaskFilters()">
          <option value="all">全部成员</option>
          <option value="me" style="font-weight: 600;">⭐ 我的任务</option>
          ${state.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
        </select>
      </div>
      <div class="filter-item">
        <label class="filter-label">工程阶段:</label>
        <select class="filter-select" id="taskPhaseFilter" onchange="applyTaskFilters()">
          <option value="all">全部</option>
          <option value="preparation">前期准备</option>
          <option value="civil">土建施工</option>
          <option value="mechanical">机电安装</option>
          <option value="commissioning">工艺调试</option>
          <option value="trial-run">试运行</option>
          <option value="acceptance">竣工验收</option>
        </select>
      </div>
      <div id="bulkActionBar" class="bulk-action-bar" style="display: none; align-items: center; gap: 12px; padding: 10px 16px; background: var(--primary-color); border-radius: 8px; margin-top: 12px; color: white;">
        <span style="font-weight: 600; font-size: 14px;">已选 <span id="selectedTaskCount">0</span> 个任务</span>
        <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white;" onclick="bulkCompleteTasks()">
          <i class="fas fa-check"></i> 批量完成
        </button>
        <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white;" onclick="bulkDeleteTasks()">
          <i class="fas fa-trash"></i> 批量删除
        </button>
        <button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white;" onclick="clearTaskSelection()">
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
    const state = store.getState();
    tasks = tasks.filter(t => {
      const project = state.projects.find(p => p.id === t.projectId);
      return project && project.phase === phase;
    });
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
  const columns = {
    todo: { title: '待开始', class: 'todo', tasks: tasks.filter(t => t.status === 'todo') },
    in_progress: { title: '进行中', class: 'progress', tasks: tasks.filter(t => t.status === 'in_progress') },
    completed: { title: '已完成', class: 'completed', tasks: tasks.filter(t => t.status === 'completed') }
  };
  
  return `
    <div class="kanban-board">
      ${Object.entries(columns).map(([status, column]) => `
        <div class="kanban-column" data-status="${status}">
          <div class="kanban-column-header">
            <div class="kanban-column-title">
              ${column.title}
              <span class="kanban-column-count ${column.class}">${column.tasks.length}</span>
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
  const isOverdue = DateUtils.isPast(task.dueDate) && task.status !== 'completed';
  const subtasks = store.getTasksByProject(task.projectId).filter(t => t.parentId === task.id);
  const parentTask = task.parentId ? store.getTaskById(task.parentId) : null;
  const isSelected = selectedTaskIds.has(task.id);
  
  const taskId = `task-${task.id}`;
  
  const priorityColors = { urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' };
  const priorityBorderColor = priorityColors[task.priority] || '#3b82f6';

  return `
    <div class="kanban-card ${task.parentId ? 'has-parent-task' : ''} ${isSelected ? 'selected' : ''}" draggable="true" data-task-id="${task.id}" ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)" style="border-left: 4px solid ${priorityBorderColor};">
      <div class="kanban-card-header">
        <div class="kanban-card-title" style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" class="task-select-checkbox" ${isSelected ? 'checked' : ''} 
            onclick="event.stopPropagation(); toggleTaskSelection('${task.id}', this.checked)" 
            style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary-color);">
          ${task.parentId ? `<div class="parent-task-indicator" title="父任务: ${parentTask?.name || ''}"><i class="fas fa-level-up-alt"></i></div>` : ''}
          ${task.name}
        </div>
        <div class="kanban-card-priority ${task.priority}" style="width: 12px; height: 12px; border-radius: 50%; background: ${priorityBorderColor}; box-shadow: 0 0 6px ${priorityBorderColor}66;"></div>
      </div>
      ${task.parentId ? `
        <div class="parent-task-name">
          <i class="fas fa-link"></i>
          ${parentTask?.name || '未知父任务'}
        </div>
      ` : ''}
      <div class="kanban-card-meta">
        <span><i class="fas fa-folder"></i> ${project?.name || '未知项目'}</span>
        ${project?.phase ? `<span class="tag tag-primary" style="font-size: 10px; margin-left: 4px;"><i class="fas fa-flag"></i> ${getPhaseName(project.phase)}</span>` : ''}
      </div>
      ${subtasks.length > 0 ? `
        <div class="subtask-summary" onclick="toggleSubtasks('${task.id}')">
          <i class="fas fa-list-ol"></i>
          <span>子任务: ${subtasks.filter(t => t.status === 'completed').length}/${subtasks.length} 已完成</span>
          <i class="fas fa-chevron-down" id="subtask-toggle-${task.id}"></i>
        </div>
      ` : ''}
      <div style="margin-bottom: 12px;">
        <div class="progress-label mb-4">
          <span class="text-xs">进度</span>
          <span class="text-xs">${task.progress}%</span>
        </div>
        <div class="progress-bar" style="height: 6px;">
          <div class="progress-bar-fill" style="width: ${task.progress}%;"></div>
        </div>
      </div>
      <div style="display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap;">
        ${task.status !== 'todo' ? `<button class="btn btn-xs" style="padding: 2px 8px; font-size: 11px; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation(); quickChangeTaskStatus('${task.id}', 'todo')" title="移至待开始"><i class="fas fa-arrow-left"></i> 待开始</button>` : ''}
        ${task.status !== 'in_progress' ? `<button class="btn btn-xs" style="padding: 2px 8px; font-size: 11px; background: #fef3c7; color: #92400e; border: none; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation(); quickChangeTaskStatus('${task.id}', 'in_progress')" title="移至进行中"><i class="fas fa-play"></i> 进行中</button>` : ''}
        ${task.status !== 'completed' ? `<button class="btn btn-xs" style="padding: 2px 8px; font-size: 11px; background: #d1fae5; color: #065f46; border: none; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation(); quickChangeTaskStatus('${task.id}', 'completed')" title="标记完成"><i class="fas fa-check"></i> 完成</button>` : ''}
      </div>
      <div class="kanban-card-footer">
        <div class="kanban-card-assignee">
          <div class="avatar avatar-sm">${getInitials(assignee?.name)}</div>
          <span class="text-sm">${assignee?.name || '未分配'}</span>
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
        <div class="subtask-list-container" id="subtask-container-${task.id}" style="display: none;">
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
    if (container.style.display === 'none') {
      container.style.display = 'block';
      if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
    } else {
      container.style.display = 'none';
      if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
    }
  }
}

let draggedTask = null;

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
    
    store.updateTaskStatus(taskId, newStatus);
    
    cardsContainer.classList.remove('drag-over');
    renderContent();
  }
}

function showCreateTaskModal(projectId = null) {
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="createTaskModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">新建任务</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('createTaskModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="createTaskForm">
            <div class="form-group">
              <label class="form-label">任务名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入任务名称">
            </div>
            
            <div class="form-group">
              <label class="form-label">任务描述</label>
              <textarea class="form-input form-textarea" name="description" placeholder="请输入任务描述"></textarea>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">所属项目 <span style="color: red;">*</span></label>
                <select class="form-select" name="projectId" required>
                  <option value="">请选择项目</option>
                  ${projects.map(p => `<option value="${p.id}" ${projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">负责人 <span style="color: red;">*</span></label>
                <select class="form-select" name="assigneeId" required>
                  <option value="">请选择负责人</option>
                  ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">开始日期</label>
                <input type="date" class="form-input" name="startDate">
              </div>
              
              <div class="form-group">
                <label class="form-label">截止日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="dueDate" required>
              </div>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">优先级 <span style="color: red;">*</span></label>
                <select class="form-select" name="priority" required>
                  <option value="">请选择优先级</option>
                  <option value="urgent">紧急</option>
                  <option value="high">高</option>
                  <option value="medium" selected>中</option>
                  <option value="low">低</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-select" name="status">
                  <option value="todo" selected>待开始</option>
                  <option value="in_progress">进行中</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">进度 (%)</label>
              <input type="number" class="form-input" name="progress" min="0" max="100" value="0" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('createTaskModal')">取消</button>
          <button class="btn btn-primary" onclick="handleCreateTask()">创建</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
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
    status: formData.get('status'),
    progress: parseInt(formData.get('progress')) || 0,
    parentId: null
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
  
  const html = `
    <div class="modal-overlay" id="editTaskModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑任务</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editTaskModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editTaskForm">
            <input type="hidden" name="id" value="${task.id}">
            
            <div class="form-group">
              <label class="form-label">任务名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required value="${task.name}">
            </div>
            
            <div class="form-group">
              <label class="form-label">任务描述</label>
              <textarea class="form-input form-textarea" name="description">${task.description}</textarea>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">所属项目 <span style="color: red;">*</span></label>
                <select class="form-select" name="projectId" required>
                  ${projects.map(p => `<option value="${p.id}" ${task.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">负责人 <span style="color: red;">*</span></label>
                <select class="form-select" name="assigneeId" required>
                  ${users.map(u => `<option value="${u.id}" ${task.assigneeId === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">开始日期</label>
                <input type="date" class="form-input" name="startDate" value="${task.startDate}">
              </div>
              
              <div class="form-group">
                <label class="form-label">截止日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="dueDate" required value="${task.dueDate}">
              </div>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">优先级 <span style="color: red;">*</span></label>
                <select class="form-select" name="priority" required>
                  <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>紧急</option>
                  <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                  <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                  <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-select" name="status">
                  <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>待开始</option>
                  <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                  <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                  <option value="cancelled" ${task.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">进度 (%)</label>
              <input type="number" class="form-input" name="progress" min="0" max="100" value="${task.progress}" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editTaskModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditTask()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
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
    progress: parseInt(formData.get('progress')) || 0
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
  
  if (confirm(`确定要删除任务"${task.name}"吗？此操作不可恢复。`)) {
    store.deleteTask(taskId);
    renderContent();
    store.addNotification({
      type: 'warning',
      title: '任务已删除',
      message: `任务"${task.name}"已被删除`
    });
  }
}

function showAddSubtaskModal(parentTaskId) {
  const parentTask = store.getTaskById(parentTaskId);
  if (!parentTask) return;
  
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="addSubtaskModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">添加子任务 - ${parentTask.name}</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addSubtaskModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="addSubtaskForm">
            <input type="hidden" name="parentId" value="${parentTaskId}">
            <input type="hidden" name="projectId" value="${parentTask.projectId}">
            
            <div class="form-group">
              <label class="form-label">子任务名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入子任务名称">
            </div>
            
            <div class="form-group">
              <label class="form-label">子任务描述</label>
              <textarea class="form-input form-textarea" name="description" placeholder="请输入子任务描述"></textarea>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">负责人</label>
                <select class="form-select" name="assigneeId">
                  <option value="">请选择负责人</option>
                  ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">截止日期</label>
                <input type="date" class="form-input" name="dueDate">
              </div>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">优先级</label>
                <select class="form-select" name="priority">
                  <option value="low">低</option>
                  <option value="medium" selected>中</option>
                  <option value="high">高</option>
                  <option value="urgent">紧急</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-select" name="status">
                  <option value="todo" selected>待开始</option>
                  <option value="in_progress">进行中</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addSubtaskModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddSubtask()">添加</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
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
  if (!confirm(`确定要删除 ${selectedTaskIds.size} 个任务吗？此操作不可恢复。`)) return;
  
  selectedTaskIds.forEach(taskId => {
    store.deleteTask(taskId);
  });
  
  store.addNotification({
    type: 'warning',
    title: '批量操作完成',
    message: `已批量删除 ${selectedTaskIds.size} 个任务`
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
      background: white; border-radius: 16px; padding: 40px 48px; text-align: center;
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderTasks };
}
