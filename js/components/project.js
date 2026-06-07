// --- 收藏功能 ---
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('projectFavorites') || '[]');
  } catch (e) {
    return [];
  }
}

function toggleFavorite(projectId, event) {
  if (event) event.stopPropagation();
  let favorites = getFavorites();
  const idx = favorites.indexOf(projectId);
  if (idx > -1) {
    favorites.splice(idx, 1);
  } else {
    favorites.push(projectId);
  }
  localStorage.setItem('projectFavorites', JSON.stringify(favorites));
  renderContent();
}

function isFavorited(projectId) {
  return getFavorites().includes(projectId);
}

function getPhaseName(phase) {
  const names = {
    preparation: '前期准备',
    civil: '土建施工',
    mechanical: '机电安装',
    commissioning: '工艺调试',
    'trial-run': '试运行',
    acceptance: '竣工验收'
  };
  return names[phase] || phase || '未设置';
}

function renderProjects() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">项目管理</h1>
        <p class="page-description">管理所有工程项目</p>
      </div>
      <div class="action-bar">
        <div class="view-toggle">
          <button class="active" data-view="grid" title="网格视图">
            <i class="fas fa-th-large"></i>
          </button>
          <button data-view="list" title="列表视图">
            <i class="fas fa-list"></i>
          </button>
        </div>
        <button class="btn btn-primary" onclick="showCreateProjectModal()">
          <i class="fas fa-plus"></i>
          新建项目
        </button>
      </div>
    </div>
    
    <div class="stats-bar" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">
      <div class="stat-item" style="background: var(--bg-white); border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 28px; font-weight: 700; color: var(--primary-color);">${projects.length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-folder"></i> 项目总数</div>
      </div>
      <div class="stat-item" style="background: var(--bg-white); border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 28px; font-weight: 700; color: var(--warning-color);">${projects.filter(p => p.status === 'active').length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-play-circle"></i> 进行中</div>
      </div>
      <div class="stat-item" style="background: var(--bg-white); border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 28px; font-weight: 700; color: var(--success-color);">${projects.filter(p => p.status === 'completed').length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-check-circle"></i> 已完成</div>
      </div>
      <div class="stat-item" style="background: var(--bg-white); border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 28px; font-weight: 700; color: var(--danger-color);">${projects.filter(p => p.status === 'paused' || p.status === 'terminated').length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-pause-circle"></i> 暂停/终止</div>
      </div>
    </div>
    
    <div class="filter-bar">
      <div class="filter-search">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索项目名称或描述..." id="projectSearch" oninput="filterProjects()">
      </div>
      <div class="filter-item">
        <label class="filter-label">状态:</label>
        <select class="filter-select" id="statusFilter" onchange="filterProjects()">
          <option value="all">全部</option>
          <option value="planning">筹备中</option>
          <option value="active">进行中</option>
          <option value="completed">已完成</option>
          <option value="paused">已暂停</option>
          <option value="terminated">已终止</option>
        </select>
      </div>
      <div class="filter-item">
        <label class="filter-label">优先级:</label>
        <select class="filter-select" id="priorityFilter" onchange="filterProjects()">
          <option value="all">全部</option>
          <option value="urgent">紧急</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
      <div class="filter-item">
        <label class="filter-label">工程阶段:</label>
        <select class="filter-select" id="phaseFilter" onchange="filterProjects()">
          <option value="all">全部</option>
          <option value="preparation">前期准备</option>
          <option value="civil">土建施工</option>
          <option value="mechanical">机电安装</option>
          <option value="commissioning">工艺调试</option>
          <option value="trial-run">试运行</option>
          <option value="acceptance">竣工验收</option>
        </select>
      </div>
    </div>
    
    <div id="projectContent">
      ${renderRecentProjectsQuickAccess(state.projects)}
      ${renderProjectGrid(projects)}
    </div>
  `;
  
  return html;
}

function filterProjects() {
  const state = store.getState();
  let projects = [...state.projects];

  const searchTerm = document.getElementById('projectSearch')?.value?.toLowerCase() || '';
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const priorityFilter = document.getElementById('priorityFilter')?.value || 'all';
  const phaseFilter = document.getElementById('phaseFilter')?.value || 'all';

  if (searchTerm) {
    projects = projects.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm))
    );
  }

  if (statusFilter !== 'all') {
    projects = projects.filter(p => p.status === statusFilter);
  }

  if (priorityFilter !== 'all') {
    projects = projects.filter(p => p.priority === priorityFilter);
  }

  if (phaseFilter !== 'all') {
    projects = projects.filter(p => p.phase === phaseFilter);
  }

  const content = document.getElementById('projectContent');
  if (content) {
    content.innerHTML = renderRecentProjectsQuickAccess(store.getState().projects) + renderProjectGrid(projects);
  }
}

function renderProjectGrid(projects) {
  if (projects.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-folder-open" style="font-size: 64px;"></i>
        <h3>暂无项目</h3>
        <p class="text-muted">点击"新建项目"按钮创建第一个项目</p>
        <button class="btn btn-primary mt-16" onclick="showCreateProjectModal()">
          <i class="fas fa-plus"></i>
          新建项目
        </button>
      </div>
    `;
  }
  
  return `
    <div class="project-grid">
      ${projects.map(project => renderProjectCard(project)).join('')}
    </div>
  `;
}

function renderProjectCard(project) {
  const progress = store.getProjectProgress(project.id);
  
  return `
    <div class="project-card fade-in" onclick="showProjectDetail('${project.id}')">
      <div class="project-card-header">
        <div class="project-card-actions" style="display: flex; align-items: center; gap: 4px;">
          <button onclick="toggleFavorite('${project.id}', event)" title="${isFavorited(project.id) ? '取消收藏' : '添加收藏'}" style="background: none; border: none; cursor: pointer; font-size: 18px; color: ${isFavorited(project.id) ? '#f59e0b' : '#ccc'}; padding: 2px 4px; transition: color 0.2s;">
            <i class="${isFavorited(project.id) ? 'fas' : 'far'} fa-star"></i>
          </button>
          <button onclick="event.stopPropagation(); showEditProjectModal('${project.id}')" title="编辑">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="event.stopPropagation(); confirmDeleteProject('${project.id}')" title="删除">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="project-card-title">${project.name}</div>
        <span class="project-card-status">${getStatusName(project.status)}</span>
      </div>
      <div class="project-card-body">
        <div class="project-card-info">
          <span><i class="fas fa-calendar"></i> ${DateUtils.formatDate(project.startDate)}</span>
          <span><i class="fas fa-calendar-check"></i> ${DateUtils.formatDate(project.endDate)}</span>
        </div>
        <p class="text-muted line-clamp-2 mb-16">${project.description}</p>
        <div class="project-card-progress">
          <div class="progress-label">
            <span class="text-sm">完成进度</span>
            <span class="progress-percentage">${progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${progress}%;"></div>
          </div>
        </div>
        <div class="project-card-footer">
          <div class="project-card-members">
            ${(project.members || []).slice(0, 4).map(memberId => {
              const member = store.getUserById(memberId);
              return `<div class="project-card-member" title="${member?.name}">${getInitials(member?.name)}</div>`;
            }).join('')}
            ${(project.members || []).length > 4 ? `<div class="project-card-member">+${(project.members || []).length - 4}</div>` : ''}
          </div>
          <span class="tag tag-${getPriorityTagColor(project.priority)}">${getPriorityName(project.priority)}</span>
        </div>
      </div>
    </div>
  `;
}

function showProjectDetail(projectId) {
  store.setState({ currentProjectId: projectId });
  router.navigate(`projects/${projectId}`);
  renderContent();
}

function showCreateProjectModal() {
  const state = store.getState();
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="createProjectModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">新建项目</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('createProjectModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="createProjectForm">
            <div class="form-group">
              <label class="form-label">项目名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入项目名称">
            </div>
            
            <div class="form-group">
              <label class="form-label">项目描述 <span style="color: red;">*</span></label>
              <textarea class="form-input form-textarea" name="description" required placeholder="请输入项目描述"></textarea>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">开始日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="startDate" required>
              </div>
              
              <div class="form-group">
                <label class="form-label">结束日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="endDate" required>
              </div>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">优先级 <span style="color: red;">*</span></label>
                <select class="form-select" name="priority" required>
                  <option value="">请选择优先级</option>
                  <option value="urgent">紧急</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-select" name="status">
                  <option value="planning">筹备中</option>
                  <option value="active" selected>进行中</option>
                  <option value="paused">已暂停</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">项目类型</label>
                <select class="form-select" name="category">
                  <option value="">请选择类型</option>
                  <option value="wastewater-new">污水处理厂-新建</option>
                  <option value="wastewater-expand">污水处理厂-改扩建</option>
                  <option value="wastewater-upgrade">污水处理厂-提标改造</option>
                  <option value="wastewater-renewal">污水处理厂-设备更新</option>
                  <option value="industrial-wastewater">工业废水处理</option>
                  <option value="other-environmental">其他环保工程</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">项目预算 (万元)</label>
                <input type="number" class="form-input" name="budget" min="0" step="0.01" placeholder="请输入项目预算">
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">工程阶段</label>
                <select class="form-select" name="phase">
                  <option value="">请选择阶段</option>
                  <option value="preparation">前期准备</option>
                  <option value="civil">土建施工</option>
                  <option value="mechanical">机电安装</option>
                  <option value="commissioning">工艺调试</option>
                  <option value="trial-run">试运行</option>
                  <option value="acceptance">竣工验收</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">项目所在地</label>
                <input type="text" class="form-input" name="location" placeholder="如：广东省广州市">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">处理规模</label>
              <input type="text" class="form-input" name="capacity" placeholder="如：5万吨/日">
            </div>
            
            <div class="form-group">
              <label class="form-label">项目成员</label>
              <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                ${users.map(user => `
                  <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 4px; transition: background 0.2s;">
                    <input type="checkbox" name="memberIds" value="${user.id}" style="flex-shrink: 0;">
                    <span style="flex: 1;">${user.name}</span>
                    <select name="memberRoles" data-user-id="${user.id}" style="padding: 4px 8px; font-size: 12px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-white);">
                      <option value="member">团队成员</option>
                      <option value="leader">项目组长</option>
                      <option value="manager">项目经理</option>
                      <option value="tech-lead">技术负责人</option>
                      <option value="quality-lead">质量负责人</option>
                      <option value="safety-lead">安全负责人</option>
                    </select>
                  </div>
                `).join('')}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('createProjectModal')">取消</button>
          <button class="btn btn-primary" onclick="handleCreateProject()">创建</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleCreateProject() {
  const form = document.getElementById('createProjectForm');
  const formData = new FormData(form);
  
  const memberIds = formData.getAll('memberIds') || [];
  const memberRoles = {};
  document.querySelectorAll('select[name="memberRoles"]').forEach(select => {
    memberRoles[select.dataset.userId] = select.value;
  });
  
  const members = memberIds.map(id => ({
    userId: id,
    role: memberRoles[id] || 'member'
  }));
  
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    priority: formData.get('priority'),
    status: formData.get('status'),
    category: formData.get('category') || '',
    phase: formData.get('phase') || '',
    location: formData.get('location') || '',
    capacity: formData.get('capacity') || '',
    budget: parseFloat(formData.get('budget')) || 0,
    members: members,
    progress: 0
  };
  
  const validation = Validate.validateProject(data);
  if (!validation.isValid) {
    alert(Object.values(validation.errors)[0]);
    return;
  }
  
  store.addProject(data);
  closeModal('createProjectModal');
  renderContent();
  store.addNotification({
    type: 'success',
    title: '项目创建成功',
    message: `项目"${data.name}"已成功创建`
  });
}

function showEditProjectModal(projectId) {
  const project = store.getProjectById(projectId);
  if (!project) return;
  
  const users = store.getState().users;
  
  const html = `
    <div class="modal-overlay" id="editProjectModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">编辑项目</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editProjectModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editProjectForm">
            <input type="hidden" name="id" value="${project.id}">
            
            <div class="form-group">
              <label class="form-label">项目名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required value="${project.name}">
            </div>
            
            <div class="form-group">
              <label class="form-label">项目描述 <span style="color: red;">*</span></label>
              <textarea class="form-input form-textarea" name="description" required>${project.description}</textarea>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">开始日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="startDate" required value="${project.startDate}">
              </div>
              
              <div class="form-group">
                <label class="form-label">结束日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="endDate" required value="${project.endDate}">
              </div>
            </div>
            
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">优先级 <span style="color: red;">*</span></label>
                <select class="form-select" name="priority" required>
                  <option value="urgent" ${project.priority === 'urgent' ? 'selected' : ''}>紧急</option>
                  <option value="high" ${project.priority === 'high' ? 'selected' : ''}>高</option>
                  <option value="medium" ${project.priority === 'medium' ? 'selected' : ''}>中</option>
                  <option value="low" ${project.priority === 'low' ? 'selected' : ''}>低</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-select" name="status">
                  <option value="planning" ${project.status === 'planning' ? 'selected' : ''}>筹备中</option>
                  <option value="active" ${project.status === 'active' ? 'selected' : ''}>进行中</option>
                  <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>已完成</option>
                  <option value="paused" ${project.status === 'paused' ? 'selected' : ''}>已暂停</option>
                  <option value="terminated" ${project.status === 'terminated' ? 'selected' : ''}>已终止</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">项目类型</label>
                <select class="form-select" name="category">
                  <option value="">请选择类型</option>
                  <option value="wastewater-new" ${project.category === 'wastewater-new' ? 'selected' : ''}>污水处理厂-新建</option>
                  <option value="wastewater-expand" ${project.category === 'wastewater-expand' ? 'selected' : ''}>污水处理厂-改扩建</option>
                  <option value="wastewater-upgrade" ${project.category === 'wastewater-upgrade' ? 'selected' : ''}>污水处理厂-提标改造</option>
                  <option value="wastewater-renewal" ${project.category === 'wastewater-renewal' ? 'selected' : ''}>污水处理厂-设备更新</option>
                  <option value="industrial-wastewater" ${project.category === 'industrial-wastewater' ? 'selected' : ''}>工业废水处理</option>
                  <option value="other-environmental" ${project.category === 'other-environmental' ? 'selected' : ''}>其他环保工程</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">项目预算 (万元)</label>
                <input type="number" class="form-input" name="budget" min="0" step="0.01" value="${project.budget || ''}" placeholder="请输入项目预算">
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">工程阶段</label>
                <select class="form-select" name="phase">
                  <option value="">请选择阶段</option>
                  <option value="preparation" ${project.phase === 'preparation' ? 'selected' : ''}>前期准备</option>
                  <option value="civil" ${project.phase === 'civil' ? 'selected' : ''}>土建施工</option>
                  <option value="mechanical" ${project.phase === 'mechanical' ? 'selected' : ''}>机电安装</option>
                  <option value="commissioning" ${project.phase === 'commissioning' ? 'selected' : ''}>工艺调试</option>
                  <option value="trial-run" ${project.phase === 'trial-run' ? 'selected' : ''}>试运行</option>
                  <option value="acceptance" ${project.phase === 'acceptance' ? 'selected' : ''}>竣工验收</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">项目所在地</label>
                <input type="text" class="form-input" name="location" value="${project.location || ''}" placeholder="如：广东省广州市">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">处理规模</label>
              <input type="text" class="form-input" name="capacity" value="${project.capacity || ''}" placeholder="如：5万吨/日">
            </div>
            
            <div class="form-group">
              <label class="form-label">项目成员</label>
              <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                ${users.map(user => {
                  const existingMember = project.members.find(m => m.userId === user.id);
                  const selectedRole = existingMember ? existingMember.role : 'member';
                  return `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 4px; transition: background 0.2s;">
                      <input type="checkbox" name="memberIds" value="${user.id}" ${existingMember ? 'checked' : ''} style="flex-shrink: 0;">
                      <span style="flex: 1;">${user.name}</span>
                      <select name="memberRoles" data-user-id="${user.id}" style="padding: 4px 8px; font-size: 12px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-white);">
                        <option value="member" ${selectedRole === 'member' ? 'selected' : ''}>团队成员</option>
                        <option value="leader" ${selectedRole === 'leader' ? 'selected' : ''}>项目组长</option>
                        <option value="manager" ${selectedRole === 'manager' ? 'selected' : ''}>项目经理</option>
                        <option value="tech-lead" ${selectedRole === 'tech-lead' ? 'selected' : ''}>技术负责人</option>
                        <option value="quality-lead" ${selectedRole === 'quality-lead' ? 'selected' : ''}>质量负责人</option>
                        <option value="safety-lead" ${selectedRole === 'safety-lead' ? 'selected' : ''}>安全负责人</option>
                      </select>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editProjectModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditProject()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditProject() {
  const form = document.getElementById('editProjectForm');
  const formData = new FormData(form);
  
  const memberIds = formData.getAll('memberIds') || [];
  const memberRoles = {};
  document.querySelectorAll('select[name="memberRoles"]').forEach(select => {
    memberRoles[select.dataset.userId] = select.value;
  });
  
  const members = memberIds.map(id => ({
    userId: id,
    role: memberRoles[id] || 'member'
  }));
  
  const data = {
    name: formData.get('name'),
    description: formData.get('description'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    priority: formData.get('priority'),
    status: formData.get('status'),
    category: formData.get('category') || '',
    phase: formData.get('phase') || '',
    location: formData.get('location') || '',
    capacity: formData.get('capacity') || '',
    budget: parseFloat(formData.get('budget')) || 0,
    members: members
  };
  
  const validation = Validate.validateProject(data);
  if (!validation.isValid) {
    alert(Object.values(validation.errors)[0]);
    return;
  }
  
  const projectId = formData.get('id');
  store.updateProject(projectId, data);
  closeModal('editProjectModal');
  renderContent();
}

function confirmDeleteProject(projectId) {
  const project = store.getProjectById(projectId);
  if (!project) return;
  
  if (confirm(`确定要删除项目"${project.name}"吗？此操作不可恢复。`)) {
    store.deleteProject(projectId);
    renderContent();
    store.addNotification({
      type: 'warning',
      title: '项目已删除',
      message: `项目"${project.name}"已被删除`
    });
  }
}

function renderProjectDetail(projectId) {
  const project = store.getProjectById(projectId);
  if (!project) {
    return `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle" style="font-size: 64px;"></i>
        <h3>项目不存在</h3>
        <p class="text-muted">该项目可能已被删除</p>
        <button class="btn btn-primary mt-16" onclick="router.navigate('projects'); renderContent();">
          返回项目列表
        </button>
      </div>
    `;
  }
  
  const tasks = store.getTasksByProject(projectId);
  const documents = store.getState().documents.filter(d => d.projectId === projectId);
  const progress = store.getProjectProgress(projectId);
  
  const html = `
    <div class="page-header">
      <div>
        <div class="breadcrumb">
          <a href="#" onclick="router.navigate('projects'); renderContent(); return false;">项目管理</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">${project.name}</span>
        </div>
        <h1 class="page-title">${project.name}</h1>
        <p class="page-description">${project.description}</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-secondary" onclick="showEditProjectModal('${project.id}')">
          <i class="fas fa-edit"></i>
          编辑项目
        </button>
        <button class="btn btn-primary" onclick="showCreateTaskModal('${project.id}')">
          <i class="fas fa-plus"></i>
          添加任务
        </button>
      </div>
    </div>
    
    <div class="grid" style="grid-template-columns: 3fr 1fr; gap: 24px;">
      <div>
        <div class="card mb-24">
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">项目信息</h3>
          <div class="grid grid-cols-2" style="gap: 20px;">
            <div>
              <div class="text-muted text-sm mb-4">状态</div>
              <span class="tag tag-${getStatusTagColor(project.status)}">${getStatusName(project.status)}</span>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">优先级</div>
              <span class="tag tag-${getPriorityTagColor(project.priority)}">${getPriorityName(project.priority)}</span>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">工程阶段</div>
              <span class="tag tag-primary">${getPhaseName(project.phase)}</span>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">项目所在地</div>
              <div class="font-medium">${project.location || '未设置'}</div>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">处理规模</div>
              <div class="font-medium">${project.capacity || '未设置'}</div>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">项目预算</div>
              <div class="font-medium">${project.budget ? project.budget + ' 万元' : '未设置'}</div>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">开始日期</div>
              <div class="font-medium">${DateUtils.formatDate(project.startDate)}</div>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">结束日期</div>
              <div class="font-medium">${DateUtils.formatDate(project.endDate)}</div>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">工期</div>
              <div class="font-medium">${DateUtils.formatDuration(project.startDate, project.endDate)}</div>
            </div>
            <div>
              <div class="text-muted text-sm mb-4">完成进度</div>
              <div class="font-medium">${progress}%</div>
            </div>
          </div>
          <div style="margin-top: 20px;">
            <div class="progress-label mb-8">
              <span class="text-sm">整体进度</span>
              <span class="progress-percentage">${progress}%</span>
            </div>
            <div class="progress-bar" style="height: 12px;">
              <div class="progress-bar-fill" style="width: ${progress}%;"></div>
            </div>
          </div>
        </div>
        
        <div class="card mb-24">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: 600;">项目任务 (${tasks.length})</h3>
            <button class="btn btn-primary btn-sm" onclick="showCreateTaskModal('${project.id}')">
              <i class="fas fa-plus"></i>
              添加任务
            </button>
          </div>
          ${renderProjectTasks(tasks)}
        </div>
        
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: 600;">项目文档 (${documents.length})</h3>
            <button class="btn btn-primary btn-sm" onclick="showUploadDocumentModal('${project.id}')">
              <i class="fas fa-upload"></i>
              上传文档
            </button>
          </div>
          ${renderProjectDocuments(documents)}
        </div>
      </div>
      
      <div>
        <div class="card mb-24">
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">项目成员</h3>
          ${renderProjectMembers(project.members)}
        </div>
        
        <div class="card">
          <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">项目统计</h3>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="text-muted">总任务</span>
              <span class="font-semibold text-xl">${tasks.length}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="text-muted">已完成</span>
              <span class="font-semibold text-xl" style="color: var(--success-color);">
                ${tasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="text-muted">进行中</span>
              <span class="font-semibold text-xl" style="color: var(--warning-color);">
                ${tasks.filter(t => t.status === 'in_progress').length}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="text-muted">待开始</span>
              <span class="font-semibold text-xl" style="color: var(--primary-color);">
                ${tasks.filter(t => t.status === 'todo').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return html;
}

function renderProjectTasks(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-tasks" style="font-size: 48px;"></i>
        <h3>暂无任务</h3>
        <p class="text-muted">点击"添加任务"创建第一个任务</p>
      </div>
    `;
  }
  
  return `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${tasks.map(task => {
        const assignee = store.getUserById(task.assigneeId);
        const isOverdue = DateUtils.isPast(task.dueDate) && task.status !== 'completed';
        
        return `
          <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-light); border-radius: 8px;">
            <div class="avatar avatar-sm">
              ${getInitials(assignee?.name)}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 500; margin-bottom: 4px;">${task.name}</div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                <span class="tag tag-${getPriorityTagColor(task.priority)}">${getPriorityName(task.priority)}</span>
                <span class="${isOverdue ? 'text-danger' : 'text-muted'}">
                  ${DateUtils.formatDate(task.dueDate)}
                </span>
              </div>
            </div>
            <div style="width: 120px;">
              <div class="progress-label mb-4">
                <span class="text-xs">${task.progress}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${task.progress}%;"></div>
              </div>
            </div>
            <span class="tag tag-${getStatusTagColor(task.status)}">${getTaskStatusName(task.status)}</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="showEditTaskModal('${task.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="confirmDeleteTask('${task.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderProjectDocuments(documents) {
  if (documents.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-file" style="font-size: 48px;"></i>
        <h3>暂无文档</h3>
        <p class="text-muted">点击"上传文档"添加项目文档</p>
      </div>
    `;
  }
  
  return `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${documents.map(doc => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-light); border-radius: 8px;">
          <i class="fas fa-file-alt" style="font-size: 24px; color: var(--primary-color);"></i>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 500;">${doc.name}</div>
            <div class="text-muted text-sm">
              ${(doc.size / 1024).toFixed(2)} KB · ${DateUtils.formatDateTime(doc.uploadedAt)}
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="downloadDocument('${doc.id}')">
            <i class="fas fa-download"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteDocument('${doc.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderProjectMembers(members) {
  if (!members || members.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-users" style="font-size: 48px;"></i>
        <h3>暂无成员</h3>
        <p class="text-muted">编辑项目添加成员</p>
      </div>
    `;
  }
  
  const getProjectRoleName = (role) => {
    const roles = {
      'member': '团队成员',
      'leader': '项目组长',
      'manager': '项目经理',
      'tech-lead': '技术负责人',
      'quality-lead': '质量负责人',
      'safety-lead': '安全负责人'
    };
    return roles[role] || '团队成员';
  };
  
  return `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${members.map(member => {
        const user = typeof member === 'string' ? store.getUserById(member) : store.getUserById(member.userId);
        if (!user) return '';
        const role = typeof member === 'string' ? 'member' : member.role;
        
        return `
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-light); border-radius: 8px;">
            <div class="avatar">
              ${getInitials(user.name)}
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 500;">${user.name}</div>
              <div class="text-muted text-sm">${getProjectRoleName(role)}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderRecentProjectsQuickAccess(allProjects) {
  const activeProjects = allProjects.filter(p => p.status === 'active' || p.status === 'planning').slice(0, 4);
  if (activeProjects.length === 0) return '';
  
  const categoryNames = {
    'wastewater-new': '污水处理厂-新建',
    'wastewater-expand': '污水处理厂-改扩建',
    'wastewater-upgrade': '污水处理厂-提标改造',
    'wastewater-renewal': '污水处理厂-设备更新',
    'industrial-wastewater': '工业废水处理',
    'other-environmental': '其他环保工程'
  };

  return `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">
        <i class="fas fa-star" style="color: var(--warning-color);"></i> 快速访问
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
        ${activeProjects.map(project => {
          const progress = store.getProjectProgress(project.id);
          const categoryLabel = project.category ? categoryNames[project.category] || project.category : '';
          return `
            <div class="card" style="padding: 16px; cursor: pointer;" onclick="showProjectDetail('${project.id}')">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
                  <i class="fas fa-folder-open"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${project.name}</div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                    ${categoryLabel ? `<span style="font-size: 11px; color: var(--text-secondary); background: var(--bg-light); padding: 1px 8px; border-radius: 10px;">${categoryLabel}</span>` : ''}
                    <span style="font-size: 12px; color: var(--text-secondary);">${progress}%</span>
                  </div>
                </div>
                <div class="progress-bar" style="width: 60px; height: 4px;">
                  <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderProjects, renderProjectDetail };
}
