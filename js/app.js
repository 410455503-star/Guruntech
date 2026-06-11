function getStatusBgColor(status) {
  const colors = {
    planning: '#dbeafe',
    active: '#d1fae5',
    completed: '#d1fae5',
    paused: '#fef3c7',
    terminated: '#f3f4f6'
  };
  return colors[status] || '#f3f4f6';
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

function getPriorityBgColor(priority) {
  const colors = {
    urgent: '#fee2e2',
    high: '#fee2e2',
    medium: '#fef3c7',
    low: '#d1fae5'
  };
  return colors[priority] || '#f3f4f6';
}

function getPriorityTextColor(priority) {
  const colors = {
    urgent: '#dc2626',
    high: '#dc2626',
    medium: '#d97706',
    low: '#059669'
  };
  return colors[priority] || '#6b7280';
}

function getAvatarColor(index) {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#ef4444', '#06b6d4', '#84cc16'
  ];
  return colors[index % colors.length];
}

function isProjectOverdue(project) {
  if (!project.endDate || project.status === 'completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(project.endDate);
  endDate.setHours(0, 0, 0, 0);
  return endDate < today;
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

function bindModalEvents() {
  document.querySelectorAll('[onclick*="showCreateProjectModal"]').forEach(function(btn) {
    btn.removeEventListener('click', handleCreateProjectClick);
    btn.addEventListener('click', handleCreateProjectClick);
  });
}

function handleCreateProjectClick(e) {
  e.preventDefault();
  e.stopPropagation();
  showCreateProjectModal();
}

document.addEventListener('DOMContentLoaded', function() {
  if (typeof initEzvizConfig === 'function') {
    initEzvizConfig();
  }
});

function showModal(modalId, contentHtml) {
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = modalId;
  overlay.innerHTML = contentHtml;
  
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.background = 'rgba(0, 0, 0, 0.6)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'auto';
  overlay.style.overflow = 'auto';
  
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeModal(modalId);
    }
  });
  
  document.body.appendChild(overlay);
}

function showUploadDocumentModal(projectId) {
  const contentHtml = `
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
  `;
  
  showModal('uploadDocumentModal', contentHtml);
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
    case 'video':
      content = renderVideoMonitoring();
      break;
    case 'form-designer':
      content = renderFormDesigner();
      break;
    case 'custom-fields':
      content = renderCustomFields();
      break;
    case 'import-data':
      content = renderImportData();
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
  
  if (state.currentRoute === 'gantt') {
    window.syncGanttScroll && window.syncGanttScroll();
  }
}

function renderSettings() {
  const state = store.getState();
  const stats = {
    projects: state.projects?.length || 0,
    tasks: state.tasks?.length || 0,
    documents: state.documents?.length || 0,
    users: state.users?.length || 0
  };
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">系统设置</h1>
        <p class="page-description">管理系统配置与数据备份</p>
      </div>
    </div>
    
    <div style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; display: grid;">
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-radius: 16px; padding: 20px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <i class="fas fa-folder-open" style="font-size: 20px; color: #3b82f6;"></i>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #1e3a5f; margin-bottom: 4px;">${stats.projects}</div>
        <div style="font-size: 12px; color: #64748b;">项目总数</div>
      </div>
      <div style="background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border-radius: 16px; padding: 20px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <i class="fas fa-tasks" style="font-size: 20px; color: #10b981;"></i>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #065f46; margin-bottom: 4px;">${stats.tasks}</div>
        <div style="font-size: 12px; color: #64748b;">任务总数</div>
      </div>
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-radius: 16px; padding: 20px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <i class="fas fa-file-alt" style="font-size: 20px; color: #f59e0b;"></i>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #92400e; margin-bottom: 4px;">${stats.documents}</div>
        <div style="font-size: 12px; color: #64748b;">文档总数</div>
      </div>
      <div style="background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border-radius: 16px; padding: 20px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <i class="fas fa-users" style="font-size: 20px; color: #8b5cf6;"></i>
        </div>
        <div style="font-size: 28px; font-weight: 700; color: #5b21b6; margin-bottom: 4px;">${stats.users}</div>
        <div style="font-size: 12px; color: #64748b;">用户总数</div>
      </div>
    </div>
    
    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px;"></div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">数据管理</h3>
        </div>
      </div>
      <div style="padding: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #374151; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s;" onclick="exportData()" onmouseover="this.style.borderColor='#3b82f6'; this.style.color='#3b82f6';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#374151';">
            <i class="fas fa-download" style="color: #3b82f6;"></i>
            导出数据
          </button>
          <button style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #374151; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s;" onclick="document.getElementById('importFile').click()" onmouseover="this.style.borderColor='#10b981'; this.style.color='#10b981';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#374151';">
            <i class="fas fa-upload" style="color: #10b981;"></i>
            导入数据
          </button>
          <input type="file" id="importFile" style="display: none;" accept=".json" onchange="importData(event)">
          <button style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: #ffffff; border: 1px solid #fee2e2; border-radius: 10px; font-size: 14px; color: #dc2626; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s;" onclick="confirmResetData()" onmouseover="this.style.background='#fef2f2';" onmouseout="this.style.background='#ffffff';">
            <i class="fas fa-trash"></i>
            重置所有数据
          </button>
        </div>
        <div style="margin-top: 16px; padding: 12px 16px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #92400e;">
          <i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>
          请注意：重置数据将清除所有项目、任务和文档，且无法恢复！
        </div>
      </div>
    </div>
    
    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%); border-radius: 4px;"></div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">关于系统</h3>
        </div>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(59, 130, 246, 0.1); display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-water" style="font-size: 18px; color: #3b82f6;"></i>
              </div>
              <div>
                <div style="font-size: 12px; color: #64748b;">系统名称</div>
                <div style="font-size: 14px; font-weight: 500; color: #1e293b;">固润科技项目管理系统</div>
              </div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div style="padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">版本号</div>
              <div style="font-size: 16px; font-weight: 600; color: #1e293b;">v1.0.0</div>
            </div>
            <div style="padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">技术架构</div>
              <div style="font-size: 14px; font-weight: 600; color: #1e293b;">HTML5/CSS3/JS</div>
            </div>
            <div style="padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">数据存储</div>
              <div style="font-size: 14px; font-weight: 600; color: #1e293b;">LocalStorage</div>
            </div>
          </div>
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
  if (!confirm('确定要重置所有数据吗？此操作不可恢复！')) {
    return;
  }
  
  showPasswordModal();
}

function showPasswordModal() {
  const html = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
      <div style="background: white; border-radius: 16px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(239, 68, 68, 0.1); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-shield-alt" style="font-size: 24px; color: #ef4444;"></i>
          </div>
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">安全验证</h3>
            <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">请输入确认密码以继续</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">确认密码</label>
          <div style="position: relative;">
            <input type="password" id="resetPasswordInput" placeholder="请输入密码（默认：888888）" 
                   style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; padding-right: 40px;">
            <i class="fas fa-lock" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 8px 0 0;">默认密码：888888</p>
        </div>
        
        <div id="passwordError" style="display: none; padding: 12px; background: #fee2e2; border-radius: 8px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #dc2626;">
            <i class="fas fa-exclamation-circle"></i>
            <span>密码错误，请重试</span>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button style="flex: 1; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #64748b; cursor: pointer; transition: all 0.2s;" 
                  onclick="closePasswordModal()" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='white';">
            取消
          </button>
          <button style="flex: 1; padding: 12px; background: #ef4444; border: none; border-radius: 10px; font-size: 14px; color: white; cursor: pointer; transition: all 0.2s;" 
                  onclick="validatePassword()" onmouseover="this.style.background='#dc2626';" onmouseout="this.style.background='#ef4444';">
            确认重置
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
}

function closePasswordModal() {
  const modal = document.querySelector('[style*="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5)"]');
  if (modal) {
    modal.remove();
  }
}

function validatePassword() {
  const password = document.getElementById('resetPasswordInput')?.value;
  const errorDiv = document.getElementById('passwordError');
  
  if (!password) {
    errorDiv.style.display = 'block';
    return;
  }
  
  if (password !== '888888') {
    errorDiv.style.display = 'block';
    document.getElementById('resetPasswordInput').style.borderColor = '#ef4444';
    return;
  }
  
  closePasswordModal();
  
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
  const taskPhaseFilter = document.getElementById('taskPhaseFilter');
  const taskDateRangeFilter = document.getElementById('taskDateRangeFilter');
  const taskStartDate = document.getElementById('taskStartDate');
  const taskEndDate = document.getElementById('taskEndDate');
  const customDateRange = document.getElementById('customDateRange');
  
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
  
  [taskProjectFilter, taskPriorityFilter, taskAssigneeFilter, taskPhaseFilter, taskStartDate, taskEndDate].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', applyTaskFilters);
    }
  });
  
  // 时间范围选择器变化时，显示/隐藏自定义日期范围
  if (taskDateRangeFilter) {
    taskDateRangeFilter.addEventListener('change', () => {
      if (customDateRange) {
        customDateRange.style.display = taskDateRangeFilter.value === 'custom' ? 'flex' : 'none';
      }
      applyTaskFilters();
    });
  }
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
    <div class="card" style="border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 16px 24px; border-bottom: 1px solid #e2e8f0;">
        <h3 style="font-size: 16px; font-weight: 600; color: #334155; margin: 0;">项目列表</h3>
        <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">共 ${projects.length} 个项目</p>
      </div>
      <table class="table" style="margin: 0;">
        <thead>
          <tr style="background: #fafafa;">
            <th style="padding: 14px 20px; text-align: left; font-weight: 600; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0;">项目名称</th>
            <th style="padding: 14px 20px; text-align: left; font-weight: 600; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0;">状态</th>
            <th style="padding: 14px 20px; text-align: left; font-weight: 600; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0;">优先级</th>
            <th style="padding: 14px 20px; text-align: left; font-weight: 600; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0;">进度</th>
            <th style="padding: 14px 20px; text-align: left; font-weight: 600; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0;">成员</th>
            <th style="padding: 14px 20px; text-align: left; font-weight: 600; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0;">截止日期</th>
            <th style="padding: 14px 20px; text-align: center; font-weight: 600; color: #64748b; font-size: 13px; border-bottom: 2px solid #e2e8f0;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map((project, index) => {
            const progress = store.getProjectProgress(project.id);
            const progressColor = progress >= 80 ? '#10b981' : progress >= 50 ? '#3b82f6' : '#f59e0b';
            return `
              <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseenter="this.style.background='#fafafa'" onmouseleave="this.style.background='transparent'">
                <td style="padding: 16px 20px;">
                  <div style="font-weight: 600; cursor: pointer; color: #1e293b; font-size: 14px; margin-bottom: 4px;" onclick="showProjectDetail('${project.id}')">
                    ${project.name}
                  </div>
                  <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">${project.description && project.description.substring(0, 60)}${project.description && project.description.length > 60 ? '...' : ''}</div>
                </td>
                <td style="padding: 16px 20px;">
                  <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; background: ${getStatusBgColor(project.status)}; color: ${getStatusTagColor(project.status) === 'green' ? '#059669' : getStatusTagColor(project.status) === 'blue' ? '#1d4ed8' : getStatusTagColor(project.status) === 'yellow' ? '#d97706' : '#6b7280'}">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${getStatusTagColor(project.status) === 'green' ? '#10b981' : getStatusTagColor(project.status) === 'blue' ? '#3b82f6' : getStatusTagColor(project.status) === 'yellow' ? '#f59e0b' : '#9ca3af'}"></span>
                    ${getStatusName(project.status)}
                  </span>
                </td>
                <td style="padding: 16px 20px;">
                  <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; background: ${getPriorityBgColor(project.priority)}; color: ${getPriorityTextColor(project.priority)}">
                    ${getPriorityName(project.priority)}
                  </span>
                </td>
                <td style="padding: 16px 20px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="flex: 1; max-width: 120px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                      <div style="height: 100%; background: linear-gradient(90deg, ${progressColor}, ${progressColor}99); border-radius: 4px; transition: width 0.3s ease; width: ${progress}%;"></div>
                    </div>
                    <span style="font-weight: 600; color: #334155; font-size: 13px; min-width: 40px;">${progress}%</span>
                  </div>
                </td>
                <td style="padding: 16px 20px;">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    ${(project.members || []).slice(0, 4).map((memberId, idx) => {
                      const member = store.getUserById(memberId);
                      return `<div style="width: 28px; height: 28px; border-radius: 50%; background: ${getAvatarColor(idx)}; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); ${idx > 0 ? 'margin-left: -6px;' : ''}" title="${member?.name}">${getInitials(member?.name)}</div>`;
                    }).join('')}
                    ${(project.members || []).length > 4 ? `<div style="width: 28px; height: 28px; border-radius: 50%; background: #e2e8f0; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-left: -6px;" title="还有 ${(project.members || []).length - 4} 人">+${(project.members || []).length - 4}</div>` : ''}
                  </div>
                </td>
                <td style="padding: 16px 20px;">
                  <span style="font-size: 13px; color: ${isProjectOverdue(project) ? '#ef4444' : '#64748b'}; font-weight: 500;">${DateUtils.formatDate(project.endDate)}</span>
                  ${isProjectOverdue(project) ? '<span style="color: #ef4444; margin-left: 4px;"><i class="fas fa-exclamation-circle" title="已逾期"></i></span>' : ''}
                </td>
                <td style="padding: 16px 20px;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <button style="padding: 6px 10px; border: none; border-radius: 8px; background: #f1f5f9; color: #64748b; cursor: pointer; transition: all 0.2s;" onclick="showEditProjectModal('${project.id}')" title="编辑">
                      <i class="fas fa-edit" style="font-size: 14px;"></i>
                    </button>
                    <button style="padding: 6px 10px; border: none; border-radius: 8px; background: #fef2f2; color: #ef4444; cursor: pointer; transition: all 0.2s;" onclick="confirmDeleteProject('${project.id}')" title="删除">
                      <i class="fas fa-trash" style="font-size: 14px;"></i>
                    </button>
                  </div>
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
