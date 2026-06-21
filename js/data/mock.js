const MockData = {
  users: [
    // 系统管理员 - 拥有全部权限
    {
      id: 'user-001',
      name: '李志刚',
      username: 'admin',
      password: '9898998',
      email: 'li.zg@guruntech.cn',
      avatar: '',
      role: 'admin',
      department: '总经办',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: true, projectEdit: true, projectDelete: true,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: true,
        resourceUpload: true, resourceDownload: true, resourceDelete: true,
        userView: true, userCreate: true, userEdit: true, userDelete: true, userPermission: true,
        systemSettings: true, systemSync: true, systemBackup: true,
        reportView: true, reportExport: true,
        expenseView: true, expenseCreate: true, expenseEdit: true, expenseApprove: true
      }
    },
    // 项目经理 - 研发部
    {
      id: 'user-002',
      name: '王振峰',
      username: 'wang.zf@guruntech.cn',
      password: '954758',
      email: 'wang.zf@guruntech.cn',
      avatar: '',
      role: 'manager',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: true, projectEdit: true, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: true,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: true, reportExport: true,
        expenseView: true, expenseCreate: true, expenseEdit: true, expenseApprove: false
      }
    },
    // 项目经理 - 研发部
    {
      id: 'user-003',
      name: '肖柯',
      username: 'xiao.k@guruntech.cn',
      password: '398583',
      email: 'xiao.k@guruntech.cn',
      avatar: '',
      role: 'manager',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: true, projectEdit: true, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: true,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: true, reportExport: true,
        expenseView: true, expenseCreate: true, expenseEdit: true, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-004',
      name: '谢沛男',
      username: 'xie.pl@guruntech.cn',
      password: '570816',
      email: 'xie.pl@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-005',
      name: '杨蝶',
      username: 'yang.d@guruntech.cn',
      password: '538945',
      email: 'yang.d@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-006',
      name: '黄云辉',
      username: 'ye@guruntech.cn',
      password: '761878',
      email: 'ye@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-007',
      name: '黄慧婷',
      username: 'huang.ht@guruntech.cn',
      password: '471473',
      email: 'huang.ht@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-008',
      name: '杨智健',
      username: 'yangzhijian@guruntech.cn',
      password: '581938',
      email: 'yangzhijian@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-009',
      name: '周树灵',
      username: 'zhoushuling@guruntech.cn',
      password: '415215',
      email: 'zhoushuling@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-010',
      name: '安晓江',
      username: 'anxiaojiang@guruntech.cn',
      password: '666660',
      email: 'anxiaojiang@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-011',
      name: '陈思敏',
      username: 'chen.sm@guruntech.cn',
      password: '264743',
      email: 'chen.sm@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-012',
      name: '刘书晃',
      username: 'liu.sh@guruntech.cn',
      password: '859479',
      email: 'liu.sh@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-013',
      name: '苏东',
      username: 'su.d@guruntech.cn',
      password: '696378',
      email: 'su.d@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-014',
      name: '姚流强',
      username: 'yao.lq@guruntech.cn',
      password: '987033',
      email: 'yao.lq@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-015',
      name: '曾继阳',
      username: 'zengjiyang@guruntech.cn',
      password: '725023',
      email: 'zengjiyang@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 普通成员 - 研发部
    {
      id: 'user-016',
      name: '张景彬',
      username: 'zhang@guruntech.cn',
      password: '769428',
      email: 'zhang@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '研发部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 营销总监 - 营销部
    {
      id: 'user-017',
      name: '陈奕宏',
      username: 'chen.yh@guruntech.cn',
      password: '101624',
      email: 'chen.yh@guruntech.cn',
      avatar: '',
      role: 'manager',
      department: '营销部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: true, projectEdit: true, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: true,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: true, reportExport: true,
        expenseView: true, expenseCreate: true, expenseEdit: true, expenseApprove: false
      }
    },
    // 营销代表 - 营销部
    {
      id: 'user-018',
      name: '何祖怡',
      username: 'hezuyi@guruntech.cn',
      password: '870357',
      email: 'hezuyi@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '营销部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 营销代表 - 营销部
    {
      id: 'user-019',
      name: '黎丹',
      username: 'linihenjin@guruntech.cn',
      password: '813928',
      email: 'linihenjin@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '营销部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 营销代表 - 营销部
    {
      id: 'user-020',
      name: '张宏平',
      username: 'zhanghongping@guruntech.cn',
      password: '978638',
      email: 'zhanghongping@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '营销部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付总监 - 交付部
    {
      id: 'user-021',
      name: '李国用',
      username: 'li.gy@guruntech.cn',
      password: '453335',
      email: 'li.gy@guruntech.cn',
      avatar: '',
      role: 'manager',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: true, projectEdit: true, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: true,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: true, reportExport: true,
        expenseView: true, expenseCreate: true, expenseEdit: true, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-022',
      name: '郑秀兰',
      username: 'zheng.xl@guruntech.cn',
      password: '967533',
      email: 'zheng.xl@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-023',
      name: '唐泽兵',
      username: 'tangzebing@guruntech.cn',
      password: '449289',
      email: 'tangzebing@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-024',
      name: '杨亚',
      username: 'yangya@guruntech.cn',
      password: '464158',
      email: 'yangya@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-025',
      name: '李娅兰',
      username: 'li.yl@guruntech.cn',
      password: '446848',
      email: 'li.yl@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-026',
      name: '李秀军',
      username: 'li.xj@guruntech.cn',
      password: '224821',
      email: 'li.xj@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-027',
      name: '王建芝',
      username: 'wang.jz@guruntech.cn',
      password: '100381',
      email: 'wang.jz@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-028',
      name: '文月',
      username: 'wen.y@guruntech.cn',
      password: '215815',
      email: 'wen.y@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-029',
      name: '蒋春',
      username: 'jiang.c@guruntech.cn',
      password: '735270',
      email: 'jiang.c@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付经理 - 交付部
    {
      id: 'user-030',
      name: '李强',
      username: 'liqiang@guruntech.cn',
      password: '759237',
      email: 'liqiang@guruntech.cn',
      avatar: '',
      role: 'manager',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: true, projectEdit: true, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: true,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: true, reportExport: true,
        expenseView: true, expenseCreate: true, expenseEdit: true, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-031',
      name: '罗昌伙',
      username: 'luo.qh@guruntech.cn',
      password: '342647',
      email: 'luo.qh@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-032',
      name: '彭世辉',
      username: 'peng.sh@guruntech.cn',
      password: '871816',
      email: 'peng.sh@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-033',
      name: '吴志豪',
      username: 'wuzhihao@guruntech.cn',
      password: '341685',
      email: 'wuzhihao@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付成员 - 交付部
    {
      id: 'user-034',
      name: '赵天理',
      username: 'tian@guruntech.cn',
      password: '392575',
      email: 'tian@guruntech.cn',
      avatar: '',
      role: 'member',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: false, projectEdit: false, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: false,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: false, reportExport: false,
        expenseView: true, expenseCreate: true, expenseEdit: false, expenseApprove: false
      }
    },
    // 交付经理 - 交付部
    {
      id: 'user-035',
      name: '谢鑫',
      username: 'xiexin@guruntech.cn',
      password: '480525',
      email: 'xiexin@guruntech.cn',
      avatar: '',
      role: 'manager',
      department: '交付部',
      phone: '',
      createdAt: '2026-01-01T00:00:00Z',
      _version: 1,
      permissions: {
        projectManagement: true, projectCreate: true, projectEdit: true, projectDelete: false,
        taskView: true, taskCreate: true, taskEdit: true, taskComplete: true, taskAssign: true,
        resourceUpload: true, resourceDownload: true, resourceDelete: false,
        userView: true, userCreate: false, userEdit: false, userDelete: false, userPermission: false,
        systemSettings: false, systemSync: false, systemBackup: false,
        reportView: true, reportExport: true,
        expenseView: true, expenseCreate: true, expenseEdit: true, expenseApprove: false
      }
    }
  ],
  projects: [],
  taskStatusConfig: [
    { id: 'todo', name: '待开始', color: '#6b7280', icon: 'circle', category: 'pending', editable: false, _version: 1 },
    { id: 'in_progress', name: '进行中', color: '#3b82f6', icon: 'play', category: 'active', editable: false, _version: 1 },
    { id: 'paused', name: '暂停', color: '#f59e0b', icon: 'pause', category: 'active', editable: false, _version: 1 },
    { id: 'delayed', name: '滞后', color: '#f97316', icon: 'alarm-clock', category: 'active', editable: false, _version: 1 },
    { id: 'overdue', name: '逾期', color: '#ef4444', icon: 'exclamation-triangle', category: 'active', editable: false, _version: 1 },
    { id: 'terminated', name: '终止', color: '#6b7280', icon: 'stop', category: 'closed', editable: false, _version: 1 },
    { id: 'completed', name: '已完成', color: '#10b981', icon: 'check-circle', category: 'closed', editable: false, _version: 1 },
    { id: 'cancelled', name: '已取消', color: '#9ca3af', icon: 'times-circle', category: 'closed', editable: false, _version: 1 }
  ],
  tasks: [],
  documents: [],
  resources: [],
  milestones: [],
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
    teamMembers: 1,
    overdueTasks: 0,
    totalResources: 0,
    totalMilestones: 0,
    completedMilestones: 0
  },
  risks: [],
  issues: [],
  progressReports: [],
  dailyLogs: [],
  warnings: [],
  scheduleChanges: [],
  expenses: [],
  budgets: [],
  payments: [],
  materials: [],
  afterSales: [],
  temporaryWorkers: [],
  workerAttendance: [],
  cameras: [],
  dashboardData: {}
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockData;
}
