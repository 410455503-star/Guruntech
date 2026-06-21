function renderMembers() {
  const state = store.getState();
  const users = state.users;

  const roleCounts = { admin: 0, manager: 0, member: 0, marketing_director: 0, marketing_rep: 0, rd_director: 0, tech_support: 0, engineering_supervisor: 0, delivery_director: 0, other: 0 };
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
          <div class="filter-search" style="flex: 1; min-width: 200px; position: relative;">
            <i class="fas fa-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 14px;"></i>
            <input type="text" style="width: 100%; padding: 10px 14px 10px 42px; font-size: 13px; border-radius: 10px; border: 1px solid #e5e7eb; background: #f8fafc; margin: 0; outline: none; transition: all 0.2s ease;" placeholder="搜索成员姓名、邮箱或部门..." id="memberSearch" oninput="filterMembers()" onfocus="this.style.borderColor='#3b82f6'; this.style.background='white';" onblur="this.style.borderColor='#e5e7eb'; this.style.background='#f8fafc';">
          </div>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="memberRoleFilter" onchange="filterMembers()">
            <option value="all">全部角色</option>
            <option value="admin">管理员</option>
            <option value="manager">项目经理</option>
            <option value="engineering_supervisor">工程主管</option>
            <option value="delivery_director">交付总监</option>
            <option value="marketing_director">营销总监</option>
            <option value="marketing_rep">营销代表</option>
            <option value="rd_director">研发总监</option>
            <option value="tech_support">技术支持</option>
            <option value="other">其它</option>
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
      (u.name && u.name.toLowerCase().includes(searchTerm)) ||
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
    member: { bg: '#10b98115', color: '#10b981' },
    marketing_director: { bg: '#8b5cf615', color: '#8b5cf6' },
    marketing_rep: { bg: '#ec489915', color: '#ec4899' },
    rd_director: { bg: '#06b6d415', color: '#06b6d4' },
    tech_support: { bg: '#3b82f615', color: '#3b82f6' },
    engineering_supervisor: { bg: '#f9731615', color: '#f97316' },
    delivery_director: { bg: '#14b8a615', color: '#14b8a6' },
    other: { bg: '#6b728015', color: '#6b7280' }
  };
  const roleBadge = roleBadgeColors[user.role] || roleBadgeColors.member;
  const deptLabel = user.department || '未分配部门';
  const completeRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
  
  const html = `
    <div class="member-card fade-in" style="display: flex; flex-direction: column; background: var(--bg-white); border-radius: 12px; padding: 24px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); border: 1px solid var(--border-color); transition: box-shadow 0.2s, transform 0.2s;">
      <div class="member-avatar" style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), #6366f1); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; margin: 0 auto 12px;">
        ${getInitials(user.name)}
      </div>
      <div class="member-name" style="font-size: 16px; font-weight: 600; text-align: center; margin-bottom: 4px;">${user.name}</div>
      <div style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 12px;">
        <i class="fas fa-user-circle" style="margin-right: 4px;"></i>${user.username || '未设置'}
      </div>
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
  // 生成默认用户名（基于姓名拼音）
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
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入姓名" oninput="generateUsername()">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">登录用户名 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="username" id="memberUsername" required placeholder="用于登录系统">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">登录密码 <span style="color: red;">*</span></label>
            <div style="position: relative;">
              <input type="password" style="width: 100%; padding: 11px 40px 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="password" id="memberPassword" required placeholder="请设置登录密码" value="123456">
              <button type="button" onclick="togglePasswordVisibility('memberPassword')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px;">
                <i class="fas fa-eye" id="memberPasswordIcon"></i>
              </button>
            </div>
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
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="department">
              <option value="">请选择部门</option>
              <option value="总经办">总经办</option>
              <option value="技术部">技术部</option>
              <option value="采购部">采购部</option>
              <option value="营销部">营销部</option>
              <option value="质控部">质控部</option>
              <option value="生产车间">生产车间</option>
              <option value="工程部">工程部</option>
              <option value="交付中心">交付中心</option>
              <option value="财务部">财务部</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">角色 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="role" required>
              <option value="">请选择角色</option>
              <option value="admin">管理员</option>
              <option value="manager">项目经理</option>
              <option value="engineering_supervisor">工程主管</option>
              <option value="delivery_director">交付总监</option>
              <option value="marketing_director">营销总监</option>
              <option value="marketing_rep">营销代表</option>
              <option value="rd_director">研发总监</option>
              <option value="tech_support">技术支持</option>
              <option value="other">其它</option>
              <option value="member" selected>成员</option>
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

// 生成用户名（基于姓名）
function generateUsername() {
  const nameInput = document.getElementById('memberUsername');
  if (nameInput && (nameInput.value === '' || !nameInput.dataset.init)) {
    const name = nameInput?.value || '';
    // 简单的拼音转换
    const pinyinMap = {
      '张': 'zhang', '李': 'li', '王': 'wang', '刘': 'liu', '陈': 'chen', '杨': 'yang',
      '赵': 'zhao', '黄': 'huang', '周': 'zhou', '吴': 'wu', '徐': 'xu', '孙': 'sun',
      '胡': 'hu', '朱': 'zhu', '高': 'gao', '林': 'lin', '何': 'he', '郭': 'guo',
      '马': 'ma', '罗': 'luo', '梁': 'liang', '宋': 'song', '郑': 'zheng', '谢': 'xie',
      '韩': 'han', '唐': 'tang', '冯': 'feng', '于': 'yu', '董': 'dong', '萧': 'xiao',
      '程': 'cheng', '曹': 'cao', '袁': 'yuan', '邓': 'deng', '许': 'xu', '傅': 'fu',
      '沈': 'shen', '曾': 'zeng', '彭': 'peng', '吕': 'lv', '苏': 'su', '卢': 'lu',
      '蒋': 'jiang', '蔡': 'cai', '贾': 'jia', '丁': 'ding', '魏': 'wei', '薛': 'xue',
      '叶': 'ye', '阎': 'yan', '余': 'yu', '潘': 'pan', '杜': 'du', '戴': 'dai',
      '夏': 'xia', '钟': 'zhong', '汪': 'wang', '田': 'tian', '任': 'ren', '姜': 'jiang',
      '范': 'fan', '方': 'fang', '石': 'shi', '姚': 'yao', '谭': 'tan', '廖': 'liao',
      '邹': 'zou', '熊': 'xiong', '金': 'jin', '陆': 'lu', '郝': 'hao', '孔': 'kong',
      '白': 'bai', '崔': 'cui', '康': 'kang', '毛': 'mao', '邱': 'qiu', '秦': 'qin',
      '江': 'jiang', '史': 'shi', '顾': 'gu', '侯': 'hou', '邵': 'shao', '孟': 'meng',
      '龙': 'long', '万': 'wan', '段': 'duan', '漕': 'cao', '钱': 'qian', '汤': 'tang',
      '尹': 'yin', '黎': 'li', '易': 'yi', '常': 'chang', '武': 'wu', '乔': 'qiao',
      '贺': 'he', '赖': 'lai', '龚': 'gong', '文': 'wen', '庞': 'pang', '樊': 'fan',
      '兰': 'lan', '殷': 'yin', '施': 'shi', '陶': 'tao', '洪': 'hong', '翟': 'zhai',
      '安': 'an', '欧阳': 'ouyang', '上官': 'shangguan', '司马': 'sima',
      '公孙': 'gongsun', '诸葛': 'zhuge', '慕容': 'murang', '东方': 'dongfang',
      '南宫': 'nangong', '西门': 'ximen', '夏侯': 'xiahou', '皇甫': 'huangfu'
    };
    
    if (name.length >= 2) {
      let username = '';
      for (let i = 0; i < Math.min(name.length, 2); i++) {
        const char = name[i];
        if (pinyinMap[char]) {
          username += pinyinMap[char];
        }
      }
      if (username) {
        const num = Math.floor(Math.random() * 90) + 10;
        nameInput.value = username + num;
        nameInput.dataset.init = 'true';
      }
    }
  }
}

// 切换密码可见性
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + 'Icon');
  if (input && icon) {
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'fas fa-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'fas fa-eye';
    }
  }
}

function handleCreateMember() {
  const form = document.getElementById('createMemberForm');
  const formData = new FormData(form);
  
  const data = {
    name: formData.get('name'),
    username: formData.get('username'),
    password: formData.get('password'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    department: formData.get('department'),
    role: formData.get('role'),
    avatar: ''
  };
  
  // 验证用户名是否已存在
  const state = store.getState();
  const existingUser = state.users.find(u => u.username === data.username);
  if (existingUser) {
    alert('用户名已存在，请使用其他用户名');
    return;
  }
  
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
    message: `${data.name}已成功添加到团队，登录用户名：${data.username}`
  });
}

function showEditMemberModal(userId) {
  const user = store.getUserById(userId);
  if (!user) return;
  
  // 权限分组
  const permissionGroups = {
    project: {
      name: '项目管理',
      icon: 'fa-folder-open',
      permissions: [
        { key: 'projectManagement', name: '项目总览', desc: '访问项目管理模块' },
        { key: 'projectCreate', name: '创建项目', desc: '创建新项目' },
        { key: 'projectEdit', name: '编辑项目', desc: '修改项目信息' },
        { key: 'projectDelete', name: '删除项目', desc: '删除项目' }
      ]
    },
    task: {
      name: '任务管理',
      icon: 'fa-tasks',
      permissions: [
        { key: 'taskView', name: '查看任务', desc: '查看任务列表' },
        { key: 'taskCreate', name: '创建任务', desc: '创建新任务' },
        { key: 'taskEdit', name: '编辑任务', desc: '修改任务信息' },
        { key: 'taskComplete', name: '完成任务', desc: '标记任务完成' },
        { key: 'taskAssign', name: '分配任务', desc: '指派任务给他人' }
      ]
    },
    resource: {
      name: '文档资源',
      icon: 'fa-file-alt',
      permissions: [
        { key: 'resourceUpload', name: '上传资料', desc: '上传文件资料' },
        { key: 'resourceDownload', name: '下载资料', desc: '下载文件资料' },
        { key: 'resourceDelete', name: '删除资料', desc: '删除文件资料' }
      ]
    },
    user: {
      name: '人员管理',
      icon: 'fa-users',
      permissions: [
        { key: 'userView', name: '查看成员', desc: '查看团队成员' },
        { key: 'userCreate', name: '添加成员', desc: '添加新成员' },
        { key: 'userEdit', name: '编辑成员', desc: '修改成员信息' },
        { key: 'userDelete', name: '删除成员', desc: '删除成员' },
        { key: 'userPermission', name: '权限管理', desc: '管理成员权限' }
      ]
    },
    system: {
      name: '系统管理',
      icon: 'fa-cog',
      permissions: [
        { key: 'systemSettings', name: '系统设置', desc: '访问系统设置' },
        { key: 'systemSync', name: '数据同步', desc: '管理云端数据同步' },
        { key: 'systemBackup', name: '数据备份', desc: '备份和恢复数据' }
      ]
    },
    report: {
      name: '统计报表',
      icon: 'fa-chart-bar',
      permissions: [
        { key: 'reportView', name: '查看报表', desc: '查看统计报表' },
        { key: 'reportExport', name: '导出报表', desc: '导出报表数据' }
      ]
    },
    expense: {
      name: '费用管理',
      icon: 'fa-money-bill',
      permissions: [
        { key: 'expenseView', name: '查看费用', desc: '查看费用记录' },
        { key: 'expenseCreate', name: '添加费用', desc: '添加费用记录' },
        { key: 'expenseEdit', name: '编辑费用', desc: '修改费用记录' },
        { key: 'expenseApprove', name: '审批费用', desc: '审批费用支出' }
      ]
    }
  };
  
  // 角色配置
  const roleConfigs = {
    admin: { name: '系统管理员', color: '#dc2626', icon: 'fa-crown', desc: '拥有系统全部权限' },
    manager: { name: '项目经理', color: '#7c3aed', icon: 'fa-user-tie', desc: '管理项目和任务' },
    member: { name: '普通成员', color: '#3b82f6', icon: 'fa-user', desc: '基本操作权限' },
    viewer: { name: '访客', color: '#6b7280', icon: 'fa-eye', desc: '只读权限' }
  };
  
  const permissions = user.permissions || {};
  
  // 生成权限分组HTML
  const permissionGroupsHtml = Object.entries(permissionGroups).map(([groupKey, group]) => `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
        <i class="fas ${group.icon}" style="color: #3b82f6; width: 18px;"></i>
        <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${group.name}</span>
        <span style="margin-left: auto; font-size: 12px; color: #94a3b8;">
          <span id="${groupKey}Count">0</span>/${group.permissions.length}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
        ${group.permissions.map(p => `
          <label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: #f8fafc; border-radius: 8px; cursor: pointer; border: 1px solid #e2e8f0; transition: all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e2e8f0'" data-group="${groupKey}">
            <input type="checkbox" name="permissions" value="${p.key}" ${permissions[p.key] ? 'checked' : ''} onchange="updatePermissionCount('${groupKey}'); updateSelectAllState();" style="margin-top: 2px;">
            <div>
              <div style="font-size: 13px; font-weight: 500; color: #374151;">${p.name}</div>
              <div style="font-size: 11px; color: #94a3b8;">${p.desc}</div>
            </div>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  // 生成角色选项HTML
  const roleOptionsHtml = Object.entries(roleConfigs).map(([key, config]) => `
    <option value="${key}" ${user.role === key ? 'selected' : ''} data-color="${config.color}" data-icon="${config.icon}">
      ${config.name}
    </option>
  `).join('');
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑成员</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editMemberModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editMemberForm">
          <input type="hidden" name="id" value="${user.id}">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">姓名 <span style="color: red;">*</span></label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${user.name}">
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">登录用户名 <span style="color: red;">*</span></label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="username" required value="${user.username || ''}" placeholder="用于登录系统">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">当前密码</label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="flex: 1; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f8fafc; color: #374151;">${user.password || '未设置'}</span>
              <button type="button" onclick="showChangePasswordModal('${user.id}')" style="padding: 10px 16px; font-size: 13px; background: #f59e0b; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap;">
                <i class="fas fa-key"></i> 修改密码
              </button>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">邮箱 <span style="color: red;">*</span></label>
              <input type="email" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="email" required value="${user.email}">
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">电话</label>
              <input type="tel" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="phone" value="${user.phone || ''}">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">部门</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="department">
                <option value="">请选择部门</option>
                <option value="总经办" ${user.department === '总经办' ? 'selected' : ''}>总经办</option>
                <option value="研发部" ${user.department === '研发部' ? 'selected' : ''}>研发部</option>
                <option value="营销部" ${user.department === '营销部' ? 'selected' : ''}>营销部</option>
                <option value="交付部" ${user.department === '交付部' ? 'selected' : ''}>交付部</option>
                <option value="技术部" ${user.department === '技术部' ? 'selected' : ''}>技术部</option>
                <option value="采购部" ${user.department === '采购部' ? 'selected' : ''}>采购部</option>
                <option value="财务部" ${user.department === '财务部' ? 'selected' : ''}>财务部</option>
              </select>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">角色 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="role" required onchange="onRoleChange(this.value)">
                ${roleOptionsHtml}
              </select>
            </div>
          </div>
          
          <!-- 角色权限预览 -->
          <div id="rolePreview" style="margin-top: 16px; padding: 12px 16px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; border-left: 4px solid #3b82f6;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
              <span style="font-size: 13px; font-weight: 500; color: #1e40af;">角色说明</span>
            </div>
            <div id="roleDesc" style="font-size: 12px; color: #64748b;">选择角色将自动配置对应权限</div>
          </div>
          
          <!-- 权限设置 -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">权限设置</h4>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 13px; color: #64748b;">
                  已选 <span id="totalPermCount" style="color: #3b82f6; font-weight: 600;">0</span> 项权限
                </span>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 12px; background: #f1f5f9; border-radius: 6px;">
                  <input type="checkbox" id="selectAllPerms" onchange="toggleAllPermissions(this.checked)" style="accent-color: #3b82f6;">
                  <span style="font-size: 13px; color: #374151;">全选</span>
                </label>
              </div>
            </div>
            ${permissionGroupsHtml}
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
  
  // 初始化
  setTimeout(() => {
    // 初始化权限计数
    Object.keys(permissionGroups).forEach(groupKey => updatePermissionCount(groupKey));
    updateTotalPermCount();
    updateRolePreview(user.role);
    updateSelectAllState();
  }, 100);
}

// 更新分组权限计数
function updatePermissionCount(groupKey) {
  const countEl = document.getElementById(groupKey + 'Count');
  if (countEl) {
    const checked = document.querySelectorAll(`input[name="permissions"][data-group="${groupKey}"]:checked`).length;
    countEl.textContent = checked;
    countEl.style.color = checked > 0 ? '#3b82f6' : '#94a3b8';
  }
}

// 更新总权限计数
function updateTotalPermCount() {
  const countEl = document.getElementById('totalPermCount');
  if (countEl) {
    const checked = document.querySelectorAll('input[name="permissions"]:checked').length;
    countEl.textContent = checked;
  }
}

// 更新角色预览
function updateRolePreview(role) {
  const descEl = document.getElementById('roleDesc');
  if (!descEl) return;
  
  const roleDescriptions = {
    admin: '管理员拥有系统全部权限，可以管理所有模块和数据，包括用户权限管理。',
    manager: '项目经理可以管理项目、任务和资源，可以创建项目、分配任务、查看报表。',
    member: '普通成员可以查看项目、创建和完成任务、上传下载资源、管理自己的费用。',
    viewer: '访客只有只读权限，可以查看项目和任务，不能进行任何修改操作。'
  };
  
  descEl.textContent = roleDescriptions[role] || '选择角色将自动配置对应权限';
}

// 全选/取消全选权限
function toggleAllPermissions(checked) {
  const checkboxes = document.querySelectorAll('input[name="permissions"]');
  checkboxes.forEach(cb => cb.checked = checked);
  Object.keys({project:1, task:1, resource:1, user:1, system:1, report:1, expense:1}).forEach(groupKey => updatePermissionCount(groupKey));
  updateTotalPermCount();
}

// 更新全选状态
function updateSelectAllState() {
  const checkboxes = document.querySelectorAll('input[name="permissions"]');
  const selectAll = document.getElementById('selectAllPerms');
  if (selectAll) {
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const someChecked = Array.from(checkboxes).some(cb => cb.checked);
    selectAll.checked = allChecked;
    selectAll.indeterminate = someChecked && !allChecked;
  }
  updateTotalPermCount();
}

// 角色变更时更新权限
function onRoleChange(role) {
  updateRolePreview(role);
  
  const checkboxes = document.querySelectorAll('input[name="permissions"]');
  const selectAll = document.getElementById('selectAllPerms');
  
  // 角色权限配置
  const rolePermissions = {
    admin: ['projectManagement', 'projectCreate', 'projectEdit', 'projectDelete', 'taskView', 'taskCreate', 'taskEdit', 'taskComplete', 'taskAssign', 'resourceUpload', 'resourceDownload', 'resourceDelete', 'userView', 'userCreate', 'userEdit', 'userDelete', 'userPermission', 'systemSettings', 'systemSync', 'systemBackup', 'reportView', 'reportExport', 'expenseView', 'expenseCreate', 'expenseEdit', 'expenseApprove'],
    manager: ['projectManagement', 'projectCreate', 'projectEdit', 'taskView', 'taskCreate', 'taskEdit', 'taskComplete', 'taskAssign', 'resourceUpload', 'resourceDownload', 'userView', 'reportView', 'expenseView', 'expenseCreate', 'expenseEdit'],
    member: ['projectManagement', 'taskView', 'taskCreate', 'taskEdit', 'taskComplete', 'resourceUpload', 'resourceDownload', 'expenseView', 'expenseCreate'],
    viewer: ['projectManagement', 'taskView', 'resourceDownload', 'reportView']
  };
  
  const allowedPerms = rolePermissions[role] || [];
  
  checkboxes.forEach(cb => {
    if (role === 'admin') {
      cb.checked = true;
    } else {
      cb.checked = allowedPerms.includes(cb.value);
    }
  });
  
  if (selectAll) selectAll.checked = role === 'admin';
  Object.keys({project:1, task:1, resource:1, user:1, system:1, report:1, expense:1}).forEach(groupKey => updatePermissionCount(groupKey));
  updateTotalPermCount();
}

// 显示修改密码模态框
function showChangePasswordModal(userId) {
  const user = store.getUserById(userId);
  if (!user) return;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 400px; width: 95%; position: relative; z-index: 100001;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">修改密码 - ${user.name}</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('changePasswordModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="changePasswordForm">
          <input type="hidden" name="userId" value="${user.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">新密码 <span style="color: red;">*</span></label>
            <div style="position: relative;">
              <input type="password" style="width: 100%; padding: 11px 40px 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="newPassword" id="newPasswordInput" required placeholder="请输入新密码" minlength="4">
              <button type="button" onclick="togglePasswordVisibility('newPasswordInput')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px;">
                <i class="fas fa-eye" id="newPasswordInputIcon"></i>
              </button>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">确认密码 <span style="color: red;">*</span></label>
            <div style="position: relative;">
              <input type="password" style="width: 100%; padding: 11px 40px 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="confirmPassword" id="confirmPasswordInput" required placeholder="请再次输入新密码" minlength="4">
              <button type="button" onclick="togglePasswordVisibility('confirmPasswordInput')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px;">
                <i class="fas fa-eye" id="confirmPasswordInputIcon"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('changePasswordModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleChangePassword()">确认修改</button>
      </div>
    </div>
  `;
  
  showModal('changePasswordModal', contentHtml);
}

// 处理修改密码
function handleChangePassword() {
  const form = document.getElementById('changePasswordForm');
  const formData = new FormData(form);
  
  const userId = formData.get('userId');
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');
  
  if (!newPassword || newPassword.length < 4) {
    alert('密码长度不能少于4位');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('两次输入的密码不一致');
    return;
  }
  
  store.updateMember(userId, { password: newPassword });
  closeModal('changePasswordModal');
  closeModal('editMemberModal');
  renderContent();
  store.addNotification({
    type: 'success',
    title: '密码修改成功',
    message: '成员登录密码已成功修改'
  });
}

function handleEditMember() {
  const form = document.getElementById('editMemberForm');
  const formData = new FormData(form);
  
  const userId = formData.get('id');
  const newUsername = formData.get('username');
  
  // 检查用户名是否与其他用户重复
  const state = store.getState();
  const existingUser = state.users.find(u => u.username === newUsername && u.id !== userId);
  if (existingUser) {
    alert('用户名已存在，请使用其他用户名');
    return;
  }
  
  // 收集权限数据
  const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]:checked');
  const permissions = {};
  permissionCheckboxes.forEach(cb => {
    permissions[cb.value] = true;
  });
  
  const data = {
    name: formData.get('name'),
    username: newUsername,
    email: formData.get('email'),
    phone: formData.get('phone'),
    department: formData.get('department'),
    role: formData.get('role'),
    permissions: permissions
  };
  
  const validation = Validate.validateMember(data);
  if (!validation.isValid) {
    alert(Object.values(validation.errors)[0]);
    return;
  }
  
  store.updateMember(userId, data);
  closeModal('editMemberModal');
  renderContent();
  store.addNotification({
    type: 'success',
    title: '成员信息已更新',
    message: `${data.name}的信息已成功保存`
  });
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
