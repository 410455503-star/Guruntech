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
    this.init();
  }
  
  init() {
    // 数据版本号：修改 mock 数据后需更新此版本号，强制刷新用户浏览器缓存
    const DATA_VERSION = 'v2.0';
    const storedVersion = Storage.get('dataVersion', null);
    const hasStoredData = Storage.get('store', null);
    
    if (hasStoredData && storedVersion === DATA_VERSION) {
      this.loadFromStorage();
    } else {
      // 版本不匹配或首次加载，使用最新 mock 数据
      this.loadMockData();
      Storage.set('dataVersion', DATA_VERSION);
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
    this.state.dashboardData = {...(MockData.dashboardData || {})};
    this.state.currentUser = this.state.users[0];
    this.state.isLoggedIn = true;
    this.saveToStorage();
  }
  
  loadFromStorage() {
    const storedData = Storage.get('store', null);
    if (storedData) {
      // 合并数据，保留默认字段，避免新字段缺失
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
      darkMode: this.state.darkMode,
      currentUser: this.state.currentUser,
      isLoggedIn: this.state.isLoggedIn
    };
    Storage.set('store', dataToSave);
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
    // 任何数据变更都保存到本地存储
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
  
  getTasksByProject(projectId) {
    return this.state.tasks.filter(t => t.projectId === projectId);
  }
  
  getTasksByUser(userId) {
    return this.state.tasks.filter(t => t.assigneeId === userId);
  }
  
  addProject(projectData) {
    const project = {
      id: this.generateId('proj'),
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.projects.push(project);
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
    return project;
  }
  
  updateProject(projectId, updates) {
    const index = this.state.projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      this.state.projects[index] = {
        ...this.state.projects[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.updateStatistics();
      this.saveToStorage();
      this.notify();
      return this.state.projects[index];
    }
    return null;
  }
  
  deleteProject(projectId) {
    this.state.projects = this.state.projects.filter(p => p.id !== projectId);
    this.state.tasks = this.state.tasks.filter(t => t.projectId !== projectId);
    this.state.documents = this.state.documents.filter(d => d.projectId !== projectId);
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
  }
  
  addTask(taskData) {
    const task = {
      id: this.generateId('task'),
      ...taskData,
      order: this.state.tasks.filter(t => t.projectId === taskData.projectId).length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.tasks.push(task);
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
    return task;
  }
  
  updateTask(taskId, updates) {
    const index = this.state.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.state.tasks[index] = {
        ...this.state.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.updateStatistics();
      this.saveToStorage();
      this.notify();
      return this.state.tasks[index];
    }
    return null;
  }
  
  deleteTask(taskId) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId && t.parentId !== taskId);
    this.updateStatistics();
    this.saveToStorage();
    this.notify();
  }
  
  updateTaskStatus(taskId, status) {
    return this.updateTask(taskId, { status });
  }
  
  updateTaskProgress(taskId, progress) {
    return this.updateTask(taskId, { progress });
  }
  
  addMember(memberData) {
    const member = {
      id: this.generateId('user'),
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
    const index = this.state.users.findIndex(u => u.id === memberId);
    if (index !== -1) {
      this.state.users[index] = {
        ...this.state.users[index],
        ...updates
      };
      this.saveToStorage();
      this.notify();
      return this.state.users[index];
    }
    return null;
  }
  
  deleteMember(memberId) {
    this.state.users = this.state.users.filter(u => u.id !== memberId);
    this.state.tasks.forEach(task => {
      if (task.assigneeId === memberId) {
        task.assigneeId = null;
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
    const doc = {
      id: this.generateId('doc'),
      ...docData,
      uploadedAt: new Date().toISOString()
    };
    this.state.documents.push(doc);
    this.saveToStorage();
    this.notify();
    return doc;
  }
  
  deleteDocument(docId) {
    this.state.documents = this.state.documents.filter(d => d.id !== docId);
    this.saveToStorage();
    this.notify();
  }
  
  addResource(resourceData) {
    const resource = {
      id: this.generateId('res'),
      ...resourceData,
      createdAt: new Date().toISOString()
    };
    this.state.resources.push(resource);
    this.saveToStorage();
    this.notify();
    return resource;
  }
  
  updateResource(resourceId, updates) {
    const index = this.state.resources.findIndex(r => r.id === resourceId);
    if (index !== -1) {
      this.state.resources[index] = {
        ...this.state.resources[index],
        ...updates
      };
      this.saveToStorage();
      this.notify();
      return this.state.resources[index];
    }
    return null;
  }
  
  deleteResource(resourceId) {
    this.state.resources = this.state.resources.filter(r => r.id !== resourceId);
    this.saveToStorage();
    this.notify();
  }
  
  getResourcesByProject(projectId) {
    return this.state.resources.filter(r => r.projectId === projectId);
  }
  
  addMilestone(milestoneData) {
    const milestone = {
      id: this.generateId('milestone'),
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
    const index = this.state.milestones.findIndex(m => m.id === milestoneId);
    if (index !== -1) {
      this.state.milestones[index] = {
        ...this.state.milestones[index],
        ...updates,
        updatedAt: new Date().toISOString()
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
        updatedAt: new Date().toISOString()
      };
      this.saveToStorage();
      this.notify();
      
      const milestone = this.state.milestones[index];
      this.addNotification({
        type: 'success',
        title: '里程碑完成',
        message: `里程碑「${milestone.name}」已完成！`
      });
      
      return this.state.milestones[index];
    }
    return null;
  }
  
  deleteMilestone(milestoneId) {
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
        return new Date(m.targetDate) < new Date();
      }).length
    };
  }
  
  addNotification(notifData) {
    const notification = {
      id: this.generateId('notif'),
      ...notifData,
      time: new Date().toISOString(),
      read: false
    };
    this.state.notifications.unshift(notification);
    this.notify();
    return notification;
  }
  
  markNotificationAsRead(notifId) {
    const index = this.state.notifications.findIndex(n => n.id === notifId);
    if (index !== -1) {
      this.state.notifications[index].read = true;
      this.notify();
    }
  }
  
  markAllNotificationsAsRead() {
    this.state.notifications.forEach(n => n.read = true);
    this.notify();
  }
  
  deleteNotification(notificationId) {
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
        if (t.status === 'completed' || t.status === 'cancelled') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
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
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  searchTasks(query) {
    if (!query) return this.state.tasks;
    const lowerQuery = query.toLowerCase();
    return this.state.tasks.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
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
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
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
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
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
    const risk = {
      id: this.generateId('risk'),
      ...riskData,
      createdAt: new Date().toISOString()
    };
    this.state.risks.push(risk);
    this.saveToStorage();
    this.notify();
    return risk;
  }
  
  updateRisk(riskId, updates) {
    const index = this.state.risks.findIndex(r => r.id === riskId);
    if (index !== -1) {
      this.state.risks[index] = {
        ...this.state.risks[index],
        ...updates
      };
      this.saveToStorage();
      this.notify();
      return this.state.risks[index];
    }
    return null;
  }
  
  deleteRisk(riskId) {
    this.state.risks = this.state.risks.filter(r => r.id !== riskId);
    this.saveToStorage();
    this.notify();
  }
  
  getRisksByProject(projectId) {
    return this.state.risks.filter(r => r.projectId === projectId);
  }
  
  addIssue(issueData) {
    const issue = {
      id: this.generateId('issue'),
      ...issueData,
      createdAt: new Date().toISOString()
    };
    this.state.issues.push(issue);
    this.saveToStorage();
    this.notify();
    return issue;
  }
  
  updateIssue(issueId, updates) {
    const index = this.state.issues.findIndex(i => i.id === issueId);
    if (index !== -1) {
      this.state.issues[index] = {
        ...this.state.issues[index],
        ...updates
      };
      this.saveToStorage();
      this.notify();
      return this.state.issues[index];
    }
    return null;
  }
  
  deleteIssue(issueId) {
    this.state.issues = this.state.issues.filter(i => i.id !== issueId);
    this.saveToStorage();
    this.notify();
  }
  
  getIssuesByProject(projectId) {
    return this.state.issues.filter(i => i.projectId === projectId);
  }
  
  // ========== 进度计划管理 ==========
  addProgressReport(reportData) {
    const report = {
      id: this.generateId('report'),
      ...reportData,
      createdAt: new Date().toISOString()
    };
    this.state.progressReports.push(report);
    this.saveToStorage();
    this.notify();
    return report;
  }
  
  getProgressReportsByProject(projectId) {
    return this.state.progressReports.filter(r => r.projectId === projectId);
  }
  
  markWarningRead(warningId) {
    const index = this.state.warnings.findIndex(w => w.id === warningId);
    if (index !== -1) {
      this.state.warnings[index].isRead = true;
      this.saveToStorage();
      this.notify();
    }
  }
  
  addWarning(warningData) {
    const warning = {
      id: this.generateId('warning'),
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
    const log = {
      id: this.generateId('dailylog'),
      ...logData,
      createdAt: new Date().toISOString()
    };
    this.state.dailyLogs.push(log);
    this.saveToStorage();
    this.notify();
    return log;
  }
  
  updateDailyLog(logId, updates) {
    const index = this.state.dailyLogs.findIndex(l => l.id === logId);
    if (index !== -1) {
      this.state.dailyLogs[index] = {
        ...this.state.dailyLogs[index],
        ...updates
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
  
  // ========== 成本与资金管理 ==========
  addBudget(budgetData) {
    const budget = {
      id: this.generateId('budget'),
      ...budgetData,
      createdAt: new Date().toISOString()
    };
    this.state.budgets.push(budget);
    this.saveToStorage();
    this.notify();
    return budget;
  }
  
  updateBudget(budgetId, updates) {
    const index = this.state.budgets.findIndex(b => b.id === budgetId);
    if (index !== -1) {
      this.state.budgets[index] = {
        ...this.state.budgets[index],
        ...updates
      };
      this.saveToStorage();
      this.notify();
      return this.state.budgets[index];
    }
    return null;
  }
  
  deleteBudget(budgetId) {
    const index = this.state.budgets.findIndex(b => b.id === budgetId);
    if (index !== -1) {
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
      this.saveToStorage();
      this.notify();
      return budget;
    }
    return null;
  }
  
  addPayment(paymentData) {
    const payment = {
      id: this.generateId('payment'),
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    this.state.payments.push(payment);
    this.saveToStorage();
    this.notify();
    return payment;
  }
  
  updatePaymentStatus(paymentId, status) {
    const index = this.state.payments.findIndex(p => p.id === paymentId);
    if (index !== -1) {
      this.state.payments[index].status = status;
      this.saveToStorage();
      this.notify();
    }
  }
  
  getPaymentsByProject(projectId) {
    return this.state.payments.filter(p => p.projectId === projectId);
  }
  
  // ========== 材料管理 ==========
  addMaterial(materialData) {
    const material = {
      id: this.generateId('material'),
      ...materialData,
      createdAt: new Date().toISOString()
    };
    this.state.materials.push(material);
    this.saveToStorage();
    this.notify();
    return material;
  }
  
  updateMaterialStatus(materialId, status) {
    const index = this.state.materials.findIndex(m => m.id === materialId);
    if (index !== -1) {
      this.state.materials[index].status = status;
      this.saveToStorage();
      this.notify();
    }
  }
  
  updateMaterial(materialId, updates) {
    const index = this.state.materials.findIndex(m => m.id === materialId);
    if (index !== -1) {
      this.state.materials[index] = {
        ...this.state.materials[index],
        ...updates
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
  
  // ========== 售后管理 ==========
  addAfterSale(afterSaleData) {
    const afterSale = {
      id: this.generateId('aftersale'),
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
    const index = this.state.afterSales.findIndex(a => a.id === afterSaleId);
    if (index !== -1) {
      this.state.afterSales[index] = {
        ...this.state.afterSales[index],
        ...updates,
        updatedAt: new Date().toISOString()
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
      const statusNames = { pending: '待处理', processing: '处理中', completed: '已完成' };
      this.addAfterSaleLog(afterSaleId, `状态变更为${statusNames[status]}`);
      this.saveToStorage();
      this.notify();
    }
  }
  
  deleteAfterSale(afterSaleId) {
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
      this.saveToStorage();
    }
  }
  
  getAfterSaleById(afterSaleId) {
    return this.state.afterSales.find(a => a.id === afterSaleId);
  }
  
  // ========== 临时用工管理 ==========
  addTemporaryWorker(workerData) {
    const worker = {
      id: this.generateId('worker'),
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
    const index = this.state.temporaryWorkers.findIndex(w => w.id === workerId);
    if (index !== -1) {
      this.state.temporaryWorkers[index] = {
        ...this.state.temporaryWorkers[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToStorage();
      this.notify();
      return this.state.temporaryWorkers[index];
    }
    return null;
  }
  
  deleteTemporaryWorker(workerId) {
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
    const attendance = {
      id: this.generateId('attendance'),
      ...attendanceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.workerAttendance.push(attendance);
    
    // 同时更新临时用工的总工时
    if (attendance.workerId && attendance.hours) {
      const workerIndex = this.state.temporaryWorkers.findIndex(w => w.id === attendance.workerId);
      if (workerIndex !== -1) {
        const currentHours = parseFloat(this.state.temporaryWorkers[workerIndex].totalHours) || 0;
        this.state.temporaryWorkers[workerIndex].totalHours = currentHours + parseFloat(attendance.hours);
        this.state.temporaryWorkers[workerIndex].updatedAt = new Date().toISOString();
      }
    }
    
    this.saveToStorage();
    this.notify();
    return attendance;
  }

  updateWorkerAttendance(attendanceId, updates) {
    const index = this.state.workerAttendance.findIndex(a => a.id === attendanceId);
    if (index !== -1) {
      const oldHours = parseFloat(this.state.workerAttendance[index].hours) || 0;
      this.state.workerAttendance[index] = {
        ...this.state.workerAttendance[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // 更新临时用工的总工时（先减去旧的，再加上新的）
      if (this.state.workerAttendance[index].workerId && updates.hours !== undefined) {
        const newHours = parseFloat(updates.hours) || 0;
        const workerIndex = this.state.temporaryWorkers.findIndex(w => w.id === this.state.workerAttendance[index].workerId);
        if (workerIndex !== -1) {
          const currentTotal = parseFloat(this.state.temporaryWorkers[workerIndex].totalHours) || 0;
          this.state.temporaryWorkers[workerIndex].totalHours = currentTotal - oldHours + newHours;
          this.state.temporaryWorkers[workerIndex].updatedAt = new Date().toISOString();
        }
      }
      
      this.saveToStorage();
      this.notify();
      return this.state.workerAttendance[index];
    }
    return null;
  }

  deleteWorkerAttendance(attendanceId) {
    const attendance = this.state.workerAttendance.find(a => a.id === attendanceId);
    if (attendance) {
      // 从临时用工的总工时中扣除
      if (attendance.workerId && attendance.hours) {
        const workerIndex = this.state.temporaryWorkers.findIndex(w => w.id === attendance.workerId);
        if (workerIndex !== -1) {
          const currentHours = parseFloat(this.state.temporaryWorkers[workerIndex].totalHours) || 0;
          const hoursToSubtract = parseFloat(attendance.hours) || 0;
          this.state.temporaryWorkers[workerIndex].totalHours = Math.max(0, currentHours - hoursToSubtract);
          this.state.temporaryWorkers[workerIndex].updatedAt = new Date().toISOString();
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
    // 清空所有数据但保留管理员账户
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = store;
}
