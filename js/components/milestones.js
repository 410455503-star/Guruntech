let currentFilter = 'all';
let currentProjectFilter = 'all';
let currentPriorityFilter = 'all';
let currentPhaseFilter = 'all';
let currentAssigneeFilter = 'all';

function getPriorityColor(priority) {
  const colors = {
    'low': '#10b981',
    'medium': '#f59e0b',
    'high': '#f97316',
    'critical': '#ef4444'
  };
  return colors[priority] || colors['medium'];
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
  if (!milestone || milestone.status === 'completed') return false;
  if (!milestone.targetDate) return false;
  try {
    const targetDate = new Date(milestone.targetDate);
    if (isNaN(targetDate.getTime())) return false;
    return targetDate < new Date();
  } catch (e) {
    return false;
  }
}

function getDaysUntilTarget(targetDate) {
  if (!targetDate) return null;
  try {
    const target = new Date(targetDate);
    if (isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return null;
  }
}

function getDaysUntilLabel(days) {
  if (days === null) return '未设置';
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  if (days === 1) return '明天到期';
  if (days <= 7) return `${days} 天后到期`;
  return `${days} 天后到期`;
}

function getDaysUntilColor(days) {
  if (days === null) return '#6b7280';
  if (days < 0) return '#ef4444';
  if (days <= 3) return '#f97316';
  if (days <= 7) return '#f59e0b';
  return '#10b981';
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
  const tasks = state.tasks;
  const users = state.users;
  let milestones = [...state.milestones];
  
  if (currentFilter !== 'all') {
    milestones = milestones.filter(m => m.status === currentFilter);
  }
  
  if (currentProjectFilter !== 'all') {
    milestones = milestones.filter(m => m.projectId === currentProjectFilter);
  }
  
  if (currentPriorityFilter !== 'all') {
    milestones = milestones.filter(m => m.priority === currentPriorityFilter);
  }
  
  if (currentPhaseFilter !== 'all') {
    milestones = milestones.filter(m => {
      const project = store.getProjectById(m.projectId);
      return project?.phase === currentPhaseFilter;
    });
  }
  
  if (currentAssigneeFilter !== 'all') {
    milestones = milestones.filter(m => m.assigneeId === currentAssigneeFilter);
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

    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #3b82f6, #60a5fa);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-flag" style="color: #3b82f6; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总里程碑</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #1e40af; margin-bottom: 6px; line-height: 1;">${stats.total}</div>
        <div style="font-size: 12px; color: #93c5fd;">个里程碑</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #22c55e, #4ade80);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34, 197, 94, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #22c55e; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已完成</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #166534; margin-bottom: 6px; line-height: 1;">${stats.completed}</div>
        <div style="margin-top: 12px; height: 6px; background: rgba(34, 197, 94, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0}%; height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #15803d; margin-top: 6px;">完成率 ${stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0}%</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #f59e0b, #fbbf24);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-spinner" style="color: #f59e0b; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">进行中</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #92400e; margin-bottom: 6px; line-height: 1;">${stats.inProgress}</div>
        <div style="font-size: 12px; color: #d97706;">个里程碑</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 1px solid #e5e7eb; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #6b7280, #9ca3af);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(107, 114, 128, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-clock" style="color: #6b7280; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">待开始</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #374151; margin-bottom: 6px; line-height: 1;">${stats.pending}</div>
        <div style="font-size: 12px; color: #6b7280;">个里程碑</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #ef4444, #f87171);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">${stats.overdue > 0 ? '已逾期' : '无逾期'}</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #991b1b; margin-bottom: 6px; line-height: 1;">${stats.overdue}</div>
        <div style="font-size: 12px; color: #dc2626;">个里程碑</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px; padding: 20px; border-radius: 12px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: var(--text-secondary);">状态:</label>
          <select class="form-input" style="width: 110px; padding: 6px 10px; font-size: 13px; border-radius: 6px;" onchange="currentFilter = this.value; renderContent();">
            <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>全部</option>
            <option value="pending" ${currentFilter === 'pending' ? 'selected' : ''}>待开始</option>
            <option value="in_progress" ${currentFilter === 'in_progress' ? 'selected' : ''}>进行中</option>
            <option value="completed" ${currentFilter === 'completed' ? 'selected' : ''}>已完成</option>
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: var(--text-secondary);">项目:</label>
          <select class="form-input" style="width: 160px; padding: 6px 10px; font-size: 13px; border-radius: 6px;" onchange="currentProjectFilter = this.value; renderContent();">
            <option value="all" ${currentProjectFilter === 'all' ? 'selected' : ''}>全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}" ${currentProjectFilter === p.id ? 'selected' : ''}>${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: var(--text-secondary);">优先级:</label>
          <select class="form-input" style="width: 100px; padding: 6px 10px; font-size: 13px; border-radius: 6px;" onchange="currentPriorityFilter = this.value; renderContent();">
            <option value="all" ${currentPriorityFilter === 'all' ? 'selected' : ''}>全部</option>
            <option value="low" ${currentPriorityFilter === 'low' ? 'selected' : ''}>低</option>
            <option value="medium" ${currentPriorityFilter === 'medium' ? 'selected' : ''}>中</option>
            <option value="high" ${currentPriorityFilter === 'high' ? 'selected' : ''}>高</option>
            <option value="critical" ${currentPriorityFilter === 'critical' ? 'selected' : ''}>紧急</option>
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: var(--text-secondary);">阶段:</label>
          <select class="form-input" style="width: 130px; padding: 6px 10px; font-size: 13px; border-radius: 6px;" onchange="currentPhaseFilter = this.value; renderContent();">
            <option value="all" ${currentPhaseFilter === 'all' ? 'selected' : ''}>全部阶段</option>
            <option value="preparation" ${currentPhaseFilter === 'preparation' ? 'selected' : ''}>前期准备</option>
            <option value="civil" ${currentPhaseFilter === 'civil' ? 'selected' : ''}>土建施工</option>
            <option value="mechanical" ${currentPhaseFilter === 'mechanical' ? 'selected' : ''}>机电安装</option>
            <option value="commissioning" ${currentPhaseFilter === 'commissioning' ? 'selected' : ''}>工艺调试</option>
            <option value="trial-run" ${currentPhaseFilter === 'trial-run' ? 'selected' : ''}>试运行</option>
            <option value="acceptance" ${currentPhaseFilter === 'acceptance' ? 'selected' : ''}>竣工验收</option>
          </select>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 13px; color: var(--text-secondary);">负责人:</label>
          <select class="form-input" style="width: 120px; padding: 6px 10px; font-size: 13px; border-radius: 6px;" onchange="currentAssigneeFilter = this.value; renderContent();">
            <option value="all" ${currentAssigneeFilter === 'all' ? 'selected' : ''}>全部成员</option>
            ${users.map(u => `
              <option value="${u.id}" ${currentAssigneeFilter === u.id ? 'selected' : ''}>${u.name}</option>
            `).join('')}
          </select>
        </div>
        <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px; margin-left: auto;" onclick="clearMilestoneFilters()">
          <i class="fas fa-redo"></i> 重置
        </button>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: repeat(3, 1fr); gap: 20px;">
      ${milestones.length === 0 ? `
        <div class="card" style="text-align: center; padding: 48px; grid-column: span 3;">
          <i class="fas fa-flag" style="font-size: 48px; color: var(--border-color); margin-bottom: 16px;"></i>
          <h3 style="margin-bottom: 8px;">暂无里程碑</h3>
          <p class="text-muted">点击"新建里程碑"按钮创建第一个里程碑</p>
        </div>
      ` : milestones.map(milestone => {
        const project = projects.find(p => p.id === milestone.projectId);
        const assignee = store.getUserById(milestone.assigneeId);
        const overdue = isOverdue(milestone);
        const daysUntil = getDaysUntilTarget(milestone.targetDate);
        const milestoneTasks = tasks.filter(t => t.milestoneId === milestone.id);
        const completedTasks = milestoneTasks.filter(t => t.status === 'completed').length;
        
        return `
          <div class="card milestone-card" style="padding: 20px; border-radius: 12px; transition: all 0.2s ease; border: 2px solid transparent;">
            <div class="milestone-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div class="milestone-icon" style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, ${getStatusColor(milestone.status)}20 0%, ${getStatusColor(milestone.status)}10 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  ${milestone.status === 'completed' ? `
                    <i class="fas fa-flag-checkered" style="color: ${getStatusColor(milestone.status)}; font-size: 20px;"></i>
                  ` : milestone.status === 'in_progress' ? `
                    <i class="fas fa-flag" style="color: ${getStatusColor(milestone.status)}; font-size: 20px;"></i>
                  ` : `
                    <i class="fas fa-flag" style="color: ${getStatusColor(milestone.status)}; font-size: 20px;"></i>
                  `}
                </div>
                <div class="milestone-info" style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                    <h3 style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary);">${milestone.name}</h3>
                    ${milestone.priority ? `
                      <span class="tag" style="background: ${getPriorityColor(milestone.priority)}20; color: ${getPriorityColor(milestone.priority)}; font-size: 11px; padding: 2px 6px;">
                        ${getPriorityName(milestone.priority)}
                      </span>
                    ` : ''}
                  </div>
                  <p style="color: var(--text-secondary); font-size: 13px; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${milestone.description || '暂无描述'}</p>
                </div>
              </div>
            </div>
            
            <div class="milestone-meta" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 13px;">
                  <i class="fas fa-project-diagram" style="font-size: 12px;"></i>
                  ${project?.name || '未分配项目'}
                </span>
                ${assignee ? `
                  <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 13px;">
                    <i class="fas fa-user" style="font-size: 12px;"></i>
                    ${assignee.name}
                  </span>
                ` : ''}
              </div>
              
              <div style="display: flex; align-items: center; gap: 4px; color: ${getDaysUntilColor(daysUntil)}; font-size: 13px; font-weight: 500;">
                <i class="fas fa-calendar" style="font-size: 12px;"></i>
                ${getDaysUntilLabel(daysUntil)}
              </div>
            </div>
            
            ${milestone.progress !== undefined ? `
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
                  <span style="color: var(--text-secondary);">进度</span>
                  <span style="font-weight: 600; color: ${getStatusColor(milestone.status)};">${milestone.progress}%</span>
                </div>
                <div class="progress-bar" style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                  <div class="progress-bar-fill" style="width: ${milestone.progress}%; height: 100%; background: linear-gradient(90deg, ${getStatusColor(milestone.status)} 0%, ${getStatusColor(milestone.status)}99 100%); border-radius: 3px; transition: width 0.3s ease;"></div>
                </div>
              </div>
            ` : ''}
            
            ${milestoneTasks.length > 0 ? `
              <div style="margin-bottom: 16px; padding: 10px; background: #f8fafc; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary);">
                  <span><i class="fas fa-tasks" style="margin-right: 4px;"></i>关联任务</span>
                  <span style="font-weight: 600;">${completedTasks}/${milestoneTasks.length}</span>
                </div>
              </div>
            ` : ''}
            
            ${milestone.tags && milestone.tags.length > 0 ? `
              <div style="display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;">
                ${milestone.tags.map(tag => `
                  <span style="background: var(--background-secondary); padding: 3px 8px; border-radius: 4px; font-size: 11px; color: var(--text-secondary);">
                    ${tag}
                  </span>
                `).join('')}
              </div>
            ` : ''}
            
            <div class="milestone-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #e2e8f0;">
              <span class="tag" style="background: ${getStatusColor(milestone.status)}20; color: ${getStatusColor(milestone.status)}; font-size: 12px; padding: 3px 10px;">
                ${getStatusName(milestone.status)}
              </span>
              <div class="milestone-actions" style="display: flex; gap: 6px;">
                ${milestone.status !== 'completed' ? `
                  <button class="btn btn-success btn-sm" style="padding: 6px 12px; font-size: 12px;" onclick="completeMilestone('${milestone.id}')" title="完成里程碑">
                    <i class="fas fa-check"></i>
                  </button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" style="padding: 6px 12px; font-size: 12px;" onclick="showEditMilestoneModal('${milestone.id}')" title="编辑">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" style="padding: 6px 12px; font-size: 12px;" onclick="confirmDeleteMilestone('${milestone.id}')" title="删除">
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

function clearMilestoneFilters() {
  currentFilter = 'all';
  currentProjectFilter = 'all';
  currentPriorityFilter = 'all';
  currentPhaseFilter = 'all';
  currentAssigneeFilter = 'all';
  renderContent();
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建里程碑</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createMilestoneModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createMilestoneForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">里程碑名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" id="milestoneNameInput" name="name" required placeholder="请输入里程碑名称">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">快速模板（污水处理厂）</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button type="button" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('施工图设计完成')">施工图设计完成</button>
              <button type="button" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('土建主体完工')">土建主体完工</button>
              <button type="button" style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('设备进场验收')">设备进场验收</button>
              <button type="button" style="background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('机电安装完成')">机电安装完成</button>
              <button type="button" style="background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('单机调试完成')">单机调试完成</button>
              <button type="button" style="background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('联动调试完成')">联动调试完成</button>
              <button type="button" style="background: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('工艺调试达标')">工艺调试达标</button>
              <button type="button" style="background: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('环保验收通过')">环保验收通过</button>
              <button type="button" style="background: #fce7f3; color: #9d174d; border: 1px solid #f9a8d4; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="setMilestonePreset('竣工移交')">竣工移交</button>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}">${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority">
                <option value="low">低</option>
                <option value="medium" selected>中</option>
                <option value="high">高</option>
                <option value="critical">紧急</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">负责人</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId">
              <option value="">请选择负责人</option>
              ${users.map(u => `
                <option value="${u.id}">${u.name}</option>
              `).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" rows="3" placeholder="请输入里程碑描述"></textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">目标日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="targetDate" required>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">初始进度 (%)</label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="progress" min="0" max="100" value="0">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">标签（用逗号分隔）</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="tags" placeholder="例如：设计,土建,安装">
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createMilestoneModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleCreateMilestone()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createMilestoneModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑里程碑</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editMilestoneModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editMilestoneForm">
          <input type="hidden" name="id" value="${milestone.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">里程碑名称</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" value="${milestone.name}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}" ${p.id === milestone.projectId ? 'selected' : ''}>${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority">
                <option value="low" ${milestone.priority === 'low' ? 'selected' : ''}>低</option>
                <option value="medium" ${milestone.priority === 'medium' ? 'selected' : ''}>中</option>
                <option value="high" ${milestone.priority === 'high' ? 'selected' : ''}>高</option>
                <option value="critical" ${milestone.priority === 'critical' ? 'selected' : ''}>紧急</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">负责人</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId">
              <option value="">请选择负责人</option>
              ${users.map(u => `
                <option value="${u.id}" ${u.id === milestone.assigneeId ? 'selected' : ''}>${u.name}</option>
              `).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description">${milestone.description || ''}</textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">目标日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="targetDate" value="${milestone.targetDate || ''}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">进度 (%)</label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="progress" min="0" max="100" value="${milestone.progress || 0}">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">标签（用逗号分隔）</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="tags" value="${milestone.tags ? milestone.tags.join(', ') : ''}" placeholder="例如：设计,土建,安装">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
              <option value="pending" ${milestone.status === 'pending' ? 'selected' : ''}>待开始</option>
              <option value="in_progress" ${milestone.status === 'in_progress' ? 'selected' : ''}>进行中</option>
              <option value="completed" ${milestone.status === 'completed' ? 'selected' : ''}>已完成</option>
            </select>
          </div>
          ${milestone.status === 'completed' || milestone.completedDate ? `
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">完成日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="completedDate" value="${milestone.completedDate || ''}">
            </div>
          ` : ''}
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editMilestoneModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditMilestone()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editMilestoneModal', contentHtml);
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
