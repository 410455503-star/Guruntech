function renderRisks() {
  const state = store.getState();
  const projects = state.projects;
  const risks = state.risks;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">风险管理</h1>
        <p class="page-description">识别、评估和处理项目风险</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showCreateRiskModal()">
          <i class="fas fa-plus"></i>
          新建风险
        </button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon red">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div class="stat-card-value">${risks.length}</div>
        <div class="stat-card-label">总风险</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-clock"></i>
          </div>
        </div>
        <div class="stat-card-value">${risks.filter(r => r.status === 'active').length}</div>
        <div class="stat-card-label">活跃风险</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon purple">
            <i class="fas fa-shield-alt"></i>
          </div>
        </div>
        <div class="stat-card-value">${risks.filter(r => r.status === 'mitigated').length}</div>
        <div class="stat-card-label">已缓解</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${risks.filter(r => r.status === 'resolved').length}</div>
        <div class="stat-card-label">已解决</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="riskProjectFilter" onchange="filterRisks()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="riskStatusFilter" onchange="filterRisks()">
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="mitigated">已缓解</option>
            <option value="resolved">已解决</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">概率筛选</label>
          <select class="form-input" id="riskProbabilityFilter" onchange="filterRisks()">
            <option value="">全部概率</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px;" id="risksGrid">
      ${renderRiskCards(risks)}
    </div>
  `;
  
  return html;
}

function renderRiskCards(risks) {
  const state = store.getState();
  const projects = state.projects;
  
  return risks.map(risk => {
    const project = projects.find(p => p.id === risk.projectId);
    const priorityColor = getRiskPriorityColor(risk.probability, risk.impact);
    const statusClass = getRiskStatusClass(risk.status);
    
    return `
      <div class="card risk-card" style="padding: 24px; border-left: 4px solid ${priorityColor};">
        <div class="risk-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${risk.name}</h3>
          <span class="tag tag-${statusClass}" style="font-size: 12px;">${getRiskStatusName(risk.status)}</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px; line-height: 1.6;">${risk.description || '-'}</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">发生概率</div>
            <span class="tag tag-${getProbabilityClass(risk.probability)}" style="font-size: 12px;">${getProbabilityName(risk.probability)}</span>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">影响程度</div>
            <span class="tag tag-${getImpactClass(risk.impact)}" style="font-size: 12px;">${getImpactName(risk.impact)}</span>
          </div>
        </div>
        
        <div style="background: var(--bg-light); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
          <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">应对措施</div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${risk.mitigation || '-'}</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px; color: var(--text-tertiary);">项目:</span>
            <span style="font-size: 13px; color: var(--text-secondary);">${project?.name || '-'}</span>
          </div>
          <span style="font-size: 12px; color: var(--text-tertiary);">${risk.createdAt || '-'}</span>
        </div>
        
        <div class="risk-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="showEditRiskModal('${risk.id}')">
            <i class="fas fa-edit"></i>
            编辑
          </button>
          <button class="btn btn-primary btn-sm" onclick="resolveRisk('${risk.id}')">
            <i class="fas fa-check"></i>
            解决
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteRisk('${risk.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterRisks() {
  const state = store.getState();
  let risks = [...state.risks];
  
  const projectFilter = document.getElementById('riskProjectFilter')?.value;
  const statusFilter = document.getElementById('riskStatusFilter')?.value;
  const probabilityFilter = document.getElementById('riskProbabilityFilter')?.value;
  
  if (projectFilter) {
    risks = risks.filter(r => r.projectId === projectFilter);
  }
  
  if (statusFilter) {
    risks = risks.filter(r => r.status === statusFilter);
  }
  
  if (probabilityFilter) {
    risks = risks.filter(r => r.probability === probabilityFilter);
  }
  
  const grid = document.getElementById('risksGrid');
  if (grid) {
    grid.innerHTML = renderRiskCards(risks);
  }
}

function getRiskPriorityColor(probability, impact) {
  if (probability === 'high' && impact === 'high') return '#ef4444';
  if (probability === 'high' || impact === 'high') return '#f59e0b';
  if (probability === 'medium' || impact === 'medium') return '#10b981';
  return '#64748b';
}

function getRiskStatusClass(status) {
  const classMap = {
    'active': 'warning',
    'mitigated': 'info',
    'resolved': 'success',
    'closed': 'secondary'
  };
  return classMap[status] || 'secondary';
}

function getRiskStatusName(status) {
  const nameMap = {
    'active': '活跃',
    'mitigated': '已缓解',
    'resolved': '已解决',
    'closed': '已关闭'
  };
  return nameMap[status] || status;
}

function getProbabilityClass(probability) {
  const classMap = { 'high': 'danger', 'medium': 'warning', 'low': 'success' };
  return classMap[probability] || 'secondary';
}

function getProbabilityName(probability) {
  const nameMap = { 'high': '高', 'medium': '中', 'low': '低' };
  return nameMap[probability] || probability;
}

function getImpactClass(impact) {
  return getProbabilityClass(impact);
}

function getImpactName(impact) {
  return getProbabilityName(impact);
}

function showCreateRiskModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="createRiskModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">新建风险</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('createRiskModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="createRiskForm">
            <div class="form-group">
              <label class="form-label">风险名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入风险名称">
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
                  <option value="active">活跃</option>
                  <option value="mitigated">已缓解</option>
                  <option value="resolved">已解决</option>
                  <option value="closed">已关闭</option>
                </select>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">发生概率</label>
                <select class="form-input" name="probability">
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">影响程度</label>
                <select class="form-input" name="impact">
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">风险描述</label>
              <textarea class="form-input" name="description" rows="3" placeholder="请描述该风险的详细内容"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">应对措施</label>
              <textarea class="form-input" name="mitigation" rows="3" placeholder="请输入应对措施"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('createRiskModal')">取消</button>
          <button class="btn btn-primary" onclick="handleCreateRisk()">创建</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleCreateRisk() {
  const form = document.getElementById('createRiskForm');
  const formData = new FormData(form);
  
  const riskData = {
    name: formData.get('name'),
    projectId: formData.get('projectId') || null,
    status: formData.get('status') || 'active',
    probability: formData.get('probability'),
    impact: formData.get('impact'),
    description: formData.get('description'),
    mitigation: formData.get('mitigation')
  };
  
  store.addRisk(riskData);
  closeModal('createRiskModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '风险创建成功',
    message: `风险 "${riskData.name}" 已创建`
  });
}

function showEditRiskModal(riskId) {
  const state = store.getState();
  const risk = state.risks.find(r => r.id === riskId);
  const projects = state.projects;
  
  if (!risk) return;
  
  const html = `
    <div class="modal-overlay" id="editRiskModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">编辑风险</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editRiskModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editRiskForm">
            <input type="hidden" name="id" value="${risk.id}">
            <div class="form-group">
              <label class="form-label">风险名称</label>
              <input type="text" class="form-input" name="name" value="${risk.name}">
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">所属项目</label>
                <select class="form-input" name="projectId">
                  <option value="">请选择项目</option>
                  ${projects.map(p => `
                    <option value="${p.id}" ${p.id === risk.projectId ? 'selected' : ''}>${p.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-input" name="status">
                  <option value="active" ${risk.status === 'active' ? 'selected' : ''}>活跃</option>
                  <option value="mitigated" ${risk.status === 'mitigated' ? 'selected' : ''}>已缓解</option>
                  <option value="resolved" ${risk.status === 'resolved' ? 'selected' : ''}>已解决</option>
                  <option value="closed" ${risk.status === 'closed' ? 'selected' : ''}>已关闭</option>
                </select>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">发生概率</label>
                <select class="form-input" name="probability">
                  <option value="high" ${risk.probability === 'high' ? 'selected' : ''}>高</option>
                  <option value="medium" ${risk.probability === 'medium' ? 'selected' : ''}>中</option>
                  <option value="low" ${risk.probability === 'low' ? 'selected' : ''}>低</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">影响程度</label>
                <select class="form-input" name="impact">
                  <option value="high" ${risk.impact === 'high' ? 'selected' : ''}>高</option>
                  <option value="medium" ${risk.impact === 'medium' ? 'selected' : ''}>中</option>
                  <option value="low" ${risk.impact === 'low' ? 'selected' : ''}>低</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">风险描述</label>
              <textarea class="form-input" name="description" rows="3">${risk.description || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">应对措施</label>
              <textarea class="form-input" name="mitigation" rows="3">${risk.mitigation || ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editRiskModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditRisk()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditRisk() {
  const form = document.getElementById('editRiskForm');
  const formData = new FormData(form);
  
  const riskId = formData.get('id');
  const updates = {
    name: formData.get('name'),
    projectId: formData.get('projectId') || null,
    status: formData.get('status'),
    probability: formData.get('probability'),
    impact: formData.get('impact'),
    description: formData.get('description'),
    mitigation: formData.get('mitigation')
  };
  
  store.updateRisk(riskId, updates);
  closeModal('editRiskModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '风险更新成功',
    message: '风险信息已更新'
  });
}

function resolveRisk(riskId) {
  store.updateRisk(riskId, { status: 'resolved' });
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '风险已解决',
    message: '该风险已标记为已解决'
  });
}

function confirmDeleteRisk(riskId) {
  if (confirm('确定要删除这个风险吗？')) {
    store.deleteRisk(riskId);
    renderContent();
    
    store.addNotification({
      type: 'info',
      title: '风险已删除',
      message: '风险已从系统中移除'
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderRisks };
}
