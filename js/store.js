class Store {
  constructor() {
    this.state = {
      currentUser: null,
      users: [],
      projects: [],
      tasks: [],
      documents: [],
      notifications: [],
      statistics: {},
      resources: [],
      milestones: [],
      risks: [],
      issues: [],
      progressReports: [],
      dailyLogs: [],
      warnings: [],
      scheduleChanges: [],
      budgets: [],
      payments: [],
      materials: [],
      afterSales: [],
      temporaryWorkers: [],
      workerAttendance: [],
      dashboardData: {},
      taskStatusConfig: [],
      systemSettings: {},
      customForms: [],
      customFields: [],
      expenses: [],
      cameras: [],
      loading: false,
      error: null,
      currentRoute: 'dashboard',
      currentProjectId: null,
      searchQuery: '',
      filterStatus: 'all',
      filterPriority: 'all',
      darkMode: false,
      isLoggedIn: false
    };
    
    this.listeners = [];
    this._onSave = null;
    this._pendingDeletions = {};
    this._loadPendingDeletions();
    this._skipSyncNotify = false;
    this.init();
  }
  
  _loadPendingDeletions() {
    try {
      const saved = Storage.get('pendingDeletions', null);
      if (saved && typeof saved === 'object') {
        this._pendingDeletions = saved;
      }
    } catch (e) {
      this._pendingDeletions = {};
    }
  }
  
  _recordDeletion(tableName, id) {
    if (!this._pendingDeletions[tableName]) {
      this._pendingDeletions[tableName] = [];
    }
    if (!this._pendingDeletions[tableName].includes(id)) {
      this._pendingDeletions[tableName].push(id);
      this._savePendingDeletions();
    }
  }
  
  _savePendingDeletions() {
    try {
      Storage.set('pendingDeletions', this._pendingDeletions);
    } catch (e) {
      console.warn('[Store] 保存待删除列表失败', e);
    }
  }
  
  popPendingDeletions() {
    // 深拷贝：每张表的ID数组也需复制
    const deletions = {};
    for (const [table, ids] of Object.entries(this._pendingDeletions)) {
      deletions[table] = [...ids];
    }
    this._pendingDeletions = {};
    this._savePendingDeletions();
    return deletions;
  }
  
  onSave(callback) {
    this._onSave = callback;
  }
  
  init() {
    const DATA_VERSION = 'v2.12';
    const storedVersion = Storage.get('dataVersion', null);
    const hasStoredData = Storage.get('store', null);
    
    if (hasStoredData && storedVersion === DATA_VERSION) {
      this.loadFromStorage();
      this._migrateAdminPassword();
    } else {
      this.loadMockData();
      Storage.set('dataVersion', DATA_VERSION);
    }
  }
  
  _migrateAdminPassword() {
    const migrated = Storage.get('migratedAdminPassword', false);
    if (migrated) return;
    
    const admin = this.state.users.find(u => u.username === 'admin');
    if (admin) {
      admin.password = '9898998';
      this.saveToStorage();
      Storage.set('migratedAdminPassword', true);
      console.log('[Store] Admin密码已迁移为9898998');
    }
  }
  
  loadMockData() {
    this.state.users = [...MockData.users];
    this.state.projects = [...MockData.projects];
    this.state.tasks = [...MockData.tasks];
    this.state.documents = [...MockData.documents];
    this.state.notifications = [...MockData.notifications];
    this.state.statistics = {...MockData.statistics};
    this.state.resources = [...(MockData.resources || [])];
    this.state.milestones = [...(MockData.milestones || [])];
    this.state.risks = [...(MockData.risks || [])];
    this.state.issues = [...(MockData.issues || [])];
    this.state.progressReports = [...(MockData.progressReports || [])];
    this.state.dailyLogs = [...(MockData.dailyLogs || [])];
    this.state.warnings = [...(MockData.warnings || [])];
    this.state.scheduleChanges = [...(MockData.scheduleChanges || [])];
    this.state.budgets = [...(MockData.budgets || [])];
    this.state.payments = [...(MockData.payments || [])];
    this.state.materials = [...(MockData.materials || [])];
    this.state.afterSales = [...(MockData.afterSales || [])];
    this.state.temporaryWorkers = [...(MockData.temporaryWorkers || [])];
    this.state.workerAttendance = [...(MockData.workerAttendance || [])];
    this.state.cameras = [...(MockData.cameras || [])];
    this.state.dashboardData = {...(MockData.dashboardData || {})};
    this.state.taskStatusConfig = [...(MockData.taskStatusConfig || this.getDefaultTaskStatusConfig())];
    this.state.currentUser = this.state.users[0];
    this.state.isLoggedIn = true;
    this.saveToStorage();
  }
  
  _getCurrentUserId() {
    if (this.state.currentUser && this.state.currentUser.id) {
      return this.state.currentUser.id;
    }
    return 'unknown';
  }
  
  _canModifyData() {
    if (typeof cloudSync !== 'undefined' && cloudSync) {
      if (!cloudSync.isConfigured) {
        alert('未配置云端同步，禁止修改数据');
        return false;
      }
      if (!cloudSync.isOnline()) {
        alert('离线状态，禁止修改数据');
        return false;
      }
    }
    return true;
  }
  
  _getCurrentUserName() {
    if (this.state.currentUser && this.state.currentUser.name) {
      return this.state.currentUser.name;
    }
    if (this.state.currentUser && this.state.currentUser.username) {
      return this.state.currentUser.username;
    }
    return '未知用户';
  }
  
  getDefaultTaskStatusConfig() {
    return [
      { id: 'todo', name: '未开始', color: '#6b7280', icon: 'fa-circle', category: 'pending', editable: false, _version: 1 },
      { id: 'in_progress', name: '进行中', color: '#3b82f6', icon: 'fa-play', category: 'active', editable: false, _version: 1 },
      { id: 'paused', name: '暂停', color: '#f59e0b', icon: 'fa-pause', category: 'active', editable: false, _version: 1 },
      { id: 'delayed', name: '延迟', color: '#f97316', icon: 'fa-alarm-clock', category: 'active', editable: false, _version: 1 },
      { id: 'overdue', name: '逾期', color: '#ef4444', icon: 'fa-exclamation-triangle', category: 'active', editable: false, _version: 1 },
      { id: 'terminated', name: '终止', color: '#6b7280', icon: 'fa-stop', category: 'closed', editable: false, _version: 1 },
      { id: 'completed', name: '已完成', color: '#10b981', icon: 'fa-check-circle', category: 'closed', editable: false, _version: 1 },
      { id: 'cancelled', name: '已取消', color: '#9ca3af', icon: 'fa-times-circle', category: 'closed', editable: false, _version: 1 }
    ];
  }
  
  loadFromStorage() {
    const storedData = Storage.get('store', null);
    if (storedData) {
      this.state = {
        ...this.state,
        ...storedData,
        progressReports: storedData.progressReports || [],
        dailyLogs: storedData.dailyLogs || [],
        warnings: storedData.warnings || [],
        scheduleChanges: storedData.scheduleChanges || [],
        budgets: storedData.budgets || [],
        payments: storedData.payments || [],
        materials: storedData.materials || [],
        afterSales: storedData.afterSales || [],
        temporaryWorkers: storedData.temporaryWorkers || [],
        workerAttendance: storedData.workerAttendance || [],
        dashboardData: storedData.dashboardData || {},
        taskStatusConfig: storedData.taskStatusConfig || this.getDefaultTaskStatusConfig(),
        systemSettings: storedData.systemSettings || {},
        customForms: storedData.customForms || [],
        customFields: storedData.customFields || [],
        expenses: storedData.expenses || [],
        cameras: storedData.cameras || [],
        darkMode: storedData.darkMode !== undefined ? storedData.darkMode : this.state.darkMode,
        currentUser: storedData.currentUser || null,
        isLoggedIn: storedData.isLoggedIn !== undefined ? storedData.isLoggedIn : this.state.isLoggedIn
      };
    }
  }
  
  saveToStorage() {
    const dataToSave = {
      users: this.state.users,
      projects: this.state.projects,
      tasks: this.state.tasks,
      documents: this.state.documents,
      notifications: this.state.notifications,
      statistics: this.state.statistics,
      resources: this.state.resources,
      milestones: this.state.milestones,
      risks: this.state.risks,
      issues: this.state.issues,
      progressReports: this.state.progressReports,
      dailyLogs: this.state.dailyLogs,
      warnings: this.state.warnings,
      scheduleChanges: this.state.scheduleChanges,
      budgets: this.state.budgets,
      payments: this.state.payments,
      materials: this.state.materials,
      afterSales: this.state.afterSales,
      temporaryWorkers: this.state.temporaryWorkers,
      workerAttendance: this.state.workerAttendance,
      dashboardData: this.state.dashboardData,
      taskStatusConfig: this.state.taskStatusConfig,
      systemSettings: this.state.systemSettings,
      customForms: this.state.customForms,
      customFields: this.state.customFields,
      expenses: this.state.expenses,
      cameras: this.state.cameras,
      darkMode: this.state.darkMode,
      currentUser: this.state.currentUser,
      isLoggedIn: this.state.isLoggedIn
    };
    Storage.set('store', dataToSave);
    
    if (this._onSave && !this._skipSyncNotify) {
      console.log('[Store] saveToStorage: 触发 cloudSync');
      try {
        this._onSave(dataToSave);
      } catch (e) {
        console.error('[Store] saveToStorage: _onSave 回调失败', e);
      }
    }
  }
  
  saveToStorageSilent() {
    this._skipSyncNotify = true;
    try {
      this.saveToStorage();
    } finally {
      this._skipSyncNotify = false;
    }
  }
  
  getTaskStatusConfig() {
    return this.state.taskStatusConfig;
  }
  
  getTaskStatusById(statusId) {
    return this.state.taskStatusConfig.find(s => s.id === statusId);
  }
  
  getStatusName(statusId) {
    const status = this.getTaskStatusById(statusId);
    return status ? status.name : statusId;
  }
  
  getStatusColor(statusId) {
    const status = this.getTaskStatusById(statusId);
    return status ? status.color : '#6b7280';
  }
  
  addCustomStatus(statusData) {
    if (!this._canModifyData()) return null;
    const newStatus = {
      id: this.generateId('status'),
      _version: 1,
      ...statusData,
      editable: true,
      isCustom: true
    };
    this.state.taskStatusConfig.push(newStatus);
    this.saveToStorage();
    this.notify();
    return newStatus;
  }
  
  updateCustomStatus(statusId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.taskStatusConfig.findIndex(s => s.id === statusId && s.editable);
    if (index !== -1) {
      this.state.taskStatusConfig[index] = {
        ...this.state.taskStatusConfig[index],
        ...updates,
        _version: (this.state.taskStatusConfig[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.taskStatusConfig[index];
    }
    return null;
  }
  
  deleteCustomStatus(statusId) {
    if (!this._canModifyData()) return null;
    const index = this.state.taskStatusConfig.findIndex(s => s.id === statusId && s.editable);
    if (index !== -1) {
      const deletedStatus = this.state.taskStatusConfig[index];
      this._recordDeletion('task_status_config', statusId);
      this.state.taskStatusConfig.splice(index, 1);
      this.state.tasks.forEach(task => {
        if (task.status === statusId) {
          task.status = 'todo';
        }
      });
      this.saveToStorage();
      this.notify();
      return deletedStatus;
    }
    return null;
  }
  
  getStatusByCategory(category) {
    if (!category || category === 'all') {
      return this.state.taskStatusConfig;
    }
    return this.state.taskStatusConfig.filter(s => s.category === category);
  }
  
  isTaskOverdue(task) {
    if (!task || !task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
      return false;
    }
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) return false;
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    } catch (e) {
      return false;
    }
  }
  
  isTaskDelayed(task) {
    if (!task || task.status === 'completed' || task.status === 'cancelled') {
      return false;
    }
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (task.status === 'todo' && task.startDate) {
        const startDate = new Date(task.startDate);
        if (isNaN(startDate.getTime())) return false;
        startDate.setHours(0, 0, 0, 0);
        return startDate < today;
      }
      
      if (!task.dueDate) {
        return false;
      }
      const dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) return false;
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue > 0 && task.progress < 100;
    } catch (e) {
      return false;
    }
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
  
  setState(updates) {
    this.state = {...this.state, ...updates};
    this.notify();
    this.saveToStorage();
  }
  
  getState() {
    return this.state;
  }
  
  toggleDarkMode() {
    this.state.darkMode = !this.state.darkMode;
    this.notify();
    this.saveToStorage();
  }
  
  loadDarkMode() {
    const saved = Storage.get('darkMode', false);
    this.state.darkMode = saved;
    return saved;
  }
  
  login(username, password) {
    const user = this.state.users.find(u => u.username === username && u.password === password);
    if (user) {
      this.state.currentUser = user;
      this.state.isLoggedIn = true;
      this.saveToStorage();
      this.notify();
      return true;
    }
    return false;
  }
  
  logout() {
    this.state.currentUser = null;
    this.state.isLoggedIn = false;
    this.saveToStorage();
    this.notify();
  }
  
  isAuthenticated() {
    return this.state.isLoggedIn;
  }
  
  // ==================== 权限管理 ====================
  
  /**
   * 获取当前用户
   */
  getCurrentUser() {
    return this.state.currentUser;
  }
  
  /**
   * 获取当前用户的权限列表
   */
  getCurrentUserPermissions() {
    if (!this.state.currentUser) return [];
    if (typeof permissionManager !== 'undefined') {
      return permissionManager.getUserPermissions(this.state.currentUser);
    }
    // 兼容旧格式
    return this._getLegacyPermissions(this.state.currentUser);
  }
  
  /**
   * 检查当前用户是否有指定权限
   */
  hasPermission(permission) {
    if (!this.state.currentUser) return false;
    if (this.state.currentUser.role === 'admin') return true;
    if (typeof permissionManager !== 'undefined') {
      return permissionManager.hasPermission(this.state.currentUser, permission);
    }
    // 兼容旧格式
    const perms = this._getLegacyPermissions(this.state.currentUser);
    return perms.includes(permission) || perms.includes(true);
  }
  
  /**
   * 检查当前用户是否有任意一个权限
   */
  hasAnyPermission(permissions) {
    if (!this.state.currentUser) return false;
    if (this.state.currentUser.role === 'admin') return true;
    if (typeof permissionManager !== 'undefined') {
      return permissionManager.hasAnyPermission(this.state.currentUser, permissions);
    }
    return permissions.some(p => this.hasPermission(p));
  }
  
  /**
   * 检查当前用户是否有所有权限
   */
  hasAllPermissions(permissions) {
    if (!this.state.currentUser) return false;
    if (this.state.currentUser.role === 'admin') return true;
    if (typeof permissionManager !== 'undefined') {
      return permissionManager.hasAllPermissions(this.state.currentUser, permissions);
    }
    return permissions.every(p => this.hasPermission(p));
  }
  
  /**
   * 获取指定用户的权限列表
   */
  getUserPermissions(userId) {
    const user = this.getUserById(userId);
    if (!user) return [];
    if (typeof permissionManager !== 'undefined') {
      return permissionManager.getUserPermissions(user);
    }
    return this._getLegacyPermissions(user);
  }
  
  /**
   * 检查指定用户是否有指定权限
   */
  checkUserPermission(userId, permission) {
    const user = this.getUserById(userId);
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (typeof permissionManager !== 'undefined') {
      return permissionManager.hasPermission(user, permission);
    }
    const perms = this._getLegacyPermissions(user);
    return perms.includes(permission);
  }
  
  /**
   * 兼容旧格式权限
   */
  _getLegacyPermissions(user) {
    if (!user || !user.permissions) return [];
    const perms = [];
    for (const [key, value] of Object.entries(user.permissions)) {
      if (value === true) {
        perms.push(key);
      }
    }
    return perms;
  }
  
  /**
   * 检查是否有人员管理权限
   */
  canManageUsers() {
    return this.hasPermission('userManagement') || this.hasPermission(PERMISSIONS.USER_EDIT);
  }
  
  /**
   * 检查是否有系统设置权限
   */
  canAccessSettings() {
    return this.hasPermission('systemSettings') || this.hasPermission(PERMISSIONS.SYSTEM_SETTINGS);
  }
  
  /**
   * 检查是否可以创建项目
   */
  canCreateProject() {
    return this.hasPermission('projectCreate') || this.hasPermission(PERMISSIONS.PROJECT_CREATE);
  }
  
  /**
   * 检查是否可以编辑任务
   */
  canEditTask() {
    return this.hasPermission('taskEdit') || this.hasPermission(PERMISSIONS.TASK_EDIT);
  }
  
  /**
   * 清除权限缓存
   */
  clearPermissionCache() {
    if (typeof permissionManager !== 'undefined') {
      permissionManager.clearCache();
    }
  }
  
  loadLoginState() {
    const savedUser = Storage.get('currentUser', null);
    if (savedUser) {
      this.state.currentUser = savedUser;
      this.state.isLoggedIn = true;
    }
    return this.state.isLoggedIn;
  }
  
  generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
  
  getUserById(userId) {
    return this.state.users.find(u => u.id === userId);
  }
  
  getProjectById(projectId) {
    return this.state.projects.find(p => p.id === projectId);
  }
  
  getTaskById(taskId) {
    return this.state.tasks.find(t => t.id === taskId);
  }

  getCameraById(cameraId) {
    return this.state.cameras.find(c => c.id === cameraId);
  }

  getCamerasByProject(projectId) {
    return this.state.cameras.filter(c => c.projectId === projectId);
  }

  addCamera(cameraData) {
    if (!this._canModifyData()) return null;
    const camera = {
      id: this.generateId('cam'),
      _version: 1,
      ...cameraData,
      createdAt: new Date().toISOString()
    };
    this.state.cameras.push(camera);
    this.saveToStorage();
    this.notify();
    return camera;
  }

  updateCamera(cameraId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.cameras.findIndex(c => c.id === cameraId);
    if (index !== -1) {
      this.state.cameras[index] = {
        ...this.state.cameras[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        _version: (this.state.cameras[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.cameras[index];
    }
    return null;
  }

  deleteCamera(cameraId) {
    if (!this._canModifyData()) return false;
    const index = this.state.cameras.findIndex(c => c.id === cameraId);
    if (index !== -1) {
      this._recordDeletion('cameras', cameraId);
      this.state.cameras.splice(index, 1);
      this.saveToStorage();
      this.notify();
      return true;
    }
    return false;
  }
  
  getTasksByProject(projectId) {
    return this.state.tasks.filter(t => t.projectId === projectId);
  }
  
  getTasksByUser(userId) {
    return this.state.tasks.filter(t => t.assigneeId === userId);
  }
  
  addProject(projectData) {
    if (!this._canModifyData()) return null;
    
    const project = {
      id: this.generateId('proj'),
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: this._getCurrentUserId(),
      _version: 1
    };
    this.state.projects.push(project);
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
    return project;
  }
  
  updateProject(projectId, updates) {
    if (!this._canModifyData()) return null;
    
    const index = this.state.projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      this.state.projects[index] = {
        ...this.state.projects[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: this._getCurrentUserId(),
        _version: (this.state.projects[index]._version || 0) + 1
      };
      this.updateStatistics();
      this.saveToStorage();
      this.notify();
      return this.state.projects[index];
    }
    return null;
  }
  
  deleteProject(projectId) {
    if (!this._canModifyData()) return null;
    
    this._recordDeletion('projects', projectId);
    
    const relatedTasks = this.state.tasks.filter(t => t.projectId === projectId);
    relatedTasks.forEach(t => this._recordDeletion('tasks', t.id));
    
    const relatedDocs = this.state.documents.filter(d => d.projectId === projectId);
    relatedDocs.forEach(d => this._recordDeletion('documents', d.id));
    
    const relatedResources = this.state.resources.filter(r => r.projectId === projectId);
    relatedResources.forEach(r => this._recordDeletion('resources', r.id));
    const relatedMilestones = this.state.milestones.filter(m => m.projectId === projectId);
    relatedMilestones.forEach(m => this._recordDeletion('milestones', m.id));
    const relatedRisks = this.state.risks.filter(r => r.projectId === projectId);
    relatedRisks.forEach(r => this._recordDeletion('risks', r.id));
    const relatedIssues = this.state.issues.filter(i => i.projectId === projectId);
    relatedIssues.forEach(i => this._recordDeletion('issues', i.id));
    const relatedReports = this.state.progressReports.filter(r => r.projectId === projectId);
    relatedReports.forEach(r => this._recordDeletion('progress_reports', r.id));
    const relatedLogs = this.state.dailyLogs.filter(l => l.projectId === projectId);
    relatedLogs.forEach(l => this._recordDeletion('daily_logs', l.id));
    const relatedBudgets = this.state.budgets.filter(b => b.projectId === projectId);
    relatedBudgets.forEach(b => this._recordDeletion('budgets', b.id));
    const relatedPayments = this.state.payments.filter(p => p.projectId === projectId);
    relatedPayments.forEach(p => this._recordDeletion('payments', p.id));
    const relatedMaterials = this.state.materials.filter(m => m.projectId === projectId);
    relatedMaterials.forEach(m => this._recordDeletion('materials', m.id));
    const relatedExpenses = this.state.expenses.filter(e => e.projectId === projectId);
    relatedExpenses.forEach(e => this._recordDeletion('expenses', e.id));
    const relatedAfterSales = this.state.afterSales.filter(a => a.projectId === projectId);
    relatedAfterSales.forEach(a => this._recordDeletion('after_sales', a.id));
    const relatedWorkers = this.state.temporaryWorkers.filter(w => w.projectId === projectId);
    relatedWorkers.forEach(w => this._recordDeletion('temporary_workers', w.id));
    const relatedAttendance = this.state.workerAttendance.filter(a => a.projectId === projectId);
    relatedAttendance.forEach(a => this._recordDeletion('worker_attendance', a.id));
    const relatedCameras = this.state.cameras.filter(c => c.projectId === projectId);
    relatedCameras.forEach(c => this._recordDeletion('cameras', c.id));
    
    this.state.projects = this.state.projects.filter(p => p.id !== projectId);
    this.state.tasks = this.state.tasks.filter(t => t.projectId !== projectId);
    this.state.documents = this.state.documents.filter(d => d.projectId !== projectId);
    this.state.resources = this.state.resources.filter(r => r.projectId !== projectId);
    this.state.milestones = this.state.milestones.filter(m => m.projectId !== projectId);
    this.state.risks = this.state.risks.filter(r => r.projectId !== projectId);
    this.state.issues = this.state.issues.filter(i => i.projectId !== projectId);
    this.state.progressReports = this.state.progressReports.filter(r => r.projectId !== projectId);
    this.state.dailyLogs = this.state.dailyLogs.filter(l => l.projectId !== projectId);
    this.state.budgets = this.state.budgets.filter(b => b.projectId !== projectId);
    this.state.payments = this.state.payments.filter(p => p.projectId !== projectId);
    this.state.materials = this.state.materials.filter(m => m.projectId !== projectId);
    this.state.expenses = this.state.expenses.filter(e => e.projectId !== projectId);
    this.state.afterSales = this.state.afterSales.filter(a => a.projectId !== projectId);
    this.state.temporaryWorkers = this.state.temporaryWorkers.filter(w => w.projectId !== projectId);
    this.state.workerAttendance = this.state.workerAttendance.filter(a => a.projectId !== projectId);
    this.state.cameras = this.state.cameras.filter(c => c.projectId !== projectId);
    
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
  }
  
  addTask(taskData) {
    if (!this._canModifyData()) return null;
    
    const task = {
      id: this.generateId('task'),
      ...taskData,
      order: this.state.tasks.filter(t => t.projectId === taskData.projectId).length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: this._getCurrentUserId(),
      _version: 1
    };
    this.state.tasks.push(task);
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
    return task;
  }
  
  updateTask(taskId, updates) {
    if (!this._canModifyData()) return null;
    
    const index = this.state.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.state.tasks[index] = {
        ...this.state.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: this._getCurrentUserId(),
        _version: (this.state.tasks[index]._version || 0) + 1
      };
      this.updateStatistics();
      this.saveToStorage();
      this.notify();
      return this.state.tasks[index];
    }
    return null;
  }
  
  deleteTask(taskId) {
    if (!this._canModifyData()) return null;
    
    this._recordDeletion('tasks', taskId);
    const childTasks = this.state.tasks.filter(t => t.parentId === taskId);
    childTasks.forEach(t => this._recordDeletion('tasks', t.id));
    
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId && t.parentId !== taskId);
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
  }
  
  checkTaskDependencies(taskId) {
    const task = this.getTaskById(taskId);
    if (!task) {
      return { canStart: true, blockedBy: [], incompleteDependencies: [] };
    }
    
    const bpmnResult = window.bpmnEngine?.checkTaskCanStart(taskId, this.state.tasks) || { canStart: true, blockedBy: [] };
    
    const oldStyleDeps = task.dependencies || [];
    const incompleteDependencies = oldStyleDeps
      .map(depId => this.getTaskById(depId))
      .filter(depTask => depTask && depTask.status !== 'completed');
    
    const allBlockedBy = [...bpmnResult.blockedBy, ...incompleteDependencies.map(dep => ({
      sourceTaskId: dep.id,
      sourceTaskName: dep.name,
      reason: `前置任务${dep.name}尚未完成`
    }))];
    
    return {
      canStart: bpmnResult.canStart && incompleteDependencies.length === 0,
      blockedBy: allBlockedBy,
      incompleteDependencies
    };
  }

  addSequenceFlow(sourceTaskId, targetTaskId, type = 'FS', condition = null) {
    if (window.bpmnEngine) {
      return window.bpmnEngine.addSequenceFlow(sourceTaskId, targetTaskId, type, condition);
    }
    return null;
  }

  removeSequenceFlow(flowId) {
    if (window.bpmnEngine) {
      return window.bpmnEngine.removeSequenceFlow(flowId);
    }
    return null;
  }

  getSequenceFlows() {
    return window.bpmnEngine?.sequenceFlows || [];
  }

  notifyTaskCompletion(taskId) {
    if (!window.bpmnEngine) return;
    
    const impactedTasks = window.bpmnEngine.checkTaskCompletionImpact(taskId, this.state.tasks);
    
    impactedTasks.forEach(impact => {
      this.addNotification({
        type: 'info',
        title: '任务解锁',
        message: `任务"${impact.taskName}"的前置条件已满足，可以开始执行`
      });
    });
  }

  updateTaskStatus(taskId, status) {
    const task = this.getTaskById(taskId);
    
    if (status === 'in_progress' && task) {
      const dependencyCheck = this.checkTaskDependencies(taskId);
      if (!dependencyCheck.canStart) {
        const reasons = dependencyCheck.blockedBy.map(b => b.reason).join('\n');
        throw new Error(`无法开始，前置任务未完成：\n\n${reasons}`);
      }
    }
    
    const result = this.updateTask(taskId, { status });
    
    if (status === 'completed' && result) {
      this.notifyTaskCompletion(taskId);
    }
    
    return result;
  }

  checkExpiringTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiringTasks = this.state.tasks.filter(task => {
      if (!task.dueDate || !task.alertBeforeDays || task.alertBeforeDays <= 0) return false;
      if (task.status === 'completed' || task.status === 'cancelled') return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      return daysUntilDue > 0 && daysUntilDue <= task.alertBeforeDays;
    });
    
    return expiringTasks;
  }
  
  updateTaskProgress(taskId, progress) {
    return this.updateTask(taskId, { progress });
  }
  
  addMember(memberData) {
    if (!this._canModifyData()) return null;
    const member = {
      id: this.generateId('user'),
      _version: 1,
      ...memberData,
      createdAt: new Date().toISOString()
    };
    this.state.users.push(member);
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
    return member;
  }
  
  updateMember(memberId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.users.findIndex(u => u.id === memberId);
    if (index !== -1) {
      this.state.users[index] = {
        ...this.state.users[index],
        ...updates,
        _version: (this.state.users[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.users[index];
    }
    return null;
  }
  
  deleteMember(memberId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('users', memberId);
    this.state.users = this.state.users.filter(u => u.id !== memberId);
    this.state.tasks.forEach(task => {
      if (task.assigneeId === memberId) {
        task.assigneeId = null;
        task.updatedAt = new Date().toISOString();
      }
    });
    this.state.projects.forEach(project => {
      project.members = project.members.filter(m => m !== memberId);
    });
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
  }
  
  addDocument(docData) {
    if (!this._canModifyData()) return null;
    const doc = {
      id: this.generateId('doc'),
      _version: 1,
      ...docData,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: this._getCurrentUserId()
    };
    this.state.documents.push(doc);
    this.saveToStorage();
    this.notify();
    return doc;
  }
  
  deleteDocument(docId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('documents', docId);
    this.state.documents = this.state.documents.filter(d => d.id !== docId);
    this.saveToStorage();
    this.notify();
  }
  
  addResource(resourceData) {
    if (!this._canModifyData()) return null;
    const resource = {
      id: this.generateId('res'),
      _version: 1,
      ...resourceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: this._getCurrentUserId()
    };
    this.state.resources.push(resource);
    this.saveToStorage();
    this.notify();
    return resource;
  }
  
  updateResource(resourceId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.resources.findIndex(r => r.id === resourceId);
    if (index !== -1) {
      this.state.resources[index] = {
        ...this.state.resources[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: this._getCurrentUserId(),
        _version: (this.state.resources[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.resources[index];
    }
    return null;
  }
  
  deleteResource(resourceId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('resources', resourceId);
    this.state.resources = this.state.resources.filter(r => r.id !== resourceId);
    this.saveToStorage();
    this.notify();
  }
  
  getResourcesByProject(projectId) {
    return this.state.resources.filter(r => r.projectId === projectId);
  }
  
  addMilestone(milestoneData) {
    if (!this._canModifyData()) return null;
    const milestone = {
      id: this.generateId('milestone'),
      _version: 1,
      priority: 'medium',
      progress: 0,
      tags: [],
      ...milestoneData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.milestones.push(milestone);
    this.saveToStorage();
    this.notify();
    return milestone;
  }
  
  updateMilestone(milestoneId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.milestones.findIndex(m => m.id === milestoneId);
    if (index !== -1) {
      this.state.milestones[index] = {
        ...this.state.milestones[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        _version: (this.state.milestones[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.milestones[index];
    }
    return null;
  }
  
  completeMilestone(milestoneId) {
    const index = this.state.milestones.findIndex(m => m.id === milestoneId);
    if (index !== -1) {
      this.state.milestones[index] = {
        ...this.state.milestones[index],
        status: 'completed',
        progress: 100,
        completedDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
        _version: (this.state.milestones[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      
      const milestone = this.state.milestones[index];
      this.addNotification({
        type: 'success',
        title: '里程碑完成',
        message: `里程碑"${milestone.name}"已完成！`
      });
      
      return this.state.milestones[index];
    }
    return null;
  }
  
  deleteMilestone(milestoneId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('milestones', milestoneId);
    this.state.milestones = this.state.milestones.filter(m => m.id !== milestoneId);
    this.saveToStorage();
    this.notify();
  }
  
  getMilestoneById(milestoneId) {
    return this.state.milestones.find(m => m.id === milestoneId);
  }
  
  getMilestonesByProject(projectId) {
    return this.state.milestones.filter(m => m.projectId === projectId);
  }
  
  getMilestoneStats(projectId = null) {
    let milestones = this.state.milestones;
    if (projectId) {
      milestones = milestones.filter(m => m.projectId === projectId);
    }
    
    return {
      total: milestones.length,
      completed: milestones.filter(m => m.status === 'completed').length,
      inProgress: milestones.filter(m => m.status === 'in_progress').length,
      pending: milestones.filter(m => m.status === 'pending').length,
      overdue: milestones.filter(m => {
        if (m.status === 'completed') return false;
        if (!m.targetDate) return false;
        try {
          const targetDate = new Date(m.targetDate);
          if (isNaN(targetDate.getTime())) return false;
          return targetDate < new Date();
        } catch (e) {
          return false;
        }
      }).length
    };
  }
  
  addNotification(notifData) {
    if (!this._canModifyData()) return null;
    const notification = {
      id: this.generateId('notif'),
      _version: 1,
      read: false,
      ...notifData,
      time: new Date().toISOString()
    };
    this.state.notifications.unshift(notification);
    this.saveToStorage();
    this.notify();
    return notification;
  }
  
  markNotificationAsRead(notifId) {
    const index = this.state.notifications.findIndex(n => n.id === notifId);
    if (index !== -1) {
      this.state.notifications[index].read = true;
      this.state.notifications[index]._version = (this.state.notifications[index]._version || 0) + 1;
      this.saveToStorage();
      this.notify();
    }
  }
  
  markAllNotificationsAsRead() {
    this.state.notifications.forEach(n => {
      n.read = true;
      n._version = (n._version || 0) + 1;
    });
    this.saveToStorage();
    this.notify();
  }
  
  deleteNotification(notificationId) {
    if (!this._canModifyData()) return null;
    this.state.notifications = this.state.notifications.filter(n => n.id !== notificationId);
    this.saveToStorage();
    this.notify();
  }

  clearNotifications() {
    this.state.notifications = [];
    this.saveToStorage();
    this.notify();
  }
  
  updateStatistics() {
    const projects = this.state.projects;
    const tasks = this.state.tasks;
    const resources = this.state.resources;
    const milestones = this.state.milestones;
    
    this.state.statistics = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      pausedProjects: projects.filter(p => p.status === 'paused' || p.status === 'planning').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      teamMembers: this.state.users.length,
      overdueTasks: tasks.filter(t => {
        if (!t || t.status === 'completed' || t.status === 'cancelled') return false;
        if (!t.dueDate) return false;
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(t.dueDate);
          if (isNaN(dueDate.getTime())) return false;
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today;
        } catch (e) {
          return false;
        }
      }).length,
      totalResources: resources.length,
      totalMilestones: milestones.length,
      completedMilestones: milestones.filter(m => m.status === 'completed').length
    };
  }
  
  searchProjects(query) {
    if (!query) return this.state.projects;
    const lowerQuery = query.toLowerCase();
    return this.state.projects.filter(p => 
      (p.name && p.name.toLowerCase().includes(lowerQuery)) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery))
    );
  }
  
  searchTasks(query) {
    if (!query) return this.state.tasks;
    const lowerQuery = query.toLowerCase();
    return this.state.tasks.filter(t => 
      (t.name && t.name.toLowerCase().includes(lowerQuery)) ||
      (t.description && t.description.toLowerCase().includes(lowerQuery))
    );
  }
  
  filterProjects(filters) {
    let filtered = [...this.state.projects];
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(p => p.priority === filters.priority);
    }
    
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }
  
  filterTasks(filters) {
    let filtered = [...this.state.tasks];
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    
    if (filters.projectId) {
      filtered = filtered.filter(t => t.projectId === filters.projectId);
    }
    
    if (filters.assigneeId) {
      filtered = filtered.filter(t => t.assigneeId === filters.assigneeId);
    }
    
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        (t.name && t.name.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }
  
  getProjectProgress(projectId) {
    const tasks = this.getTasksByProject(projectId);
    if (tasks.length === 0) return 0;
    
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  }
  
  getUserTasksStats(userId) {
    const tasks = this.getTasksByUser(userId);
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      todo: tasks.filter(t => t.status === 'todo').length
    };
  }
  
  addRisk(riskData) {
    if (!this._canModifyData()) return null;
    const risk = {
      id: this.generateId('risk'),
      _version: 1,
      ...riskData,
      createdAt: new Date().toISOString()
    };
    this.state.risks.push(risk);
    this.saveToStorage();
    this.notify();
    return risk;
  }
  
  updateRisk(riskId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.risks.findIndex(r => r.id === riskId);
    if (index !== -1) {
      this.state.risks[index] = {
        ...this.state.risks[index],
        ...updates,
        _version: (this.state.risks[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.risks[index];
    }
    return null;
  }
  
  deleteRisk(riskId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('risks', riskId);
    this.state.risks = this.state.risks.filter(r => r.id !== riskId);
    this.saveToStorage();
    this.notify();
  }
  
  getRisksByProject(projectId) {
    return this.state.risks.filter(r => r.projectId === projectId);
  }
  
  addIssue(issueData) {
    if (!this._canModifyData()) return null;
    const issue = {
      id: this.generateId('issue'),
      _version: 1,
      ...issueData,
      createdAt: new Date().toISOString()
    };
    this.state.issues.push(issue);
    this.saveToStorage();
    this.notify();
    return issue;
  }
  
  updateIssue(issueId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.issues.findIndex(i => i.id === issueId);
    if (index !== -1) {
      this.state.issues[index] = {
        ...this.state.issues[index],
        ...updates,
        _version: (this.state.issues[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.issues[index];
    }
    return null;
  }
  
  deleteIssue(issueId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('issues', issueId);
    this.state.issues = this.state.issues.filter(i => i.id !== issueId);
    this.saveToStorage();
    this.notify();
  }
  
  getIssuesByProject(projectId) {
    return this.state.issues.filter(i => i.projectId === projectId);
  }
  
  addProgressReport(reportData) {
    if (!this._canModifyData()) return null;
    const report = {
      id: this.generateId('report'),
      _version: 1,
      ...reportData,
      createdAt: new Date().toISOString()
    };
    this.state.progressReports.push(report);
    this.saveToStorage();
    this.notify();
    return report;
  }

  updateProgressReport(reportId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.progressReports.findIndex(r => r.id === reportId);
    if (index !== -1) {
      this.state.progressReports[index] = {
        ...this.state.progressReports[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        _version: (this.state.progressReports[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.progressReports[index];
    }
    return null;
  }
  
  getProgressReportsByProject(projectId) {
    return this.state.progressReports.filter(r => r.projectId === projectId);
  }
  
  markWarningRead(warningId) {
    const index = this.state.warnings.findIndex(w => w.id === warningId);
    if (index !== -1) {
      this.state.warnings[index].isRead = true;
      this.state.warnings[index]._version = (this.state.warnings[index]._version || 0) + 1;
      this.saveToStorage();
      this.notify();
    }
  }
  
  updateWarning(warningId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.warnings.findIndex(w => w.id === warningId);
    if (index !== -1) {
      this.state.warnings[index] = {
        ...this.state.warnings[index],
        ...updates,
        _version: (this.state.warnings[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.warnings[index];
    }
    return null;
  }
  
  deleteWarning(warningId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('warnings', warningId);
    this.state.warnings = this.state.warnings.filter(w => w.id !== warningId);
    this.saveToStorage();
    this.notify();
  }
  
  markAllWarningsAsRead() {
    this.state.warnings.forEach(w => {
      w.isRead = true;
      w._version = (w._version || 0) + 1;
    });
    this.saveToStorage();
    this.notify();
  }
  
  addWarning(warningData) {
    if (!this._canModifyData()) return null;
    const warning = {
      id: this.generateId('warning'),
      _version: 1,
      isRead: false,
      message: warningData.message || warningData.title || '未知警告',
      level: warningData.level || 'medium',
      dueDate: warningData.dueDate || new Date().toISOString().split('T')[0],
      ...warningData,
      createdAt: new Date().toISOString()
    };
    this.state.warnings.push(warning);
    this.saveToStorage();
    this.notify();
    return warning;
  }
  
  addDailyLog(logData) {
    if (!this._canModifyData()) return null;
    const log = {
      id: this.generateId('dailylog'),
      _version: 1,
      ...logData,
      createdAt: new Date().toISOString()
    };
    this.state.dailyLogs.push(log);
    this.saveToStorage();
    this.notify();
    return log;
  }
  
  updateDailyLog(logId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.dailyLogs.findIndex(l => l.id === logId);
    if (index !== -1) {
      this.state.dailyLogs[index] = {
        ...this.state.dailyLogs[index],
        ...updates,
        _version: (this.state.dailyLogs[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.dailyLogs[index];
    }
    return null;
  }
  
  getDailyLogsByProject(projectId) {
    return this.state.dailyLogs.filter(l => l.projectId === projectId);
  }
  
  addBudget(budgetData) {
    if (!this._canModifyData()) return null;
    const budget = {
      id: this.generateId('budget'),
      _version: 1,
      ...budgetData,
      createdAt: new Date().toISOString()
    };
    this.state.budgets.push(budget);
    this.saveToStorage();
    this.notify();
    return budget;
  }
  
  updateBudget(budgetId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.budgets.findIndex(b => b.id === budgetId);
    if (index !== -1) {
      this.state.budgets[index] = {
        ...this.state.budgets[index],
        ...updates,
        _version: (this.state.budgets[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.budgets[index];
    }
    return null;
  }
  
  deleteBudget(budgetId) {
    if (!this._canModifyData()) return null;
    const index = this.state.budgets.findIndex(b => b.id === budgetId);
    if (index !== -1) {
      this._recordDeletion('budgets', budgetId);
      this.state.budgets.splice(index, 1);
      this.saveToStorage();
      this.notify();
      return true;
    }
    return false;
  }
  
  getBudgetsByProject(projectId) {
    return this.state.budgets.filter(b => b.projectId === projectId);
  }

  addBudgetExpense(itemId, amount) {
    const index = this.state.budgets.findIndex(b => b.id === itemId);
    if (index !== -1) {
      const budget = this.state.budgets[index];
      const currentSpent = budget.spentAmount || budget.spent || 0;
      budget.spentAmount = currentSpent + amount;
      budget.spent = budget.spentAmount;
      budget._version = (budget._version || 0) + 1;
      this.saveToStorage();
      this.notify();
      return budget;
    }
    return null;
  }
  
  addPayment(paymentData) {
    if (!this._canModifyData()) return null;
    const payment = {
      id: this.generateId('payment'),
      _version: 1,
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    this.state.payments.push(payment);
    this.saveToStorage();
    this.notify();
    return payment;
  }
  
  updatePaymentStatus(paymentId, status) {
    if (!this._canModifyData()) return null;
    const index = this.state.payments.findIndex(p => p.id === paymentId);
    if (index !== -1) {
      this.state.payments[index].status = status;
      this.state.payments[index]._version = (this.state.payments[index]._version || 0) + 1;
      this.saveToStorage();
      this.notify();
    }
  }
  
  getPaymentsByProject(projectId) {
    return this.state.payments.filter(p => p.projectId === projectId);
  }
  
  addMaterial(materialData) {
    if (!this._canModifyData()) return null;
    const material = {
      id: this.generateId('material'),
      _version: 1,
      ...materialData,
      createdAt: new Date().toISOString()
    };
    this.state.materials.push(material);
    this.saveToStorage();
    this.notify();
    return material;
  }
  
  updateMaterialStatus(materialId, status) {
    if (!this._canModifyData()) return null;
    const index = this.state.materials.findIndex(m => m.id === materialId);
    if (index !== -1) {
      this.state.materials[index].status = status;
      this.state.materials[index]._version = (this.state.materials[index]._version || 0) + 1;
      this.saveToStorage();
      this.notify();
    }
  }
  
  updateMaterial(materialId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.materials.findIndex(m => m.id === materialId);
    if (index !== -1) {
      this.state.materials[index] = {
        ...this.state.materials[index],
        ...updates,
        _version: (this.state.materials[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.materials[index];
    }
    return null;
  }
  
  getMaterialsByProject(projectId) {
    return this.state.materials.filter(m => m.projectId === projectId);
  }
  
  addExpense(expenseData) {
    if (!this._canModifyData()) return null;
    const expense = {
      id: this.generateId('expense'),
      _version: 1,
      ...expenseData,
      createdAt: new Date().toISOString()
    };
    this.state.expenses.push(expense);
    this.saveToStorage();
    this.notify();
    return expense;
  }
  
  updateExpense(expenseId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.expenses.findIndex(e => e.id === expenseId);
    if (index !== -1) {
      this.state.expenses[index] = {
        ...this.state.expenses[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        _version: (this.state.expenses[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.expenses[index];
    }
    return null;
  }
  
  deleteExpense(expenseId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('expenses', expenseId);
    this.state.expenses = this.state.expenses.filter(e => e.id !== expenseId);
    this.saveToStorage();
    this.notify();
  }
  
  getExpensesByProject(projectId) {
    return this.state.expenses.filter(e => e.projectId === projectId);
  }
  
  getExpenseById(expenseId) {
    return this.state.expenses.find(e => e.id === expenseId);
  }
  
  getExpensesByCategory(category) {
    return this.state.expenses.filter(e => e.category === category);
  }
  
  getExpensesByDateRange(startDate, endDate) {
    return this.state.expenses.filter(e => {
      if (!e.expenseDate) return false;
      try {
        const expenseDate = new Date(e.expenseDate);
        if (isNaN(expenseDate.getTime())) return false;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
        return expenseDate >= start && expenseDate <= end;
      } catch (e) {
        return false;
      }
    });
  }
  
  getExpenseStats(projectId = null) {
    let expenses = this.state.expenses;
    if (projectId) {
      expenses = expenses.filter(e => e.projectId === projectId);
    }
    
    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const byCategory = {};
    expenses.forEach(e => {
      const cat = e.category || '其他';
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += e.amount || 0;
    });
    
    return {
      total: totalAmount,
      count: expenses.length,
      byCategory
    };
  }
  
  addAfterSale(afterSaleData) {
    if (!this._canModifyData()) return null;
    const afterSale = {
      id: this.generateId('aftersale'),
      _version: 1,
      assigneeId: null,
      logs: [],
      ...afterSaleData,
      createdAt: new Date().toISOString()
    };
    this.state.afterSales.push(afterSale);
    this.saveToStorage();
    this.notify();
    return afterSale;
  }
  
  updateAfterSale(afterSaleId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.afterSales.findIndex(a => a.id === afterSaleId);
    if (index !== -1) {
      this.state.afterSales[index] = {
        ...this.state.afterSales[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        _version: (this.state.afterSales[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.afterSales[index];
    }
    return null;
  }
  
  updateAfterSaleStatus(afterSaleId, status) {
    const index = this.state.afterSales.findIndex(a => a.id === afterSaleId);
    if (index !== -1) {
      this.state.afterSales[index].status = status;
      this.state.afterSales[index].updatedAt = new Date().toISOString();
      this.state.afterSales[index]._version = (this.state.afterSales[index]._version || 0) + 1;
      const statusNames = { pending: '待处理', processing: '处理中', completed: '已完成' };
      this.addAfterSaleLog(afterSaleId, `状态变更为${statusNames[status]}`);
      this.saveToStorage();
      this.notify();
    }
  }
  
  deleteAfterSale(afterSaleId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('after_sales', afterSaleId);
    this.state.afterSales = this.state.afterSales.filter(a => a.id !== afterSaleId);
    this.saveToStorage();
    this.notify();
  }
  
  getAfterSalesByProject(projectId) {
    return this.state.afterSales.filter(a => a.projectId === projectId);
  }
  
  assignAfterSale(afterSaleId, assigneeId) {
    const index = this.state.afterSales.findIndex(a => a.id === afterSaleId);
    if (index !== -1) {
      this.state.afterSales[index].assigneeId = assigneeId;
      this.state.afterSales[index].updatedAt = new Date().toISOString();
      this.state.afterSales[index]._version = (this.state.afterSales[index]._version || 0) + 1;
      const assignee = this.state.users.find(u => u.id === assigneeId);
      this.addAfterSaleLog(afterSaleId, `分配给${assignee?.name || '未知人员'}`);
      this.saveToStorage();
      this.notify();
    }
  }
  
  addAfterSaleLog(afterSaleId, action) {
    const index = this.state.afterSales.findIndex(a => a.id === afterSaleId);
    if (index !== -1) {
      if (!this.state.afterSales[index].logs) {
        this.state.afterSales[index].logs = [];
      }
      this.state.afterSales[index].logs.push({
        id: this.generateId('log'),
        action,
        createdAt: new Date().toISOString(),
        userId: this.state.currentUser?.id
      });
      this.state.afterSales[index]._version = (this.state.afterSales[index]._version || 0) + 1;
      this.saveToStorage();
      this.notify();
    }
  }
  
  getAfterSaleById(afterSaleId) {
    return this.state.afterSales.find(a => a.id === afterSaleId);
  }
  
  addTemporaryWorker(workerData) {
    if (!this._canModifyData()) return null;
    const worker = {
      id: this.generateId('worker'),
      _version: 1,
      ...workerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.temporaryWorkers.push(worker);
    this.saveToStorage();
    this.notify();
    return worker;
  }
  
  updateTemporaryWorker(workerId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.temporaryWorkers.findIndex(w => w.id === workerId);
    if (index !== -1) {
      this.state.temporaryWorkers[index] = {
        ...this.state.temporaryWorkers[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        _version: (this.state.temporaryWorkers[index]._version || 0) + 1
      };
      this.saveToStorage();
      this.notify();
      return this.state.temporaryWorkers[index];
    }
    return null;
  }
  
  deleteTemporaryWorker(workerId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('temporary_workers', workerId);
    const relatedAttendance = this.state.workerAttendance.filter(a => a.workerId === workerId);
    relatedAttendance.forEach(a => this._recordDeletion('worker_attendance', a.id));
    
    this.state.temporaryWorkers = this.state.temporaryWorkers.filter(w => w.id !== workerId);
    this.state.workerAttendance = this.state.workerAttendance.filter(a => a.workerId !== workerId);
    this.saveToStorage();
    this.notify();
  }
  
  getTemporaryWorkersByProject(projectId) {
    return this.state.temporaryWorkers.filter(w => w.projectId === projectId);
  }
  
  getTemporaryWorkerById(workerId) {
    return this.state.temporaryWorkers.find(w => w.id === workerId);
  }

  addWorkerAttendance(attendanceData) {
    if (!this._canModifyData()) return null;
    const attendance = {
      id: this.generateId('attendance'),
      _version: 1,
      ...attendanceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.workerAttendance.push(attendance);
    
    if (attendance.workerId && attendance.hours) {
      const workerIndex = this.state.temporaryWorkers.findIndex(w => w.id === attendance.workerId);
      if (workerIndex !== -1) {
        const currentHours = parseFloat(this.state.temporaryWorkers[workerIndex].totalHours) || 0;
        this.state.temporaryWorkers[workerIndex].totalHours = currentHours + parseFloat(attendance.hours);
        this.state.temporaryWorkers[workerIndex].updatedAt = new Date().toISOString();
        this.state.temporaryWorkers[workerIndex]._version = (this.state.temporaryWorkers[workerIndex]._version || 0) + 1;
      }
    }
    
    this.saveToStorage();
    this.notify();
    return attendance;
  }

  updateWorkerAttendance(attendanceId, updates) {
    if (!this._canModifyData()) return null;
    const index = this.state.workerAttendance.findIndex(a => a.id === attendanceId);
    if (index !== -1) {
      const oldHours = parseFloat(this.state.workerAttendance[index].hours) || 0;
      this.state.workerAttendance[index] = {
        ...this.state.workerAttendance[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        _version: (this.state.workerAttendance[index]._version || 0) + 1
      };
      
      if (this.state.workerAttendance[index].workerId && updates.hours !== undefined) {
        const newHours = parseFloat(updates.hours) || 0;
        const workerIndex = this.state.temporaryWorkers.findIndex(w => w.id === this.state.workerAttendance[index].workerId);
        if (workerIndex !== -1) {
          const currentTotal = parseFloat(this.state.temporaryWorkers[workerIndex].totalHours) || 0;
          this.state.temporaryWorkers[workerIndex].totalHours = currentTotal - oldHours + newHours;
          this.state.temporaryWorkers[workerIndex].updatedAt = new Date().toISOString();
          this.state.temporaryWorkers[workerIndex]._version = (this.state.temporaryWorkers[workerIndex]._version || 0) + 1;
        }
      }
      
      this.saveToStorage();
      this.notify();
      return this.state.workerAttendance[index];
    }
    return null;
  }

  deleteWorkerAttendance(attendanceId) {
    if (!this._canModifyData()) return null;
    this._recordDeletion('worker_attendance', attendanceId);
    const attendance = this.state.workerAttendance.find(a => a.id === attendanceId);
    if (attendance) {
      if (attendance.workerId && attendance.hours) {
        const workerIndex = this.state.temporaryWorkers.findIndex(w => w.id === attendance.workerId);
        if (workerIndex !== -1) {
          const currentHours = parseFloat(this.state.temporaryWorkers[workerIndex].totalHours) || 0;
          const hoursToSubtract = parseFloat(attendance.hours) || 0;
          this.state.temporaryWorkers[workerIndex].totalHours = Math.max(0, currentHours - hoursToSubtract);
          this.state.temporaryWorkers[workerIndex].updatedAt = new Date().toISOString();
          this.state.temporaryWorkers[workerIndex]._version = (this.state.temporaryWorkers[workerIndex]._version || 0) + 1;
        }
      }
      
      this.state.workerAttendance = this.state.workerAttendance.filter(a => a.id !== attendanceId);
      this.saveToStorage();
      this.notify();
    }
  }

  getWorkerAttendanceByWorker(workerId) {
    return this.state.workerAttendance.filter(a => a.workerId === workerId);
  }

  getWorkerAttendanceByProject(projectId) {
    return this.state.workerAttendance.filter(a => a.projectId === projectId);
  }

  getWorkerAttendanceById(attendanceId) {
    return this.state.workerAttendance.find(a => a.id === attendanceId);
  }

  reset() {
    Storage.clear();
    this.state = {
      currentUser: null,
      users: [...MockData.users],
      projects: [],
      tasks: [],
      documents: [],
      notifications: [],
      statistics: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        pausedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        teamMembers: MockData.users.length,
        overdueTasks: 0,
        totalResources: 0,
        totalMilestones: 0,
        completedMilestones: 0
      },
      resources: [],
      milestones: [],
      risks: [],
      issues: [],
      progressReports: [],
      dailyLogs: [],
      warnings: [],
      scheduleChanges: [],
      budgets: [],
      payments: [],
      materials: [],
      afterSales: [],
      temporaryWorkers: [],
      workerAttendance: [],
      cameras: [],
      dashboardData: {},
      loading: false,
      error: null,
      currentRoute: 'dashboard',
      currentProjectId: null,
      searchQuery: '',
      filterStatus: 'all',
      filterPriority: 'all',
      darkMode: this.state.darkMode,
      isLoggedIn: false
    };
    this.saveToStorage();
    this.notify();
  }
}

const store = new Store();
window.store = store;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = store;
}