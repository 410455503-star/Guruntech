/**
 * 权限管理系统
 * 统一的权限定义、检查和控制
 */

// 权限定义
const PERMISSIONS = {
  // 项目相关
  PROJECT_VIEW: 'project.view',
  PROJECT_CREATE: 'project.create',
  PROJECT_EDIT: 'project.edit',
  PROJECT_DELETE: 'project.delete',
  PROJECT_MANAGE: 'project.manage',
  
  // 任务相关
  TASK_VIEW: 'task.view',
  TASK_CREATE: 'task.create',
  TASK_EDIT: 'task.edit',
  TASK_DELETE: 'task.delete',
  TASK_COMPLETE: 'task.complete',
  TASK_ASSIGN: 'task.assign',
  
  // 文档资源相关
  RESOURCE_UPLOAD: 'resource.upload',
  RESOURCE_DOWNLOAD: 'resource.download',
  RESOURCE_DELETE: 'resource.delete',
  
  // 人员相关
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  USER_PERMISSION: 'user.permission',
  
  // 系统相关
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_SYNC: 'system.sync',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_LOG: 'system.log',
  
  // 报表相关
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',
  
  // 费用相关
  EXPENSE_VIEW: 'expense.view',
  EXPENSE_CREATE: 'expense.create',
  EXPENSE_EDIT: 'expense.edit',
  EXPENSE_DELETE: 'expense.delete',
  EXPENSE_APPROVE: 'expense.approve'
};

// 权限分组
const PERMISSION_GROUPS = {
  'project': {
    name: '项目管理',
    icon: 'fa-folder-open',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_EDIT,
      PERMISSIONS.PROJECT_DELETE,
      PERMISSIONS.PROJECT_MANAGE
    ]
  },
  'task': {
    name: '任务管理',
    icon: 'fa-tasks',
    permissions: [
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_DELETE,
      PERMISSIONS.TASK_COMPLETE,
      PERMISSIONS.TASK_ASSIGN
    ]
  },
  'resource': {
    name: '文档资源',
    icon: 'fa-file-alt',
    permissions: [
      PERMISSIONS.RESOURCE_UPLOAD,
      PERMISSIONS.RESOURCE_DOWNLOAD,
      PERMISSIONS.RESOURCE_DELETE
    ]
  },
  'user': {
    name: '人员管理',
    icon: 'fa-users',
    permissions: [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_EDIT,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.USER_PERMISSION
    ]
  },
  'system': {
    name: '系统管理',
    icon: 'fa-cog',
    permissions: [
      PERMISSIONS.SYSTEM_SETTINGS,
      PERMISSIONS.SYSTEM_SYNC,
      PERMISSIONS.SYSTEM_BACKUP,
      PERMISSIONS.SYSTEM_LOG
    ]
  },
  'report': {
    name: '统计报表',
    icon: 'fa-chart-bar',
    permissions: [
      PERMISSIONS.REPORT_VIEW,
      PERMISSIONS.REPORT_EXPORT
    ]
  },
  'expense': {
    name: '费用管理',
    icon: 'fa-money-bill',
    permissions: [
      PERMISSIONS.EXPENSE_VIEW,
      PERMISSIONS.EXPENSE_CREATE,
      PERMISSIONS.EXPENSE_EDIT,
      PERMISSIONS.EXPENSE_DELETE,
      PERMISSIONS.EXPENSE_APPROVE
    ]
  }
};

// 权限名称映射
const PERMISSION_NAMES = {
  [PERMISSIONS.PROJECT_VIEW]: { name: '查看项目', desc: '查看项目列表和详情' },
  [PERMISSIONS.PROJECT_CREATE]: { name: '创建项目', desc: '创建新项目' },
  [PERMISSIONS.PROJECT_EDIT]: { name: '编辑项目', desc: '修改项目信息' },
  [PERMISSIONS.PROJECT_DELETE]: { name: '删除项目', desc: '删除项目' },
  [PERMISSIONS.PROJECT_MANAGE]: { name: '项目总览', desc: '访问项目管理模块' },
  
  [PERMISSIONS.TASK_VIEW]: { name: '查看任务', desc: '查看任务列表' },
  [PERMISSIONS.TASK_CREATE]: { name: '创建任务', desc: '创建新任务' },
  [PERMISSIONS.TASK_EDIT]: { name: '编辑任务', desc: '修改任务信息' },
  [PERMISSIONS.TASK_DELETE]: { name: '删除任务', desc: '删除任务' },
  [PERMISSIONS.TASK_COMPLETE]: { name: '完成任务', desc: '标记任务完成' },
  [PERMISSIONS.TASK_ASSIGN]: { name: '分配任务', desc: '指派任务给其他成员' },
  
  [PERMISSIONS.RESOURCE_UPLOAD]: { name: '上传资料', desc: '上传文件资料' },
  [PERMISSIONS.RESOURCE_DOWNLOAD]: { name: '下载资料', desc: '下载文件资料' },
  [PERMISSIONS.RESOURCE_DELETE]: { name: '删除资料', desc: '删除文件资料' },
  
  [PERMISSIONS.USER_VIEW]: { name: '查看成员', desc: '查看团队成员' },
  [PERMISSIONS.USER_CREATE]: { name: '添加成员', desc: '添加新成员' },
  [PERMISSIONS.USER_EDIT]: { name: '编辑成员', desc: '修改成员信息' },
  [PERMISSIONS.USER_DELETE]: { name: '删除成员', desc: '删除成员' },
  [PERMISSIONS.USER_PERMISSION]: { name: '权限管理', desc: '管理成员权限' },
  
  [PERMISSIONS.SYSTEM_SETTINGS]: { name: '系统设置', desc: '访问系统设置' },
  [PERMISSIONS.SYSTEM_SYNC]: { name: '数据同步', desc: '管理云端数据同步' },
  [PERMISSIONS.SYSTEM_BACKUP]: { name: '数据备份', desc: '备份和恢复数据' },
  [PERMISSIONS.SYSTEM_LOG]: { name: '操作日志', desc: '查看操作日志' },
  
  [PERMISSIONS.REPORT_VIEW]: { name: '查看报表', desc: '查看统计报表' },
  [PERMISSIONS.REPORT_EXPORT]: { name: '导出报表', desc: '导出报表数据' },
  
  [PERMISSIONS.EXPENSE_VIEW]: { name: '查看费用', desc: '查看费用记录' },
  [PERMISSIONS.EXPENSE_CREATE]: { name: '添加费用', desc: '添加费用记录' },
  [PERMISSIONS.EXPENSE_EDIT]: { name: '编辑费用', desc: '修改费用记录' },
  [PERMISSIONS.EXPENSE_DELETE]: { name: '删除费用', desc: '删除费用记录' },
  [PERMISSIONS.EXPENSE_APPROVE]: { name: '审批费用', desc: '审批费用支出' }
};

// 角色定义
const ROLES = {
  admin: {
    name: '系统管理员',
    desc: '拥有系统全部权限',
    icon: 'fa-crown',
    color: '#dc2626',
    permissions: Object.values(PERMISSIONS) // 所有权限
  },
  manager: {
    name: '项目经理',
    desc: '管理项目和任务',
    icon: 'fa-user-tie',
    color: '#7c3aed',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.PROJECT_EDIT,
      PERMISSIONS.PROJECT_MANAGE,
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_DELETE,
      PERMISSIONS.TASK_COMPLETE,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.RESOURCE_UPLOAD,
      PERMISSIONS.RESOURCE_DOWNLOAD,
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.REPORT_VIEW,
      PERMISSIONS.EXPENSE_VIEW,
      PERMISSIONS.EXPENSE_CREATE,
      PERMISSIONS.EXPENSE_EDIT
    ]
  },
  member: {
    name: '普通成员',
    desc: '基本操作权限',
    icon: 'fa-user',
    color: '#3b82f6',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.TASK_CREATE,
      PERMISSIONS.TASK_EDIT,
      PERMISSIONS.TASK_COMPLETE,
      PERMISSIONS.RESOURCE_UPLOAD,
      PERMISSIONS.RESOURCE_DOWNLOAD,
      PERMISSIONS.EXPENSE_VIEW,
      PERMISSIONS.EXPENSE_CREATE
    ]
  },
  viewer: {
    name: '访客',
    desc: '只读权限',
    icon: 'fa-eye',
    color: '#6b7280',
    permissions: [
      PERMISSIONS.PROJECT_VIEW,
      PERMISSIONS.TASK_VIEW,
      PERMISSIONS.RESOURCE_DOWNLOAD,
      PERMISSIONS.REPORT_VIEW
    ]
  }
};

// 旧权限映射到新权限
const LEGACY_PERMISSION_MAP = {
  'projectManagement': [PERMISSIONS.PROJECT_MANAGE, PERMISSIONS.PROJECT_VIEW],
  'projectCreate': [PERMISSIONS.PROJECT_CREATE],
  'resourceUpload': [PERMISSIONS.RESOURCE_UPLOAD, PERMISSIONS.RESOURCE_DOWNLOAD],
  'taskView': [PERMISSIONS.TASK_VIEW],
  'taskEdit': [PERMISSIONS.TASK_CREATE, PERMISSIONS.TASK_EDIT],
  'taskComplete': [PERMISSIONS.TASK_COMPLETE],
  'userManagement': [PERMISSIONS.USER_VIEW, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_EDIT, PERMISSIONS.USER_DELETE],
  'dataManagement': [PERMISSIONS.EXPENSE_VIEW, PERMISSIONS.EXPENSE_CREATE, PERMISSIONS.EXPENSE_EDIT, PERMISSIONS.EXPENSE_DELETE],
  'systemSettings': [PERMISSIONS.SYSTEM_SETTINGS]
};

/**
 * 权限管理器类
 */
class PermissionManager {
  constructor() {
    this._cache = new Map();
  }
  
  /**
   * 获取用户的所有权限
   * @param {Object} user - 用户对象
   * @returns {Array} 权限数组
   */
  getUserPermissions(user) {
    if (!user) return [];
    
    const cacheKey = user.id || user.username;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }
    
    let permissions = [];
    
    // 如果用户有明确的权限设置，使用用户权限
    if (user.permissions && typeof user.permissions === 'object') {
      // 处理旧格式权限
      for (const [key, value] of Object.entries(user.permissions)) {
        if (value === true) {
          if (LEGACY_PERMISSION_MAP[key]) {
            permissions = permissions.concat(LEGACY_PERMISSION_MAP[key]);
          } else {
            // 新格式权限直接添加
            permissions.push(key);
          }
        }
      }
    }
    
    // 合并角色默认权限
    const role = ROLES[user.role];
    if (role && role.permissions) {
      permissions = [...new Set([...permissions, ...role.permissions])];
    }
    
    // 管理员拥有所有权限
    if (user.role === 'admin') {
      permissions = Object.values(PERMISSIONS);
    }
    
    // 去重并缓存
    permissions = [...new Set(permissions)];
    this._cache.set(cacheKey, permissions);
    
    return permissions;
  }
  
  /**
   * 检查用户是否有指定权限
   * @param {Object} user - 用户对象
   * @param {string} permission - 权限标识
   * @returns {boolean}
   */
  hasPermission(user, permission) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const permissions = this.getUserPermissions(user);
    return permissions.includes(permission);
  }
  
  /**
   * 检查用户是否有任意一个权限
   * @param {Object} user - 用户对象
   * @param {Array} permissions - 权限数组
   * @returns {boolean}
   */
  hasAnyPermission(user, permissions) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const userPermissions = this.getUserPermissions(user);
    return permissions.some(p => userPermissions.includes(p));
  }
  
  /**
   * 检查用户是否有所有权限
   * @param {Object} user - 用户对象
   * @param {Array} permissions - 权限数组
   * @returns {boolean}
   */
  hasAllPermissions(user, permissions) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const userPermissions = this.getUserPermissions(user);
    return permissions.every(p => userPermissions.includes(p));
  }
  
  /**
   * 获取用户在特定模块的权限
   * @param {Object} user - 用户对象
   * @param {string} module - 模块名称
   * @returns {Array} 权限数组
   */
  getModulePermissions(user, module) {
    const group = PERMISSION_GROUPS[module];
    if (!group) return [];
    
    const userPermissions = this.getUserPermissions(user);
    return group.permissions.filter(p => userPermissions.includes(p));
  }
  
  /**
   * 清除权限缓存
   * @param {string} userId - 用户ID，不传则清除所有
   */
  clearCache(userId) {
    if (userId) {
      this._cache.delete(userId);
    } else {
      this._cache.clear();
    }
  }
  
  /**
   * 获取角色信息
   * @param {string} roleKey - 角色键
   * @returns {Object} 角色信息
   */
  getRole(roleKey) {
    return ROLES[roleKey] || null;
  }
  
  /**
   * 获取所有角色
   * @returns {Object} 所有角色定义
   */
  getAllRoles() {
    return { ...ROLES };
  }
  
  /**
   * 获取权限信息
   * @param {string} permission - 权限标识
   * @returns {Object} 权限信息
   */
  getPermissionInfo(permission) {
    return PERMISSION_NAMES[permission] || { name: permission, desc: '' };
  }
  
  /**
   * 获取权限分组
   * @returns {Object} 权限分组
   */
  getPermissionGroups() {
    return { ...PERMISSION_GROUPS };
  }
}

// 创建全局权限管理器实例
const permissionManager = new PermissionManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PERMISSIONS,
    PERMISSION_GROUPS,
    PERMISSION_NAMES,
    ROLES,
    LEGACY_PERMISSION_MAP,
    PermissionManager,
    permissionManager
  };
}
