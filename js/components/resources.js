function renderResources() {
  const state = store.getState();
  const projects = state.projects;
  const resources = state.resources;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">设备管理</h1>
        <p class="page-description">项目设备管理，追踪采购、到货、安装、调试全流程</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showCreateResourceModal()">
          <i class="fas fa-plus"></i>
          新增设备、工具
        </button>
      </div>
    </div>

    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-cube" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">设备总数</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${resources.length}</div>
        <div style="font-size: 12px; color: #93c5fd;">台/套设备</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已投用</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${resources.filter(r => r.status === 'installed').length}</div>
        <div style="font-size: 12px; color: #15803d;">已投入使用</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-spinner" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">安装中</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${resources.filter(r => r.status === 'installing').length}</div>
        <div style="font-size: 12px; color: #d97706;">正在安装</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-dollar-sign" style="color: #8b5cf6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总价值</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #6d28d9; margin-bottom: 8px;">¥${resources.reduce((sum, r) => sum + (r.totalPrice || 0), 0).toLocaleString()}</div>
        <div style="font-size: 12px; color: #7c3aed;">设备总价值</div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">设备筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="resourceProjectFilter" onchange="filterResources()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
          <select style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="resourceTypeFilter" onchange="filterResources()">
            <option value="">全部类型</option>
            <option value="设备">设备</option>
            <option value="工具">工具</option>
            <option value="机械设备">机械设备</option>
            <option value="电气设备">电气设备</option>
            <option value="自控仪表">自控仪表</option>
            <option value="管道阀门">管道阀门</option>
            <option value="安装材料">安装材料</option>
            <option value="调试药剂">调试药剂</option>
            <option value="其他">其他</option>
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="resourceStatusFilter" onchange="filterResources()">
            <option value="">全部状态</option>
            <option value="pending">待采购</option>
            <option value="ordered">已订购</option>
            <option value="delivered">已到货</option>
            <option value="installing">安装中</option>
            <option value="commissioned">已调试</option>
            <option value="installed">已投用</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetResourceFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px; border-radius: 16px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">项目设备概览</h3>
        </div>
      </div>
      <div class="card-body" id="resourcesGrid" style="padding: 20px;">
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
  
  const projectColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];
  
  return projects.map((project, idx) => {
    const color = projectColors[idx % projectColors.length];
    const projectResources = grouped[project.id];
    if (!projectResources || projectResources.length === 0) return '';
    
    const projTotal = projectResources.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const installedCount = projectResources.filter(r => r.status === 'installed').length;
    const installingCount = projectResources.filter(r => r.status === 'installing').length;
    
    return `
      <div style="padding: 24px; margin-bottom: 20px; background: white; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; background: ${color}; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-building" style="color: white; font-size: 20px;"></i>
            </div>
            <div>
              <h4 style="font-size: 16px; font-weight: 600; color: ${color}; margin-bottom: 4px;">${project.name}</h4>
              <div style="display: flex; gap: 8px;">
                <span class="tag" style="font-size: 11px; background: rgba(0,0,0,0.05);">${projectResources.length}台/套</span>
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 28px; font-weight: 700; color: #1f2937;">¥${projTotal.toLocaleString()}</div>
            <div style="font-size: 12px; color: #6b7280;">项目设备总值</div>
          </div>
        </div>
        
        <!-- 汇总统计 -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="text-align: center; padding: 14px 10px; background: rgba(0,0,0,0.04); border-radius: 12px;">
            <div style="font-size: 18px; font-weight: 700; color: ${color};">${projectResources.length}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">设备数量</div>
          </div>
          <div style="text-align: center; padding: 14px 10px; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">
            <div style="font-size: 18px; font-weight: 700; color: #10b981;">${installedCount}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">已投用</div>
          </div>
          <div style="text-align: center; padding: 14px 10px; background: rgba(245, 158, 11, 0.1); border-radius: 12px;">
            <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">${installingCount}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">安装中</div>
          </div>
        </div>
        
        <!-- 设备表格 -->
        <div style="overflow-x: auto; background: #f9fafb; border-radius: 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 600; font-size: 13px;">名称</th>
                <th style="text-align: left; padding: 12px 16px; color: #4b5563; font-weight: 600; font-size: 13px;">类型</th>
                <th style="text-align: center; padding: 12px 16px; color: #4b5563; font-weight: 600; font-size: 13px;">数量</th>
                <th style="text-align: center; padding: 12px 16px; color: #4b5563; font-weight: 600; font-size: 13px;">状态</th>
                <th style="text-align: right; padding: 12px 16px; color: #4b5563; font-weight: 600; font-size: 13px;">单价</th>
                <th style="text-align: right; padding: 12px 16px; color: #4b5563; font-weight: 600; font-size: 13px;">总价</th>
              </tr>
            </thead>
            <tbody>
              ${projectResources.map(r => {
                const statusInfo = r.status === 'installed' || r.status === 'commissioned' ? { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', text: getResourceStatusName(r.status) } : 
                                   r.status === 'installing' ? { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', text: getResourceStatusName(r.status) } : 
                                   r.status === 'ordered' ? { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', text: getResourceStatusName(r.status) } :
                                   { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', text: getResourceStatusName(r.status) };
                return `
                  <tr style="border-bottom: 1px solid #e5e7eb; background: white;">
                    <td style="padding: 12px 16px; font-weight: 500; color: #1f2937;">${r.name}</td>
                    <td style="padding: 12px 16px; color: #4b5563;">${r.type || '-'}</td>
                    <td style="padding: 12px 16px; text-align: center; color: #1f2937;">${r.quantity} ${r.unit || ''}</td>
                    <td style="padding: 12px 16px; text-align: center;"><span style="font-size: 11px; background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 4px 10px; border-radius: 4px;">${statusInfo.text}</span></td>
                    <td style="padding: 12px 16px; text-align: right; color: #1f2937;">¥${(r.unitPrice || 0).toLocaleString()}</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: ${color};">¥${(r.totalPrice || 0).toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- 项目合计 -->
        <div style="display: flex; justify-content: flex-end; padding-top: 16px; margin-top: 16px; border-top: 1px dashed #e5e7eb;">
          <div style="text-align: right;">
            <span style="color: #6b7280; font-size: 12px;">项目合计：</span>
            <span style="font-weight: 700; font-size: 16px; color: ${color};">¥${projTotal.toLocaleString()}</span>
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

function resetResourceFilters() {
  const projectFilter = document.getElementById('resourceProjectFilter');
  const typeFilter = document.getElementById('resourceTypeFilter');
  const statusFilter = document.getElementById('resourceStatusFilter');
  if (projectFilter) projectFilter.value = '';
  if (typeFilter) typeFilter.value = '';
  if (statusFilter) statusFilter.value = '';
  filterResources();
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新增设备、工具</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createResourceModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createResourceForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">资源名称 <span style="color: red;">*</span></label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入资源名称">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">类型</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type">
                <option value="设备">设备</option>
                <option value="工具">工具</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">型号规格</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="model" placeholder="请输入型号">
            </div>
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
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">数量</label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="quantity" placeholder="0">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">单位</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="unit" placeholder="台/套/米">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">单价</label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="unitPrice" placeholder="0">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">供应商</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="supplier" placeholder="供应商名称">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="pending">待采购</option>
                <option value="ordered">已订购</option>
                <option value="delivered">已到货</option>
                <option value="installing">安装中</option>
                <option value="commissioned">已调试</option>
                <option value="installed">已投用</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">采购日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="purchaseDate">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">安装位置</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="installLocation" placeholder="如：鼓风机房、二沉池、脱水机房">
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createResourceModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleCreateResource()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createResourceModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑资源</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editResourceModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editResourceForm">
          <input type="hidden" name="id" value="${resource.id}">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">资源名称</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" value="${resource.name}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">类型</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type">
                <option value="设备" ${resource.type === '设备' ? 'selected' : ''}>设备</option>
                <option value="工具" ${resource.type === '工具' ? 'selected' : ''}>工具</option>
                <option value="其他" ${resource.type === '其他' ? 'selected' : ''}>其他</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">型号规格</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="model" value="${resource.model || ''}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}" ${p.id === resource.projectId ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">数量</label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="quantity" value="${resource.quantity}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">单位</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="unit" value="${resource.unit || ''}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">单价</label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="unitPrice" value="${resource.unitPrice || 0}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">供应商</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="supplier" value="${resource.supplier || ''}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="pending" ${resource.status === 'pending' ? 'selected' : ''}>待采购</option>
                <option value="ordered" ${resource.status === 'ordered' ? 'selected' : ''}>已订购</option>
                <option value="delivered" ${resource.status === 'delivered' ? 'selected' : ''}>已到货</option>
                <option value="installing" ${resource.status === 'installing' ? 'selected' : ''}>安装中</option>
                <option value="commissioned" ${resource.status === 'commissioned' ? 'selected' : ''}>已调试</option>
                <option value="installed" ${resource.status === 'installed' ? 'selected' : ''}>已投用</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">采购日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="purchaseDate" value="${resource.purchaseDate || ''}">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">安装位置</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="installLocation" value="${resource.installLocation || ''}" placeholder="如：鼓风机房、二沉池、脱水机房">
          </div>
          ${resource.status === 'installed' ? `
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">安装日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="installedDate" value="${resource.installedDate || ''}">
            </div>
          ` : ''}
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editResourceModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditResource()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editResourceModal', contentHtml);
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
