let currentFilter = 'all';
let currentProjectFilter = 'all';

function getPriorityColor(priority) {
  const colors = {
    'low': '#10b981',
    'medium': '#f59e0b',
    'high': '#f97316',
    'critical': '#ef4444'
  };
  return colors[priority] || colors['medium'];
}

function getPriorityName(priority) {
  const names = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'critical': '紧急'
  };
  return names[priority] || names['medium'];
}

function getStatusColor(status) {
  const colors = {
    'pending': '#6b7280',
    'in_progress': '#f59e0b',
    'completed': '#10b981'
  };
  return colors[status] || colors['pending'];
}

function getStatusName(status) {
  const names = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成'
  };
  return names[status] || names['pending'];
}

function isOverdue(milestone) {
  if (milestone.status === 'completed') return false;
  if (!milestone.targetDate) return false;
  return new Date(milestone.targetDate) < new Date();
}

function setMilestonePreset(name) {
  const input = document.getElementById('milestoneNameInput');
  if (input) {
    input.value = name;
    input.focus();
  }
}

function renderMilestones() {
  const state = store.getState();
  const projects = state.projects;
  let milestones = [...state.milestones];
  
  if (currentFilter !== 'all') {
    milestones = milestones.filter(m => m.status === currentFilter);
  }
  
  if (currentProjectFilter !== 'all') {
    milestones = milestones.filter(m => m.projectId === currentProjectFilter);
  }
  
  const stats = store.getMilestoneStats(
    currentProjectFilter !== 'all' ? currentProjectFilter : null
  );
  
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

    <div class="stats-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon" style="background: #dbeafe; color: #3b82f6;">
            <i class="fas fa-flag"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.total}</div>
        <div class="stat-card-label">总里程碑</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon" style="background: #d1fae5; color: #10b981;">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.completed}</div>
        <div class="stat-card-label">已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon" style="background: #fef3c7; color: #f59e0b;">
            <i class="fas fa-spinner"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.inProgress}</div>
        <div class="stat-card-label">进行中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon" style="background: #f3f4f6; color: #6b7280;">
            <i class="fas fa-clock"></i>
          </div>
        </div>
        <div class="stat-card-value">${stats.pending}</div>
        <div class="stat-card-label">待开始</div>
      </div>
      ${stats.overdue > 0 ? `
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background: #fee2e2; color: #ef4444;">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
          </div>
          <div class="stat-card-value">${stats.overdue}</div>
          <div class="stat-card-label">已逾期</div>
        </div>
      ` : ''}
    </div>

    <div class="card" style="margin-bottom: 24px; padding: 16px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <div>
          <label style="font-size: 14px; color: var(--text-secondary); margin-right: 8px;">状态筛选:</label>
          <select class="form-input" style="width: auto; display: inline-block;" onchange="currentFilter = this.value; renderContent();">
            <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>全部</option>
            <option value="pending" ${currentFilter === 'pending' ? 'selected' : ''}>待开始</option>
            <option value="in_progress" ${currentFilter === 'in_progress' ? 'selected' : ''}>进行中</option>
            <option value="completed" ${currentFilter === 'completed' ? 'selected' : ''}>已完成</option>
          </select>
        </div>
        <div>
          <label style="font-size: 14px; color: var(--text-secondary); margin-right: 8px;">项目筛选:</label>
          <select class="form-input" style="width: auto; display: inline-block;" onchange="currentProjectFilter = this.value; renderContent();">
            <option value="all" ${currentProjectFilter === 'all' ? 'selected' : ''}>全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}" ${currentProjectFilter === p.id ? 'selected' : ''}>${p.name}</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1fr; gap: 16px;">
      ${milestones.length === 0 ? `
        <div class="card" style="text-align: center; padding: 48px;">
          <i class="fas fa-flag" style="font-size: 48px; color: var(--border-color); margin-bottom: 16px;"></i>
          <h3 style="margin-bottom: 8px;">暂无里程碑</h3>
          <p class="text-muted">点击"新建里程碑"按钮创建第一个里程碑</p>
        </div>
      ` : milestones.map(milestone => {
        const project = projects.find(p => p.id === milestone.projectId);
        const assignee = store.getUserById(milestone.assigneeId);
        const overdue = isOverdue(milestone);
        
        return `
          <div class="card milestone-card" style="padding: 20px;">
            <div class="milestone-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div class="milestone-info" style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                  <h3 style="font-size: 18px; font-weight: 600; margin: 0;">${milestone.name}</h3>
                  ${milestone.priority ? `
                    <span class="tag" style="background: ${getPriorityColor(milestone.priority)}20; color: ${getPriorityColor(milestone.priority)}; font-size: 12px;">
                      <i class="fas fa-flag" style="margin-right: 4px;"></i>
                      ${getPriorityName(milestone.priority)}
                    </span>
                  ` : ''}
                  ${overdue ? `
                    <span class="tag" style="background: #fee2e2; color: #ef4444; font-size: 12px;">
                      <i class="fas fa-exclamation-circle" style="margin-right: 4px;"></i>
                      已逾期
                    </span>
                  ` : ''}
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 12px; line-height: 1.6;">${milestone.description || '暂无描述'}</p>
                <div class="milestone-meta" style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
                  <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 14px;">
                    <i class="fas fa-project-diagram"></i>
                    ${project?.name || '未分配项目'}
                  </span>
                  ${assignee ? `
                    <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 14px;">
                      <i class="fas fa-user"></i>
                      ${assignee.name}
                    </span>
                  ` : ''}
                  <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 14px;">
                    <i class="fas fa-calendar"></i>
                    目标: ${milestone.targetDate || '未设置'}
                  </span>
                  ${milestone.completedDate ? `
                    <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 14px;">
                      <i class="fas fa-check-double"></i>
                      完成: ${milestone.completedDate}
                    </span>
                  ` : ''}
                </div>
                ${milestone.tags && milestone.tags.length > 0 ? `
                  <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                    ${milestone.tags.map(tag => `
                      <span style="background: var(--background-secondary); padding: 4px 10px; border-radius: 4px; font-size: 12px; color: var(--text-secondary);">
                        ${tag}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
                ${milestone.progress !== undefined ? `
                  <div style="margin-top: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                      <span style="color: var(--text-secondary);">进度</span>
                      <span style="font-weight: 500;">${milestone.progress}%</span>
                    </div>
                    <div class="progress-bar" style="width: 100%; height: 8px;">
                      <div class="progress-bar-fill" style="width: ${milestone.progress}%;"></div>
                    </div>
                  </div>
                ` : ''}
              </div>
              <div class="milestone-actions" style="display: flex; gap: 8px; align-items: center;">
                <span class="tag" style="background: ${getStatusColor(milestone.status)}20; color: ${getStatusColor(milestone.status)};">
                  ${getStatusName(milestone.status)}
                </span>
                ${milestone.status !== 'completed' ? `
                  <button class="btn btn-success btn-sm" onclick="completeMilestone('${milestone.id}')" title="完成里程碑">
                    <i class="fas fa-check"></i>
                  </button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="showEditMilestoneModal('${milestone.id}')" title="编辑">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteMilestone('${milestone.id}')" title="删除">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  return html;
}

function completeMilestone(milestoneId) {
  if (confirm('确定要将此里程碑标记为已完成吗？')) {
    store.completeMilestone(milestoneId);
    renderContent();
  }
}

function showCreateMilestoneModal() {
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="createMilestoneModal">
      <div class="modal-content" style="max-width: 600px;">
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
              <input type="text" class="form-input" id="milestoneNameInput" name="name" required placeholder="请输入里程碑名称">
            </div>
            <div class="form-group">
              <label class="form-label">快速模板（污水处理厂）</label>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <button type="button" class="btn btn-xs" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('施工图设计完成')">施工图设计完成</button>
                <button type="button" class="btn btn-xs" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('土建主体完工')">土建主体完工</button>
                <button type="button" class="btn btn-xs" style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('设备进场验收')">设备进场验收</button>
                <button type="button" class="btn btn-xs" style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('机电安装完成')">机电安装完成</button>
                <button type="button" class="btn btn-xs" style="background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('单机调试完成')">单机调试完成</button>
                <button type="button" class="btn btn-xs" style="background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('联动调试完成')">联动调试完成</button>
                <button type="button" class="btn btn-xs" style="background: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('工艺调试达标')">工艺调试达标</button>
                <button type="button" class="btn btn-xs" style="background: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('环保验收通过')">环保验收通过</button>
                <button type="button" class="btn btn-xs" style="background: #fce7f3; color: #9d174d; border: 1px solid #f9a8d4; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('竣工移交')">竣工移交</button>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">所属项目 <span style="color: red;">*</span></label>
                <select class="form-input" name="projectId" required>
                  <option value="">请选择项目</option>
                  ${projects.map(p => `
                    <option value="${p.id}">${p.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">优先级</label>
                <select class="form-input" name="priority">
                  <option value="low">低</option>
                  <option value="medium" selected>中</option>
                  <option value="high">高</option>
                  <option value="critical">紧急</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">负责人</label>
              <select class="form-input" name="assigneeId">
                <option value="">请选择负责人</option>
                ${users.map(u => `
                  <option value="${u.id}">${u.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea class="form-input" name="description" rows="3" placeholder="请输入里程碑描述"></textarea>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">目标日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="targetDate" required>
              </div>
              <div class="form-group">
                <label class="form-label">初始进度 (%)</label>
                <input type="number" class="form-input" name="progress" min="0" max="100" value="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">标签（用逗号分隔）</label>
              <input type="text" class="form-input" name="tags" placeholder="例如：设计,土建,安装">
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
  
  const tagsInput = formData.get('tags');
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
  
  const milestoneData = {
    name: formData.get('name'),
    projectId: formData.get('projectId'),
    description: formData.get('description'),
    targetDate: formData.get('targetDate'),
    priority: formData.get('priority') || 'medium',
    assigneeId: formData.get('assigneeId') || null,
    progress: parseInt(formData.get('progress')) || 0,
    status: 'pending',
    tags: tags
  };
  
  store.addMilestone(milestoneData);
  closeModal('createMilestoneModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '里程碑创建成功',
    message: `里程碑「${milestoneData.name}」已创建`
  });
}

function showEditMilestoneModal(milestoneId) {
  const state = store.getState();
  const milestone = state.milestones.find(m => m.id === milestoneId);
  const projects = state.projects;
  const users = state.users;
  
  if (!milestone) return;
  
  const html = `
    <div class="modal-overlay" id="editMilestoneModal">
      <div class="modal-content" style="max-width: 600px;">
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
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
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
                <label class="form-label">优先级</label>
                <select class="form-input" name="priority">
                  <option value="low" ${milestone.priority === 'low' ? 'selected' : ''}>低</option>
                  <option value="medium" ${milestone.priority === 'medium' ? 'selected' : ''}>中</option>
                  <option value="high" ${milestone.priority === 'high' ? 'selected' : ''}>高</option>
                  <option value="critical" ${milestone.priority === 'critical' ? 'selected' : ''}>紧急</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">负责人</label>
              <select class="form-input" name="assigneeId">
                <option value="">请选择负责人</option>
                ${users.map(u => `
                  <option value="${u.id}" ${u.id === milestone.assigneeId ? 'selected' : ''}>${u.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea class="form-input" name="description" rows="3">${milestone.description || ''}</textarea>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">目标日期</label>
                <input type="date" class="form-input" name="targetDate" value="${milestone.targetDate || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">进度 (%)</label>
                <input type="number" class="form-input" name="progress" min="0" max="100" value="${milestone.progress || 0}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">标签（用逗号分隔）</label>
              <input type="text" class="form-input" name="tags" value="${milestone.tags ? milestone.tags.join(', ') : ''}" placeholder="例如：设计,土建,安装">
            </div>
            <div class="form-group">
              <label class="form-label">状态</label>
              <select class="form-input" name="status">
                <option value="pending" ${milestone.status === 'pending' ? 'selected' : ''}>待开始</option>
                <option value="in_progress" ${milestone.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                <option value="completed" ${milestone.status === 'completed' ? 'selected' : ''}>已完成</option>
              </select>
            </div>
            ${milestone.status === 'completed' || milestone.completedDate ? `
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
  const tagsInput = formData.get('tags');
  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
  
  const updates = {
    name: formData.get('name'),
    projectId: formData.get('projectId'),
    description: formData.get('description'),
    targetDate: formData.get('targetDate'),
    priority: formData.get('priority'),
    assigneeId: formData.get('assigneeId') || null,
    progress: parseInt(formData.get('progress')) || 0,
    status: formData.get('status'),
    tags: tags
  };
  
  if (updates.status === 'completed') {
    updates.completedDate = formData.get('completedDate') || new Date().toISOString().split('T')[0];
  } else if (updates.status !== 'completed') {
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
  if (confirm('确定要删除这个里程碑吗？此操作不可撤销。')) {
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
