function renderMembers() {
  const state = store.getState();
  const users = state.users;

  const roleCounts = { admin: 0, manager: 0, member: 0 };
  users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });
  
  const activeMembers = users.filter(u => {
    const stats = store.getUserTasksStats(u.id);
    return stats.total > 0 && stats.completed < stats.total;
  }).length;
  const inactiveMembers = users.length - activeMembers;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">人员管理</h1>
        <p class="page-description">管理团队成员和权限</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showCreateMemberModal()">
          <i class="fas fa-user-plus"></i>
          添加成员
        </button>
      </div>
    </div>

    <div class="member-stats-bar" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="stat-card" style="padding: 16px;">
        <div style="font-size: 28px; font-weight: 700; color: var(--primary-color);">${users.length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          <i class="fas fa-users"></i> 团队总数
        </div>
      </div>
      <div class="stat-card" style="padding: 16px;">
        <div style="font-size: 28px; font-weight: 700; color: var(--success-color);">${activeMembers}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          <i class="fas fa-user-check"></i> 活跃成员
        </div>
      </div>
      <div class="stat-card" style="padding: 16px;">
        <div style="font-size: 28px; font-weight: 700; color: #9ca3af;">${inactiveMembers}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          <i class="fas fa-user-clock"></i> 暂无任务
        </div>
      </div>
      <div class="stat-card" style="padding: 16px;">
        <div style="font-size: 28px; font-weight: 700; color: var(--danger-color);">${roleCounts.admin}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          <i class="fas fa-user-shield"></i> 管理员
        </div>
      </div>
      <div class="stat-card" style="padding: 16px;">
        <div style="font-size: 28px; font-weight: 700; color: var(--warning-color);">${roleCounts.manager}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          <i class="fas fa-user-tie"></i> 项目经理
        </div>
      </div>
      <div class="stat-card" style="padding: 16px;">
        <div style="font-size: 28px; font-weight: 700; color: var(--success-color);">${roleCounts.member}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
          <i class="fas fa-user"></i> 普通成员
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-search" style="flex: 1;">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索成员姓名、邮箱或部门..." id="memberSearch" oninput="filterMembers()">
      </div>
      <div class="filter-item">
        <label class="filter-label">角色:</label>
        <select class="filter-select" id="memberRoleFilter" onchange="filterMembers()">
          <option value="all">全部角色</option>
          <option value="admin">管理员</option>
          <option value="manager">项目经理</option>
          <option value="member">普通成员</option>
        </select>
      </div>
      <div class="filter-item">
        <label class="filter-label">部门:</label>
        <select class="filter-select" id="memberDeptFilter" onchange="filterMembers()">
          <option value="all">全部部门</option>
          ${[...new Set(users.map(u => u.department).filter(Boolean))].map(dept =>
            `<option value="${dept}">${dept}</option>`
          ).join('')}
        </select>
      </div>
    </div>
    
    <div id="memberGridContainer" class="member-grid">
      ${users.map(user => renderMemberCard(user)).join('')}
    </div>
  `;
  
  return html;
}

function filterMembers() {
  const state = store.getState();
  let users = [...state.users];

  const searchTerm = document.getElementById('memberSearch')?.value?.toLowerCase() || '';
  const roleFilter = document.getElementById('memberRoleFilter')?.value || 'all';
  const deptFilter = document.getElementById('memberDeptFilter')?.value || 'all';

  if (searchTerm) {
    users = users.filter(u =>
      u.name.toLowerCase().includes(searchTerm) ||
      (u.email && u.email.toLowerCase().includes(searchTerm)) ||
      (u.department && u.department.toLowerCase().includes(searchTerm))
    );
  }

  if (roleFilter !== 'all') {
    users = users.filter(u => u.role === roleFilter);
  }

  if (deptFilter !== 'all') {
    users = users.filter(u => u.department === deptFilter);
  }

  const container = document.getElementById('memberGridContainer');
  if (container) {
    if (users.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-user-slash" style="font-size: 48px;"></i>
          <h3>未找到匹配的成员</h3>
          <p class="text-muted">请尝试调整搜索条件</p>
        </div>
      `;
    } else {
      container.innerHTML = users.map(user => renderMemberCard(user)).join('');
    }
  }
}

function renderMemberCard(user) {
  const taskStats = store.getUserTasksStats(user.id);

  const roleBadgeColors = {
    admin: { bg: '#dc262615', color: '#dc2626' },
    manager: { bg: '#f59e0b15', color: '#f59e0b' },
    member: { bg: '#10b98115', color: '#10b981' }
  };
  const roleBadge = roleBadgeColors[user.role] || roleBadgeColors.member;
  const deptLabel = user.department || '未分配部门';
  const completeRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  
  const html = `
    <div class="member-card fade-in" style="display: flex; flex-direction: column; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); border: 1px solid var(--border-color); transition: box-shadow 0.2s, transform 0.2s;">
      <div class="member-avatar" style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), #6366f1); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; margin: 0 auto 12px;">
        ${getInitials(user.name)}
      </div>
      <div class="member-name" style="font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 8px;">${user.name}</div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: ${roleBadge.bg}; color: ${roleBadge.color};">
          ${getRoleName(user.role)}
        </span>
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: rgba(59, 130, 246, 0.08); color: var(--primary-color);">
          <i class="fas fa-building"></i> ${deptLabel}
        </span>
      </div>
      
      <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-light); border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <i class="fas fa-envelope" style="color: var(--text-secondary); font-size: 12px;"></i>
          <span style="font-size: 13px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.email}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <i class="fas fa-phone" style="color: var(--text-secondary); font-size: 12px;"></i>
          <span style="font-size: 13px; color: var(--text-secondary);">${user.phone || '未设置'}</span>
        </div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 12px; color: var(--text-secondary);">任务完成率</span>
          <span style="font-size: 14px; font-weight: 600; color: ${completeRate === 100 ? 'var(--success-color)' : 'var(--primary-color)'};">${completeRate}%</span>
        </div>
        <div class="progress-bar" style="height: 8px; border-radius: 4px;">
          <div class="progress-bar-fill" style="width: ${completeRate}%; border-radius: 4px;"></div>
        </div>
      </div>

      <div class="member-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; padding: 12px; background: var(--bg-light); border-radius: 8px;">
        <div class="member-stat" style="text-align: center;">
          <div class="member-stat-value" style="font-size: 18px; font-weight: 700;">${taskStats.total}</div>
          <div class="member-stat-label" style="font-size: 11px; color: var(--text-secondary);">总任务</div>
        </div>
        <div class="member-stat" style="text-align: center;">
          <div class="member-stat-value" style="font-size: 18px; font-weight: 700; color: var(--success-color);">${taskStats.completed}</div>
          <div class="member-stat-label" style="font-size: 11px; color: var(--text-secondary);">已完成</div>
        </div>
        <div class="member-stat" style="text-align: center;">
          <div class="member-stat-value" style="font-size: 18px; font-weight: 700; color: var(--warning-color);">${taskStats.inProgress}</div>
          <div class="member-stat-label" style="font-size: 11px; color: var(--text-secondary);">进行中</div>
        </div>
      </div>
      
      <div class="member-actions" style="display: flex; gap: 8px; justify-content: center; margin-top: auto;">
        <button class="btn btn-secondary btn-sm" onclick="showEditMemberModal('${user.id}')" style="flex: 1;">
          <i class="fas fa-edit"></i>
          编辑
        </button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteMember('${user.id}')" style="flex: 1;">
          <i class="fas fa-trash"></i>
          删除
        </button>
      </div>
    </div>
  `;
  
  return html;
}

function showCreateMemberModal() {
  const html = `
    <div class="modal-overlay" id="createMemberModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">添加成员</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('createMemberModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="createMemberForm">
            <div class="form-group">
              <label class="form-label">姓名 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入姓名">
            </div>
            
            <div class="form-group">
              <label class="form-label">邮箱 <span style="color: red;">*</span></label>
              <input type="email" class="form-input" name="email" required placeholder="请输入邮箱">
            </div>
            
            <div class="form-group">
              <label class="form-label">电话</label>
              <input type="tel" class="form-input" name="phone" placeholder="请输入电话">
            </div>
            
            <div class="form-group">
              <label class="form-label">部门</label>
              <input type="text" class="form-input" name="department" placeholder="请输入部门">
            </div>
            
            <div class="form-group">
              <label class="form-label">角色 <span style="color: red;">*</span></label>
              <select class="form-select" name="role" required>
                <option value="">请选择角色</option>
                <option value="admin">管理员</option>
                <option value="manager">项目经理</option>
                <option value="member">成员</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('createMemberModal')">取消</button>
          <button class="btn btn-primary" onclick="handleCreateMember()">添加</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleCreateMember() {
  const form = document.getElementById('createMemberForm');
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    department: formData.get('department'),
    role: formData.get('role'),
    avatar: ''
  };
  
  const validation = Validate.validateMember(data);
  if (!validation.isValid) {
    alert(Object.values(validation.errors)[0]);
    return;
  }
  
  store.addMember(data);
  closeModal('createMemberModal');
  renderContent();
  store.addNotification({
    type: 'success',
    title: '成员添加成功',
    message: `${data.name}已成功添加到团队`
  });
}

function showEditMemberModal(userId) {
  const user = store.getUserById(userId);
  if (!user) return;
  
  const html = `
    <div class="modal-overlay" id="editMemberModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑成员</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editMemberModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editMemberForm">
            <input type="hidden" name="id" value="${user.id}">
            
            <div class="form-group">
              <label class="form-label">姓名 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required value="${user.name}">
            </div>
            
            <div class="form-group">
              <label class="form-label">邮箱 <span style="color: red;">*</span></label>
              <input type="email" class="form-input" name="email" required value="${user.email}">
            </div>
            
            <div class="form-group">
              <label class="form-label">电话</label>
              <input type="tel" class="form-input" name="phone" value="${user.phone || ''}">
            </div>
            
            <div class="form-group">
              <label class="form-label">部门</label>
              <input type="text" class="form-input" name="department" value="${user.department || ''}">
            </div>
            
            <div class="form-group">
              <label class="form-label">角色 <span style="color: red;">*</span></label>
              <select class="form-select" name="role" required>
                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理员</option>
                <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>项目经理</option>
                <option value="member" ${user.role === 'member' ? 'selected' : ''}>成员</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editMemberModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditMember()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditMember() {
  const form = document.getElementById('editMemberForm');
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    department: formData.get('department'),
    role: formData.get('role')
  };
  
  const validation = Validate.validateMember(data);
  if (!validation.isValid) {
    alert(Object.values(validation.errors)[0]);
    return;
  }
  
  const userId = formData.get('id');
  store.updateMember(userId, data);
  closeModal('editMemberModal');
  renderContent();
}

function confirmDeleteMember(userId) {
  const user = store.getUserById(userId);
  if (!user) return;
  
  if (confirm(`确定要删除成员"${user.name}"吗？此操作不可恢复。`)) {
    store.deleteMember(userId);
    renderContent();
    store.addNotification({
      type: 'warning',
      title: '成员已删除',
      message: `${user.name}已被从团队中移除`
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderMembers };
}
