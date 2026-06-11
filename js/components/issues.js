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

    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-bug" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总问题</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">${issues.length}</div>
        <div style="font-size: 12px; color: #dc2626;">问题总数</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-circle" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">待处理</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${issues.filter(i => i.status === 'open').length}</div>
        <div style="font-size: 12px; color: #d97706;">待处理问题</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-tools" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">处理中</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${issues.filter(i => i.status === 'in_progress').length}</div>
        <div style="font-size: 12px; color: #93c5fd;">进行中问题</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-double" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已解决</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${issues.filter(i => i.status === 'resolved').length}</div>
        <div style="font-size: 12px; color: #15803d;">已解决问题</div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #f59e0b 0%, #f97316 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">问题筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="issueProjectFilter" onchange="filterIssues()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
          <select style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="issueStatusFilter" onchange="filterIssues()">
            <option value="">全部状态</option>
            <option value="open">待处理</option>
            <option value="in_progress">处理中</option>
            <option value="resolved">已解决</option>
            <option value="closed">已关闭</option>
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="issuePriorityFilter" onchange="filterIssues()">
            <option value="">全部优先级</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetIssueFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
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
    const priorityColor = getIssuePriorityColor(issue.level);
    
    return `
      <div class="card issue-card" style="padding: 24px; border-top: 4px solid ${priorityColor};">
        <div class="issue-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${issue.title}</h3>
          <span class="tag tag-${statusClass}" style="font-size: 12px;">${getIssueStatusName(issue.status)}</span>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
          <span class="tag tag-${getPriorityClass(issue.level)}" style="font-size: 12px;">${getPriorityName(issue.level)}</span>
          <span class="tag tag-info" style="font-size: 12px;">${issue.type || '其他'}</span>
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

function resetIssueFilters() {
  const projectFilter = document.getElementById('issueProjectFilter');
  const statusFilter = document.getElementById('issueStatusFilter');
  const priorityFilter = document.getElementById('issuePriorityFilter');
  if (projectFilter) projectFilter.value = '';
  if (statusFilter) statusFilter.value = '';
  if (priorityFilter) priorityFilter.value = '';
  filterIssues();
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
  const colorMap = { 'urgent': '#dc2626', 'high': '#ef4444', 'medium': '#f59e0b', 'low': '#10b981' };
  return colorMap[priority] || '#64748b';
}

function getPriorityClass(priority) {
  const classMap = { 'urgent': 'danger', 'high': 'danger', 'medium': 'warning', 'low': 'success' };
  return classMap[priority] || 'secondary';
}

function getPriorityName(priority) {
  const nameMap = { 'urgent': '紧急', 'high': '高优先级', 'medium': '中优先级', 'low': '低优先级' };
  return nameMap[priority] || priority || '未设置';
}

function showCreateIssueModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建问题</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createIssueModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createIssueForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题标题 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="title" required placeholder="请输入问题标题">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}">${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="open">待处理</option>
                <option value="in_progress">处理中</option>
                <option value="resolved">已解决</option>
                <option value="closed">已关闭</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">分类</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
                <option value="技术">技术</option>
                <option value="业务">业务</option>
                <option value="需求">需求</option>
                <option value="设计">设计</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" placeholder="请描述问题的详细内容"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createIssueModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleCreateIssue()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createIssueModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑问题</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editIssueModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editIssueForm">
          <input type="hidden" name="id" value="${issue.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题标题</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="title" value="${issue.title}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}" ${p.id === issue.projectId ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="open" ${issue.status === 'open' ? 'selected' : ''}>待处理</option>
                <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>处理中</option>
                <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>已解决</option>
                <option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>已关闭</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority">
                <option value="high" ${issue.priority === 'high' ? 'selected' : ''}>高</option>
                <option value="medium" ${issue.priority === 'medium' ? 'selected' : ''}>中</option>
                <option value="low" ${issue.priority === 'low' ? 'selected' : ''}>低</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">分类</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
                <option value="技术" ${issue.category === '技术' ? 'selected' : ''}>技术</option>
                <option value="业务" ${issue.category === '业务' ? 'selected' : ''}>业务</option>
                <option value="需求" ${issue.category === '需求' ? 'selected' : ''}>需求</option>
                <option value="设计" ${issue.category === '设计' ? 'selected' : ''}>设计</option>
                <option value="其他" ${issue.category === '其他' ? 'selected' : ''}>其他</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description">${issue.description || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editIssueModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditIssue()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editIssueModal', contentHtml);
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
