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

    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总风险</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">${risks.length}</div>
        <div style="font-size: 12px; color: #dc2626;">风险总数</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-clock" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">活跃风险</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${risks.filter(r => r.status === 'active').length}</div>
        <div style="font-size: 12px; color: #d97706;">需关注</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-shield-alt" style="color: #8b5cf6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已缓解</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #6d28d9; margin-bottom: 8px;">${risks.filter(r => r.status === 'mitigated').length}</div>
        <div style="font-size: 12px; color: #7c3aed;">已控制</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已解决</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${risks.filter(r => r.status === 'resolved').length}</div>
        <div style="font-size: 12px; color: #15803d;">已处理</div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">风险筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="riskProjectFilter" onchange="filterRisks()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
          <select style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="riskStatusFilter" onchange="filterRisks()">
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="mitigated">已缓解</option>
            <option value="resolved">已解决</option>
            <option value="closed">已关闭</option>
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="riskProbabilityFilter" onchange="filterRisks()">
            <option value="">全部概率</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetRiskFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
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
    const priorityColor = getRiskPriorityColor(risk.level);
    const statusClass = getRiskStatusClass(risk.status);
    
    return `
      <div class="card risk-card" style="padding: 24px; border-left: 4px solid ${priorityColor};">
        <div class="risk-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${risk.title || risk.name || '未命名风险'}</h3>
          <span class="tag tag-${statusClass}" style="font-size: 12px;">${getRiskStatusName(risk.status)}</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px; line-height: 1.6;">${risk.description || '-'}</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">风险类型</div>
            <span class="tag tag-info" style="font-size: 12px;">${risk.type || '其他'}</span>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">风险级别</div>
            <span class="tag tag-${getRiskLevelClass(risk.level)}" style="font-size: 12px;">${getRiskLevelName(risk.level)}</span>
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

function resetRiskFilters() {
  const projectFilter = document.getElementById('riskProjectFilter');
  const statusFilter = document.getElementById('riskStatusFilter');
  const probabilityFilter = document.getElementById('riskProbabilityFilter');
  if (projectFilter) projectFilter.value = '';
  if (statusFilter) statusFilter.value = '';
  if (probabilityFilter) probabilityFilter.value = '';
  filterRisks();
}

function getRiskPriorityColor(level) {
  const colorMap = { 'high': '#ef4444', 'medium': '#f59e0b', 'low': '#10b981' };
  return colorMap[level] || '#64748b';
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
  return nameMap[status] || status || '未设置';
}

function getRiskLevelClass(level) {
  const classMap = { 'high': 'danger', 'medium': 'warning', 'low': 'success' };
  return classMap[level] || 'secondary';
}

function getRiskLevelName(level) {
  const nameMap = { 'high': '高', 'medium': '中', 'low': '低' };
  return nameMap[level] || level || '未设置';
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建风险</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createRiskModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createRiskForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">风险名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入风险名称">
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
                <option value="active">活跃</option>
                <option value="mitigated">已缓解</option>
                <option value="resolved">已解决</option>
                <option value="closed">已关闭</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">发生概率</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="probability">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">影响程度</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="impact">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">风险描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" placeholder="请描述该风险的详细内容"></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">应对措施</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="mitigation" placeholder="请输入应对措施"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createRiskModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleCreateRisk()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createRiskModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑风险</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editRiskModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editRiskForm">
          <input type="hidden" name="id" value="${risk.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">风险名称</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" value="${risk.name}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}" ${p.id === risk.projectId ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="active" ${risk.status === 'active' ? 'selected' : ''}>活跃</option>
                <option value="mitigated" ${risk.status === 'mitigated' ? 'selected' : ''}>已缓解</option>
                <option value="resolved" ${risk.status === 'resolved' ? 'selected' : ''}>已解决</option>
                <option value="closed" ${risk.status === 'closed' ? 'selected' : ''}>已关闭</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">发生概率</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="probability">
                <option value="high" ${risk.probability === 'high' ? 'selected' : ''}>高</option>
                <option value="medium" ${risk.probability === 'medium' ? 'selected' : ''}>中</option>
                <option value="low" ${risk.probability === 'low' ? 'selected' : ''}>低</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">影响程度</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="impact">
                <option value="high" ${risk.impact === 'high' ? 'selected' : ''}>高</option>
                <option value="medium" ${risk.impact === 'medium' ? 'selected' : ''}>中</option>
                <option value="low" ${risk.impact === 'low' ? 'selected' : ''}>低</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">风险描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description">${risk.description || ''}</textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">应对措施</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="mitigation">${risk.mitigation || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editRiskModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditRisk()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editRiskModal', contentHtml);
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
