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
  if (!project || !project.endDate || project.status === 'completed') return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(project.endDate);
    if (isNaN(endDate.getTime())) return false;
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  } catch (e) {
    return false;
  }
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
  if (typeof initCloudSync === 'function') {
    initCloudSync();
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
  overlay.style.zIndex = '999999';
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'auto';
  overlay.style.overflow = 'auto';
  
  setTimeout(() => {
    const modalContent = overlay.querySelector('.modal-content');
    const modalHeader = overlay.querySelector('.modal-header');
    const modalBody = overlay.querySelector('.modal-body');
    const modalFooter = overlay.querySelector('.modal-footer');
    if (modalContent) {
      modalContent.style.background = '#ffffff';
      modalContent.style.backgroundColor = '#ffffff';
    }
    if (modalHeader) {
      modalHeader.style.background = '#ffffff';
      modalHeader.style.backgroundColor = '#ffffff';
    }
    if (modalBody) {
      modalBody.style.background = '#ffffff';
      modalBody.style.backgroundColor = '#ffffff';
    }
    if (modalFooter) {
      modalFooter.style.background = '#ffffff';
      modalFooter.style.backgroundColor = '#ffffff';
    }
  }, 0);
  
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
    case 'warnings':
      content = renderWarnings();
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
  
  // 甘特图页面：给 main-content 加 gantt-mode 使其固定高度不自身滚动
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    if (state.currentRoute === 'gantt') {
      mainContent.classList.add('gantt-mode');
    } else {
      mainContent.classList.remove('gantt-mode');
    }
  }
  
  attachFilterEvents();
  attachViewToggleEvents();
  
  if (state.currentRoute === 'gantt') {
    window.syncGanttScroll && window.syncGanttScroll();
    window.drawDependencyArrows && window.drawDependencyArrows();
  }
  
  // 初始化云同步开关状态
  if (state.currentRoute === 'settings') {
    setTimeout(() => {
      const toggle = document.getElementById('cloudSyncToggle');
      if (toggle && typeof cloudSync !== 'undefined') {
        toggle.checked = cloudSync.isConfigured;
        updateSyncStatusUI(cloudSync.isConfigured);
      }
    }, 100);
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
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px;"></div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">云端同步</h3>
        </div>
      </div>
      <div style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8fafc; border-radius: 10px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-cloud" style="font-size: 18px; color: #10b981;"></i>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 500; color: #1e293b;">启用云端同步</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">开启后数据将与云端自动同步（15秒间隔）</div>
            </div>
          </div>
          <label class="switch" style="position: relative; display: inline-block; width: 48px; height: 26px;">
            <input type="checkbox" id="cloudSyncToggle" style="opacity: 0; width: 0; height: 0;" onchange="toggleCloudSync(this.checked)">
            <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .3s; border-radius: 26px;"></span>
          </label>
        </div>
        <div id="cloudSyncStatus" style="font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-info-circle"></i>
          <span>当前状态：本地模式（云同步已关闭）</span>
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
              <div style="font-size: 16px; font-weight: 600; color: #1e293b;">V1.0.3</div>
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
  // 显示导出密码弹窗
  showExportPasswordModal();
}

function showExportPasswordModal() {
  const modal = document.createElement('div');
  modal.id = 'exportPasswordModal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 24px; width: 400px; max-width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-download" style="color: white; font-size: 18px;"></i>
        </div>
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">导出数据</h3>
          <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">请输入密码确认导出</p>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">确认密码</label>
        <div style="position: relative;">
          <input type="password" id="exportPasswordInput" placeholder="请输入密码" 
                 style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; padding-right: 40px;">
          <i class="fas fa-lock" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
        </div>
      </div>
      
      <div id="exportPasswordError" style="display: none; padding: 12px; background: #fee2e2; border-radius: 8px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #dc2626;">
          <i class="fas fa-exclamation-circle"></i>
          <span>密码错误，请重试</span>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button style="flex: 1; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #64748b; cursor: pointer; transition: all 0.2s;" 
                onclick="closeExportPasswordModal()" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='white';">
          取消
        </button>
        <button style="flex: 1; padding: 12px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border: none; border-radius: 10px; font-size: 14px; color: white; cursor: pointer; transition: all 0.2s;" 
                onclick="validateExportPassword()" onmouseover="this.style.opacity='0.9';" onmouseout="this.style.opacity='1';">
          确认导出
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function closeExportPasswordModal() {
  const modal = document.getElementById('exportPasswordModal');
  if (modal) modal.remove();
}

function validateExportPassword() {
  const password = document.getElementById('exportPasswordInput')?.value;
  const errorDiv = document.getElementById('exportPasswordError');
  
  if (!password) {
    errorDiv.style.display = 'block';
    return;
  }
  
  if (password !== '888888') {
    errorDiv.style.display = 'block';
    document.getElementById('exportPasswordInput').style.borderColor = '#ef4444';
    return;
  }
  
  closeExportPasswordModal();
  doExportData();
}

function doExportData() {
  const state = store.getState();
  
  const data = {
    // 核心业务数据
    users: state.users,
    projects: state.projects,
    tasks: state.tasks,
    documents: state.documents,
    
    // 项目管理数据
    milestones: state.milestones,
    risks: state.risks,
    issues: state.issues,
    scheduleChanges: state.scheduleChanges,
    
    // 进度与日志数据
    progressReports: state.progressReports,
    dailyLogs: state.dailyLogs,
    
    // 人员管理数据
    temporaryWorkers: state.temporaryWorkers,
    workerAttendance: state.workerAttendance,
    
    // 资源与财务数据
    resources: state.resources,
    budgets: state.budgets,
    payments: state.payments,
    expenses: state.expenses,
    
    // 物料与售后数据
    materials: state.materials,
    afterSales: state.afterSales,
    
    // 系统配置数据
    taskStatusConfig: state.taskStatusConfig,
    systemSettings: state.systemSettings,
    customForms: state.customForms,
    customFields: state.customFields,
    
    // 监控数据
    cameras: state.cameras,
    
    // 警告数据
    warnings: state.warnings,
    
    // 统计汇总数据
    statistics: state.statistics,
    dashboardData: state.dashboardData,
    
    // 系统状态数据
    darkMode: state.darkMode,
    currentUser: state.currentUser,
    
    // 导出元数据
    exportTime: new Date().toISOString(),
    exportVersion: '1.0',
    dataVersion: 'v2.4',
    totalRecords: {
      users: state.users.length,
      projects: state.projects.length,
      tasks: state.tasks.length,
      documents: state.documents.length,
      milestones: state.milestones.length,
      risks: state.risks.length,
      issues: state.issues.length,
      scheduleChanges: state.scheduleChanges.length,
      progressReports: state.progressReports.length,
      dailyLogs: state.dailyLogs.length,
      temporaryWorkers: state.temporaryWorkers.length,
      workerAttendance: state.workerAttendance.length,
      resources: state.resources.length,
      budgets: state.budgets.length,
      payments: state.payments.length,
      expenses: state.expenses.length,
      materials: state.materials.length,
      afterSales: state.afterSales.length,
      cameras: state.cameras.length,
      warnings: state.warnings.length
    }
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
  
  const totalCount = Object.values(data.totalRecords).reduce((a, b) => a + b, 0);
  store.addNotification({
    type: 'success',
    title: '数据导出成功',
    message: `已导出 ${totalCount} 条数据记录`
  });
}

// 导入数据密码验证
let pendingImportFile = null;

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // 保存文件引用，显示密码弹窗
  pendingImportFile = file;
  showImportPasswordModal();
  event.target.value = ''; // 清空input，允许重新选择同一文件
}

function showImportPasswordModal() {
  const modal = document.createElement('div');
  modal.id = 'importPasswordModal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 24px; width: 400px; max-width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-upload" style="color: white; font-size: 18px;"></i>
        </div>
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">导入数据</h3>
          <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">请输入密码确认导入</p>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">确认密码</label>
        <div style="position: relative;">
          <input type="password" id="importPasswordInput" placeholder="请输入密码" 
                 style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; padding-right: 40px;">
          <i class="fas fa-lock" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
        </div>
      </div>
      
      <div id="importPasswordError" style="display: none; padding: 12px; background: #fee2e2; border-radius: 8px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #dc2626;">
          <i class="fas fa-exclamation-circle"></i>
          <span>密码错误，请重试</span>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button style="flex: 1; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #64748b; cursor: pointer; transition: all 0.2s;" 
                onclick="closeImportPasswordModal()" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='white';">
          取消
        </button>
        <button style="flex: 1; padding: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; border-radius: 10px; font-size: 14px; color: white; cursor: pointer; transition: all 0.2s;" 
                onclick="validateImportPassword()" onmouseover="this.style.opacity='0.9';" onmouseout="this.style.opacity='1';">
          确认导入
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function closeImportPasswordModal() {
  const modal = document.getElementById('importPasswordModal');
  if (modal) modal.remove();
  pendingImportFile = null;
}

function validateImportPassword() {
  const password = document.getElementById('importPasswordInput')?.value;
  const errorDiv = document.getElementById('importPasswordError');
  
  if (!password) {
    errorDiv.style.display = 'block';
    return;
  }
  
  if (password !== '888888') {
    errorDiv.style.display = 'block';
    document.getElementById('importPasswordInput').style.borderColor = '#ef4444';
    return;
  }
  
  closeImportPasswordModal();
  doImportData();
}

function doImportData() {
  if (!pendingImportFile) return;
  
  const file = pendingImportFile;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.users && data.projects && data.tasks) {
        store.setState({
          // 核心业务数据
          users: data.users,
          projects: data.projects,
          tasks: data.tasks,
          documents: data.documents || [],
          
          // 项目管理数据
          milestones: data.milestones || [],
          risks: data.risks || [],
          issues: data.issues || [],
          scheduleChanges: data.scheduleChanges || [],
          
          // 进度与日志数据
          progressReports: data.progressReports || [],
          dailyLogs: data.dailyLogs || [],
          
          // 人员管理数据
          temporaryWorkers: data.temporaryWorkers || [],
          workerAttendance: data.workerAttendance || [],
          
          // 资源与财务数据
          resources: data.resources || [],
          budgets: data.budgets || [],
          payments: data.payments || [],
          expenses: data.expenses || [],
          
          // 物料与售后数据
          materials: data.materials || [],
          afterSales: data.afterSales || [],
          
          // 系统配置数据
          taskStatusConfig: data.taskStatusConfig || store.getState().taskStatusConfig,
          systemSettings: data.systemSettings || {},
          customForms: data.customForms || [],
          customFields: data.customFields || [],
          
          // 监控数据
          cameras: data.cameras || [],
          
          // 警告数据
          warnings: data.warnings || [],
          
          // 统计汇总数据
          statistics: data.statistics || {},
          dashboardData: data.dashboardData || {},
          
          // 系统状态
          darkMode: data.darkMode || false,
          currentUser: data.currentUser || data.users[0]
        });
        
        store.saveToStorage();
        renderSidebar();
        renderHeader();
        renderContent();
        
        const totalRecords = data.totalRecords || {
          users: data.users.length,
          projects: data.projects.length,
          tasks: data.tasks.length
        };
        const totalCount = Object.values(totalRecords).reduce((a, b) => a + b, 0);
        
        store.addNotification({
          type: 'success',
          title: '数据导入成功',
          message: `成功导入 ${totalCount} 条数据记录`
        });
      } else {
        alert('无效的数据格式');
      }
    } catch (error) {
      alert('数据解析失败: ' + error.message);
    }
  };
  reader.readAsText(file);
  
  pendingImportFile = null;
}

// 云端同步开关
function toggleCloudSync(enabled) {
  if (typeof cloudSync === 'undefined') {
    store.addNotification({
      type: 'error',
      title: '错误',
      message: '云同步模块未加载'
    });
    return;
  }
  
  if (enabled) {
    // 启用云同步
    Storage.set('cloudSyncEnabled', true);
    cloudSync.isConfigured = true;
    
    // 如果已经初始化过，先强制从云端拉取覆盖本地，再启动同步
    // 如果未初始化，调用 initComplete 会先全量拉取再启动同步
    if (cloudSync._initialized) {
      cloudSync.pullAndOverwriteLocal().then(() => {
        cloudSync.initRealtimeSync();
        cloudSync.startAutoSync(5);
        cloudSync.setStatus('online');
      }).catch(err => {
        console.error('[App] 启用云同步时拉取失败:', err);
        cloudSync.setStatus('error');
      });
    } else {
      cloudSync.initComplete().catch(err => {
        console.error('[App] 启用云同步初始化失败:', err);
      });
    }
    
    store.addNotification({
      type: 'success',
      title: '云同步已启用',
      message: '数据将每5秒与云端同步一次'
    });
    updateSyncStatusUI(true);
  } else {
    // 禁用云同步
    Storage.set('cloudSyncEnabled', false);
    cloudSync.isConfigured = false;
    cloudSync.stopAutoSync(); // 停止所有同步机制（轮询、WebSocket、自动同步）
    cloudSync.setStatus('offline');
    store.addNotification({
      type: 'info',
      title: '云同步已关闭',
      message: '数据将仅保存在本地'
    });
    updateSyncStatusUI(false);
  }
}

function updateSyncStatusUI(enabled) {
  const statusEl = document.getElementById('cloudSyncStatus');
  if (statusEl) {
    if (enabled) {
      statusEl.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i><span style="color: #10b981;">当前状态：云端同步已启用</span>';
    } else {
      statusEl.innerHTML = '<i class="fas fa-info-circle"></i><span>当前状态：本地模式（云同步已关闭）</span>';
    }
  }
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
            <input type="password" id="resetPasswordInput" placeholder="请输入密码" 
                   style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; padding-right: 40px;">
            <i class="fas fa-lock" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
          </div>
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

async function validatePassword() {
  const password = document.getElementById('resetPasswordInput')?.value;
  const errorDiv = document.getElementById('passwordError');
  
  if (!password) {
    errorDiv.style.display = 'block';
    return;
  }
  
  if (password !== '9898998') {
    errorDiv.style.display = 'block';
    document.getElementById('resetPasswordInput').style.borderColor = '#ef4444';
    return;
  }
  
  closePasswordModal();

  // 检查用户是否启用了云同步（从Storage读取，而非运行时状态）
  const cloudSyncEnabled = Storage.get('cloudSyncEnabled', true); // 默认启用

  if (cloudSyncEnabled) {
    // 显示正在重置的提示
    store.addNotification({
      type: 'info',
      title: '正在重置',
      message: '正在清空本地和云端数据，请稍候...'
    });

    // 先停止云同步轮询，防止在清空过程中拉回旧数据
    if (typeof cloudSync !== 'undefined') {
      cloudSync._stopPeriodicPull();
    }

    // 先清空本地数据
    store.reset();
    renderSidebar();
    renderHeader();
    renderContent();

    // 将空数据同步到云端（覆盖云端数据）
    try {
      if (typeof cloudSync === 'undefined') {
        throw new Error('云同步模块未加载');
      }
      const syncResult = await cloudSync.syncToCloud();

      // 检查云端数据是否真的被清空
      const clearedCount = syncResult.cleared ? syncResult.cleared.length : 0;
      const failedCount = syncResult.failed ? syncResult.failed.length : 0;

      if (syncResult.success && failedCount === 0) {
        store.addNotification({
          type: 'success',
          title: '数据重置成功',
          message: '已清空本地和云端数据。请刷新页面以重新初始化。'
        });
        // 云端数据清空成功，可以重新启动轮询
        cloudSync._startPeriodicPull();
      } else {
        store.addNotification({
          type: 'warning',
          title: '数据重置完成',
          message: '已清空本地数据。云端数据清空可能不完全（可能因权限限制），请手动在云端数据库中清空数据，或关闭云同步后继续使用。'
        });
        // 云端数据清空失败，不重新启动轮询，防止数据恢复
        // 用户需要手动刷新页面或关闭云同步
      }
    } catch (e) {
      store.addNotification({
        type: 'warning',
        title: '数据重置完成',
        message: '已清空本地数据（云端同步失败）。请刷新页面继续使用。'
      });
      // 不重新启动轮询
    }
  } else {
    // 云同步未启用，只清空本地数据
    store.addNotification({
      type: 'info',
      title: '正在重置',
      message: '正在清空本地数据...'
    });

    store.reset();
    renderSidebar();
    renderHeader();
    renderContent();

    store.addNotification({
      type: 'success',
      title: '数据重置成功',
      message: '已清空本地数据。如需同时清空云端数据，请先在"系统设置 → 云端同步"中开启云同步。'
    });
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

// 暴露到 window，供 gantt.js 等跨文件组件调用刷新
window.renderContent = renderContent;
