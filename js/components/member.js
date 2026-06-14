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

    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-users" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">团队总数</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${users.length}</div>
        <div style="font-size: 12px; color: #93c5fd;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-user-check" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">活跃成员</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${activeMembers}</div>
        <div style="font-size: 12px; color: #15803d;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 1px solid #d1d5db; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(156, 163, 175, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-user-clock" style="color: #9ca3af; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">暂无任务</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #6b7280; margin-bottom: 8px;">${inactiveMembers}</div>
        <div style="font-size: 12px; color: #9ca3af;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-user-shield" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">管理员</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">${roleCounts.admin}</div>
        <div style="font-size: 12px; color: #dc2626;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-user-tie" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">项目经理</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${roleCounts.manager}</div>
        <div style="font-size: 12px; color: #d97706;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-user" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">普通成员</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${roleCounts.member}</div>
        <div style="font-size: 12px; color: #15803d;">人</div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">成员筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <div class="filter-search" style="flex: 1; min-width: 200px;">
            <i class="fas fa-search"></i>
            <input type="text" style="width: 100%; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; margin: 0;" placeholder="搜索成员姓名、邮箱或部门..." id="memberSearch" oninput="filterMembers()">
          </div>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="memberRoleFilter" onchange="filterMembers()">
            <option value="all">全部角色</option>
            <option value="admin">管理员</option>
            <option value="manager">项目经理</option>
            <option value="member">普通成员</option>
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="memberDeptFilter" onchange="filterMembers()">
            <option value="all">全部部门</option>
            ${[...new Set(users.map(u => u.department).filter(Boolean))].map(dept =>
              `<option value="${dept}">${dept}</option>`
            ).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetMemberFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
        </div>
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

function resetMemberFilters() {
  const searchInput = document.getElementById('memberSearch');
  const roleFilter = document.getElementById('memberRoleFilter');
  const deptFilter = document.getElementById('memberDeptFilter');
  if (searchInput) searchInput.value = '';
  if (roleFilter) roleFilter.value = 'all';
  if (deptFilter) deptFilter.value = 'all';
  filterMembers();
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
    <div class="member-card fade-in" style="display: flex; flex-direction: column; background: var(--bg-white); border-radius: 12px; padding: 24px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); border: 1px solid var(--border-color); transition: box-shadow 0.2s, transform 0.2s;">
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
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">添加成员</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createMemberModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createMemberForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">姓名 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入姓名">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">邮箱 <span style="color: red;">*</span></label>
            <input type="email" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="email" required placeholder="请输入邮箱">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">电话</label>
            <input type="tel" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="phone" placeholder="请输入电话">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">部门</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="department" placeholder="请输入部门">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">角色 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="role" required>
              <option value="">请选择角色</option>
              <option value="admin">管理员</option>
              <option value="manager">项目经理</option>
              <option value="member">成员</option>
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createMemberModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleCreateMember()">添加</button>
      </div>
    </div>
  `;
  
  showModal('createMemberModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑成员</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editMemberModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editMemberForm">
          <input type="hidden" name="id" value="${user.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">姓名 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${user.name}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">邮箱 <span style="color: red;">*</span></label>
            <input type="email" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="email" required value="${user.email}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">电话</label>
            <input type="tel" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="phone" value="${user.phone || ''}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">部门</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="department" value="${user.department || ''}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">角色 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="role" required>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理员</option>
              <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>项目经理</option>
              <option value="member" ${user.role === 'member' ? 'selected' : ''}>成员</option>
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editMemberModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditMember()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editMemberModal', contentHtml);
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
