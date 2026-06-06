function renderResources() {
  const state = store.getState();
  const projects = state.projects;
  const resources = state.resources;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">设备、工具管理</h1>
        <p class="page-description">项目设备管理，追踪采购、到货、安装、调试全流程</p>
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
        <div class="stat-card-label">设备总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${resources.filter(r => r.status === 'installed').length}</div>
        <div class="stat-card-label">已投用</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-spinner"></i>
          </div>
        </div>
        <div class="stat-card-value">${resources.filter(r => r.status === 'installing').length}</div>
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
            <option value="机械设备">机械设备</option>
            <option value="电气设备">电气设备</option>
            <option value="自控仪表">自控仪表</option>
            <option value="管道阀门">管道阀门</option>
            <option value="安装材料">安装材料</option>
            <option value="调试药剂">调试药剂</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="resourceStatusFilter" onchange="filterResources()">
            <option value="">全部状态</option>
            <option value="pending">待采购</option>
            <option value="ordered">已订购</option>
            <option value="delivered">已到货</option>
            <option value="installing">安装中</option>
            <option value="commissioned">已调试</option>
            <option value="installed">已投用</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <h3 class="card-title">项目设备概览</h3>
      </div>
      <div class="card-body" id="resourcesGrid">
        ${renderProjectResourceCards(projects, resources)}
      </div>
    </div>
  `;
  
  return html;
}

function renderProjectResourceCards(projects, resourceList) {
  // Group resources by project
  const grouped = {};
  resourceList.forEach(r => {
    const pid = r.projectId || '_unassigned';
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(r);
  });
  
  if (Object.keys(grouped).length === 0) {
    return `
      <div class="empty-state" style="padding: 60px 0;">
        <i class="fas fa-tools" style="font-size: 56px; color: var(--text-muted); opacity: 0.4;"></i>
        <h3 style="margin-top: 16px; font-weight: 600;">暂无设备数据</h3>
        <p class="text-muted">请在项目下添加设备或工具</p>
      </div>
    `;
  }
  
  return projects.map(project => {
    const projectResources = grouped[project.id];
    if (!projectResources || projectResources.length === 0) return '';
    
    const projTotal = projectResources.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const installedCount = projectResources.filter(r => r.status === 'installed').length;
    const installingCount = projectResources.filter(r => r.status === 'installing').length;
    
    return `
      <div style="padding: 20px; margin-bottom: 16px; background: var(--bg-primary); border-radius: 12px; border: 1px solid var(--border-color); border-left: 4px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <i class="fas fa-folder-open" style="color: #3b82f6;"></i>
              <span style="font-weight: 600; font-size: 16px;">${project.name}</span>
              <span class="tag tag-muted" style="font-size: 11px;">${projectResources.length}台/套</span>
            </div>
            <span style="font-size: 12px; color: var(--text-muted);">${project.description || ''}</span>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 22px; font-weight: 700; color: var(--text-primary);">¥${projTotal.toLocaleString()}</div>
            <div style="font-size: 12px; color: var(--text-muted);">项目设备总值</div>
          </div>
        </div>
        
        <!-- 汇总统计 -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px;">
          <div style="text-align: center; padding: 10px 8px; background: rgba(59, 130, 246, 0.06); border-radius: 8px;">
            <div style="font-size: 16px; font-weight: 700; color: #3b82f6;">${projectResources.length}</div>
            <div style="font-size: 11px; color: var(--text-muted);">设备数量</div>
          </div>
          <div style="text-align: center; padding: 10px 8px; background: rgba(16, 185, 129, 0.06); border-radius: 8px;">
            <div style="font-size: 16px; font-weight: 700; color: #10b981;">${installedCount}</div>
            <div style="font-size: 11px; color: var(--text-muted);">已投用</div>
          </div>
          <div style="text-align: center; padding: 10px 8px; background: rgba(245, 158, 11, 0.06); border-radius: 8px;">
            <div style="font-size: 16px; font-weight: 700; color: #f59e0b;">${installingCount}</div>
            <div style="font-size: 11px; color: var(--text-muted);">安装中</div>
          </div>
        </div>
        
        <!-- 设备表格 -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-color);">
                <th style="text-align: left; padding: 8px 10px; color: var(--text-muted); font-weight: 500; font-size: 12px;">名称</th>
                <th style="text-align: left; padding: 8px 10px; color: var(--text-muted); font-weight: 500; font-size: 12px;">类型</th>
                <th style="text-align: center; padding: 8px 10px; color: var(--text-muted); font-weight: 500; font-size: 12px;">数量</th>
                <th style="text-align: center; padding: 8px 10px; color: var(--text-muted); font-weight: 500; font-size: 12px;">状态</th>
                <th style="text-align: right; padding: 8px 10px; color: var(--text-muted); font-weight: 500; font-size: 12px;">单价</th>
                <th style="text-align: right; padding: 8px 10px; color: var(--text-muted); font-weight: 500; font-size: 12px;">总价</th>
              </tr>
            </thead>
            <tbody>
              ${projectResources.map(r => {
                const statusClass = r.status === 'installed' || r.status === 'commissioned' ? 'success' : 
                                   r.status === 'installing' ? 'warning' : 'primary';
                return `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 8px 10px; font-weight: 500;">${r.name}</td>
                    <td style="padding: 8px 10px; color: var(--text-secondary);">${r.type || '-'}</td>
                    <td style="padding: 8px 10px; text-align: center;">${r.quantity} ${r.unit || ''}</td>
                    <td style="padding: 8px 10px; text-align: center;"><span class="tag tag-${statusClass}" style="font-size: 11px;">${getResourceStatusName(r.status)}</span></td>
                    <td style="padding: 8px 10px; text-align: right;">¥${(r.unitPrice || 0).toLocaleString()}</td>
                    <td style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--primary-color);">¥${(r.totalPrice || 0).toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- 项目合计 -->
        <div style="display: flex; justify-content: flex-end; padding-top: 12px; margin-top: 12px; border-top: 1px dashed var(--border-color);">
          <div style="text-align: right;">
            <span style="color: var(--text-muted); font-size: 12px;">项目合计：</span>
            <span style="font-weight: 700; font-size: 16px; color: var(--primary-color);">¥${projTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterResources() {
  const state = store.getState();
  let resources = [...state.resources];
  const projects = state.projects;
  
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
    grid.innerHTML = renderProjectResourceCards(projects, resources);
  }
}

function getResourceStatusName(status) {
  const statusMap = {
    'pending': '待采购',
    'ordered': '已订购',
    'delivered': '已到货',
    'installing': '安装中',
    'commissioned': '已调试',
    'installed': '已投用'
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
                  <option value="机械设备">机械设备</option>
                  <option value="电气设备">电气设备</option>
                  <option value="自控仪表">自控仪表</option>
                  <option value="管道阀门">管道阀门</option>
                  <option value="安装材料">安装材料</option>
                  <option value="调试药剂">调试药剂</option>
                  <option value="其他">其他</option>
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
                  <option value="commissioned">已调试</option>
                  <option value="installed">已投用</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">采购日期</label>
                <input type="date" class="form-input" name="purchaseDate">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">安装位置</label>
              <input type="text" class="form-input" name="installLocation" placeholder="如：鼓风机房、二沉池、脱水机房">
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
    purchaseDate: formData.get('purchaseDate') || null,
    installLocation: formData.get('installLocation') || ''
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
                  <option value="机械设备" ${resource.type === '机械设备' ? 'selected' : ''}>机械设备</option>
                  <option value="电气设备" ${resource.type === '电气设备' ? 'selected' : ''}>电气设备</option>
                  <option value="自控仪表" ${resource.type === '自控仪表' ? 'selected' : ''}>自控仪表</option>
                  <option value="管道阀门" ${resource.type === '管道阀门' ? 'selected' : ''}>管道阀门</option>
                  <option value="安装材料" ${resource.type === '安装材料' ? 'selected' : ''}>安装材料</option>
                  <option value="调试药剂" ${resource.type === '调试药剂' ? 'selected' : ''}>调试药剂</option>
                  <option value="其他" ${resource.type === '其他' ? 'selected' : ''}>其他</option>
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
                  <option value="commissioned" ${resource.status === 'commissioned' ? 'selected' : ''}>已调试</option>
                  <option value="installed" ${resource.status === 'installed' ? 'selected' : ''}>已投用</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">采购日期</label>
                <input type="date" class="form-input" name="purchaseDate" value="${resource.purchaseDate || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">安装位置</label>
              <input type="text" class="form-input" name="installLocation" value="${resource.installLocation || ''}" placeholder="如：鼓风机房、二沉池、脱水机房">
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
    installLocation: formData.get('installLocation') || '',
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
