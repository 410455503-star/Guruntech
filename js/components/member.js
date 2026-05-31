function renderMembers() {
  const state = store.getState();
  const users = state.users;
  
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
    
    <div class="member-grid">
      ${users.map(user => renderMemberCard(user)).join('')}
    </div>
  `;
  
  return html;
}

function renderMemberCard(user) {
  const taskStats = store.getUserTasksStats(user.id);
  
  const html = `
    <div class="member-card fade-in">
      <div class="member-avatar">
        ${getInitials(user.name)}
      </div>
      <div class="member-name">${user.name}</div>
      <div class="member-role">${getRoleName(user.role)}</div>
      
      <div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <i class="fas fa-envelope" style="color: var(--text-secondary);"></i>
          <span class="text-sm truncate" style="flex: 1;">${user.email}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <i class="fas fa-phone" style="color: var(--text-secondary);"></i>
          <span class="text-sm">${user.phone || '未设置'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-building" style="color: var(--text-secondary);"></i>
          <span class="text-sm">${user.department || '未设置'}</span>
        </div>
      </div>
      
      <div class="member-stats">
        <div class="member-stat">
          <div class="member-stat-value">${taskStats.total}</div>
          <div class="member-stat-label">总任务</div>
        </div>
        <div class="member-stat">
          <div class="member-stat-value" style="color: var(--success-color);">${taskStats.completed}</div>
          <div class="member-stat-label">已完成</div>
        </div>
        <div class="member-stat">
          <div class="member-stat-value" style="color: var(--warning-color);">${taskStats.inProgress}</div>
          <div class="member-stat-label">进行中</div>
        </div>
      </div>
      
      <div class="member-actions">
        <button class="btn btn-secondary btn-sm" onclick="showEditMemberModal('${user.id}')">
          <i class="fas fa-edit"></i>
          编辑
        </button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteMember('${user.id}')">
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
