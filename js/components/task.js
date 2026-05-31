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
        <select class="filter-select" id="taskProjectFilter">
          <option value="all">全部项目</option>
          ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="filter-item">
        <label class="filter-label">优先级:</label>
        <select class="filter-select" id="taskPriorityFilter">
          <option value="all">全部</option>
          <option value="urgent">紧急</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
      <div class="filter-item">
        <label class="filter-label">负责人:</label>
        <select class="filter-select" id="taskAssigneeFilter">
          <option value="all">全部成员</option>
          ${state.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
        </select>
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
  
  const filters = {};
  if (projectId !== 'all') filters.projectId = projectId;
  if (priority !== 'all') filters.priority = priority;
  if (assigneeId !== 'all') filters.assigneeId = assigneeId;
  
  return store.filterTasks(filters);
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
  
  const taskId = `task-${task.id}`;
  
  return `
    <div class="kanban-card ${task.parentId ? 'has-parent-task' : ''}" draggable="true" data-task-id="${task.id}" ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)">
      <div class="kanban-card-header">
        <div class="kanban-card-title">
          ${task.parentId ? `<div class="parent-task-indicator" title="父任务: ${parentTask?.name || ''}"><i class="fas fa-level-up-alt"></i></div>` : ''}
          ${task.name}
        </div>
        <div class="kanban-card-priority ${task.priority}"></div>
      </div>
      ${task.parentId ? `
        <div class="parent-task-name">
          <i class="fas fa-link"></i>
          ${parentTask?.name || '未知父任务'}
        </div>
      ` : ''}
      <div class="kanban-card-meta">
        <span><i class="fas fa-folder"></i> ${project?.name || '未知项目'}</span>
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
        ${subtasks.map(subtask => renderSubtaskItem(subtask)).join('')}
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderTasks };
}
