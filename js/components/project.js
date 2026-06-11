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

function getProjectStatusName(status) {
  const names = {
    planning: '筹备中',
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    terminated: '已终止'
  };
  return names[status] || status || '未设置';
}

function getProjectStatusTagColor(status) {
  const colors = {
    planning: 'info',
    active: 'success',
    completed: 'success',
    paused: 'warning',
    terminated: 'danger'
  };
  return colors[status] || 'default';
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
    
    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">项目筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <div class="filter-search" style="flex: 1; min-width: 200px; max-width: 300px;">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="搜索项目名称或描述..." id="projectSearch" style="width: 100%;">
          </div>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="statusFilter">
            <option value="all">全部状态</option>
            <option value="planning">筹备中</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="paused">已暂停</option>
            <option value="terminated">已终止</option>
          </select>
          <select style="width: 100px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="priorityFilter">
            <option value="all">全部优先级</option>
            <option value="urgent">紧急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="phaseFilter">
            <option value="all">全部阶段</option>
            <option value="preparation">前期准备</option>
            <option value="civil">土建施工</option>
            <option value="mechanical">机电安装</option>
            <option value="commissioning">工艺调试</option>
            <option value="trial-run">试运行</option>
            <option value="acceptance">竣工验收</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetProjectFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
        </div>
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

function resetProjectFilters() {
  const projectSearch = document.getElementById('projectSearch');
  const statusFilter = document.getElementById('statusFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  const phaseFilter = document.getElementById('phaseFilter');

  if (projectSearch) projectSearch.value = '';
  if (statusFilter) statusFilter.value = 'all';
  if (priorityFilter) priorityFilter.value = 'all';
  if (phaseFilter) phaseFilter.value = 'all';

  filterProjects();
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
        <span class="project-card-status">${getProjectStatusName(project.status)}</span>
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
  const users = state.users || [];
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建项目</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createProjectModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="createProjectForm">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">项目名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入项目名称">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">项目描述 <span style="color: red;">*</span></label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="description" required placeholder="请输入项目描述"></textarea>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">开始日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="startDate" required>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">结束日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="endDate" required>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">优先级 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority" required>
                <option value="">请选择优先级</option>
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="planning">筹备中</option>
                <option value="active" selected>进行中</option>
                <option value="paused">已暂停</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">项目类型</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
                <option value="">请选择类型</option>
                <option value="wastewater-new">污水处理厂-新建</option>
                <option value="wastewater-expand">污水处理厂-改扩建</option>
                <option value="wastewater-upgrade">污水处理厂-提标改造</option>
                <option value="wastewater-renewal">污水处理厂-设备更新</option>
                <option value="industrial-wastewater">工业废水处理</option>
                <option value="other-environmental">其他环保工程</option>
              </select>
            </div>

            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">项目预算 (万元)</label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="budget" min="0" step="0.01" placeholder="请输入项目预算">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">工程阶段</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="phase">
                <option value="">请选择阶段</option>
                <option value="preparation">前期准备</option>
                <option value="civil">土建施工</option>
                <option value="mechanical">机电安装</option>
                <option value="commissioning">工艺调试</option>
                <option value="trial-run">试运行</option>
                <option value="acceptance">竣工验收</option>
              </select>
            </div>

            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">项目所在地</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="location" placeholder="如：广东省广州市">
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">处理规模</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="capacity" placeholder="如：5万吨/日">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">项目成员</label>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
              ${users.map(user => `
                <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 4px;">
                  <input type="checkbox" name="memberIds" value="${user.id}" style="flex-shrink: 0;">
                  <span style="flex: 1;">${user.name}</span>
                  <select name="memberRoles" data-user-id="${user.id}" style="padding: 4px 8px; font-size: 12px; border-radius: 4px; border: 1px solid #e2e8f0; background: #ffffff;">
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
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('createProjectModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);" onclick="handleCreateProject()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createProjectModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑项目</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editProjectModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editProjectForm">
          <input type="hidden" name="id" value="${project.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${project.name}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目描述 <span style="color: red;">*</span></label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" required>${project.description}</textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">开始日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="startDate" required value="${project.startDate}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">结束日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="endDate" required value="${project.endDate}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority" required>
                <option value="urgent" ${project.priority === 'urgent' ? 'selected' : ''}>紧急</option>
                <option value="high" ${project.priority === 'high' ? 'selected' : ''}>高</option>
                <option value="medium" ${project.priority === 'medium' ? 'selected' : ''}>中</option>
                <option value="low" ${project.priority === 'low' ? 'selected' : ''}>低</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="planning" ${project.status === 'planning' ? 'selected' : ''}>筹备中</option>
                <option value="active" ${project.status === 'active' ? 'selected' : ''}>进行中</option>
                <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>已完成</option>
                <option value="paused" ${project.status === 'paused' ? 'selected' : ''}>已暂停</option>
                <option value="terminated" ${project.status === 'terminated' ? 'selected' : ''}>已终止</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目类型</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
                <option value="">请选择类型</option>
                <option value="wastewater-new" ${project.category === 'wastewater-new' ? 'selected' : ''}>污水处理厂-新建</option>
                <option value="wastewater-expand" ${project.category === 'wastewater-expand' ? 'selected' : ''}>污水处理厂-改扩建</option>
                <option value="wastewater-upgrade" ${project.category === 'wastewater-upgrade' ? 'selected' : ''}>污水处理厂-提标改造</option>
                <option value="wastewater-renewal" ${project.category === 'wastewater-renewal' ? 'selected' : ''}>污水处理厂-设备更新</option>
                <option value="industrial-wastewater" ${project.category === 'industrial-wastewater' ? 'selected' : ''}>工业废水处理</option>
                <option value="other-environmental" ${project.category === 'other-environmental' ? 'selected' : ''}>其他环保工程</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目预算 (万元)</label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="budget" min="0" step="0.01" value="${project.budget || ''}" placeholder="请输入项目预算">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">工程阶段</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="phase">
                <option value="">请选择阶段</option>
                <option value="preparation" ${project.phase === 'preparation' ? 'selected' : ''}>前期准备</option>
                <option value="civil" ${project.phase === 'civil' ? 'selected' : ''}>土建施工</option>
                <option value="mechanical" ${project.phase === 'mechanical' ? 'selected' : ''}>机电安装</option>
                <option value="commissioning" ${project.phase === 'commissioning' ? 'selected' : ''}>工艺调试</option>
                <option value="trial-run" ${project.phase === 'trial-run' ? 'selected' : ''}>试运行</option>
                <option value="acceptance" ${project.phase === 'acceptance' ? 'selected' : ''}>竣工验收</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目所在地</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="location" value="${project.location || ''}" placeholder="如：广东省广州市">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">处理规模</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="capacity" value="${project.capacity || ''}" placeholder="如：5万吨/日">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目成员</label>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px;">
              ${users.map(user => {
                const existingMember = project.members.find(m => m.userId === user.id);
                const selectedRole = existingMember ? existingMember.role : 'member';
                return `
                  <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 4px;">
                    <input type="checkbox" name="memberIds" value="${user.id}" ${existingMember ? 'checked' : ''} style="flex-shrink: 0;">
                    <span style="flex: 1; color: #374151;">${user.name}</span>
                    <select name="memberRoles" data-user-id="${user.id}" style="padding: 4px 8px; font-size: 12px; border-radius: 4px; border: 1px solid #e2e8f0;">
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
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editProjectModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditProject()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editProjectModal', contentHtml);
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
              <span class="tag tag-${getProjectStatusTagColor(project.status)}">${getProjectStatusName(project.status)}</span>
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
              <div class="font-medium" id="projectDuration-${project.id}">${DateUtils.formatDuration(project.startDate, project.endDate)}</div>
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
            <h3 style="font-size: 18px; font-weight: 600;">项目时间线</h3>
            <div class="view-toggle" style="gap: 4px;">
              <button class="btn btn-sm btn-outline active" data-view="day" onclick="switchProjectTimelineView('${project.id}', 'day')">
                <i class="fas fa-calendar-day"></i> 日
              </button>
              <button class="btn btn-sm btn-outline" data-view="week" onclick="switchProjectTimelineView('${project.id}', 'week')">
                <i class="fas fa-calendar-week"></i> 周
              </button>
              <button class="btn btn-sm btn-outline" data-view="month" onclick="switchProjectTimelineView('${project.id}', 'month')">
                <i class="fas fa-calendar-alt"></i> 月
              </button>
            </div>
          </div>
          <div id="projectTimeline-${project.id}">
            ${renderProjectTimeline(project, 'day')}
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

function renderProjectTimeline(project, viewType = 'day') {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysBetween = DateUtils.getDaysBetween(project.startDate, project.endDate);
  const totalDays = daysBetween <= 0 ? 1 : daysBetween;
  
  let timelineHtml = '';
  
  switch(viewType) {
    case 'day':
      timelineHtml = renderDayView(project, startDate, endDate, today, totalDays);
      break;
    case 'week':
      timelineHtml = renderWeekView(project, startDate, endDate, today, totalDays);
      break;
    case 'month':
      timelineHtml = renderMonthView(project, startDate, endDate, today, totalDays);
      break;
  }
  
  return timelineHtml;
}

function renderDayView(project, startDate, endDate, today, totalDays) {
  const days = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const isToday = current.toDateString() === today.toDateString();
    const isPast = current < today;
    const dayOfWeek = DateUtils.getWeekDayName(current.getDay(), true);
    days.push({
      date: new Date(current),
      day: current.getDate(),
      dayOfWeek,
      isToday,
      isPast
    });
    current.setDate(current.getDate() + 1);
  }
  
  const todayIndex = days.findIndex(d => d.isToday);
  const progress = Math.min(100, Math.max(0, todayIndex / days.length * 100));
  
  return `
    <div class="timeline-container">
      <div class="timeline-progress" style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
          <span>${DateUtils.formatDate(project.startDate)}</span>
          <span>完成 ${Math.round(progress)}%</span>
          <span>${DateUtils.formatDate(project.endDate)}</span>
        </div>
        <div class="progress-bar" style="height: 8px;">
          <div class="progress-bar-fill" style="width: ${progress}%;"></div>
        </div>
      </div>
      <div class="timeline-grid">
        ${days.map((day, index) => `
          <div class="timeline-cell ${day.isToday ? 'today' : ''} ${day.isPast ? 'past' : ''}" title="${DateUtils.formatDate(day.date)}">
            <div style="font-size: 14px; font-weight: 600; ${day.isToday ? 'color: var(--primary-color);' : ''}">${day.day}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">周${day.dayOfWeek}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderWeekView(project, startDate, endDate, today, totalDays) {
  const weeks = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const weekStart = DateUtils.getStartOfWeek(current);
    const weekEnd = DateUtils.getEndOfWeek(current);
    if (weekEnd > end) weekEnd.setTime(end.getTime());
    
    const isCurrentWeek = weekStart <= today && today <= weekEnd;
    const isPastWeek = weekEnd < today;
    
    const weekNumber = Math.ceil((weekStart - new Date(startDate.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24 * 7));
    
    weeks.push({
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      weekNumber,
      isCurrentWeek,
      isPastWeek
    });
    
    current.setDate(current.getDate() + 7);
  }
  
  return `
    <div class="timeline-container">
      <div class="timeline-grid">
        ${weeks.map((week, index) => `
          <div class="timeline-cell week-cell ${week.isCurrentWeek ? 'today' : ''} ${week.isPastWeek ? 'past' : ''}" title="${DateUtils.formatDate(week.weekStart)} ~ ${DateUtils.formatDate(week.weekEnd)}">
            <div style="font-size: 13px; font-weight: 600; ${week.isCurrentWeek ? 'color: var(--primary-color);' : ''}">第${week.weekNumber}周</div>
            <div style="font-size: 10px; color: var(--text-secondary);">${DateUtils.formatDate(week.weekStart, 'MM-DD')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMonthView(project, startDate, endDate, today, totalDays) {
  const months = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const monthStart = DateUtils.getStartOfMonth(current);
    const monthEnd = DateUtils.getEndOfMonth(current);
    if (monthEnd > end) monthEnd.setTime(end.getTime());
    
    const isCurrentMonth = monthStart <= today && today <= monthEnd;
    const isPastMonth = monthEnd < today;
    
    const monthName = DateUtils.getMonthName(current.getMonth(), true);
    const year = current.getFullYear();
    
    months.push({
      monthStart: new Date(monthStart),
      monthEnd: new Date(monthEnd),
      monthName,
      year,
      isCurrentMonth,
      isPastMonth
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return `
    <div class="timeline-container">
      <div class="timeline-grid">
        ${months.map((month, index) => `
          <div class="timeline-cell month-cell ${month.isCurrentMonth ? 'today' : ''} ${month.isPastMonth ? 'past' : ''}" title="${month.year}年${month.monthName}">
            <div style="font-size: 13px; font-weight: 600; ${month.isCurrentMonth ? 'color: var(--primary-color);' : ''}">${month.year}年</div>
            <div style="font-size: 12px; color: ${month.isCurrentMonth ? 'var(--primary-color)' : 'var(--text-secondary)'}; margin-top: 2px;">${month.monthName}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function switchProjectTimelineView(projectId, viewType) {
  const project = store.getProjectById(projectId);
  if (!project) return;
  
  const buttons = document.querySelectorAll(`#projectTimeline-${projectId} .view-toggle button`);
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const activeBtn = document.querySelector(`#projectTimeline-${projectId} button[data-view="${viewType}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  const timelineContainer = document.getElementById(`projectTimeline-${projectId}`);
  if (timelineContainer) {
    timelineContainer.innerHTML = renderProjectTimeline(project, viewType);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderProjects, renderProjectDetail };
}
