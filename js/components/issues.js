function renderIssues() {
  const state = store.getState();
  const projects = state.projects;
  const issues = state.issues;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">问题追踪</h1>
        <p class="page-description">记录和解决项目中出现的问题</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showCreateIssueModal()">
          <i class="fas fa-plus"></i>
          新建问题
        </button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon red">
            <i class="fas fa-bug"></i>
          </div>
        </div>
        <div class="stat-card-value">${issues.length}</div>
        <div class="stat-card-label">总问题</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-exclamation-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${issues.filter(i => i.status === 'open').length}</div>
        <div class="stat-card-label">待处理</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-tools"></i>
          </div>
        </div>
        <div class="stat-card-value">${issues.filter(i => i.status === 'in_progress').length}</div>
        <div class="stat-card-label">处理中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-double"></i>
          </div>
        </div>
        <div class="stat-card-value">${issues.filter(i => i.status === 'resolved').length}</div>
        <div class="stat-card-label">已解决</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="issueProjectFilter" onchange="filterIssues()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="issueStatusFilter" onchange="filterIssues()">
            <option value="">全部状态</option>
            <option value="open">待处理</option>
            <option value="in_progress">处理中</option>
            <option value="resolved">已解决</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">优先级筛选</label>
          <select class="form-input" id="issuePriorityFilter" onchange="filterIssues()">
            <option value="">全部优先级</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px;" id="issuesGrid">
      ${renderIssueCards(issues)}
    </div>
  `;
  
  return html;
}

function renderIssueCards(issues) {
  const state = store.getState();
  const projects = state.projects;
  
  return issues.map(issue => {
    const project = projects.find(p => p.id === issue.projectId);
    const statusClass = getIssueStatusClass(issue.status);
    const priorityColor = getIssuePriorityColor(issue.priority);
    
    return `
      <div class="card issue-card" style="padding: 24px; border-top: 4px solid ${priorityColor};">
        <div class="issue-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${issue.title}</h3>
          <span class="tag tag-${statusClass}" style="font-size: 12px;">${getIssueStatusName(issue.status)}</span>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
          <span class="tag tag-${getPriorityClass(issue.priority)}" style="font-size: 12px;">${getPriorityName(issue.priority)}</span>
          <span class="tag tag-info" style="font-size: 12px;">${issue.category || '其他'}</span>
        </div>
        
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px; line-height: 1.6;">${issue.description || '-'}</p>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px; color: var(--text-tertiary);">项目:</span>
            <span style="font-size: 13px; color: var(--text-secondary);">${project?.name || '-'}</span>
          </div>
          <span style="font-size: 12px; color: var(--text-tertiary);">${issue.createdAt || '-'}</span>
        </div>
        
        ${issue.resolvedAt ? `
          <div style="background: var(--success-color)15; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
            <div style="font-size: 12px; color: var(--success-color); font-weight: 500;">已解决</div>
            <div style="font-size: 12px; color: var(--text-secondary);">解决时间: ${issue.resolvedAt}</div>
          </div>
        ` : ''}
        
        <div class="issue-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="showEditIssueModal('${issue.id}')">
            <i class="fas fa-edit"></i>
            编辑
          </button>
          <button class="btn btn-primary btn-sm" onclick="resolveIssue('${issue.id}')">
            <i class="fas fa-check"></i>
            解决
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteIssue('${issue.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterIssues() {
  const state = store.getState();
  let issues = [...state.issues];
  
  const projectFilter = document.getElementById('issueProjectFilter')?.value;
  const statusFilter = document.getElementById('issueStatusFilter')?.value;
  const priorityFilter = document.getElementById('issuePriorityFilter')?.value;
  
  if (projectFilter) {
    issues = issues.filter(i => i.projectId === projectFilter);
  }
  
  if (statusFilter) {
    issues = issues.filter(i => i.status === statusFilter);
  }
  
  if (priorityFilter) {
    issues = issues.filter(i => i.priority === priorityFilter);
  }
  
  const grid = document.getElementById('issuesGrid');
  if (grid) {
    grid.innerHTML = renderIssueCards(issues);
  }
}

function getIssueStatusClass(status) {
  const classMap = {
    'open': 'warning',
    'in_progress': 'info',
    'resolved': 'success',
    'closed': 'secondary'
  };
  return classMap[status] || 'secondary';
}

function getIssueStatusName(status) {
  const nameMap = {
    'open': '待处理',
    'in_progress': '处理中',
    'resolved': '已解决',
    'closed': '已关闭'
  };
  return nameMap[status] || status;
}

function getIssuePriorityColor(priority) {
  const colorMap = { 'high': '#ef4444', 'medium': '#f59e0b', 'low': '#10b981' };
  return colorMap[priority] || '#64748b';
}

function getPriorityClass(priority) {
  const classMap = { 'high': 'danger', 'medium': 'warning', 'low': 'success' };
  return classMap[priority] || 'secondary';
}

function getPriorityName(priority) {
  const nameMap = { 'high': '高优先级', 'medium': '中优先级', 'low': '低优先级' };
  return nameMap[priority] || priority;
}

function showCreateIssueModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="createIssueModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">新建问题</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('createIssueModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="createIssueForm">
            <div class="form-group">
              <label class="form-label">问题标题 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="title" required placeholder="请输入问题标题">
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
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
                <label class="form-label">状态</label>
                <select class="form-input" name="status">
                  <option value="open">待处理</option>
                  <option value="in_progress">处理中</option>
                  <option value="resolved">已解决</option>
                  <option value="closed">已关闭</option>
                </select>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">优先级</label>
                <select class="form-input" name="priority">
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">分类</label>
                <select class="form-input" name="category">
                  <option value="技术">技术</option>
                  <option value="业务">业务</option>
                  <option value="需求">需求</option>
                  <option value="设计">设计</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">问题描述</label>
              <textarea class="form-input" name="description" rows="3" placeholder="请描述问题的详细内容"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('createIssueModal')">取消</button>
          <button class="btn btn-primary" onclick="handleCreateIssue()">创建</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleCreateIssue() {
  const form = document.getElementById('createIssueForm');
  const formData = new FormData(form);
  
  const issueData = {
    title: formData.get('title'),
    projectId: formData.get('projectId') || null,
    status: formData.get('status') || 'open',
    priority: formData.get('priority') || 'medium',
    category: formData.get('category'),
    description: formData.get('description')
  };
  
  store.addIssue(issueData);
  closeModal('createIssueModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '问题创建成功',
    message: `问题 "${issueData.title}" 已创建`
  });
}

function showEditIssueModal(issueId) {
  const state = store.getState();
  const issue = state.issues.find(i => i.id === issueId);
  const projects = state.projects;
  
  if (!issue) return;
  
  const html = `
    <div class="modal-overlay" id="editIssueModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">编辑问题</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editIssueModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editIssueForm">
            <input type="hidden" name="id" value="${issue.id}">
            <div class="form-group">
              <label class="form-label">问题标题</label>
              <input type="text" class="form-input" name="title" value="${issue.title}">
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">所属项目</label>
                <select class="form-input" name="projectId">
                  <option value="">请选择项目</option>
                  ${projects.map(p => `
                    <option value="${p.id}" ${p.id === issue.projectId ? 'selected' : ''}>${p.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-input" name="status">
                  <option value="open" ${issue.status === 'open' ? 'selected' : ''}>待处理</option>
                  <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>处理中</option>
                  <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>已解决</option>
                  <option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>已关闭</option>
                </select>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">优先级</label>
                <select class="form-input" name="priority">
                  <option value="high" ${issue.priority === 'high' ? 'selected' : ''}>高</option>
                  <option value="medium" ${issue.priority === 'medium' ? 'selected' : ''}>中</option>
                  <option value="low" ${issue.priority === 'low' ? 'selected' : ''}>低</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">分类</label>
                <select class="form-input" name="category">
                  <option value="技术" ${issue.category === '技术' ? 'selected' : ''}>技术</option>
                  <option value="业务" ${issue.category === '业务' ? 'selected' : ''}>业务</option>
                  <option value="需求" ${issue.category === '需求' ? 'selected' : ''}>需求</option>
                  <option value="设计" ${issue.category === '设计' ? 'selected' : ''}>设计</option>
                  <option value="其他" ${issue.category === '其他' ? 'selected' : ''}>其他</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">问题描述</label>
              <textarea class="form-input" name="description" rows="3">${issue.description || ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editIssueModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditIssue()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditIssue() {
  const form = document.getElementById('editIssueForm');
  const formData = new FormData(form);
  
  const issueId = formData.get('id');
  const updates = {
    title: formData.get('title'),
    projectId: formData.get('projectId') || null,
    status: formData.get('status'),
    priority: formData.get('priority'),
    category: formData.get('category'),
    description: formData.get('description')
  };
  
  store.updateIssue(issueId, updates);
  closeModal('editIssueModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '问题更新成功',
    message: '问题信息已更新'
  });
}

function resolveIssue(issueId) {
  store.updateIssue(issueId, { 
    status: 'resolved', 
    resolvedAt: new Date().toISOString().split('T')[0] 
  });
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '问题已解决',
    message: '该问题已标记为已解决'
  });
}

function confirmDeleteIssue(issueId) {
  if (confirm('确定要删除这个问题吗？')) {
    store.deleteIssue(issueId);
    renderContent();
    
    store.addNotification({
      type: 'info',
      title: '问题已删除',
      message: '问题已从系统中移除'
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderIssues };
}
