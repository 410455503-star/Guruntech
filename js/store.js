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
    // 为了测试甘特图，强制加载模拟数据（注释掉下面的代码可以恢复正常逻辑）
    this.loadMockData();
    
    // 正常的逻辑（保留）：优先从本地存储加载数据，如果没有数据再加载模拟数据
    // const hasStoredData = Storage.get('store', null);
    // if (hasStoredData) {
    //   this.loadFromStorage();
    // } else {
    //   this.loadMockData();
    // }
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
    this.state.currentUser = this.state.users[0];
    this.saveToStorage();
  }
  
  loadFromStorage() {
    const storedData = Storage.get('store', null);
    if (storedData) {
      this.state = {...this.state, ...storedData};
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
      issues: this.state.issues
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
    Storage.set('darkMode', this.state.darkMode);
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
      Storage.set('currentUser', user);
      Storage.set('isLoggedIn', true);
      this.notify();
      return true;
    }
    return false;
  }
  
  logout() {
    this.state.currentUser = null;
    this.state.isLoggedIn = false;
    Storage.remove('currentUser');
    Storage.remove('isLoggedIn');
    this.notify();
  }
  
  isAuthenticated() {
    return this.state.isLoggedIn;
  }
  
  loadLoginState() {
    const saved = Storage.get('isLoggedIn', false);
    if (saved) {
      const user = Storage.get('currentUser', null);
      if (user) {
        this.state.currentUser = user;
        this.state.isLoggedIn = true;
      }
    }
    return this.state.isLoggedIn;
  }
  
  generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      ...milestoneData,
      createdAt: new Date().toISOString()
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
        ...updates
      };
      this.saveToStorage();
      this.notify();
      return this.state.milestones[index];
    }
    return null;
  }
  
  deleteMilestone(milestoneId) {
    this.state.milestones = this.state.milestones.filter(m => m.id !== milestoneId);
    this.saveToStorage();
    this.notify();
  }
  
  getMilestonesByProject(projectId) {
    return this.state.milestones.filter(m => m.projectId === projectId);
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
      }).length
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
  
  reset() {
    Storage.clear();
    this.loadMockData();
    this.notify();
  }
}

const store = new Store();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = store;
}
