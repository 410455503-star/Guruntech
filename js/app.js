function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

function showUploadDocumentModal(projectId) {
  const html = `
    <div class="modal-overlay" id="uploadDocumentModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">上传文档</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('uploadDocumentModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="uploadDocumentForm">
            <input type="hidden" name="projectId" value="${projectId}">
            
            <div class="form-group">
              <label class="form-label">文档名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入文档名称">
            </div>
            
            <div class="form-group">
              <label class="form-label">选择文件 <span style="color: red;">*</span></label>
              <input type="file" class="form-input" name="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" style="padding: 8px;">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('uploadDocumentModal')">取消</button>
          <button class="btn btn-primary" onclick="handleUploadDocument()">上传</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleUploadDocument() {
  const form = document.getElementById('uploadDocumentForm');
  const formData = new FormData(form);
  const fileInput = form.querySelector('input[name="file"]');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('请选择文件');
    return;
  }
  
  const data = {
    projectId: formData.get('projectId'),
    name: formData.get('name') || file.name,
    type: file.name.split('.').pop(),
    size: file.size,
    url: '#',
    uploadedBy: store.getState().currentUser?.id
  };
  
  store.addDocument(data);
  closeModal('uploadDocumentModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '文档上传成功',
    message: `${data.name}已成功上传`
  });
}

function downloadDocument(docId) {
  const doc = store.getState().documents.find(d => d.id === docId);
  if (doc) {
    alert(`下载文档: ${doc.name}\n文件大小: ${(doc.size / 1024).toFixed(2)} KB`);
  }
}

function confirmDeleteDocument(docId) {
  const doc = store.getState().documents.find(d => d.id === docId);
  if (!doc) return;
  
  if (confirm(`确定要删除文档"${doc.name}"吗？`)) {
    store.deleteDocument(docId);
    renderContent();
  }
}

function renderContent() {
  const state = store.getState();
  const currentRoute = state.currentRoute;
  const currentProjectId = state.currentProjectId;
  
  let content = '';
  
  switch (currentRoute) {
    case 'dashboard':
      content = renderDashboard();
      break;

    case 'projects':
      if (currentProjectId) {
        content = renderProjectDetail(currentProjectId);
      } else {
        content = renderProjects();
      }
      break;
    case 'tasks':
      content = renderTasks();
      break;
    case 'gantt':
      content = renderGantt();
      break;
    case 'progress':
      content = renderProgress();
      break;
    case 'dailyLog':
      content = renderDailyLog();
      break;
    case 'budget':
      content = renderBudget();
      break;
    case 'payment':
      content = renderPayment();
      break;
    case 'materials':
      content = renderMaterials();
      break;
    case 'afterSale':
      content = renderAfterSale();
      break;
    case 'temporaryWorkers':
      content = renderTemporaryWorkers();
      break;
    case 'members':
      content = renderMembers();
      break;
    case 'reports':
      content = renderReports();
      setTimeout(() => {
        if (typeof attachReportEvents === 'function') {
          attachReportEvents();
        }
      }, 100);
      break;
    case 'milestones':
      content = renderMilestones();
      break;
    case 'resources':
      content = renderResources();
      break;
    case 'documents':
      content = renderDocuments();
      break;
    case 'risks':
      content = renderRisks();
      break;
    case 'issues':
      content = renderIssues();
      break;
    case 'notifications':
      content = renderNotifications();
      break;
    case 'settings':
      content = renderSettings();
      break;
    default:
      content = renderDashboard();
  }
  
  const contentElement = document.getElementById('content');
  if (contentElement) {
    // 给甘特图页面添加专用的 class
    const pageContentClass = state.currentRoute === 'gantt' ? 'page-content gantt-page-content' : 'page-content';
    contentElement.innerHTML = `<div class="${pageContentClass}">${content}</div>`;
  }
  
  attachFilterEvents();
  attachViewToggleEvents();
  
  if (state.currentRoute === 'reports') {
    attachReportEvents();
  }
  
  if (state.currentRoute === 'gantt') {
    window.syncGanttScroll && window.syncGanttScroll();
  }
}

function renderSettings() {
  const state = store.getState();
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">系统设置</h1>
        <p class="page-description">配置系统参数</p>
      </div>
    </div>
    
    <div class="card mb-24">
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">数据管理</h3>
      
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <button class="btn btn-secondary" onclick="exportData()">
          <i class="fas fa-download"></i>
          导出数据
        </button>
        <button class="btn btn-secondary" onclick="document.getElementById('importFile').click()">
          <i class="fas fa-upload"></i>
          导入数据
        </button>
        <input type="file" id="importFile" style="display: none;" accept=".json" onchange="importData(event)">
        <button class="btn btn-danger" onclick="confirmResetData()">
          <i class="fas fa-trash"></i>
          重置所有数据
        </button>
      </div>
    </div>
    
    <div class="card mb-24">
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">关于系统</h3>
      
      <div style="display: grid; gap: 16px;">
        <div style="display: flex; justify-content: space-between;">
          <span class="text-muted">系统名称</span>
          <span class="font-medium">工程项目管理系统</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span class="text-muted">版本号</span>
          <span class="font-medium">1.0.0</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span class="text-muted">技术架构</span>
          <span class="font-medium">HTML5 + CSS3 + JavaScript</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span class="text-muted">数据存储</span>
          <span class="font-medium">LocalStorage</span>
        </div>
      </div>
    </div>
  `;
  
  return html;
}

function exportData() {
  const data = {
    users: store.getState().users,
    projects: store.getState().projects,
    tasks: store.getState().tasks,
    documents: store.getState().documents,
    exportTime: new Date().toISOString()
  };
  
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `工程管理软件数据_${DateUtils.formatDate(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  store.addNotification({
    type: 'success',
    title: '数据导出成功',
    message: '所有数据已成功导出为JSON文件'
  });
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.users && data.projects && data.tasks) {
        store.setState({
          users: data.users,
          projects: data.projects,
          tasks: data.tasks,
          documents: data.documents || []
        });
        
        renderSidebar();
        renderHeader();
        renderContent();
        
        store.addNotification({
          type: 'success',
          title: '数据导入成功',
          message: `成功导入${data.projects.length}个项目和${data.tasks.length}个任务`
        });
      } else {
        alert('无效的数据格式');
      }
    } catch (error) {
      alert('数据解析失败: ' + error.message);
    }
  };
  reader.readAsText(file);
  
  event.target.value = '';
}

function confirmResetData() {
  if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
    if (confirm('再次确认：所有数据将被清空，是否继续？')) {
      store.reset();
      renderSidebar();
      renderHeader();
      renderContent();
      
      store.addNotification({
        type: 'warning',
        title: '数据已重置',
        message: '所有数据已恢复为初始状态'
      });
    }
  }
}

function attachFilterEvents() {
  // 项目筛选事件
  const projectSearch = document.getElementById('projectSearch');
  const statusFilter = document.getElementById('statusFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  
  if (projectSearch) {
    let debounce = null;
    projectSearch.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const filtered = store.filterProjects({
          search: e.target.value,
          status: statusFilter?.value || 'all',
          priority: priorityFilter?.value || 'all'
        });
        
        const content = document.getElementById('projectContent');
        if (content) {
          content.innerHTML = renderProjectGrid(filtered);
        }
      }, 300);
    });
  }
  
  [statusFilter, priorityFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', () => {
        const searchValue = projectSearch?.value || '';
        const filtered = store.filterProjects({
          search: searchValue,
          status: statusFilter?.value || 'all',
          priority: priorityFilter?.value || 'all'
        });
        
        const content = document.getElementById('projectContent');
        if (content) {
          content.innerHTML = renderProjectGrid(filtered);
        }
      });
    }
  });
  
  // 任务筛选事件
  const taskProjectFilter = document.getElementById('taskProjectFilter');
  const taskPriorityFilter = document.getElementById('taskPriorityFilter');
  const taskAssigneeFilter = document.getElementById('taskAssigneeFilter');
  
  const applyTaskFilters = () => {
    const filtered = getFilteredTasks();
    const taskContent = document.getElementById('taskContent');
    const viewButtons = document.querySelectorAll('.view-toggle button');
    const activeView = Array.from(viewButtons).find(btn => btn.classList.contains('active'))?.dataset.view || 'kanban';
    
    if (taskContent) {
      if (activeView === 'list') {
        taskContent.innerHTML = renderTaskList(filtered);
      } else {
        taskContent.innerHTML = renderKanbanBoard(filtered);
      }
    }
  };
  
  [taskProjectFilter, taskPriorityFilter, taskAssigneeFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', applyTaskFilters);
    }
  });
}

function attachViewToggleEvents() {
  const viewButtons = document.querySelectorAll('.view-toggle button');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const view = btn.dataset.view;
      const state = store.getState();
      
      if (state.currentRoute === 'projects') {
        if (view === 'list') {
          const projects = store.filterProjects({
            status: document.getElementById('statusFilter')?.value || 'all',
            priority: document.getElementById('priorityFilter')?.value || 'all'
          });
          document.getElementById('projectContent').innerHTML = renderProjectList(projects);
        } else {
          const projects = store.filterProjects({
            status: document.getElementById('statusFilter')?.value || 'all',
            priority: document.getElementById('priorityFilter')?.value || 'all'
          });
          document.getElementById('projectContent').innerHTML = renderProjectGrid(projects);
        }
      } else if (state.currentRoute === 'tasks') {
        const tasks = getFilteredTasks();
        if (view === 'list') {
          document.getElementById('taskContent').innerHTML = renderTaskList(tasks);
        } else {
          document.getElementById('taskContent').innerHTML = renderKanbanBoard(tasks);
        }
      }
    });
  });
}

function renderProjectList(projects) {
  if (projects.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-folder-open" style="font-size: 64px;"></i>
        <h3>暂无项目</h3>
        <p class="text-muted">点击"新建项目"按钮创建第一个项目</p>
      </div>
    `;
  }
  
  return `
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>项目名称</th>
            <th>状态</th>
            <th>优先级</th>
            <th>进度</th>
            <th>成员</th>
            <th>截止日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(project => {
            const progress = store.getProjectProgress(project.id);
            return `
              <tr>
                <td>
                  <div style="font-weight: 600; cursor: pointer;" onclick="showProjectDetail('${project.id}')">
                    ${project.name}
                  </div>
                  <div class="text-muted text-sm">${project.description && project.description.substring(0, 50)}...</div>
                </td>
                <td><span class="tag tag-${getStatusTagColor(project.status)}">${getStatusName(project.status)}</span></td>
                <td><span class="tag tag-${getPriorityTagColor(project.priority)}">${getPriorityName(project.priority)}</span></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="progress-bar" style="width: 100px; height: 6px;">
                      <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                    </div>
                    <span>${progress}%</span>
                  </div>
                </td>
                <td>
                  <div class="project-card-members">
                    ${(project.members || []).slice(0, 3).map(memberId => {
                      const member = store.getUserById(memberId);
                      return `<div class="project-card-member">${getInitials(member?.name)}</div>`;
                    }).join('')}
                  </div>
                </td>
                <td>${DateUtils.formatDate(project.endDate)}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="showEditProjectModal('${project.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="confirmDeleteProject('${project.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderTaskList(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-tasks" style="font-size: 64px;"></i>
        <h3>暂无任务</h3>
        <p class="text-muted">点击"新建任务"按钮创建第一个任务</p>
      </div>
    `;
  }
  
  return `
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>任务名称</th>
            <th>所属项目</th>
            <th>负责人</th>
            <th>优先级</th>
            <th>状态</th>
            <th>进度</th>
            <th>截止日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => {
            const project = store.getProjectById(task.projectId);
            const assignee = store.getUserById(task.assigneeId);
            const isOverdue = DateUtils.isPast(task.dueDate) && task.status !== 'completed';
            
            return `
              <tr>
                <td>
                  <div style="font-weight: 600;">${task.name}</div>
                  <div class="text-muted text-sm">${task.description && task.description.substring(0, 50)}...</div>
                </td>
                <td>${project?.name || '未知项目'}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="avatar avatar-sm">${getInitials(assignee?.name)}</div>
                    <span>${assignee?.name || '未分配'}</span>
                  </div>
                </td>
                <td><span class="tag tag-${getPriorityTagColor(task.priority)}">${getPriorityName(task.priority)}</span></td>
                <td><span class="tag tag-${getStatusTagColor(task.status)}">${getTaskStatusName(task.status)}</span></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="progress-bar" style="width: 100px; height: 6px;">
                      <div class="progress-bar-fill" style="width: ${task.progress}%;"></div>
                    </div>
                    <span>${task.progress}%</span>
                  </div>
                </td>
                <td class="${isOverdue ? 'text-danger' : ''}">
                  ${DateUtils.formatDate(task.dueDate)}
                </td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="showEditTaskModal('${task.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="confirmDeleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}



if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderContent };
}
