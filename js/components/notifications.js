function renderNotifications() {
  const state = store.getState();
  const notifications = state.notifications;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">通知中心</h1>
        <p class="page-description">查看和管理所有系统通知</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-secondary" onclick="markAllAsRead()">
          <i class="fas fa-check-double"></i>
          全部标记为已读
        </button>
        <button class="btn btn-danger" onclick="clearAllNotifications()">
          <i class="fas fa-trash-alt"></i>
          清除所有
        </button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-bell"></i>
          </div>
        </div>
        <div class="stat-card-value">${notifications.length}</div>
        <div class="stat-card-label">总通知</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-bell-slash"></i>
          </div>
        </div>
        <div class="stat-card-value">${notifications.filter(n => !n.read).length}</div>
        <div class="stat-card-label">未读</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${notifications.filter(n => n.read).length}</div>
        <div class="stat-card-label">已读</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">类型筛选</label>
          <select class="form-input" id="notificationTypeFilter" onchange="filterNotifications()">
            <option value="">全部类型</option>
            <option value="success">成功</option>
            <option value="info">信息</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="notificationStatusFilter" onchange="filterNotifications()">
            <option value="">全部状态</option>
            <option value="unread">未读</option>
            <option value="read">已读</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1fr; gap: 16px;" id="notificationsGrid">
      ${renderNotificationCards(notifications)}
    </div>
  `;
  
  return html;
}

function renderNotificationCards(notifications) {
  if (notifications.length === 0) {
    return `
      <div class="card" style="padding: 48px; text-align: center;">
        <i class="fas fa-inbox" style="font-size: 64px; color: var(--text-tertiary); margin-bottom: 16px;"></i>
        <h3 style="color: var(--text-secondary); margin-bottom: 8px;">暂无通知</h3>
        <p style="color: var(--text-tertiary);">您目前没有收到任何通知</p>
      </div>
    `;
  }
  
  return notifications.map(notification => {
    const typeIcon = getNotificationTypeIcon(notification.type);
    const typeColor = getNotificationTypeColor(notification.type);
    const typeBg = getNotificationTypeBg(notification.type);
    
    return `
      <div class="card notification-card" style="padding: 20px; border-left: 4px solid ${typeColor}; ${!notification.read ? 'background: var(--primary-color)08;' : ''}">
        <div style="display: flex; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${typeBg}; color: ${typeColor}; flex-shrink: 0;">
            <i class="${typeIcon}" style="font-size: 20px;"></i>
          </div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">${notification.title}</h3>
              <span style="font-size: 12px; color: var(--text-tertiary); flex-shrink: 0; margin-left: 16px;">${formatNotificationTime(notification.time)}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 12px; line-height: 1.5;">${notification.message}</p>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              ${!notification.read ? `
                <button class="btn btn-secondary btn-sm" onclick="markAsRead('${notification.id}')">
                  <i class="fas fa-check"></i>
                  标记为已读
                </button>
              ` : ''}
              <button class="btn btn-danger btn-sm" onclick="deleteNotification('${notification.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterNotifications() {
  const state = store.getState();
  let notifications = [...state.notifications];
  
  const typeFilter = document.getElementById('notificationTypeFilter')?.value;
  const statusFilter = document.getElementById('notificationStatusFilter')?.value;
  
  if (typeFilter) {
    notifications = notifications.filter(n => n.type === typeFilter);
  }
  
  if (statusFilter === 'unread') {
    notifications = notifications.filter(n => !n.read);
  } else if (statusFilter === 'read') {
    notifications = notifications.filter(n => n.read);
  }
  
  const grid = document.getElementById('notificationsGrid');
  if (grid) {
    grid.innerHTML = renderNotificationCards(notifications);
  }
}

function getNotificationTypeIcon(type) {
  const iconMap = {
    'success': 'fas fa-check-circle',
    'info': 'fas fa-info-circle',
    'warning': 'fas fa-exclamation-triangle',
    'error': 'fas fa-times-circle'
  };
  return iconMap[type] || 'fas fa-bell';
}

function getNotificationTypeColor(type) {
  const colorMap = {
    'success': '#10b981',
    'info': '#3b82f6',
    'warning': '#f59e0b',
    'error': '#ef4444'
  };
  return colorMap[type] || '#64748b';
}

function getNotificationTypeBg(type) {
  const bgMap = {
    'success': '#10b98115',
    'info': '#3b82f615',
    'warning': '#f59e0b15',
    'error': '#ef444415'
  };
  return bgMap[type] || '#64748b15';
}

function formatNotificationTime(timeStr) {
  if (!timeStr) return '';
  
  const time = new Date(timeStr);
  const now = new Date();
  const diff = now - time;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return time.toLocaleDateString('zh-CN');
}

function markAsRead(notificationId) {
  store.markNotificationAsRead(notificationId);
  renderContent();
}

function markAllAsRead() {
  store.markAllNotificationsAsRead();
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '操作成功',
    message: '所有通知已标记为已读'
  });
}

function deleteNotification(notificationId) {
  const state = store.getState();
  const notification = state.notifications.find(n => n.id === notificationId);
  
  if (notification) {
    store.deleteNotification(notificationId);
    renderContent();
  }
}

function clearAllNotifications() {
  if (confirm('确定要清除所有通知吗？')) {
    store.clearNotifications();
    renderContent();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderNotifications };
}
