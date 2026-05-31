function renderMilestones() {
  const state = store.getState();
  const projects = state.projects;
  const milestones = state.milestones;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">里程碑管理</h1>
        <p class="page-description">跟踪项目关键节点完成情况</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showCreateMilestoneModal()">
          <i class="fas fa-plus"></i>
          新建里程碑
        </button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-flag"></i>
          </div>
        </div>
        <div class="stat-card-value">${milestones.length}</div>
        <div class="stat-card-label">总里程碑</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${milestones.filter(m => m.status === 'completed').length}</div>
        <div class="stat-card-label">已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-spinner"></i>
          </div>
        </div>
        <div class="stat-card-value">${milestones.filter(m => m.status === 'in_progress').length}</div>
        <div class="stat-card-label">进行中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon gray">
            <i class="fas fa-clock"></i>
          </div>
        </div>
        <div class="stat-card-value">${milestones.filter(m => m.status === 'pending').length}</div>
        <div class="stat-card-label">待开始</div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1fr; gap: 24px;">
      ${milestones.map(milestone => {
        const project = projects.find(p => p.id === milestone.projectId);
        const assignee = store.getUserById(milestone.assigneeId);
        const statusClass = milestone.status === 'completed' ? 'success' : 
                           milestone.status === 'in_progress' ? 'warning' : 'primary';
        
        return `
          <div class="card milestone-card" style="padding: 24px;">
            <div class="milestone-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
              <div class="milestone-info">
                <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${milestone.name}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 12px;">${milestone.description || '暂无描述'}</p>
                <div class="milestone-meta" style="display: flex; gap: 16px; flex-wrap: wrap;">
                  <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                    <i class="fas fa-project-diagram"></i>
                    ${project?.name || '未分配项目'}
                  </span>
                  <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                    <i class="fas fa-calendar"></i>
                    目标: ${milestone.targetDate}
                  </span>
                  ${milestone.completedDate ? `
                    <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                      <i class="fas fa-check-double"></i>
                      完成: ${milestone.completedDate}
                    </span>
                  ` : ''}
                </div>
              </div>
              <div class="milestone-actions" style="display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-sm" onclick="showEditMilestoneModal('${milestone.id}')">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteMilestone('${milestone.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="milestone-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-color);">
              <span class="tag tag-${statusClass}">${getStatusName(milestone.status)}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  return html;
}

function showCreateMilestoneModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="createMilestoneModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">新建里程碑</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('createMilestoneModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="createMilestoneForm">
            <div class="form-group">
              <label class="form-label">里程碑名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入里程碑名称">
            </div>
            <div class="form-group">
              <label class="form-label">所属项目</label>
              <select class="form-input" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}">${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea class="form-input" name="description" rows="3" placeholder="请输入描述"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">目标日期 <span style="color: red;">*</span></label>
              <input type="date" class="form-input" name="targetDate" required>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('createMilestoneModal')">取消</button>
          <button class="btn btn-primary" onclick="handleCreateMilestone()">创建</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleCreateMilestone() {
  const form = document.getElementById('createMilestoneForm');
  const formData = new FormData(form);
  
  const milestoneData = {
    name: formData.get('name'),
    projectId: formData.get('projectId') || null,
    description: formData.get('description'),
    targetDate: formData.get('targetDate'),
    status: 'pending'
  };
  
  store.addMilestone(milestoneData);
  closeModal('createMilestoneModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '里程碑创建成功',
    message: `里程碑 "${milestoneData.name}" 已创建`
  });
}

function showEditMilestoneModal(milestoneId) {
  const state = store.getState();
  const milestone = state.milestones.find(m => m.id === milestoneId);
  const projects = state.projects;
  
  if (!milestone) return;
  
  const html = `
    <div class="modal-overlay" id="editMilestoneModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">编辑里程碑</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editMilestoneModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editMilestoneForm">
            <input type="hidden" name="id" value="${milestone.id}">
            <div class="form-group">
              <label class="form-label">里程碑名称</label>
              <input type="text" class="form-input" name="name" value="${milestone.name}">
            </div>
            <div class="form-group">
              <label class="form-label">所属项目</label>
              <select class="form-input" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}" ${p.id === milestone.projectId ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea class="form-input" name="description" rows="3">${milestone.description || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">目标日期</label>
              <input type="date" class="form-input" name="targetDate" value="${milestone.targetDate}">
            </div>
            <div class="form-group">
              <label class="form-label">状态</label>
              <select class="form-input" name="status">
                <option value="pending" ${milestone.status === 'pending' ? 'selected' : ''}>待开始</option>
                <option value="in_progress" ${milestone.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                <option value="completed" ${milestone.status === 'completed' ? 'selected' : ''}>已完成</option>
              </select>
            </div>
            ${milestone.status === 'completed' ? `
              <div class="form-group">
                <label class="form-label">完成日期</label>
                <input type="date" class="form-input" name="completedDate" value="${milestone.completedDate || ''}">
              </div>
            ` : ''}
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editMilestoneModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditMilestone()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditMilestone() {
  const form = document.getElementById('editMilestoneForm');
  const formData = new FormData(form);
  
  const milestoneId = formData.get('id');
  const updates = {
    name: formData.get('name'),
    projectId: formData.get('projectId') || null,
    description: formData.get('description'),
    targetDate: formData.get('targetDate'),
    status: formData.get('status')
  };
  
  if (updates.status === 'completed') {
    updates.completedDate = formData.get('completedDate') || new Date().toISOString().split('T')[0];
  } else {
    updates.completedDate = null;
  }
  
  store.updateMilestone(milestoneId, updates);
  closeModal('editMilestoneModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '里程碑更新成功',
    message: '里程碑信息已更新'
  });
}

function confirmDeleteMilestone(milestoneId) {
  if (confirm('确定要删除这个里程碑吗？')) {
    store.deleteMilestone(milestoneId);
    renderContent();
    
    store.addNotification({
      type: 'info',
      title: '里程碑已删除',
      message: '里程碑已从系统中移除'
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderMilestones };
}
