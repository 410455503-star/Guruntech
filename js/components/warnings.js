function renderWarnings() {
  const state = store.getState();
  const warnings = state.warnings || [];
  const projects = state.projects;
  const tasks = state.tasks;
  
  const stats = {
    total: warnings.length,
    active: warnings.filter(w => w.status === 'active').length,
    urgent: warnings.filter(w => w.level === 'urgent' && w.status === 'active').length,
    high: warnings.filter(w => w.level === 'high' && w.status === 'active').length,
    medium: warnings.filter(w => w.level === 'medium' && w.status === 'active').length,
    read: warnings.filter(w => w.isRead).length,
    unread: warnings.filter(w => !w.isRead).length
  };
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">工期预警管理</h1>
        <p class="page-description">实时监控项目工期风险，及时处理预警信息</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showCreateWarningModal()">
          <i class="fas fa-plus"></i>
          新建预警
        </button>
        <button class="btn btn-secondary" onclick="markAllWarningsAsRead()">
          <i class="fas fa-check-double"></i>
          全部标记已读
        </button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-bell" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总预警</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${stats.total}</div>
        <div style="font-size: 12px; color: #2563eb;">预警总数</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">紧急</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">${stats.urgent}</div>
        <div style="font-size: 12px; color: #dc2626;">紧急预警</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-alarm-clock" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">高风险</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${stats.high}</div>
        <div style="font-size: 12px; color: #d97706;">高风险预警</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-info-circle" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">中风险</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${stats.medium}</div>
        <div style="font-size: 12px; color: #15803d;">中风险预警</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border: 1px solid #a5b4fc; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #8b5cf6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已读</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #4c1d95; margin-bottom: 8px;">${stats.read}</div>
        <div style="font-size: 12px; color: #7c3aed;">已读预警</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border: 1px solid #f9a8d4; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(236, 72, 153, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-clock" style="color: #ec4899; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">未读</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #831843; margin-bottom: 8px;">${stats.unread}</div>
        <div style="font-size: 12px; color: #db2777;">未读预警</div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #3b82f6 0%, #6366f1 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">预警筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="warningProjectFilter" onchange="filterWarnings()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
          <select style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="warningLevelFilter" onchange="filterWarnings()">
            <option value="">全部级别</option>
            <option value="urgent">紧急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <select style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="warningTypeFilter" onchange="filterWarnings()">
            <option value="">全部类型</option>
            <option value="delay">进度滞后</option>
            <option value="safety">安全预警</option>
            <option value="budget">预算预警</option>
            <option value="quality">质量预警</option>
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="warningStatusFilter" onchange="filterWarnings()">
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="resolved">已处理</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetWarningFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
        </div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px;">
      <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 24px; padding: 20px;" id="warningsGrid">
        ${renderWarningCards(warnings, projects, tasks)}
      </div>
    </div>
  `;
  
  return html;
}

function renderWarningCards(warnings, projects, tasks) {
  if (warnings.length === 0) {
    return `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <i class="fas fa-bell" style="font-size: 56px; color: var(--text-tertiary); margin-bottom: 16px;"></i>
        <div style="font-size: 16px; color: var(--text-secondary); margin-bottom: 8px;">暂无预警信息</div>
        <div style="font-size: 13px; color: var(--text-tertiary);">系统目前没有需要处理的预警</div>
      </div>
    `;
  }
  
  return warnings.map(warning => {
    const project = projects.find(p => p.id === warning.projectId);
    const task = warning.taskId ? tasks.find(t => t.id === warning.taskId) : null;
    const levelClass = getWarningLevelClass(warning.level);
    const levelName = getWarningLevelName(warning.level);
    const typeName = getWarningTypeName(warning.type);
    const statusClass = warning.status === 'active' ? 'warning' : 'success';
    const statusName = warning.status === 'active' ? '未处理' : '已处理';
    const levelColor = getWarningLevelColor(warning.level);
    
    return `
      <div class="card warning-card" style="padding: 24px; border-radius: 12px; border-top: 4px solid ${levelColor}; ${!warning.isRead ? 'background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%);' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div style="flex: 1;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${warning.title}</h3>
            ${!warning.isRead ? '<span class="badge badge-danger" style="font-size: 11px;">未读</span>' : ''}
          </div>
          <span class="tag tag-${statusClass}" style="font-size: 12px;">${statusName}</span>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
          <span class="tag tag-${getWarningTypeClass(warning.type)}" style="font-size: 12px;">${typeName}</span>
          <span class="badge badge-${levelClass}" style="font-size: 12px;">${levelName}</span>
        </div>
        
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px; line-height: 1.6;">${warning.description || '-'}</p>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-building" style="font-size: 12px; color: var(--text-tertiary);"></i>
              <span style="font-size: 13px; color: var(--text-secondary);">${project?.name || '-'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-list-check" style="font-size: 12px; color: var(--text-tertiary);"></i>
              <span style="font-size: 13px; color: var(--text-secondary);">${task?.name || '-'}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: var(--text-tertiary);">预警日期</div>
            <div style="font-size: 13px; color: var(--text-secondary);">${DateUtils.formatDate(warning.createdAt)}</div>
          </div>
        </div>
        
        ${warning.dueDate ? `
          <div style="background: var(--info-color)15; border-radius: 8px; padding: 10px 12px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="fas fa-clock" style="font-size: 12px; color: var(--info-color);"></i>
              <span style="font-size: 12px; color: var(--text-secondary);">截止日期: ${DateUtils.formatDate(warning.dueDate)}</span>
            </div>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          ${!warning.isRead ? `
            <button class="btn btn-secondary btn-sm" style="border-radius: 8px; padding: 6px 12px;" onclick="markWarningAsRead('${warning.id}')" title="标记已读">
              <i class="fas fa-check"></i>
              已读
            </button>
          ` : ''}
          <button class="btn btn-primary btn-sm" style="border-radius: 8px; padding: 6px 12px;" onclick="showEditWarningModal('${warning.id}')" title="编辑">
            <i class="fas fa-edit"></i>
            编辑
          </button>
          <button class="btn btn-success btn-sm" style="border-radius: 8px; padding: 6px 12px;" onclick="resolveWarning('${warning.id}')" title="标记处理">
            <i class="fas fa-check-circle"></i>
            处理
          </button>
          <button class="btn btn-danger btn-sm" style="border-radius: 8px; padding: 6px 12px;" onclick="confirmDeleteWarning('${warning.id}')" title="删除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getWarningLevelColor(level) {
  const colorMap = {
    'urgent': '#ef4444',
    'high': '#f59e0b',
    'medium': '#3b82f6',
    'low': '#22c55e'
  };
  return colorMap[level] || '#6b7280';
}

function filterWarnings() {
  const state = store.getState();
  let warnings = [...state.warnings];
  
  const projectFilter = document.getElementById('warningProjectFilter')?.value;
  const levelFilter = document.getElementById('warningLevelFilter')?.value;
  const typeFilter = document.getElementById('warningTypeFilter')?.value;
  const statusFilter = document.getElementById('warningStatusFilter')?.value;
  
  if (projectFilter) {
    warnings = warnings.filter(w => w.projectId === projectFilter);
  }
  
  if (levelFilter) {
    warnings = warnings.filter(w => w.level === levelFilter);
  }
  
  if (typeFilter) {
    warnings = warnings.filter(w => w.type === typeFilter);
  }
  
  if (statusFilter) {
    warnings = warnings.filter(w => w.status === statusFilter);
  }
  
  const grid = document.getElementById('warningsGrid');
  if (grid) {
    grid.innerHTML = renderWarningCards(warnings, state.projects, state.tasks);
  }
}

function resetWarningFilters() {
  const projectFilter = document.getElementById('warningProjectFilter');
  const levelFilter = document.getElementById('warningLevelFilter');
  const typeFilter = document.getElementById('warningTypeFilter');
  const statusFilter = document.getElementById('warningStatusFilter');
  
  if (projectFilter) projectFilter.value = '';
  if (levelFilter) levelFilter.value = '';
  if (typeFilter) typeFilter.value = '';
  if (statusFilter) statusFilter.value = '';
  
  filterWarnings();
}

function getWarningLevelClass(level) {
  const classMap = {
    'urgent': 'danger',
    'high': 'warning',
    'medium': 'info',
    'low': 'secondary'
  };
  return classMap[level] || 'secondary';
}

function getWarningLevelName(level) {
  const nameMap = {
    'urgent': '紧急',
    'high': '高',
    'medium': '中',
    'low': '低'
  };
  return nameMap[level] || level || '未设置';
}

function getWarningTypeName(type) {
  const nameMap = {
    'delay': '进度滞后',
    'safety': '安全预警',
    'budget': '预算预警',
    'quality': '质量预警',
    'resource': '资源预警'
  };
  return nameMap[type] || type || '其他';
}

function getWarningTypeClass(type) {
  const classMap = {
    'delay': 'warning',
    'safety': 'danger',
    'budget': 'info',
    'quality': 'secondary',
    'resource': 'primary'
  };
  return classMap[type] || 'secondary';
}

// formatDate 已由 DateUtils.formatDate 提供，不再重复定义

function markWarningAsRead(warningId) {
  store.updateWarning(warningId, { isRead: true });
  renderContent();
}

function markAllWarningsAsRead() {
  store.markAllWarningsAsRead();
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '操作成功',
    message: '所有预警已标记为已读'
  });
}

function resolveWarning(warningId) {
  store.updateWarning(warningId, { status: 'resolved', isRead: true });
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '预警已处理',
    message: '预警已标记为已处理状态'
  });
}

function confirmDeleteWarning(warningId) {
  if (confirm('确定要删除这个预警吗？')) {
    store.deleteWarning(warningId);
    renderContent();
    
    store.addNotification({
      type: 'info',
      title: '预警已删除',
      message: '预警已从系统中移除'
    });
  }
}

function showCreateWarningModal() {
  const state = store.getState();
  const projects = state.projects;
  const tasks = state.tasks;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 550px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建预警</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createWarningModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createWarningForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预警标题 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="title" required placeholder="请输入预警标题">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预警类型</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type">
                <option value="delay">进度滞后</option>
                <option value="safety">安全预警</option>
                <option value="budget">预算预警</option>
                <option value="quality">质量预警</option>
                <option value="resource">资源预警</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预警级别</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="level">
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
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
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">关联任务</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="taskId">
                <option value="">请选择任务</option>
                ${tasks.map(t => `
                  <option value="${t.id}">${t.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预警描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="description" placeholder="请详细描述预警内容"></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">截止日期</label>
            <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate">
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createWarningModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleCreateWarning()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createWarningModal', contentHtml);
}

function handleCreateWarning() {
  const form = document.getElementById('createWarningForm');
  const formData = new FormData(form);
  
  const warningData = {
    title: formData.get('title'),
    type: formData.get('type') || 'delay',
    level: formData.get('level') || 'medium',
    projectId: formData.get('projectId') || null,
    taskId: formData.get('taskId') || null,
    description: formData.get('description'),
    dueDate: formData.get('dueDate'),
    status: 'active',
    isRead: false
  };
  
  store.addWarning(warningData);
  closeModal('createWarningModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '预警创建成功',
    message: `预警 "${warningData.title}" 已创建`
  });
}

function showEditWarningModal(warningId) {
  const state = store.getState();
  const warning = state.warnings.find(w => w.id === warningId);
  const projects = state.projects;
  const tasks = state.tasks;
  
  if (!warning) return;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 550px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑预警</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editWarningModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editWarningForm">
          <input type="hidden" name="id" value="${warning.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预警标题</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="title" value="${warning.title}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预警类型</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type">
                <option value="delay" ${warning.type === 'delay' ? 'selected' : ''}>进度滞后</option>
                <option value="safety" ${warning.type === 'safety' ? 'selected' : ''}>安全预警</option>
                <option value="budget" ${warning.type === 'budget' ? 'selected' : ''}>预算预警</option>
                <option value="quality" ${warning.type === 'quality' ? 'selected' : ''}>质量预警</option>
                <option value="resource" ${warning.type === 'resource' ? 'selected' : ''}>资源预警</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预警级别</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="level">
                <option value="urgent" ${warning.level === 'urgent' ? 'selected' : ''}>紧急</option>
                <option value="high" ${warning.level === 'high' ? 'selected' : ''}>高</option>
                <option value="medium" ${warning.level === 'medium' ? 'selected' : ''}>中</option>
                <option value="low" ${warning.level === 'low' ? 'selected' : ''}>低</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}" ${p.id === warning.projectId ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">关联任务</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="taskId">
                <option value="">请选择任务</option>
                ${tasks.map(t => `
                  <option value="${t.id}" ${t.id === warning.taskId ? 'selected' : ''}>${t.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="active" ${warning.status === 'active' ? 'selected' : ''}>活跃</option>
                <option value="resolved" ${warning.status === 'resolved' ? 'selected' : ''}>已处理</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">截止日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate" value="${warning.dueDate || ''}">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预警描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="description">${warning.description || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editWarningModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditWarning()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editWarningModal', contentHtml);
}

function handleEditWarning() {
  const form = document.getElementById('editWarningForm');
  const formData = new FormData(form);
  
  const warningId = formData.get('id');
  const updates = {
    title: formData.get('title'),
    type: formData.get('type'),
    level: formData.get('level'),
    projectId: formData.get('projectId') || null,
    taskId: formData.get('taskId') || null,
    description: formData.get('description'),
    dueDate: formData.get('dueDate'),
    status: formData.get('status')
  };
  
  store.updateWarning(warningId, updates);
  closeModal('editWarningModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '预警更新成功',
    message: '预警信息已更新'
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderWarnings };
}