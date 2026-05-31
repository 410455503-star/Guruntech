function renderResources() {
  const state = store.getState();
  const projects = state.projects;
  const resources = state.resources;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">资源管理</h1>
        <p class="page-description">管理项目设备、材料和人力资源</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showCreateResourceModal()">
          <i class="fas fa-plus"></i>
          新建资源
        </button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-cube"></i>
          </div>
        </div>
        <div class="stat-card-value">${resources.length}</div>
        <div class="stat-card-label">总资源</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${resources.filter(r => r.status === 'installed').length}</div>
        <div class="stat-card-label">已安装</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-spinner"></i>
          </div>
        </div>
        <div class="stat-card-value">${resources.filter(r => r.status === 'installing' || r.status === 'using').length}</div>
        <div class="stat-card-label">安装中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon orange">
            <i class="fas fa-dollar-sign"></i>
          </div>
        </div>
        <div class="stat-card-value">¥${resources.reduce((sum, r) => sum + (r.totalPrice || 0), 0).toLocaleString()}</div>
        <div class="stat-card-label">总价值</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="resourceProjectFilter" onchange="filterResources()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">类型筛选</label>
          <select class="form-input" id="resourceTypeFilter" onchange="filterResources()">
            <option value="">全部类型</option>
            <option value="设备">设备</option>
            <option value="电气">电气</option>
            <option value="自控">自控</option>
            <option value="仪表">仪表</option>
            <option value="材料">材料</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="resourceStatusFilter" onchange="filterResources()">
            <option value="">全部状态</option>
            <option value="installed">已安装</option>
            <option value="installing">安装中</option>
            <option value="using">使用中</option>
            <option value="pending">待采购</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px;" id="resourcesGrid">
      ${renderResourceCards(resources)}
    </div>
  `;
  
  return html;
}

function renderResourceCards(resources) {
  const state = store.getState();
  const projects = state.projects;
  
  return resources.map(resource => {
    const project = projects.find(p => p.id === resource.projectId);
    const statusClass = resource.status === 'installed' ? 'success' : 
                       resource.status === 'installing' || resource.status === 'using' ? 'warning' : 'primary';
    
    return `
      <div class="card resource-card" style="padding: 24px;">
        <div class="resource-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div class="resource-info">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${resource.name}</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px;">
              ${resource.model ? `型号: ${resource.model}` : ''}
            </p>
            <div class="resource-meta" style="display: flex; gap: 12px; flex-wrap: wrap;">
              <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 13px;">
                <i class="fas fa-cube"></i>
                ${resource.quantity} ${resource.unit}
              </span>
              <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 13px;">
                <i class="fas fa-tag"></i>
                类型: ${resource.type}
              </span>
            </div>
          </div>
          <div class="resource-actions" style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="showEditResourceModal('${resource.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteResource('${resource.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="resource-body" style="padding-top: 16px; border-top: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: var(--text-secondary); font-size: 13px;">供应商</span>
            <span style="font-weight: 500; font-size: 13px;">${resource.supplier || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: var(--text-secondary); font-size: 13px;">项目</span>
            <span style="font-weight: 500; font-size: 13px;">${project?.name || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: var(--text-secondary); font-size: 13px;">采购日期</span>
            <span style="font-weight: 500; font-size: 13px;">${resource.purchaseDate || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: var(--text-secondary); font-size: 13px;">单价</span>
            <span style="font-weight: 500; font-size: 13px;">¥${(resource.unitPrice || 0).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span style="color: var(--text-secondary); font-size: 13px;">总价</span>
            <span style="font-weight: 600; font-size: 14px; color: var(--primary-color);">¥${(resource.totalPrice || 0).toLocaleString()}</span>
          </div>
          <div class="resource-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="tag tag-${statusClass}">${getResourceStatusName(resource.status)}</span>
            ${resource.installedDate ? `
              <span style="font-size: 12px; color: var(--text-secondary);">安装: ${resource.installedDate}</span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterResources() {
  const state = store.getState();
  let resources = [...state.resources];
  
  const projectFilter = document.getElementById('resourceProjectFilter')?.value;
  const typeFilter = document.getElementById('resourceTypeFilter')?.value;
  const statusFilter = document.getElementById('resourceStatusFilter')?.value;
  
  if (projectFilter) {
    resources = resources.filter(r => r.projectId === projectFilter);
  }
  
  if (typeFilter) {
    resources = resources.filter(r => r.type === typeFilter);
  }
  
  if (statusFilter) {
    resources = resources.filter(r => r.status === statusFilter);
  }
  
  const grid = document.getElementById('resourcesGrid');
  if (grid) {
    grid.innerHTML = renderResourceCards(resources);
  }
}

function getResourceStatusName(status) {
  const statusMap = {
    'pending': '待采购',
    'ordered': '已订购',
    'delivered': '已到货',
    'installing': '安装中',
    'using': '使用中',
    'installed': '已安装',
    'completed': '完成'
  };
  return statusMap[status] || status;
}

function showCreateResourceModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="createResourceModal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">新建资源</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('createResourceModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="createResourceForm">
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">资源名称 <span style="color: red;">*</span></label>
                <input type="text" class="form-input" name="name" required placeholder="请输入资源名称">
              </div>
              <div class="form-group">
                <label class="form-label">类型</label>
                <select class="form-input" name="type">
                  <option value="设备">设备</option>
                  <option value="电气">电气</option>
                  <option value="自控">自控</option>
                  <option value="仪表">仪表</option>
                  <option value="材料">材料</option>
                </select>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">型号规格</label>
                <input type="text" class="form-input" name="model" placeholder="请输入型号">
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
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">数量</label>
                <input type="number" class="form-input" name="quantity" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">单位</label>
                <input type="text" class="form-input" name="unit" placeholder="台/套/米">
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">单价</label>
                <input type="number" class="form-input" name="unitPrice" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label">供应商</label>
                <input type="text" class="form-input" name="supplier" placeholder="供应商名称">
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-input" name="status">
                  <option value="pending">待采购</option>
                  <option value="ordered">已订购</option>
                  <option value="delivered">已到货</option>
                  <option value="installing">安装中</option>
                  <option value="using">使用中</option>
                  <option value="installed">已安装</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">采购日期</label>
                <input type="date" class="form-input" name="purchaseDate">
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('createResourceModal')">取消</button>
          <button class="btn btn-primary" onclick="handleCreateResource()">创建</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleCreateResource() {
  const form = document.getElementById('createResourceForm');
  const formData = new FormData(form);
  
  const quantity = parseInt(formData.get('quantity') || 0);
  const unitPrice = parseFloat(formData.get('unitPrice') || 0);
  
  const resourceData = {
    name: formData.get('name'),
    type: formData.get('type'),
    model: formData.get('model'),
    projectId: formData.get('projectId') || null,
    quantity: quantity,
    unit: formData.get('unit'),
    unitPrice: unitPrice,
    totalPrice: quantity * unitPrice,
    supplier: formData.get('supplier'),
    status: formData.get('status') || 'pending',
    purchaseDate: formData.get('purchaseDate') || null
  };
  
  store.addResource(resourceData);
  closeModal('createResourceModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '资源创建成功',
    message: `资源 "${resourceData.name}" 已创建`
  });
}

function showEditResourceModal(resourceId) {
  const state = store.getState();
  const resource = state.resources.find(r => r.id === resourceId);
  const projects = state.projects;
  
  if (!resource) return;
  
  const html = `
    <div class="modal-overlay" id="editResourceModal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑资源</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editResourceModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editResourceForm">
            <input type="hidden" name="id" value="${resource.id}">
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">资源名称</label>
                <input type="text" class="form-input" name="name" value="${resource.name}">
              </div>
              <div class="form-group">
                <label class="form-label">类型</label>
                <select class="form-input" name="type">
                  <option value="设备" ${resource.type === '设备' ? 'selected' : ''}>设备</option>
                  <option value="电气" ${resource.type === '电气' ? 'selected' : ''}>电气</option>
                  <option value="自控" ${resource.type === '自控' ? 'selected' : ''}>自控</option>
                  <option value="仪表" ${resource.type === '仪表' ? 'selected' : ''}>仪表</option>
                  <option value="材料" ${resource.type === '材料' ? 'selected' : ''}>材料</option>
                </select>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">型号规格</label>
                <input type="text" class="form-input" name="model" value="${resource.model || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">所属项目</label>
                <select class="form-input" name="projectId">
                  <option value="">请选择项目</option>
                  ${projects.map(p => `
                    <option value="${p.id}" ${p.id === resource.projectId ? 'selected' : ''}>${p.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">数量</label>
                <input type="number" class="form-input" name="quantity" value="${resource.quantity}">
              </div>
              <div class="form-group">
                <label class="form-label">单位</label>
                <input type="text" class="form-input" name="unit" value="${resource.unit || ''}">
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">单价</label>
                <input type="number" class="form-input" name="unitPrice" value="${resource.unitPrice || 0}">
              </div>
              <div class="form-group">
                <label class="form-label">供应商</label>
                <input type="text" class="form-input" name="supplier" value="${resource.supplier || ''}">
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-input" name="status">
                  <option value="pending" ${resource.status === 'pending' ? 'selected' : ''}>待采购</option>
                  <option value="ordered" ${resource.status === 'ordered' ? 'selected' : ''}>已订购</option>
                  <option value="delivered" ${resource.status === 'delivered' ? 'selected' : ''}>已到货</option>
                  <option value="installing" ${resource.status === 'installing' ? 'selected' : ''}>安装中</option>
                  <option value="using" ${resource.status === 'using' ? 'selected' : ''}>使用中</option>
                  <option value="installed" ${resource.status === 'installed' ? 'selected' : ''}>已安装</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">采购日期</label>
                <input type="date" class="form-input" name="purchaseDate" value="${resource.purchaseDate || ''}">
              </div>
            </div>
            ${resource.status === 'installed' ? `
              <div class="form-group">
                <label class="form-label">安装日期</label>
                <input type="date" class="form-input" name="installedDate" value="${resource.installedDate || ''}">
              </div>
            ` : ''}
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editResourceModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditResource()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditResource() {
  const form = document.getElementById('editResourceForm');
  const formData = new FormData(form);
  
  const resourceId = formData.get('id');
  const quantity = parseInt(formData.get('quantity') || 0);
  const unitPrice = parseFloat(formData.get('unitPrice') || 0);
  
  const updates = {
    name: formData.get('name'),
    type: formData.get('type'),
    model: formData.get('model'),
    projectId: formData.get('projectId') || null,
    quantity: quantity,
    unit: formData.get('unit'),
    unitPrice: unitPrice,
    totalPrice: quantity * unitPrice,
    supplier: formData.get('supplier'),
    status: formData.get('status'),
    purchaseDate: formData.get('purchaseDate') || null,
    installedDate: formData.get('installedDate') || null
  };
  
  store.updateResource(resourceId, updates);
  closeModal('editResourceModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '资源更新成功',
    message: '资源信息已更新'
  });
}

function confirmDeleteResource(resourceId) {
  if (confirm('确定要删除这个资源吗？')) {
    store.deleteResource(resourceId);
    renderContent();
    
    store.addNotification({
      type: 'info',
      title: '资源已删除',
      message: '资源已从系统中移除'
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderResources };
}
