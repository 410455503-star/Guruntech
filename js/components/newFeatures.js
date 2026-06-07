// ========== 进度计划管理 ==========
function renderProgress() {
  const state = store.getState();
  const progressReports = state.progressReports || [];
  const warnings = state.warnings || [];
  
  const warningCount = warnings.filter(w => !w.isRead).length;

  const commissioningProjects = state.projects.filter(p => p.phase === 'commissioning' || p.phase === 'trial-run');
  const commissioningProgress = commissioningProjects.length > 0
    ? Math.round(commissioningProjects.reduce((sum, p) => sum + store.getProjectProgress(p.id), 0) / commissioningProjects.length)
    : 0;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">进度计划管理</h1>
        <p class="page-description">实时上报进度，自动对比计划，智能预警滞后工序</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showAddProgressReportModal()">
          <i class="fas fa-plus"></i>
          进度填报
        </button>
        ${warningCount > 0 ? `
          <button class="btn btn-danger" onclick="showWarningsModal()">
            <i class="fas fa-exclamation-triangle"></i>
            预警(${warningCount})
          </button>
        ` : ''}
      </div>
    </div>
    
    <div class="grid grid-cols-4 gap-24 mb-24" style="grid-template-columns: repeat(4, 1fr);">
      <div class="card">
        <div class="text-sm text-muted mb-8">总进度报告</div>
        <div class="text-3xl font-bold text-primary">${progressReports.length}</div>
      </div>
      <div class="card">
        <div class="text-sm text-muted mb-8">滞后工序</div>
        <div class="text-3xl font-bold text-warning">${progressReports.filter(r => r.status === 'delayed').length}</div>
      </div>
      <div class="card">
        <div class="text-sm text-muted mb-8">调试进度</div>
        <div class="text-3xl font-bold text-purple">${commissioningProgress}%</div>
        <div class="text-xs text-muted mt-4">${commissioningProjects.length} 个项目在调试/试运行</div>
      </div>
      <div class="card">
        <div class="text-sm text-muted mb-8">待处理预警</div>
        <div class="text-3xl font-bold text-danger">${warningCount}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3 class="card-title">进度报告列表</h3>
        <div style="display: flex; gap: 12px; align-items: center;">
          <label style="font-size: 13px; color: var(--text-secondary);">项目筛选：</label>
          <select class="form-input" id="progressProjectFilter" onchange="filterProgress()" style="width: 180px; padding: 6px 12px; font-size: 13px;">
            <option value="">全部项目</option>
            ${state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <label style="font-size: 13px; color: var(--text-secondary);">阶段筛选：</label>
          <select class="form-input" id="progressPhaseFilter" onchange="filterProgress()" style="width: 150px; padding: 6px 12px; font-size: 13px;">
            <option value="">全部阶段</option>
            <option value="preparation">前期准备</option>
            <option value="civil">土建施工</option>
            <option value="mechanical">机电安装</option>
            <option value="commissioning">工艺调试</option>
            <option value="trial-run">试运行</option>
            <option value="acceptance">竣工验收</option>
          </select>
        </div>
      </div>
      <div class="card-body" id="progressReportTableBody">
        ${renderProgressTableBody(progressReports, state)}
      </div>
    </div>
  `;
  
  return html;
}

function renderProgressTableBody(progressReports, state) {
  const selectedProject = document.getElementById('progressProjectFilter')?.value || '';
  const selectedPhase = document.getElementById('progressPhaseFilter')?.value || '';
  
  let filtered = progressReports;
  
  if (selectedProject) {
    filtered = filtered.filter(r => r.projectId === selectedProject);
  }
  
  if (selectedPhase) {
    filtered = filtered.filter(r => {
      const project = store.getProjectById(r.projectId);
      return project?.phase === selectedPhase;
    });
  }

  if (filtered.length === 0) {
    return `
      <div class="empty-state" style="padding: 40px;">
        <i class="fas fa-chart-line" style="font-size: 48px; color: var(--text-muted);"></i>
        <h3 style="margin-top: 16px;">暂无进度报告</h3>
        <p class="text-muted">点击"进度填报"按钮创建第一条报告</p>
      </div>`;
  }

  return `
    <div style="background: white; border-radius: 12px; overflow: hidden;">
      <table class="table" style="margin: 0; border: none;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">日期</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">项目</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">工程阶段</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">进度</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">状态</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">进度描述</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">填报人</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(report => {
            const project = store.getProjectById(report.projectId);
            const reporterId = report.reportedBy || report.reporterId;
            const reporter = store.getUserById(reporterId);
            
            // 兼容两种数据格式：mock数据有 overallProgress，表单数据有 plannedProgress/actualProgress
            const progressValue = report.overallProgress !== undefined ? report.overallProgress : report.actualProgress || 0;
            const hasComparison = report.plannedProgress !== undefined && report.actualProgress !== undefined;
            
            const description = report.description || '';
            let statusName = '正常';
            let statusColor = 'tag-success';
            
            // 表单数据有明确的 status 字段
            if (report.status === 'delayed') {
              statusName = '滞后';
              statusColor = 'tag-danger';
            } else if (report.status === 'ahead') {
              statusName = '提前';
              statusColor = 'tag-info';
            } else if (description.includes('滞后') || description.includes('延期') || description.includes('放缓')) {
              statusName = '注意';
              statusColor = 'tag-warning';
            } else if (description.includes('提前')) {
              statusName = '提前';
              statusColor = 'tag-info';
            }
            
            const phaseNames = {
              preparation: '前期准备',
              civil: '土建施工',
              mechanical: '机电安装',
              commissioning: '工艺调试',
              'trial-run': '试运行',
              acceptance: '竣工验收'
            };
            
            const shortDesc = description.length > 40 ? description.substring(0, 40) + '...' : description;
            
            return `
              <tr style="border-bottom: 1px solid #e5e7eb; background: white;">
                <td style="padding: 14px 16px; color: #1f2937;">${DateUtils.formatDate(report.date)}</td>
                <td style="padding: 14px 16px; color: #1f2937;">${project?.name || '-'}</td>
                <td style="padding: 14px 16px; color: #1f2937;">${phaseNames[project?.phase] || project?.phase || '-'}</td>
                <td style="padding: 14px 16px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${hasComparison ? `
                      <span style="font-size: 12px; color: #6b7280;">计划${report.plannedProgress}%</span>
                      <span style="font-weight: 600; color: #1f2937;">实际${report.actualProgress}%</span>
                    ` : `
                      <div class="progress-bar" style="width: 80px; height: 6px;">
                        <div class="progress-bar-fill" style="width: ${progressValue}%;"></div>
                      </div>
                      <span style="color: #1f2937;">${progressValue}%</span>
                    `}
                  </div>
                </td>
                <td style="padding: 14px 16px;"><span class="tag ${statusColor}">${statusName}</span></td>
                <td style="padding: 14px 16px; max-width: 250px; color: #1f2937;" title="${report.description || ''}">${shortDesc || '-'}</td>
                <td style="padding: 14px 16px; color: #1f2937;">${reporter?.name || '-'}</td>
                <td style="padding: 14px 16px;">
                  <button class="btn btn-secondary btn-sm" onclick="viewProgressReport('${report.id}')">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function filterProgress() {
  const state = store.getState();
  const progressReports = state.progressReports || [];
  const tableBody = document.getElementById('progressReportTableBody');
  if (tableBody) {
    tableBody.innerHTML = renderProgressTableBody(progressReports, state);
  }
}

function showAddProgressReportModal() {
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="addProgressReportModal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">进度填报</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addProgressReportModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="addProgressReportForm">
            <div class="form-group">
              <label class="form-label">选择项目 <span style="color: red;">*</span></label>
              <select class="form-input" name="projectId" required onchange="updateTaskOptions(this.value)">
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">选择任务 <span style="color: red;">*</span></label>
              <select class="form-input" name="taskId" id="taskSelect" required>
                <option value="">请先选择项目</option>
              </select>
            </div>
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">计划进度(%) <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="plannedProgress" min="0" max="100" required value="0">
              </div>
              <div class="form-group">
                <label class="form-label">实际进度(%) <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="actualProgress" min="0" max="100" required value="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">进度说明</label>
              <textarea class="form-input form-textarea" name="description" placeholder="请描述当前进度情况"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">填报人</label>
              <select class="form-input" name="reporterId">
                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addProgressReportModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddProgressReport()">提交</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function updateTaskOptions(projectId) {
  const tasks = store.getTasksByProject(projectId);
  const select = document.getElementById('taskSelect');
  select.innerHTML = tasks.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
}

function handleAddProgressReport() {
  const form = document.getElementById('addProgressReportForm');
  const formData = new FormData(form);
  
  const plannedProgress = parseInt(formData.get('plannedProgress'));
  const actualProgress = parseInt(formData.get('actualProgress'));
  
  let status = 'normal';
  if (actualProgress < plannedProgress - 10) {
    status = 'delayed';
    store.addWarning({
      projectId: formData.get('projectId'),
      message: `任务进度滞后：实际进度${actualProgress}%，计划进度${plannedProgress}%`,
      type: 'progress',
      level: 'high',
      dueDate: new Date().toISOString().split('T')[0],
      relatedId: formData.get('taskId')
    });
  } else if (actualProgress > plannedProgress + 10) {
    status = 'ahead';
  }
  
  const reportData = {
    projectId: formData.get('projectId'),
    taskId: formData.get('taskId'),
    date: new Date().toISOString().split('T')[0],
    plannedProgress,
    actualProgress,
    description: formData.get('description'),
    reporterId: formData.get('reporterId'),
    status
  };
  
  store.addProgressReport(reportData);
  closeModal('addProgressReportModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '进度填报成功',
    message: '进度报告已成功提交'
  });
}

function viewProgressReport(reportId) {
  const state = store.getState();
  const report = state.progressReports?.find(r => r.id === reportId);
  if (!report) return;
  
  const project = store.getProjectById(report.projectId);
  const reporter = store.getUserById(report.reportedBy || report.reporterId);
  
  const description = report.description || '';
  let statusName = '正常';
  let statusTag = 'tag-success';
  if (description.includes('滞后') || description.includes('延期') || description.includes('放缓')) {
    statusName = '注意';
    statusTag = 'tag-warning';
  }
  if (description.includes('提前')) {
    statusName = '提前';
    statusTag = 'tag-info';
  }
  
  // Format phase progress if available
  let phaseProgressHtml = '';
  if (report.phaseProgress && Object.keys(report.phaseProgress).length > 0) {
    phaseProgressHtml = Object.entries(report.phaseProgress).map(([phase, progress]) => `
      <div style="display: flex; justify-content: space-between;">
        <span class="text-muted">${phase}</span>
        <span>${progress}%</span>
      </div>
    `).join('');
  }
  
  const html = `
    <div class="modal-overlay" id="viewProgressReportModal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">进度报告详情</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('viewProgressReportModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">报告日期</span>
              <span>${DateUtils.formatDate(report.date)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">项目</span>
              <span>${project?.name || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">填报人</span>
              <span>${reporter?.name || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">总体进度</span>
              <span>${report.overallProgress || 0}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">状态</span>
              <span><span class="tag ${statusTag}">${statusName}</span></span>
            </div>
            ${phaseProgressHtml ? `
              <div style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 4px;">
                <div class="text-muted" style="margin-bottom: 8px; font-weight: 600;">各阶段进度</div>
                ${phaseProgressHtml}
              </div>
            ` : ''}
            <div style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 4px;">
              <div class="text-muted" style="margin-bottom: 8px; font-weight: 600;">进度描述</div>
              <p style="line-height: 1.8; color: var(--text-primary);">${report.description || '暂无描述'}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('viewProgressReportModal')">关闭</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function showWarningsModal() {
  const state = store.getState();
  const warnings = state.warnings || [];
  
  const html = `
    <div class="modal-overlay" id="warningsModal">
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h3 class="modal-title">工期预警</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('warningsModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${warnings.length === 0 ? `
            <div class="empty-state" style="padding: 40px;">
              <i class="fas fa-check-circle" style="font-size: 48px; color: var(--success-color);"></i>
              <h3 style="margin-top: 16px;">暂无预警</h3>
              <p class="text-muted">所有工序正常进行中</p>
            </div>
          ` : `
            <table class="table">
              <thead>
                <tr>
                  <th>预警日期</th>
                  <th>预警信息</th>
                  <th>级别</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${warnings.map(warning => {
                  const levelColors = {
                    urgent: 'tag-danger',
                    high: 'tag-danger',
                    medium: 'tag-warning',
                    low: 'tag-info'
                  };
                  const levelNames = {
                    urgent: '紧急',
                    high: '高',
                    medium: '中',
                    low: '低'
                  };
                  const message = warning.message || warning.title || '未知警告';
                  const level = warning.level || 'medium';
                  const dueDate = warning.dueDate || warning.createdAt || '';
                  const isRead = warning.isRead || false;
                  return `
                    <tr>
                      <td>${dueDate ? DateUtils.formatDate(dueDate) : '-'}</td>
                      <td>${message}</td>
                      <td><span class="tag ${levelColors[level]}">${levelNames[level]}</span></td>
                      <td><span class="tag ${isRead ? 'tag-success' : 'tag-warning'}">${isRead ? '已处理' : '未处理'}</span></td>
                      <td>
                        ${!isRead ? `
                          <button class="btn btn-primary btn-sm" onclick="markWarningAsRead('${warning.id}')">
                            标记已读
                          </button>
                        ` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function markWarningAsRead(warningId) {
  store.markWarningRead(warningId);
  closeModal('warningsModal');
  renderContent();
}

// ========== 施工日志 ==========
function renderDailyLog() {
  const state = store.getState();
  const dailyLogs = state.dailyLogs || [];
  const projects = state.projects || [];
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">施工日志</h1>
        <p class="page-description">记录每日施工情况，一键汇总统计</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" onclick="exportDailyLogs()">
          <i class="fas fa-file-export"></i>
          导出汇总
        </button>
        <button class="btn btn-primary" onclick="showAddDailyLogModal()">
          <i class="fas fa-plus"></i>
          新建日志
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3 class="card-title">施工日志列表</h3>
        <div style="display: flex; gap: 12px; align-items: center;">
          <label style="font-size: 13px; color: var(--text-secondary);">项目筛选：</label>
          <select class="form-input" id="dailyLogProjectFilter" onchange="filterDailyLog()" style="width: 180px; padding: 6px 12px; font-size: 13px;">
            <option value="">全部项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card-body" id="dailyLogTableBody">
        ${renderDailyLogTableBody(dailyLogs, projects)}
      </div>
    </div>
  `;
  
  return html;
}

function renderDailyLogTableBody(dailyLogs, projects) {
  const selectedProject = document.getElementById('dailyLogProjectFilter')?.value || '';
  const filtered = selectedProject
    ? dailyLogs.filter(log => log.projectId === selectedProject)
    : dailyLogs;

  if (filtered.length === 0) {
    return `
      <div class="empty-state" style="padding: 40px;">
        <i class="fas fa-book" style="font-size: 48px; color: var(--text-muted);"></i>
        <h3 style="margin-top: 16px;">暂无施工日志</h3>
        <p class="text-muted">点击"新建日志"按钮创建第一条记录</p>
      </div>
    `;
  }

  const phaseNames = { preparation: '前期准备', civil: '土建施工', mechanical: '机电安装', commissioning: '工艺调试', 'trial-run': '试运行', acceptance: '竣工验收' };
  
  // 设备状态：兼容中英文
  const equipmentMap = {
    '正常': { name: '正常', cls: 'tag-success' },
    '故障': { name: '故障', cls: 'tag-danger' },
    '维护中': { name: '维护中', cls: 'tag-warning' },
    'normal': { name: '正常', cls: 'tag-success' },
    'fault': { name: '故障', cls: 'tag-danger' },
    'maintenance': { name: '维护中', cls: 'tag-warning' }
  };
  
  // 施工状态：从内容关键词推断
  function getLogStatus(log) {
    const content = log.content || '';
    if (content.includes('停工') || content.includes('暂停')) return { name: '停工', cls: 'tag-danger' };
    if (content.includes('滞后') || content.includes('延误')) return { name: '滞后', cls: 'tag-warning' };
    return { name: '正常', cls: 'tag-success' };
  }
  
  // 绩效：从内容关键词推断
  function getPerformance(log) {
    const content = log.content || '';
    if (content.includes('提前') || content.includes('超标')) return { name: '优秀', cls: 'tag-success' };
    if (content.includes('正常') || content.includes('达标') || content.includes('安全')) return { name: '良好', cls: 'tag-info' };
    return { name: '一般', cls: 'tag-warning' };
  }
  
  // 从内容提取施工人数
  function extractWorkerCount(log) {
    const content = log.content || '';
    const match = content.match(/(\d+)人/);
    return match ? match[1] : null;
  }

  return `
    <div style="background: white; border-radius: 12px; overflow: hidden;">
      <table class="table" style="margin: 0; border: none;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">日期</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">天气</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">项目</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">工程阶段</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">人数</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">状态</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">设备状态</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">绩效</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">填报人</th>
            <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(log => {
            const project = projects.find(p => p.id === log.projectId);
            const reporterId = log.reporter || log.reporterId;
            const reporter = store.getUserById(reporterId);
            const status = getLogStatus(log);
            const performance = getPerformance(log);
            const equipStatus = log.equipmentStatus ? (equipmentMap[log.equipmentStatus] || { name: log.equipmentStatus, cls: 'tag-success' }) : null;
            const workerCount = log.workers || extractWorkerCount(log);
            
            return `
              <tr style="border-bottom: 1px solid #e5e7eb; background: white;">
                <td style="padding: 14px 16px; color: #1f2937;">${DateUtils.formatDate(log.date)}</td>
                <td style="padding: 14px 16px; color: #1f2937;">${log.weather}</td>
                <td style="padding: 14px 16px; color: #1f2937;">${project?.name || '-'}</td>
                <td style="padding: 14px 16px; color: #1f2937;">${phaseNames[log.phase] || log.phase || '-'}</td>
                <td style="padding: 14px 16px; color: #1f2937;">${workerCount ? workerCount + '人' : '-'}</td>
                <td style="padding: 14px 16px;"><span class="tag ${status.cls}">${status.name}</span></td>
                <td style="padding: 14px 16px;">${equipStatus ? `<span class="tag ${equipStatus.cls}">${equipStatus.name}</span>` : '-'}</td>
                <td style="padding: 14px 16px;"><span class="tag ${performance.cls}">${performance.name}</span></td>
                <td style="padding: 14px 16px; color: #1f2937;">${reporter?.name || '-'}</td>
                <td style="padding: 14px 16px;">
                  <button class="btn btn-secondary btn-sm" onclick="viewDailyLog('${log.id}')">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="editDailyLog('${log.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function filterDailyLog() {
  const state = store.getState();
  const dailyLogs = state.dailyLogs || [];
  const projects = state.projects || [];
  const tableBody = document.getElementById('dailyLogTableBody');
  if (tableBody) {
    tableBody.innerHTML = renderDailyLogTableBody(dailyLogs, projects);
  }
}

function showAddDailyLogModal() {
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="addDailyLogModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">新建施工日志</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addDailyLogModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="addDailyLogForm">
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label class="form-label">天气 <span style="color: red;">*</span></label>
                <select class="form-input" name="weather" required>
                  <option value="晴">晴</option>
                  <option value="多云">多云</option>
                  <option value="阴">阴</option>
                  <option value="小雨">小雨</option>
                  <option value="中雨">中雨</option>
                  <option value="大雨">大雨</option>
                  <option value="雪">雪</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">项目 <span style="color: red;">*</span></label>
              <select class="form-input" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">施工人数 <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="workers" min="0" required value="0">
              </div>
              <div class="form-group">
                <label class="form-label">施工状态 <span style="color: red;">*</span></label>
                <select class="form-input" name="status" required>
                  <option value="normal">正常</option>
                  <option value="delayed">滞后</option>
                  <option value="stopped">停工</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">工程阶段</label>
              <select class="form-input" name="phase">
                <option value="">请选择阶段</option>
                <option value="preparation">前期准备</option>
                <option value="civil">土建施工</option>
                <option value="mechanical">机电安装</option>
                <option value="commissioning">工艺调试</option>
                <option value="trial-run">试运行</option>
                <option value="acceptance">竣工验收</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">设备运行状态</label>
              <select class="form-input" name="equipmentStatus">
                <option value="normal">正常</option>
                <option value="fault">故障</option>
                <option value="maintenance">维护中</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">绩效评估</label>
              <select class="form-input" name="performance">
                <option value="excellent">优秀</option>
                <option value="good">良好</option>
                <option value="average" selected>一般</option>
                <option value="poor">较差</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">今日施工内容</label>
              <textarea class="form-input form-textarea" name="content" placeholder="请描述今日施工内容"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">今日工艺参数</label>
              <textarea class="form-input form-textarea" name="processParams" placeholder="调试阶段请记录工艺参数，如：进水量、COD、氨氮、DO、MLSS、SV30等"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">明日计划</label>
              <textarea class="form-input form-textarea" name="tomorrowPlan" placeholder="请描述明日施工计划"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">存在问题</label>
              <textarea class="form-input form-textarea" name="issues" placeholder="请描述存在的问题"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">填报人</label>
              <select class="form-input" name="reporterId">
                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addDailyLogModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddDailyLog()">提交</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddDailyLog() {
  const form = document.getElementById('addDailyLogForm');
  const formData = new FormData(form);
  
  const logData = {
    date: formData.get('date'),
    weather: formData.get('weather'),
    projectId: formData.get('projectId'),
    workers: parseInt(formData.get('workers')),
    status: formData.get('status'),
    phase: formData.get('phase'),
    equipmentStatus: formData.get('equipmentStatus'),
    performance: formData.get('performance'),
    content: formData.get('content'),
    processParams: formData.get('processParams'),
    tomorrowPlan: formData.get('tomorrowPlan'),
    issues: formData.get('issues'),
    reporterId: formData.get('reporterId')
  };
  
  store.addDailyLog(logData);
  closeModal('addDailyLogModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '施工日志创建成功',
    message: '施工日志已成功保存'
  });
}

function viewDailyLog(logId) {
  const state = store.getState();
  const log = state.dailyLogs?.find(l => l.id === logId);
  if (!log) return;
  
  const project = state.projects.find(p => p.id === log.projectId);
  const reporterId = log.reporter || log.reporterId;
  const reporter = store.getUserById(reporterId);
  
  const phaseNames = { preparation: '前期准备', civil: '土建施工', mechanical: '机电安装', commissioning: '工艺调试', 'trial-run': '试运行', acceptance: '竣工验收' };
  const equipmentMap = { '正常': '正常', '故障': '故障', '维护中': '维护中', 'normal': '正常', 'fault': '故障', 'maintenance': '维护中' };
  
  const content = log.content || '';
  function getStatus() { if (content.includes('停工') || content.includes('暂停')) return '停工'; if (content.includes('滞后') || content.includes('延误')) return '滞后'; return '正常'; }
  function getPerformance() { if (content.includes('提前') || content.includes('超标')) return '优秀'; if (content.includes('正常') || content.includes('达标')) return '良好'; return '一般'; }
  function getWorkerCount() { const m = content.match(/(\d+)人/); return m ? m[1] : (log.workers || '-'); }
  
  const html = `
    <div class="modal-overlay" id="viewDailyLogModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">施工日志详情</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('viewDailyLogModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="display: grid; gap: 16px;">
            <div class="grid grid-cols-2 gap-16">
              <div>
                <span class="text-muted">日期</span>
                <p style="font-weight: 500;">${DateUtils.formatDate(log.date)}</p>
              </div>
              <div>
                <span class="text-muted">天气</span>
                <p style="font-weight: 500;">${log.weather}</p>
              </div>
            </div>
            <div>
              <span class="text-muted">项目</span>
              <p style="font-weight: 500;">${project?.name || '-'}</p>
            </div>
            <div class="grid grid-cols-3 gap-16">
              <div>
                <span class="text-muted">施工人数</span>
                <p style="font-weight: 500;">${getWorkerCount()}人</p>
              </div>
              <div>
                <span class="text-muted">状态</span>
                <p style="font-weight: 500;">${getStatus()}</p>
              </div>
              <div>
                <span class="text-muted">绩效</span>
                <p style="font-weight: 500;">${getPerformance()}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-16">
              <div>
                <span class="text-muted">工程阶段</span>
                <p style="font-weight: 500;">${phaseNames[log.phase] || log.phase || '-'}</p>
              </div>
              <div>
                <span class="text-muted">设备运行状态</span>
                <p style="font-weight: 500;">${log.equipmentStatus ? (equipmentMap[log.equipmentStatus] || log.equipmentStatus) : '-'}</p>
              </div>
            </div>
            <div>
              <span class="text-muted">填报人</span>
              <p style="font-weight: 500;">${reporter?.name || '-'}</p>
            </div>
            ${log.content ? `
              <div>
                <span class="text-muted">今日施工内容</span>
                <p style="margin-top: 8px; padding: 12px; background: var(--bg-light); border-radius: 4px;">${log.content}</p>
              </div>
            ` : ''}
            ${log.processParams ? `
              <div>
                <span class="text-muted">今日工艺参数</span>
                <p style="margin-top: 8px; padding: 12px; background: var(--bg-light); border-radius: 4px;">${log.processParams}</p>
              </div>
            ` : ''}
            ${log.tomorrowPlan ? `
              <div>
                <span class="text-muted">明日计划</span>
                <p style="margin-top: 8px; padding: 12px; background: var(--bg-light); border-radius: 4px;">${log.tomorrowPlan}</p>
              </div>
            ` : ''}
            ${log.issues ? `
              <div>
                <span class="text-muted">存在问题</span>
                <p style="margin-top: 8px; padding: 12px; background: var(--bg-light); border-radius: 4px;">${log.issues}</p>
              </div>
            ` : ''}
            <div>
              <span class="text-muted">填报人</span>
              <p style="font-weight: 500;">${reporter?.name || '-'}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('viewDailyLogModal')">关闭</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function editDailyLog(logId) {
  const state = store.getState();
  const log = state.dailyLogs?.find(l => l.id === logId);
  if (!log) return;
  
  const projects = state.projects;
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="editDailyLogModal">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑施工日志</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editDailyLogModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editDailyLogForm">
            <input type="hidden" name="logId" value="${log.id}">
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="date" required value="${log.date}">
              </div>
              <div class="form-group">
                <label class="form-label">天气 <span style="color: red;">*</span></label>
                <select class="form-input" name="weather" required>
                  <option value="晴" ${log.weather === '晴' ? 'selected' : ''}>晴</option>
                  <option value="多云" ${log.weather === '多云' ? 'selected' : ''}>多云</option>
                  <option value="阴" ${log.weather === '阴' ? 'selected' : ''}>阴</option>
                  <option value="小雨" ${log.weather === '小雨' ? 'selected' : ''}>小雨</option>
                  <option value="中雨" ${log.weather === '中雨' ? 'selected' : ''}>中雨</option>
                  <option value="大雨" ${log.weather === '大雨' ? 'selected' : ''}>大雨</option>
                  <option value="雪" ${log.weather === '雪' ? 'selected' : ''}>雪</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">项目 <span style="color: red;">*</span></label>
              <select class="form-input" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}" ${p.id === log.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">施工人数 <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="workers" min="0" required value="${log.workers}">
              </div>
              <div class="form-group">
                <label class="form-label">施工状态 <span style="color: red;">*</span></label>
                <select class="form-input" name="status" required>
                  <option value="normal" ${log.status === 'normal' ? 'selected' : ''}>正常</option>
                  <option value="delayed" ${log.status === 'delayed' ? 'selected' : ''}>滞后</option>
                  <option value="stopped" ${log.status === 'stopped' ? 'selected' : ''}>停工</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">工程阶段</label>
              <select class="form-input" name="phase">
                <option value="">请选择阶段</option>
                <option value="preparation" ${log.phase === 'preparation' ? 'selected' : ''}>前期准备</option>
                <option value="civil" ${log.phase === 'civil' ? 'selected' : ''}>土建施工</option>
                <option value="mechanical" ${log.phase === 'mechanical' ? 'selected' : ''}>机电安装</option>
                <option value="commissioning" ${log.phase === 'commissioning' ? 'selected' : ''}>工艺调试</option>
                <option value="trial-run" ${log.phase === 'trial-run' ? 'selected' : ''}>试运行</option>
                <option value="acceptance" ${log.phase === 'acceptance' ? 'selected' : ''}>竣工验收</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">设备运行状态</label>
              <select class="form-input" name="equipmentStatus">
                <option value="normal" ${log.equipmentStatus === 'normal' ? 'selected' : ''}>正常</option>
                <option value="fault" ${log.equipmentStatus === 'fault' ? 'selected' : ''}>故障</option>
                <option value="maintenance" ${log.equipmentStatus === 'maintenance' ? 'selected' : ''}>维护中</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">绩效评估</label>
              <select class="form-input" name="performance">
                <option value="excellent" ${log.performance === 'excellent' ? 'selected' : ''}>优秀</option>
                <option value="good" ${log.performance === 'good' ? 'selected' : ''}>良好</option>
                <option value="average" ${log.performance === 'average' ? 'selected' : ''}>一般</option>
                <option value="poor" ${log.performance === 'poor' ? 'selected' : ''}>较差</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">今日施工内容</label>
              <textarea class="form-input form-textarea" name="content">${log.content || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">今日工艺参数</label>
              <textarea class="form-input form-textarea" name="processParams">${log.processParams || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">明日计划</label>
              <textarea class="form-input form-textarea" name="tomorrowPlan">${log.tomorrowPlan || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">存在问题</label>
              <textarea class="form-input form-textarea" name="issues">${log.issues || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">填报人</label>
              <select class="form-input" name="reporterId">
                ${users.map(u => `<option value="${u.id}" ${u.id === log.reporterId ? 'selected' : ''}>${u.name}</option>`).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editDailyLogModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditDailyLog()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditDailyLog() {
  const form = document.getElementById('editDailyLogForm');
  const formData = new FormData(form);
  
  const logId = formData.get('logId');
  const logData = {
    date: formData.get('date'),
    weather: formData.get('weather'),
    projectId: formData.get('projectId'),
    workers: parseInt(formData.get('workers')),
    status: formData.get('status'),
    phase: formData.get('phase'),
    equipmentStatus: formData.get('equipmentStatus'),
    performance: formData.get('performance'),
    content: formData.get('content'),
    processParams: formData.get('processParams'),
    tomorrowPlan: formData.get('tomorrowPlan'),
    issues: formData.get('issues'),
    reporterId: formData.get('reporterId')
  };
  
  store.updateDailyLog(logId, logData);
  closeModal('editDailyLogModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '施工日志更新成功',
    message: '施工日志已成功更新'
  });
}

function exportDailyLogs() {
  const state = store.getState();
  const dailyLogs = state.dailyLogs || [];
  const projects = state.projects || [];
  
  if (dailyLogs.length === 0) {
    alert('暂无施工日志可导出');
    return;
  }
  
  let csvContent = '日期,天气,项目,工程阶段,人数,状态,设备状态,绩效,填报人\n';
  dailyLogs.forEach(log => {
    const project = projects.find(p => p.id === log.projectId);
    const reporterId = log.reporter || log.reporterId;
    const reporter = store.getUserById(reporterId);
    const phaseNames = { preparation: '前期准备', civil: '土建施工', mechanical: '机电安装', commissioning: '工艺调试', 'trial-run': '试运行', acceptance: '竣工验收' };
    const equipmentMap = { '正常': '正常', '故障': '故障', '维护中': '维护中', 'normal': '正常', 'fault': '故障', 'maintenance': '维护中' };
    const content = log.content || '';
    function getStatus() { if (content.includes('停工') || content.includes('暂停')) return '停工'; if (content.includes('滞后') || content.includes('延误')) return '滞后'; return '正常'; }
    function getPerformance() { if (content.includes('提前') || content.includes('超标')) return '优秀'; if (content.includes('正常') || content.includes('达标')) return '良好'; return '一般'; }
    function getWorkerCount() { const m = content.match(/(\d+)人/); return m ? m[1] : (log.workers || '-'); }
    const equipStatus = log.equipmentStatus ? (equipmentMap[log.equipmentStatus] || log.equipmentStatus) : '-';
    csvContent += `${log.date},${log.weather},${project?.name || '-'},${phaseNames[log.phase] || log.phase || '-'},${getWorkerCount()},${getStatus()},${equipStatus},${getPerformance()},${reporter?.name || '-'}\n`;
  });
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `施工日志汇总_${DateUtils.formatDate(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  store.addNotification({
    type: 'success',
    title: '导出成功',
    message: '施工日志汇总已成功导出'
  });
}

// ========== 预算管理 ==========
function renderBudget() {
  const state = store.getState();
  const budgets = state.budgets || [];
  const projects = state.projects || [];
  
  const categories = ['人工费用', '设备采购', '材料费用', '设备租赁', '施工费用', '安装费用', '调试费用', '管理费用', '其他'];  // Budget categories
  const totalBudget = budgets.reduce((sum, item) => sum + (item.totalAmount || item.budget || 0), 0);
  const totalSpent = budgets.reduce((sum, item) => sum + (item.spentAmount || item.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const overBudget = budgets.filter(item => (item.spentAmount || item.spent || 0) > (item.totalAmount || item.budget || 0));
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">预算管理</h1>
        <p class="page-description">按项目、按类别设置预算，实时追踪已用金额，超预算自动预警</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showAddBudgetItemModal()">
          <i class="fas fa-plus"></i>
          新增预算项
        </button>
      </div>
    </div>
    
    <!-- 总体统计卡片 -->
    <div class="grid grid-cols-4 gap-4" style="margin-bottom: 24px;">
      <div class="card stat-card" style="border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">总预算</div>
            <div style="font-size: 28px; font-weight: 700;">¥${totalBudget.toLocaleString()}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${budgets.length} 项预算</div>
          </div>
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-coins" style="font-size: 24px;"></i>
          </div>
        </div>
      </div>
      
      <div class="card stat-card" style="border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">已使用</div>
            <div style="font-size: 28px; font-weight: 700;">¥${totalSpent.toLocaleString()}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">总支出</div>
          </div>
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-chart-line" style="font-size: 24px;"></i>
          </div>
        </div>
      </div>
      
      <div class="card stat-card" style="border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">剩余可用</div>
            <div style="font-size: 28px; font-weight: 700;">¥${remaining.toLocaleString()}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">可用余额</div>
          </div>
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-piggy-bank" style="font-size: 24px;"></i>
          </div>
        </div>
      </div>
      
      <div class="card stat-card" style="border-radius: 16px; padding: 20px; background: linear-gradient(135deg, ${overBudget.length > 0 ? '#ff416c 0%, #ff4b2b' : '#11998e 0%, #38ef7d'} 100%); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">${overBudget.length > 0 ? '超预算项' : '超预算项'}</div>
            <div style="font-size: 28px; font-weight: 700;">${overBudget.length}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${overBudget.length > 0 ? '需关注' : '状态良好'}</div>
          </div>
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 按项目分别统计 -->
    <div class="card" style="margin-bottom: 24px; border-radius: 16px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">项目预算概览</h3>
        </div>
      </div>
      <div class="card-body" style="padding: 20px;">
        ${projects.length === 0 ? `
          <div class="empty-state" style="padding: 60px 0; text-align: center;">
            <div style="width: 100px; height: 100px; margin: 0 auto 16px; background: var(--bg-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-folder-open" style="font-size: 40px; color: var(--text-muted);"></i>
            </div>
            <h4 style="margin-bottom: 8px;">暂无项目</h4>
            <p class="text-muted" style="font-size: 14px;">请先创建项目后再设置预算</p>
          </div>
        ` : projects.map((project, idx) => {
          const colors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];
          const color = colors[idx % colors.length];
          const projectBudgets = budgets.filter(b => b.projectId === project.id);
          const projTotal = projectBudgets.reduce((sum, b) => sum + (b.totalAmount || b.budget || 0), 0);
          const projSpent = projectBudgets.reduce((sum, b) => sum + (b.spentAmount || b.spent || 0), 0);
          const projRemaining = projTotal - projSpent;
          const projRate = projTotal > 0 ? Math.round((projSpent / projTotal) * 100) : 0;
          const isOver = projRate >= 100;
          const isWarn = projRate >= 80 && projRate < 100;
          
          // 项目下各分类统计
          const projCategories = {};
          projectBudgets.forEach(b => {
            const cat = b.category || '其他';
            if (!projCategories[cat]) projCategories[cat] = { total: 0, spent: 0 };
            projCategories[cat].total += (b.totalAmount || b.budget || 0);
            projCategories[cat].spent += (b.spentAmount || b.spent || 0);
          });
          
          const statusColor = isOver ? '#ef4444' : isWarn ? '#f59e0b' : color;
          
          return `
            <div style="padding: 24px; margin-bottom: 20px; background: rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.06); border-radius: 16px; border: 1px solid ${color}20; transition: all 0.3s ease;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 44px; height: 44px; background: ${color}; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-building" style="color: white; font-size: 20px;"></i>
                  </div>
                  <div>
                    <h4 style="font-size: 16px; font-weight: 600; color: ${color}; margin-bottom: 4px;">${project.name}</h4>
                    <div style="display: flex; gap: 8px;">
                      <span class="tag tag-muted" style="font-size: 11px; background: rgba(0,0,0,0.05);">${projectBudgets.length}项预算</span>
                      ${isOver ? '<span class="tag" style="font-size: 11px; background: rgba(239, 68, 68, 0.15); color: #ef4444;">超预算</span>' : isWarn ? '<span class="tag" style="font-size: 11px; background: rgba(245, 158, 11, 0.15); color: #f59e0b;">接近超支</span>' : (projTotal > 0 ? '<span class="tag" style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #10b981;">正常</span>' : '')}
                    </div>
                  </div>
                </div>
                ${projTotal > 0 ? `
                  <div style="text-align: right;">
                    <div style="font-size: 28px; font-weight: 700; color: ${statusColor};">¥${projTotal.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">预算总额</div>
                  </div>
                ` : ''}
              </div>
              
              ${projTotal > 0 ? `
                <!-- 金额明细 -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                  <div style="text-align: center; padding: 14px 10px; background: rgba(0,0,0,0.04); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: ${color};">¥${projTotal.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">总预算</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(245, 158, 11, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">¥${projSpent.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">已使用</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #10b981;">¥${projRemaining.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">剩余</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(99, 102, 241, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: ${statusColor};">${projRate}%</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">使用率</div>
                  </div>
                </div>
                
                <!-- 进度条 -->
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">
                    <span>使用进度</span>
                    <span>${projRate}%</span>
                  </div>
                  <div style="height: 8px; background: rgba(0,0,0,0.06); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(projRate, 100)}%; border-radius: 4px; background: linear-gradient(90deg, ${color}, ${isOver ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981'}); transition: width 0.5s ease;"></div>
                  </div>
                </div>
                
                <!-- 类别明细行 -->
                ${Object.keys(projCategories).length > 0 ? `
                <div style="padding-top: 16px; border-top: 1px dashed rgba(0,0,0,0.1);">
                  <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">预算分类</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${Object.entries(projCategories).map(([cat, s]) => {
                      const catRate = s.total > 0 ? Math.round((s.spent / s.total) * 100) : 0;
                      return `
                        <span style="padding: 6px 14px; background: white; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                          <span style="color: var(--text-secondary);">${cat}</span>
                          <span style="font-weight: 600; color: ${color};">¥${s.total.toLocaleString()}</span>
                          <span style="color: var(--text-muted);">(${catRate}%)</span>
                        </span>
                      `;
                    }).join('')}
                  </div>
                </div>
                ` : ''}
              ` : `
                <div style="padding: 20px 0; text-align: center;">
                  <div style="width: 50px; height: 50px; margin: 0 auto 10px; background: rgba(0,0,0,0.04); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-plus" style="font-size: 20px; color: ${color};"></i>
                  </div>
                  <p style="font-size: 13px; color: var(--text-muted);">暂未设置预算，点击右上角"新增预算项"添加</p>
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <!-- 预算列表 -->
    <div class="card" style="border-radius: 16px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #10b981 0%, #38ef7d 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">预算明细</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <select class="form-input" id="budgetProjectFilter" onchange="filterBudgetItems()" style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-primary);">
            <option value="">全部项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <select class="form-input" id="budgetCategoryFilter" onchange="filterBudgetItems()" style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-primary);">
            <option value="">全部类别</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card-body" id="budgetTableContainer" style="padding: 0;">
        ${renderBudgetTableBody(budgets, projects)}
      </div>
    </div>
  `;
  
  return html;
}

function renderBudgetTableBody(budgetList, projects) {
  if (budgetList.length === 0) {
    return `
      <div class="empty-state" style="padding: 60px 0;">
        <i class="fas fa-wallet" style="font-size: 56px; color: var(--text-muted); opacity: 0.4;"></i>
        <h3 style="margin-top: 16px; font-weight: 600;">暂无预算项</h3>
        <p class="text-muted">点击右上角"新增预算项"为项目创建预算记录</p>
      </div>
    `;
  }
  
  // 按项目分组
  const grouped = {};
  budgetList.forEach(item => {
    const pid = item.projectId || 'no-project';
    if (!grouped[pid]) grouped[pid] = { items: [], project: null };
    grouped[pid].items.push(item);
    grouped[pid].project = projects.find(p => p.id === item.projectId);
  });
  
  let html = '';
  Object.keys(grouped).forEach(pid => {
    const group = grouped[pid];
    const projectName = group.project?.name || '未分配项目';
    const groupTotal = group.items.reduce((sum, i) => sum + (i.totalAmount || i.budget || 0), 0);
    const groupSpent = group.items.reduce((sum, i) => sum + (i.spentAmount || i.spent || 0), 0);
    const projectColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];
    const colorIndex = group.project ? projects.findIndex(p => p.id === group.project.id) % projectColors.length : 0;
    const color = projectColors[colorIndex];
    
    html += `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.06); border-radius: 12px; border: 1px solid ${color}20;">
          <div style="width: 36px; height: 36px; background: ${color}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-folder-open" style="color: white; font-size: 14px;"></i>
          </div>
          <span style="font-weight: 600; font-size: 15px; color: ${color};">${projectName}</span>
          <span class="tag" style="font-size: 11px; background: rgba(0,0,0,0.06);">${group.items.length}项预算</span>
          <span style="margin-left: auto; font-size: 14px; color: var(--text-secondary);">
            合计: <b style="color: ${color};">¥${groupTotal.toLocaleString()}</b> / 已用: <b style="color: #f59e0b;">¥${groupSpent.toLocaleString()}</b>
          </span>
        </div>
        <div style="background: var(--bg-primary); border-radius: 12px; overflow: hidden;">
          <table class="table" style="margin: 0; border: none;">
            <thead>
              <tr style="background: var(--bg-secondary);">
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">类别</th>
                <th style="padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">预算名称</th>
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">预算金额</th>
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">已用金额</th>
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">剩余金额</th>
                <th style="width: 160px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">使用率</th>
                <th style="width: 90px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">状态</th>
                <th style="width: 140px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${group.items.map(item => {
                const itemBudget = item.totalAmount || item.budget || 0;
                const itemSpent = item.spentAmount || item.spent || 0;
                const usageRate = itemBudget > 0 ? Math.round((itemSpent / itemBudget) * 100) : 0;
                const remainingAmount = itemBudget - itemSpent;
                let statusBg = 'rgba(16, 185, 129, 0.15)';
                let statusColor = '#10b981';
                let statusText = '正常';
                if (usageRate >= 100) {
                  statusBg = 'rgba(239, 68, 68, 0.15)';
                  statusColor = '#ef4444';
                  statusText = '超支';
                } else if (usageRate >= 80) {
                  statusBg = 'rgba(245, 158, 11, 0.15)';
                  statusColor = '#f59e0b';
                  statusText = '接近超支';
                }
                return `
                  <tr style="border-bottom: 1px solid var(--border-color); background: white; transition: background 0.2s;">
                    <td style="padding: 14px 16px;"><span class="tag" style="font-size: 11px; background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 4px 10px; border-radius: 4px;">${item.category || '其他'}</span></td>
                    <td style="padding: 14px 16px;">
                      <div style="font-weight: 500; color: #1f2937;">${item.name}</div>
                      ${item.description ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${item.description}</div>` : ''}
                    </td>
                    <td style="padding: 14px 16px; font-weight: 600; color: #1f2937;">¥${itemBudget.toLocaleString()}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">¥${itemSpent.toLocaleString()}</td>
                    <td style="padding: 14px 16px; color: ${remainingAmount < 0 ? '#ef4444' : '#1f2937'}; font-weight: ${remainingAmount < 0 ? '600' : '400'};">¥${remainingAmount.toLocaleString()}</td>
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden;">
                          <div style="height: 100%; width: ${Math.min(usageRate, 100)}%; border-radius: 3px; background: ${usageRate >= 100 ? '#ef4444' : usageRate >= 80 ? '#f59e0b' : color}; transition: width 0.3s;"></div>
                        </div>
                        <span style="font-size: 12px; font-weight: 500; min-width: 35px; color: #1f2937;">${usageRate}%</span>
                      </div>
                    </td>
                    <td style="padding: 14px 16px;"><span class="tag" style="font-size: 11px; background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 4px;">${statusText}</span></td>
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="showEditBudgetItemModal('${item.id}')" title="编辑" style="padding: 6px 8px;">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="showAddExpenseModal('${item.id}')" title="记录支出" style="padding: 6px 8px;">
                          <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBudgetItem('${item.id}')" title="删除" style="padding: 6px 8px;">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
  
  return html;
}

function filterBudgetItems() {
  const state = store.getState();
  let budgets = state.budgets || [];
  const projects = state.projects || [];
  
  const projectFilter = document.getElementById('budgetProjectFilter')?.value;
  const categoryFilter = document.getElementById('budgetCategoryFilter')?.value;
  
  if (projectFilter) {
    budgets = budgets.filter(b => b.projectId === projectFilter);
  }
  if (categoryFilter) {
    budgets = budgets.filter(b => (b.category || '其他') === categoryFilter);
  }
  
  const container = document.getElementById('budgetTableContainer');
  if (container) {
    container.innerHTML = renderBudgetTableBody(budgets, projects);
  }
}

function deleteBudgetItem(itemId) {
  if (!confirm('确定要删除此预算项吗？已记录的支出将一并移除。')) return;
  store.deleteBudget(itemId);
  renderContent();
  store.addNotification({ type: 'info', title: '预算已删除', message: '预算项已从系统中移除' });
}

function showAddBudgetItemModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="addBudgetItemModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">新增预算</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addBudgetItemModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="addBudgetItemForm">
            <div class="form-group">
              <label class="form-label">项目 <span style="color: red;">*</span></label>
              <select class="form-input" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">预算名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入预算名称">
            </div>
            <div class="form-group">
              <label class="form-label">费用类别 <span style="color: red;">*</span></label>
              <select class="form-input" name="category" required>
                <option value="人工费用">人工费用</option>
                <option value="设备采购">设备采购</option>
                <option value="材料费用">材料费用</option>
                <option value="设备租赁">设备租赁</option>
                <option value="施工费用">施工费用</option>
                <option value="安装费用">安装费用</option>
                <option value="调试费用">调试费用</option>
                <option value="管理费用">管理费用</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">预算金额 <span style="color: red;">*</span></label>
              <input type="number" class="form-input" name="budget" min="0" required placeholder="请输入预算金额">
            </div>
            <div class="form-group">
              <label class="form-label">已用金额</label>
              <input type="number" class="form-input" name="spent" min="0" value="0" placeholder="请输入已用金额">
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="description" placeholder="请输入备注"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addBudgetItemModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddBudgetItem()">提交</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddBudgetItem() {
  const form = document.getElementById('addBudgetItemForm');
  const formData = new FormData(form);
  
  const budget = parseInt(formData.get('budget'));
  const spent = parseInt(formData.get('spent')) || 0;
  
  const itemData = {
    projectId: formData.get('projectId'),
    name: formData.get('name'),
    category: formData.get('category'),
    budget: budget,
    spent: spent,
    description: formData.get('description')
  };
  
  store.addBudget(itemData);
  closeModal('addBudgetItemModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '预算创建成功',
    message: '预算项已成功创建'
  });
}

function showEditBudgetItemModal(itemId) {
  const state = store.getState();
  const item = state.budgets?.find(i => i.id === itemId);
  if (!item) return;
  
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="editBudgetItemModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑预算</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editBudgetItemModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editBudgetItemForm">
            <input type="hidden" name="itemId" value="${item.id}">
            <div class="form-group">
              <label class="form-label">项目 <span style="color: red;">*</span></label>
              <select class="form-input" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}" ${p.id === item.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">费用类别</label>
              <select class="form-input" name="category">
                <option value="人工费用" ${item.category === '人工费用' ? 'selected' : ''}>人工费用</option>
                <option value="设备采购" ${item.category === '设备采购' ? 'selected' : ''}>设备采购</option>
                <option value="材料费用" ${item.category === '材料费用' ? 'selected' : ''}>材料费用</option>
                <option value="设备租赁" ${item.category === '设备租赁' ? 'selected' : ''}>设备租赁</option>
                <option value="施工费用" ${item.category === '施工费用' ? 'selected' : ''}>施工费用</option>
                <option value="安装费用" ${item.category === '安装费用' ? 'selected' : ''}>安装费用</option>
                <option value="调试费用" ${item.category === '调试费用' ? 'selected' : ''}>调试费用</option>
                <option value="管理费用" ${item.category === '管理费用' ? 'selected' : ''}>管理费用</option>
                <option value="其他" ${item.category === '其他' ? 'selected' : ''}>其他</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">预算名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required value="${item.name}">
            </div>
            <div class="form-group">
              <label class="form-label">预算金额 <span style="color: red;">*</span></label>
              <input type="number" class="form-input" name="budget" min="0" required value="${item.totalAmount || item.budget || 0}">
            </div>
            <div class="form-group">
              <label class="form-label">已用金额</label>
              <input type="number" class="form-input" name="spent" min="0" value="${item.spentAmount || item.spent || 0}">
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="description">${item.description || ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editBudgetItemModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditBudgetItem()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditBudgetItem() {
  const form = document.getElementById('editBudgetItemForm');
  const formData = new FormData(form);
  
  const itemId = formData.get('itemId');
  const itemData = {
    projectId: formData.get('projectId'),
    name: formData.get('name'),
    category: formData.get('category'),
    budget: parseInt(formData.get('budget')),
    spent: parseInt(formData.get('spent')),
    description: formData.get('description')
  };
  
  store.updateBudget(itemId, itemData);
  closeModal('editBudgetItemModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '预算更新成功',
    message: '预算项已成功更新'
  });
}

function showAddExpenseModal(itemId) {
  const state = store.getState();
  const item = state.budgets?.find(i => i.id === itemId);
  if (!item) return;
  
  const projects = state.projects;
  const project = projects.find(p => p.id === item.projectId);
  
  const html = `
    <div class="modal-overlay" id="addExpenseModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">添加支出</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addExpenseModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 16px; padding: 12px; background: var(--bg-light); border-radius: 4px;">
            <div class="text-sm text-muted">项目</div>
            <div style="font-weight: 500;">${project?.name || '-'}</div>
            <div class="text-sm text-muted mt-8">预算名称</div>
            <div style="font-weight: 500;">${item.name}</div>
            <div class="grid grid-cols-2 gap-16 mt-16">
              <div>
                <div class="text-sm text-muted">预算金额</div>
                <div style="font-weight: 500;">¥${(item.totalAmount || item.budget || 0).toLocaleString()}</div>
              </div>
              <div>
                <div class="text-sm text-muted">已用金额</div>
                <div style="font-weight: 500;">¥${(item.spentAmount || item.spent || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
          <form id="addExpenseForm">
            <input type="hidden" name="itemId" value="${item.id}">
            <div class="form-group">
              <label class="form-label">支出金额 <span style="color: red;">*</span></label>
              <input type="number" class="form-input" name="amount" min="0" required placeholder="请输入支出金额">
            </div>
            <div class="form-group">
              <label class="form-label">支出说明</label>
              <textarea class="form-input form-textarea" name="description" placeholder="请输入支出说明"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addExpenseModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddExpense()">确认支出</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddExpense() {
  const form = document.getElementById('addExpenseForm');
  const formData = new FormData(form);
  
  const itemId = formData.get('itemId');
  const amount = parseInt(formData.get('amount'));
  
  store.addBudgetExpense(itemId, amount);
  closeModal('addExpenseModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '支出添加成功',
    message: '支出已成功记录'
  });
}

// ========== 费用统计 ==========
function renderPayment() {
  const state = store.getState();
  const payments = state.payments || [];
  const projects = state.projects || [];
  
  const categories = ['人工费用', '设备采购', '材料费用', '设备租赁', '施工费用', '安装费用', '调试费用', '管理费用', '其他'];
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = totalAmount - completedAmount;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">费用统计</h1>
        <p class="page-description">按项目统计实际发生的各类费用，实时归集与追踪</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showAddPaymentModal()">
          <i class="fas fa-plus"></i>
          新增费用
        </button>
        <button class="btn btn-secondary" onclick="exportPayments()">
          <i class="fas fa-download"></i>
          导出报表
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-4 gap-4" style="margin-bottom: 24px;">
      <div class="card stat-card" style="border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">总费用金额</div>
            <div style="font-size: 28px; font-weight: 700;">¥${totalAmount.toLocaleString()}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${payments.length} 条记录</div>
          </div>
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-coins" style="font-size: 24px;"></i>
          </div>
        </div>
      </div>
      
      <div class="card stat-card" style="border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">已支付</div>
            <div style="font-size: 28px; font-weight: 700;">¥${completedAmount.toLocaleString()}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">占比 ${totalAmount > 0 ? ((completedAmount / totalAmount) * 100).toFixed(1) : 0}%</div>
          </div>
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="font-size: 24px;"></i>
          </div>
        </div>
      </div>
      
      <div class="card stat-card" style="border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">待支付</div>
            <div style="font-size: 28px; font-weight: 700;">¥${pendingAmount.toLocaleString()}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">占比 ${totalAmount > 0 ? ((pendingAmount / totalAmount) * 100).toFixed(1) : 0}%</div>
          </div>
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-clock" style="font-size: 24px;"></i>
          </div>
        </div>
      </div>
      
      <div class="card stat-card" style="border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">费用记录</div>
            <div style="font-size: 28px; font-weight: 700;">${payments.length}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">笔费用</div>
          </div>
          <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-file-invoice" style="font-size: 24px;"></i>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 24px; border-radius: 16px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">项目费用概览</h3>
        </div>
      </div>
      <div class="card-body" style="padding: 20px;">
        ${projects.length === 0 ? `
          <div class="empty-state" style="padding: 60px 0; text-align: center;">
            <div style="width: 100px; height: 100px; margin: 0 auto 16px; background: var(--bg-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-folder-open" style="font-size: 40px; color: var(--text-muted);"></i>
            </div>
            <h4 style="margin-bottom: 8px;">暂无项目</h4>
            <p class="text-muted" style="font-size: 14px;">请先创建项目后再登记费用</p>
          </div>
        ` : projects.map((project, idx) => {
          const colors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];
          const color = colors[idx % colors.length];
          const projectPayments = payments.filter(p => p.projectId === project.id);
          const projTotal = projectPayments.reduce((sum, p) => sum + p.amount, 0);
          const projCompleted = projectPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
          const projPending = projTotal - projCompleted;
          const projRate = projTotal > 0 ? Math.round((projCompleted / projTotal) * 100) : 0;
          
          const projCategories = {};
          projectPayments.forEach(p => {
            const cat = p.category || '其他';
            if (!projCategories[cat]) projCategories[cat] = 0;
            projCategories[cat] += p.amount;
          });
          
          return `
            <div style="padding: 24px; margin-bottom: 20px; background: rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.06); border-radius: 16px; border: 1px solid ${color}20; transition: all 0.3s ease;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 44px; height: 44px; background: ${color}; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-building" style="color: white; font-size: 20px;"></i>
                  </div>
                  <div>
                    <h4 style="font-size: 16px; font-weight: 600; color: ${color}; margin-bottom: 4px;">${project.name}</h4>
                    <div style="display: flex; gap: 8px;">
                      <span class="tag tag-muted" style="font-size: 11px; background: rgba(0,0,0,0.05);">${projectPayments.length}条记录</span>
                      ${projPending > 0 ? '<span class="tag" style="font-size: 11px; background: rgba(245, 158, 11, 0.15); color: #f59e0b;">有待支付</span>' : (projTotal > 0 ? '<span class="tag" style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #10b981;">已结清</span>' : '')}
                    </div>
                  </div>
                </div>
                ${projTotal > 0 ? `
                  <div style="text-align: right;">
                    <div style="font-size: 28px; font-weight: 700; color: ${color};">¥${projTotal.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">费用合计</div>
                  </div>
                ` : ''}
              </div>
              ${projTotal > 0 ? `
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
                  <div style="text-align: center; padding: 14px 10px; background: rgba(0,0,0,0.04); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: ${color};">¥${projTotal.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">总费用</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #10b981;">¥${projCompleted.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">已支付</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(245, 158, 11, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">¥${projPending.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">待支付</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(99, 102, 241, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #6366f1;">${projRate}%</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">支付率</div>
                  </div>
                </div>
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">
                    <span>支付进度</span>
                    <span>${projRate}%</span>
                  </div>
                  <div style="height: 8px; background: rgba(0,0,0,0.06); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(projRate, 100)}%; border-radius: 4px; background: linear-gradient(90deg, ${color}, #10b981); transition: width 0.5s ease;"></div>
                  </div>
                </div>
                ${Object.keys(projCategories).length > 0 ? `
                  <div style="padding-top: 16px; border-top: 1px dashed rgba(0,0,0,0.1);">
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">费用分类</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                      ${Object.entries(projCategories).map(([cat, amt]) => `
                        <span style="padding: 6px 14px; background: white; border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                          <span style="color: var(--text-secondary);">${cat}</span>
                          <span style="font-weight: 600; color: ${color};">¥${amt.toLocaleString()}</span>
                        </span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              ` : `
                <div style="padding: 20px 0; text-align: center;">
                  <div style="width: 50px; height: 50px; margin: 0 auto 10px; background: rgba(0,0,0,0.04); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-plus" style="font-size: 20px; color: ${color};"></i>
                  </div>
                  <p style="font-size: 13px; color: var(--text-muted);">暂未登记费用</p>
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <div class="card" style="border-radius: 16px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">费用明细</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <select class="form-input" id="paymentProjectFilter" onchange="filterPayments()" style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-primary);">
            <option value="all">全部项目</option>
            ${projects.map(p => '<option value="' + p.id + '">' + p.name + '</option>').join('')}
          </select>
          <select class="form-input" id="paymentCategoryFilter" onchange="filterPayments()" style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-primary);">
            <option value="all">全部类别</option>
            ${categories.map(c => '<option value="' + c + '">' + c + '</option>').join('')}
          </select>
          <select class="form-input" id="paymentStatusFilter" onchange="filterPayments()" style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-primary);">
            <option value="all">全部状态</option>
            <option value="pending">待支付</option>
            <option value="completed">已支付</option>
          </select>
        </div>
      </div>
      <div class="card-body" id="paymentTableContainer" style="padding: 0;">
        ${renderPaymentTableBody(payments, projects)}
      </div>
    </div>
  `;
  
  return html;
}

function showAddPaymentModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const categories = ['人工费用', '设备采购', '材料费用', '设备租赁', '施工费用', '安装费用', '调试费用', '管理费用', '其他'];  // Payment categories
  const html = `
    <div class="modal-overlay" id="addPaymentModal">
      <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3 class="modal-title">新增费用记录</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addPaymentModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="addPaymentForm">
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label class="form-label">项目 <span style="color: red;">*</span></label>
                <select class="form-input" name="projectId" required>
                  <option value="">请选择项目</option>
                  ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">费用类别 <span style="color: red;">*</span></label>
                <select class="form-input" name="category" required>
                  <option value="">请选择类别</option>
                  ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">金额 <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="amount" min="0" step="0.01" required placeholder="请输入金额">
              </div>
            </div>
            <div class="grid grid-cols-3">
              <div class="form-group">
                <label class="form-label">合同号</label>
                <input type="text" class="form-input" name="contractNo" placeholder="请输入合同号">
              </div>
              <div class="form-group">
                <label class="form-label">计划支付日期</label>
                <input type="date" class="form-input" name="dueDate">
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-input" name="status">
                  <option value="pending">待支付</option>
                  <option value="completed">已支付</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="remark" placeholder="请输入备注" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addPaymentModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddPayment()">提交</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddPayment() {
  const form = document.getElementById('addPaymentForm');
  const formData = new FormData(form);
  
  const paymentData = {
    date: formData.get('date'),
    projectId: formData.get('projectId'),
    category: formData.get('category'),
    amount: parseFloat(formData.get('amount')),
    contractNo: formData.get('contractNo'),
    dueDate: formData.get('dueDate'),
    remark: formData.get('remark'),
    status: formData.get('status') || 'pending'
  };
  
  store.addPayment(paymentData);
  closeModal('addPaymentModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '费用记录创建成功',
    message: '费用记录已成功创建'
  });
}

function exportPayments() {
  const state = store.getState();
  const payments = state.payments || [];
  const projects = state.projects || [];
  
  const statusNames = {
    pending: '待支付',
    processing: '处理中',
    completed: '已支付',
    cancelled: '已取消'
  };
  
  const headers = ['日期', '项目', '费用类别', '金额', '合同号', '计划支付日期', '状态', '备注'];
  const rows = payments.map(payment => {
    const project = projects.find(p => p.id === payment.projectId);
    return [
      DateUtils.formatDate(payment.date),
      project?.name || '-',
      payment.category || '-',
      payment.amount,
      payment.contractNo || '-',
      DateUtils.formatDate(payment.dueDate),
      statusNames[payment.status],
      payment.remark || '-'
    ];
  });
  
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `费用统计报表_${DateUtils.formatDate(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  store.addNotification({
    type: 'success',
    title: '导出成功',
    message: '费用统计报表已导出'
  });
}

function filterPayments() {
  const state = store.getState();
  let payments = state.payments || [];
  const projects = state.projects || [];
  
  const projectFilter = document.getElementById('paymentProjectFilter')?.value || 'all';
  const categoryFilter = document.getElementById('paymentCategoryFilter')?.value || 'all';
  const statusFilter = document.getElementById('paymentStatusFilter')?.value || 'all';
  
  if (projectFilter !== 'all') payments = payments.filter(p => p.projectId === projectFilter);
  if (categoryFilter !== 'all') payments = payments.filter(p => p.category === categoryFilter);
  if (statusFilter !== 'all') payments = payments.filter(p => p.status === statusFilter);
  
  const container = document.getElementById('paymentTableContainer');
  if (container) container.innerHTML = renderPaymentTableBody(payments, projects);
}

function renderPaymentTableBody(payments, projects) {
  if (payments.length === 0) {
    return '<div class="empty-state" style="padding: 60px 0;"><i class="fas fa-file-invoice" style="font-size: 56px; color: var(--text-muted); opacity: 0.4;"></i><h3 style="margin-top: 16px; font-weight: 600;">暂无费用记录</h3><p class="text-muted">点击右上角"新增费用"为项目记录费用</p></div>';
  }
  
  const statusColors = { pending: 'tag-warning', completed: 'tag-success' };
  const statusNames = { pending: '待支付', completed: '已支付' };
  
  const grouped = {};
  payments.forEach(p => {
    const pid = p.projectId || 'no-project';
    if (!grouped[pid]) grouped[pid] = { items: [], project: null };
    grouped[pid].items.push(p);
    grouped[pid].project = projects.find(pr => pr.id === p.projectId);
  });
  
  let html = '';
  Object.keys(grouped).forEach(pid => {
    const group = grouped[pid];
    const groupTotal = group.items.reduce((sum, p) => sum + p.amount, 0);
    const projectColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];
    const colorIndex = grouped[pid].project ? projects.findIndex(p => p.id === grouped[pid].project.id) % projectColors.length : 0;
    const color = projectColors[colorIndex];
    
    html += '<div style="margin-bottom: 24px;">' +
      '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: rgba(' + parseInt(color.slice(1,3),16) + ',' + parseInt(color.slice(3,5),16) + ',' + parseInt(color.slice(5,7),16) + ',0.06); border-radius: 12px; border: 1px solid ' + color + '20;">' +
        '<div style="width: 36px; height: 36px; background: ' + color + '; border-radius: 10px; display: flex; align-items: center; justify-content: center;">' +
          '<i class="fas fa-folder-open" style="color: white; font-size: 14px;"></i>' +
        '</div>' +
        '<span style="font-weight: 600; font-size: 15px; color: ' + color + ';">' + (group.project?.name || '未分配项目') + '</span>' +
        '<span class="tag" style="font-size: 11px; background: rgba(0,0,0,0.06);">' + group.items.length + '条记录</span>' +
        '<span style="margin-left: auto; font-size: 14px; font-weight: 600; color: ' + color + ';">¥' + groupTotal.toLocaleString() + '</span>' +
      '</div>' +
      '<div style="background: white; border-radius: 12px; overflow: hidden;">' +
      '<table class="table" style="margin: 0; border: none;"><thead><tr style="background: #f3f4f6;">' +
        '<th style="width: 120px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">日期</th>' +
        '<th style="width: 110px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">类别</th>' +
        '<th style="width: 140px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">金额</th>' +
        '<th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">合同号</th>' +
        '<th style="width: 120px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">支付日期</th>' +
        '<th style="width: 90px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">状态</th>' +
        '<th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">备注</th>' +
      '</tr></thead><tbody>' +
      group.items.map((p, idx) => '<tr style="border-bottom: 1px solid #e5e7eb; background: white; transition: background 0.2s;">' +
        '<td style="padding: 14px 16px; color: #1f2937;">' + DateUtils.formatDate(p.date) + '</td>' +
        '<td style="padding: 14px 16px;"><span class="tag" style="font-size: 11px; background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 4px 10px; border-radius: 4px;">' + (p.category || '其他') + '</span></td>' +
        '<td style="padding: 14px 16px; font-weight: 600; color: #1f2937;">¥' + p.amount.toLocaleString() + '</td>' +
        '<td style="padding: 14px 16px; color: #1f2937;">' + (p.contractNo || '-') + '</td>' +
        '<td style="padding: 14px 16px; color: #1f2937;">' + DateUtils.formatDate(p.dueDate) + '</td>' +
        '<td style="padding: 14px 16px;">' + (p.status === 'completed' ? '<span class="tag" style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 4px;">已支付</span>' : '<span class="tag" style="font-size: 11px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 10px; border-radius: 4px;">待支付</span>') + '</td>' +
        '<td style="padding: 14px 16px; color: #4b5563; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + (p.remark || '') + '">' + (p.remark || '-') + '</td>' +
      '</tr>').join('') +
      '</tbody></table></div></div>';
  });
  
  return html;
}

function viewPayment(paymentId) {
  const state = store.getState();
  const payment = state.payments?.find(p => p.id === paymentId);
  if (!payment) return;
  
  const projects = state.projects;
  const project = projects.find(p => p.id === payment.projectId);
  
  const statusNames = {
    pending: '待支付',
    processing: '处理中',
    completed: '已支付',
    cancelled: '已取消'
  };
  
  const html = `
    <div class="modal-overlay" id="viewPaymentModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">费用详情</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('viewPaymentModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">项目</span>
              <span>${project?.name || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">费用类别</span>
              <span><span class="tag tag-secondary">${payment.category || '其他'}</span></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">金额</span>
              <span style="font-size: 24px; font-weight: bold; color: var(--primary-color);">¥${payment.amount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">状态</span>
              <span><span class="tag tag-${payment.status === 'completed' ? 'success' : payment.status === 'processing' ? 'info' : payment.status === 'pending' ? 'warning' : 'muted'}">${statusNames[payment.status]}</span></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">合同号</span>
              <span>${payment.contractNo || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">计划支付日期</span>
              <span>${DateUtils.formatDate(payment.dueDate)}</span>
            </div>
            ${payment.remark ? `
              <div>
                <span class="text-muted">备注</span>
                <p style="margin-top: 8px; padding: 12px; background: var(--bg-light); border-radius: 4px;">${payment.remark}</p>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('viewPaymentModal')">关闭</button>
          ${payment.status !== 'completed' && payment.status !== 'cancelled' ? `
            <button class="btn btn-primary" onclick="updatePaymentStatus('${payment.id}', 'completed'); closeModal('viewPaymentModal');">确认支付</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function updatePaymentStatus(paymentId, status) {
  store.updatePaymentStatus(paymentId, status);
  renderContent();
  
  const statusNames = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  };
  
  store.addNotification({
    type: 'success',
    title: '状态更新成功',
    message: `款项状态已更新为${statusNames[status]}`
  });
}

// ========== 材料管理 ==========
function renderMaterials() {
  const state = store.getState();
  const materials = state.materials || [];
  const projects = state.projects || [];
  
  const ordered = materials.filter(m => m.status === 'ordered').length;
  const inTransit = materials.filter(m => m.status === 'in_transit').length;
  const received = materials.filter(m => m.status === 'received').length;
  const totalValue = materials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">材料管理</h1>
        <p class="page-description">项目材料管理，追踪材料发货、物流与到货状态</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showAddMaterialModal()">
          <i class="fas fa-plus"></i>
          新增材料
        </button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-boxes"></i>
          </div>
        </div>
        <div class="stat-card-value">${materials.length}</div>
        <div class="stat-card-label">材料总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-shopping-cart"></i>
          </div>
        </div>
        <div class="stat-card-value">${ordered}</div>
        <div class="stat-card-label">已下单</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-truck"></i>
          </div>
        </div>
        <div class="stat-card-value">${inTransit}</div>
        <div class="stat-card-label">运输中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${received}</div>
        <div class="stat-card-label">已到货</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="materialProjectFilter" onchange="filterMaterials()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">类别筛选</label>
          <select class="form-input" id="materialCategoryFilter" onchange="filterMaterials()">
            <option value="">全部类别</option>
            <option value="土建材料">土建材料</option>
            <option value="安装材料">安装材料</option>
            <option value="电气材料">电气材料</option>
            <option value="管材管件">管材管件</option>
            <option value="调试耗材">调试耗材</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="materialStatusFilter" onchange="filterMaterials()">
            <option value="">全部状态</option>
            <option value="ordered">已下单</option>
            <option value="in_transit">运输中</option>
            <option value="received">已到货</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="card" style="background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
        <h3 style="font-size: 14px; font-weight: 600; color: #4b5563; margin: 0;">材料列表</h3>
      </div>
      <div style="padding: 0;">
        ${materials.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-boxes" style="font-size: 48px; color: #9ca3af;"></i>
            <h3 style="margin-top: 16px; color: #1f2937;">暂无材料记录</h3>
            <p style="color: #6b7280;">点击"新增材料"按钮创建第一条记录</p>
          </div>
        ` : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">日期</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">项目</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">材料名称</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">类别</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">数量</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">单价</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">总价</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 120px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${materials.map(material => {
                const project = projects.find(p => p.id === material.projectId);
                const statusInfo = getMaterialStatusInfo(material.status);
                return `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 14px 16px; color: #1f2937;">${DateUtils.formatDate(material.date)}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${project?.name || '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${material.name}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${material.category || '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${material.quantity}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">¥${material.unitPrice.toLocaleString()}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">¥${(material.quantity * material.unitPrice).toLocaleString()}</td>
                    <td style="padding: 14px 16px;">
                      <span style="font-size: 11px; background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 4px 10px; border-radius: 4px;">${statusInfo.name}</span>
                    </td>
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="viewMaterial('${material.id}')" title="查看详情">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editMaterial('${material.id}')" title="编辑">
                          <i class="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
  
  return html;
}

function getMaterialStatusInfo(status) {
  const statusMap = {
    'ordered': { name: '已下单', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
    'in_transit': { name: '运输中', bg: 'rgba(251, 191, 36, 0.1)', color: '#b45309' },
    'received': { name: '已到货', bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }
  };
  return statusMap[status] || { name: status, bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
}

function filterMaterials() {
  const state = store.getState();
  let materials = [...state.materials];
  const projects = state.projects;
  
  const projectFilter = document.getElementById('materialProjectFilter')?.value;
  const categoryFilter = document.getElementById('materialCategoryFilter')?.value;
  const statusFilter = document.getElementById('materialStatusFilter')?.value;
  
  if (projectFilter) {
    materials = materials.filter(m => m.projectId === projectFilter);
  }
  if (categoryFilter) {
    materials = materials.filter(m => m.category === categoryFilter);
  }
  if (statusFilter) {
    materials = materials.filter(m => m.status === statusFilter);
  }
  
  const container = document.getElementById('pageContent');
  if (container) {
    container.innerHTML = renderMaterialsFiltered(materials, projects);
  }
}

function renderMaterialsFiltered(materials, projects) {
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">材料管理</h1>
        <p class="page-description">项目材料管理，追踪材料发货、物流与到货状态</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showAddMaterialModal()">
          <i class="fas fa-plus"></i>
          新增材料
        </button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-boxes"></i>
          </div>
        </div>
        <div class="stat-card-value">${materials.length}</div>
        <div class="stat-card-label">材料总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-shopping-cart"></i>
          </div>
        </div>
        <div class="stat-card-value">${materials.filter(m => m.status === 'ordered').length}</div>
        <div class="stat-card-label">已下单</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-truck"></i>
          </div>
        </div>
        <div class="stat-card-value">${materials.filter(m => m.status === 'in_transit').length}</div>
        <div class="stat-card-label">运输中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${materials.filter(m => m.status === 'received').length}</div>
        <div class="stat-card-label">已到货</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="materialProjectFilter" onchange="filterMaterials()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">类别筛选</label>
          <select class="form-input" id="materialCategoryFilter" onchange="filterMaterials()">
            <option value="">全部类别</option>
            <option value="土建材料">土建材料</option>
            <option value="安装材料">安装材料</option>
            <option value="电气材料">电气材料</option>
            <option value="管材管件">管材管件</option>
            <option value="调试耗材">调试耗材</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="materialStatusFilter" onchange="filterMaterials()">
            <option value="">全部状态</option>
            <option value="ordered">已下单</option>
            <option value="in_transit">运输中</option>
            <option value="received">已到货</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="card" style="background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
        <h3 style="font-size: 14px; font-weight: 600; color: #4b5563; margin: 0;">材料列表</h3>
      </div>
      <div style="padding: 0;">
        ${materials.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-boxes" style="font-size: 48px; color: #9ca3af;"></i>
            <h3 style="margin-top: 16px; color: #1f2937;">暂无材料记录</h3>
            <p style="color: #6b7280;">点击"新增材料"按钮创建第一条记录</p>
          </div>
        ` : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">日期</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">项目</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">材料名称</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">类别</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">数量</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">单价</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">总价</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 120px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${materials.map(material => {
                const project = projects.find(p => p.id === material.projectId);
                const statusInfo = getMaterialStatusInfo(material.status);
                return `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 14px 16px; color: #1f2937;">${DateUtils.formatDate(material.date)}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${project?.name || '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${material.name}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${material.category || '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${material.quantity}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">¥${material.unitPrice.toLocaleString()}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">¥${(material.quantity * material.unitPrice).toLocaleString()}</td>
                    <td style="padding: 14px 16px;">
                      <span style="font-size: 11px; background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 4px 10px; border-radius: 4px;">${statusInfo.name}</span>
                    </td>
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="viewMaterial('${material.id}')" title="查看详情">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editMaterial('${material.id}')" title="编辑">
                          <i class="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
  
  return html;
}

function showAddMaterialModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="addMaterialModal">
      <div class="modal-content" style="max-width: 900px; max-height: 90vh;">
        <div class="modal-header">
          <h3 class="modal-title">新增材料</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addMaterialModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="max-height: calc(90vh - 120px); overflow-y: auto;">
          <form id="addMaterialForm">
            <div class="grid" style="grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label class="form-label">项目 <span style="color: red;">*</span></label>
                <select class="form-input" name="projectId" required>
                  <option value="">请选择项目</option>
                  ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">类别</label>
                <select class="form-input" name="category">
                  <option value="">请选择类别</option>
                  <option value="土建材料">土建材料</option>
                  <option value="安装材料">安装材料</option>
                  <option value="电气材料">电气材料</option>
                  <option value="管材管件">管材管件</option>
                  <option value="调试耗材">调试耗材</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 2fr 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">材料名称 <span style="color: red;">*</span></label>
                <input type="text" class="form-input" name="name" required placeholder="请输入材料名称">
              </div>
              <div class="form-group">
                <label class="form-label">数量 <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="quantity" min="0" required value="0">
              </div>
              <div class="form-group">
                <label class="form-label">单价 <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="unitPrice" min="0" required value="0">
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">状态 <span style="color: red;">*</span></label>
                <select class="form-input" name="status" required>
                  <option value="ordered">已下单</option>
                  <option value="in_transit">运输中</option>
                  <option value="received">已到货</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">发货日期</label>
                <input type="date" class="form-input" name="shipDate">
              </div>
              <div class="form-group">
                <label class="form-label">预计到达</label>
                <input type="date" class="form-input" name="estimatedArrival">
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 2fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">物流单号</label>
                <input type="text" class="form-input" name="trackingNumber" placeholder="物流/快递单号">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="notes" placeholder="请输入备注" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addMaterialModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddMaterial()">提交</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddMaterial() {
  const form = document.getElementById('addMaterialForm');
  const formData = new FormData(form);
  
  const materialData = {
    date: formData.get('date'),
    projectId: formData.get('projectId'),
    name: formData.get('name'),
    category: formData.get('category') || '',
    quantity: parseInt(formData.get('quantity')),
    unitPrice: parseInt(formData.get('unitPrice')),
    status: formData.get('status'),
    shipDate: formData.get('shipDate') || '',
    trackingNumber: formData.get('trackingNumber') || '',
    estimatedArrival: formData.get('estimatedArrival') || '',
    notes: formData.get('notes')
  };
  
  store.addMaterial(materialData);
  closeModal('addMaterialModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '材料创建成功',
    message: '材料记录已成功创建'
  });
}

function viewMaterial(materialId) {
  const state = store.getState();
  const material = state.materials?.find(m => m.id === materialId);
  if (!material) return;
  
  const projects = state.projects;
  const project = projects.find(p => p.id === material.projectId);
  
  const statusNames = {
    ordered: '已下单',
    in_transit: '运输中',
    received: '已到货'
  };
  
  const html = `
    <div class="modal-overlay" id="viewMaterialModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">材料详情</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('viewMaterialModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">日期</span>
              <span>${DateUtils.formatDate(material.date)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">项目</span>
              <span>${project?.name || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">材料名称</span>
              <span>${material.name}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">类别</span>
              <span>${material.category || '-'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">数量</span>
              <span>${material.quantity}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">单价</span>
              <span>¥${material.unitPrice.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">总价</span>
              <span style="font-weight: 600;">¥${(material.quantity * material.unitPrice).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">状态</span>
              <span>${statusNames[material.status]}</span>
            </div>
            ${material.shipDate ? `
              <div style="display: flex; justify-content: space-between;">
                <span class="text-muted">发货日期</span>
                <span>${material.shipDate}</span>
              </div>
            ` : ''}
            ${material.trackingNumber ? `
              <div style="display: flex; justify-content: space-between;">
                <span class="text-muted">物流单号</span>
                <span>${material.trackingNumber}</span>
              </div>
            ` : ''}
            ${material.estimatedArrival ? `
              <div style="display: flex; justify-content: space-between;">
                <span class="text-muted">预计到达</span>
                <span>${material.estimatedArrival}</span>
              </div>
            ` : ''}
            ${material.notes ? `
              <div>
                <span class="text-muted">备注</span>
                <p style="margin-top: 8px; padding: 12px; background: var(--bg-light); border-radius: 4px;">${material.notes}</p>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('viewMaterialModal')">关闭</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function editMaterial(materialId) {
  const state = store.getState();
  const material = state.materials?.find(m => m.id === materialId);
  if (!material) return;
  
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="editMaterialModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑材料</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editMaterialModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editMaterialForm">
            <input type="hidden" name="materialId" value="${material.id}">
            <div class="form-group">
              <label class="form-label">日期 <span style="color: red;">*</span></label>
              <input type="date" class="form-input" name="date" required value="${material.date}">
            </div>
            <div class="form-group">
              <label class="form-label">项目 <span style="color: red;">*</span></label>
              <select class="form-input" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}" ${p.id === material.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">材料名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required value="${material.name}">
            </div>
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">类别</label>
                <select class="form-input" name="category">
                  <option value="">请选择类别</option>
                  <option value="土建材料" ${material.category === '土建材料' ? 'selected' : ''}>土建材料</option>
                  <option value="安装材料" ${material.category === '安装材料' ? 'selected' : ''}>安装材料</option>
                  <option value="电气材料" ${material.category === '电气材料' ? 'selected' : ''}>电气材料</option>
                  <option value="管材管件" ${material.category === '管材管件' ? 'selected' : ''}>管材管件</option>
                  <option value="调试耗材" ${material.category === '调试耗材' ? 'selected' : ''}>调试耗材</option>
                  <option value="其他" ${material.category === '其他' ? 'selected' : ''}>其他</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">数量 <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="quantity" min="0" required value="${material.quantity}">
              </div>
            </div>
            <div class="grid grid-cols-2">
              <div class="form-group">
                <label class="form-label">单价 <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="unitPrice" min="0" required value="${material.unitPrice}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">状态 <span style="color: red;">*</span></label>
              <select class="form-input" name="status" required>
                <option value="ordered" ${material.status === 'ordered' ? 'selected' : ''}>已下单</option>
                <option value="in_transit" ${material.status === 'in_transit' ? 'selected' : ''}>运输中</option>
                <option value="received" ${material.status === 'received' ? 'selected' : ''}>已到货</option>
              </select>
            </div>
            <div class="grid grid-cols-3">
              <div class="form-group">
                <label class="form-label">发货日期</label>
                <input type="date" class="form-input" name="shipDate" value="${material.shipDate || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">物流单号</label>
                <input type="text" class="form-input" name="trackingNumber" value="${material.trackingNumber || ''}" placeholder="物流/快递单号">
              </div>
              <div class="form-group">
                <label class="form-label">预计到达</label>
                <input type="date" class="form-input" name="estimatedArrival" value="${material.estimatedArrival || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="notes">${material.notes || ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editMaterialModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditMaterial()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditMaterial() {
  const form = document.getElementById('editMaterialForm');
  const formData = new FormData(form);
  
  const materialId = formData.get('materialId');
  const materialData = {
    date: formData.get('date'),
    projectId: formData.get('projectId'),
    name: formData.get('name'),
    category: formData.get('category') || '',
    quantity: parseInt(formData.get('quantity')),
    unitPrice: parseInt(formData.get('unitPrice')),
    status: formData.get('status'),
    shipDate: formData.get('shipDate') || '',
    trackingNumber: formData.get('trackingNumber') || '',
    estimatedArrival: formData.get('estimatedArrival') || '',
    notes: formData.get('notes')
  };
  
  store.updateMaterial(materialId, materialData);
  closeModal('editMaterialModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '材料更新成功',
    message: '材料记录已成功更新'
  });
}

// ========== 售后管理 ==========
let afterSaleFilter = {
  search: '',
  projectId: '',
  status: '',
  priority: '',
  issueType: ''
};

function renderAfterSale() {
  const state = store.getState();
  const afterSales = state.afterSales || [];
  const projects = state.projects || [];
  const users = state.users || [];
  
  let filteredAfterSales = afterSales.filter(a => {
    if (afterSaleFilter.search && !a.description.toLowerCase().includes(afterSaleFilter.search.toLowerCase()) && 
        !a.clientName?.toLowerCase().includes(afterSaleFilter.search.toLowerCase())) {
      return false;
    }
    if (afterSaleFilter.projectId && a.projectId !== afterSaleFilter.projectId) {
      return false;
    }
    if (afterSaleFilter.status && a.status !== afterSaleFilter.status) {
      return false;
    }
    if (afterSaleFilter.priority && a.priority !== afterSaleFilter.priority) {
      return false;
    }
    if (afterSaleFilter.issueType && a.issueType !== afterSaleFilter.issueType) {
      return false;
    }
    return true;
  });
  
  const pending = afterSales.filter(a => a.status === 'pending').length;
  const processing = afterSales.filter(a => a.status === 'processing').length;
  const completed = afterSales.filter(a => a.status === 'completed').length;
  const highPriority = afterSales.filter(a => a.priority === 'high' && a.status !== 'completed').length;
  const overdue = afterSales.filter(a => {
    const dueDate = a.dueDate ? new Date(a.dueDate) : null;
    return dueDate && dueDate < new Date() && a.status !== 'completed';
  }).length;
  const avgDays = afterSales.length > 0 
    ? Math.round(afterSales.reduce((sum, a) => {
        const created = new Date(a.createdAt);
        const completedDate = a.status === 'completed' ? new Date(a.updatedAt || a.createdAt) : new Date();
        return sum + ((completedDate - created) / (1000 * 60 * 60 * 24));
      }, 0) / afterSales.length)
    : 0;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">售后管理</h1>
        <p class="page-description">售后问题跟踪处理，保障设备运行稳定，及时响应客户需求</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" onclick="exportAfterSales()">
          <i class="fas fa-file-export"></i>
          导出报表
        </button>
        <button class="btn btn-primary" onclick="showAddAfterSaleModal()">
          <i class="fas fa-plus"></i>
          新增售后
        </button>
      </div>
    </div>
    
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon orange">
            <i class="fas fa-clock"></i>
          </div>
        </div>
        <div class="stat-card-value">${pending}</div>
        <div class="stat-card-label">待处理</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-spinner"></i>
          </div>
        </div>
        <div class="stat-card-value">${processing}</div>
        <div class="stat-card-label">处理中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${completed}</div>
        <div class="stat-card-label">已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon red">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div class="stat-card-value">${overdue}</div>
        <div class="stat-card-label">已超期</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon red">
            <i class="fas fa-flag"></i>
          </div>
        </div>
        <div class="stat-card-value">${highPriority}</div>
        <div class="stat-card-label">高优先级</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon purple">
            <i class="fas fa-calendar"></i>
          </div>
        </div>
        <div class="stat-card-value">${avgDays}</div>
        <div class="stat-card-label">平均处理天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon gray">
            <i class="fas fa-ticket-alt"></i>
          </div>
        </div>
        <div class="stat-card-value">${afterSales.length}</div>
        <div class="stat-card-label">总记录数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-percentage"></i>
          </div>
        </div>
        <div class="stat-card-value">${afterSales.length > 0 ? Math.round((completed / afterSales.length) * 100) : 0}%</div>
        <div class="stat-card-label">完成率</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap; padding: 16px;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">搜索</label>
          <input 
            type="text" 
            class="form-input" 
            placeholder="搜索问题描述或客户..." 
            value="${afterSaleFilter.search || ''}"
            oninput="afterSaleFilter.search = this.value; renderContent()"
          >
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目</label>
          <select class="form-input" value="${afterSaleFilter.projectId || ''}" onchange="afterSaleFilter.projectId = this.value; renderContent()">
            <option value="">全部项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label class="form-label">问题类别</label>
          <select class="form-input" value="${afterSaleFilter.issueType || ''}" onchange="afterSaleFilter.issueType = this.value; renderContent()">
            <option value="">全部类别</option>
            <option value="设备故障">设备故障</option>
            <option value="工艺问题">工艺问题</option>
            <option value="安装问题">安装问题</option>
            <option value="调试问题">调试问题</option>
            <option value="水质不达标">水质不达标</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label class="form-label">状态</label>
          <select class="form-input" value="${afterSaleFilter.status || ''}" onchange="afterSaleFilter.status = this.value; renderContent()">
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label class="form-label">优先级</label>
          <select class="form-input" value="${afterSaleFilter.priority || ''}" onchange="afterSaleFilter.priority = this.value; renderContent()">
            <option value="">全部优先级</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </div>
        <div style="flex: 0; min-width: 100px; align-self: flex-end;">
          <button class="btn btn-secondary btn-sm w-full" onclick="afterSaleFilter = {search: '', projectId: '', status: '', priority: '', issueType: ''}; renderContent()">
            <i class="fas fa-sync-alt"></i> 重置
          </button>
        </div>
      </div>
    </div>
    
    <div class="card" style="background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
        <h3 style="font-size: 14px; font-weight: 600; color: #4b5563; margin: 0;">售后工单列表</h3>
        <span style="font-size: 12px; color: #6b7280; margin-left: 8px;">共 ${filteredAfterSales.length} 条记录</span>
      </div>
      <div style="padding: 0;">
        ${filteredAfterSales.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-headset" style="font-size: 48px; color: #9ca3af;"></i>
            <h3 style="margin-top: 16px; color: #1f2937;">暂无售后记录</h3>
            <p style="color: #6b7280;">点击"新增售后"按钮创建第一条记录</p>
          </div>
        ` : `
          ${renderAfterSaleTableBody(filteredAfterSales, projects, users)}
        `}
      </div>
    </div>
  `;
  
  return html;
}

function renderAfterSaleTableBody(filteredAfterSales, projects, users) {
  const priorityColors = { low: 'tag-info', medium: 'tag-warning', high: 'tag-danger' };
  const priorityNames = { low: '低', medium: '中', high: '高' };
  const statusColors = { pending: 'tag-warning', processing: 'tag-info', completed: 'tag-success' };
  const statusNames = { pending: '待处理', processing: '处理中', completed: '已完成' };
  
  // 按项目分组
  const grouped = {};
  filteredAfterSales.forEach(a => {
    const pid = a.projectId || 'no-project';
    if (!grouped[pid]) grouped[pid] = { items: [], project: null };
    grouped[pid].items.push(a);
    grouped[pid].project = projects.find(p => p.id === a.projectId);
  });
  
  let html = '';
  Object.keys(grouped).forEach(pid => {
    const group = grouped[pid];
    const pending = group.items.filter(a => a.status !== 'completed').length;
    
    html += `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: rgba(59, 130, 246, 0.06); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
          <div style="width: 36px; height: 36px; background: #3b82f6; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-folder-open" style="color: white; font-size: 14px;"></i>
          </div>
          <span style="font-weight: 600; font-size: 15px; color: #3b82f6;">${group.project?.name || '未分配项目'}</span>
          <span class="tag" style="font-size: 11px; background: rgba(0,0,0,0.06);">${group.items.length}条记录</span>
          ${pending > 0 ? `<span class="tag" style="font-size: 11px; background: rgba(245, 158, 11, 0.15); color: #f59e0b;">${pending}条待处理</span>` : '<span class="tag" style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: #10b981;">全部完成</span>'}
        </div>
        <div style="background: white; border-radius: 12px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="width: 100px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">日期</th>
                <th style="width: 100px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">问题类别</th>
                <th style="width: 100px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">负责人</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">问题描述</th>
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">客户信息</th>
                <th style="width: 70px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">优先级</th>
                <th style="width: 100px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">计划完成</th>
                <th style="width: 80px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="width: 160px; padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">操作</th>
              </tr>
            </thead>
            <tbody>
            ${group.items.map(afterSale => {
              const assignee = users.find(u => u.id === afterSale.assigneeId);
              const dueDate = afterSale.dueDate ? new Date(afterSale.dueDate) : null;
              const isOverdue = dueDate && dueDate < new Date() && afterSale.status !== 'completed';
              const daysOpen = Math.ceil((new Date() - new Date(afterSale.date)) / (1000 * 60 * 60 * 24));
              const priorityInfo = getAfterSalePriorityInfo(afterSale.priority);
              const statusInfo = getAfterSaleStatusInfo(afterSale.status);
              return `
                <tr style="border-bottom: 1px solid #e5e7eb; background: ${isOverdue ? 'rgba(239, 68, 68, 0.04);' : 'white;'}">
                  <td style="padding: 14px 16px; color: #1f2937;">${DateUtils.formatDate(afterSale.date)}</td>
                  <td style="padding: 14px 16px;"><span style="font-size: 11px; background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 4px 10px; border-radius: 4px;">${afterSale.issueType || '其他'}</span></td>
                  <td style="padding: 14px 16px; color: #1f2937;">${assignee?.name || '<span style="color: #6b7280;">未分配</span>'}</td>
                  <td style="padding: 14px 16px; color: #1f2937;">
                    <span style="cursor: pointer; color: #3b82f6;" onclick="viewAfterSale('${afterSale.id}')">
                      ${afterSale.description.substring(0, 40)}${afterSale.description.length > 40 ? '...' : ''}
                    </span>
                  </td>
                  <td style="padding: 14px 16px;">
                    <div style="font-size: 13px; color: #1f2937;">${afterSale.clientName || '-'}</div>
                    ${afterSale.clientPhone ? `<div style="font-size: 11px; color: #6b7280;">${afterSale.clientPhone}</div>` : ''}
                  </td>
                  <td style="padding: 14px 16px;">
                    <span style="font-size: 11px; background: ${priorityInfo.bg}; color: ${priorityInfo.color}; padding: 4px 10px; border-radius: 4px;">${priorityInfo.name}</span>
                  </td>
                  <td style="padding: 14px 16px; font-size: 13px; color: ${isOverdue ? '#ef4444' : '#1f2937'}; font-weight: ${isOverdue ? '600' : '400'};">
                    ${dueDate ? DateUtils.formatDate(afterSale.dueDate) + (isOverdue ? ' <i class="fas fa-exclamation-circle"></i>' : '') : '-'}
                  </td>
                  <td style="padding: 14px 16px;">
                    <select class="form-input" style="padding: 4px 8px; font-size: 12px; width: 100px; border-radius: 6px;" 
                      onchange="quickChangeAfterSaleStatus('${afterSale.id}', this.value)">
                      <option value="pending" ${afterSale.status === 'pending' ? 'selected' : ''}>待处理</option>
                      <option value="processing" ${afterSale.status === 'processing' ? 'selected' : ''}>处理中</option>
                      <option value="completed" ${afterSale.status === 'completed' ? 'selected' : ''}>已完成</option>
                    </select>
                  </td>
                  <td style="padding: 14px 16px;">
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm" onclick="showAfterSaleLogModal('${afterSale.id}')" title="添加日志">
                        <i class="fas fa-plus-circle"></i>
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="viewAfterSale('${afterSale.id}')" title="查看详情">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="editAfterSale('${afterSale.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="deleteAfterSaleConfirm('${afterSale.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
  
  return html;
}

function getAfterSalePriorityInfo(priority) {
  const priorityMap = {
    'low': { name: '低', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
    'medium': { name: '中', bg: 'rgba(251, 191, 36, 0.1)', color: '#b45309' },
    'high': { name: '高', bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }
  };
  return priorityMap[priority] || { name: priority, bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
}

function getAfterSaleStatusInfo(status) {
  const statusMap = {
    'pending': { name: '待处理', bg: 'rgba(251, 191, 36, 0.1)', color: '#b45309' },
    'processing': { name: '处理中', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
    'completed': { name: '已完成', bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }
  };
  return statusMap[status] || { name: status, bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
}

function showAfterSaleLogModal(afterSaleId) {
  const html = `
    <div class="modal-overlay" id="addLogModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">添加处理日志</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addLogModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="addLogForm">
            <div class="form-group">
              <label class="form-label">处理内容 <span style="color: red;">*</span></label>
              <textarea class="form-input form-textarea" name="action" required rows="4" placeholder="请输入处理进展、采取的措施等..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">下一步计划</label>
              <textarea class="form-input form-textarea" name="nextStep" rows="2" placeholder="请输入下一步计划（可选）"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addLogModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddAfterSaleLog('${afterSaleId}')">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddAfterSaleLog(afterSaleId) {
  const form = document.getElementById('addLogForm');
  const formData = new FormData(form);
  
  const action = formData.get('action');
  const nextStep = formData.get('nextStep');
  
  const state = store.getState();
  const afterSale = state.afterSales?.find(a => a.id === afterSaleId);
  if (!afterSale) return;
  
  const newLog = {
    action: action,
    nextStep: nextStep || '',
    createdAt: new Date().toISOString()
  };
  
  const updates = {
    ...afterSale,
    logs: [...(afterSale.logs || []), newLog],
    status: 'processing'
  };
  
  store.updateAfterSale(afterSaleId, updates);
  closeModal('addLogModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '日志添加成功',
    message: '处理日志已成功添加'
  });
}

function quickChangeAfterSaleStatus(afterSaleId, newStatus) {
  const state = store.getState();
  const afterSale = state.afterSales?.find(a => a.id === afterSaleId);
  if (!afterSale) return;
  
  const updates = { ...afterSale, status: newStatus };
  if (newStatus === 'completed' && !afterSale.result) {
    updates.result = '已处理完成';
  }
  updates.logs = [...(afterSale.logs || []), {
    action: `状态更新为: ${newStatus === 'completed' ? '已完成' : newStatus === 'processing' ? '处理中' : '待处理'}`,
    createdAt: new Date().toISOString()
  }];
  
  store.updateAfterSale(afterSaleId, updates);
  renderContent();
  
  store.addNotification({
    type: newStatus === 'completed' ? 'success' : 'info',
    title: '售后状态更新',
    message: `工单状态已更新`
  });
}

function showAddAfterSaleModal() {
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="addAfterSaleModal">
      <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
        <div class="modal-header">
          <h3 class="modal-title">新增售后</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addAfterSaleModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="max-height: calc(90vh - 120px); overflow-y: auto;">
          <form id="addAfterSaleForm">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
              <div class="form-group">
                <label class="form-label">日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label class="form-label">项目 <span style="color: red;">*</span></label>
                <select class="form-input" name="projectId" required>
                  <option value="">请选择项目</option>
                  ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">负责人</label>
                <select class="form-input" name="assigneeId">
                  <option value="">未分配</option>
                  ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">问题类别 <span style="color: red;">*</span></label>
                <select class="form-input" name="issueType" required>
                  <option value="">请选择问题类别</option>
                  <option value="设备故障">设备故障</option>
                  <option value="工艺问题">工艺问题</option>
                  <option value="安装问题">安装问题</option>
                  <option value="调试问题">调试问题</option>
                  <option value="水质不达标">水质不达标</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">客户名称</label>
                <input type="text" class="form-input" name="clientName" placeholder="请输入客户名称">
              </div>
              <div class="form-group">
                <label class="form-label">客户电话</label>
                <input type="tel" class="form-input" name="clientPhone" placeholder="请输入客户电话">
              </div>
              <div class="form-group">
                <label class="form-label">计划完成日期</label>
                <input type="date" class="form-input" name="dueDate">
              </div>
              <div class="form-group">
                <label class="form-label">优先级 <span style="color: red;">*</span></label>
                <select class="form-input" name="priority" required>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-top: 16px;">
              <label class="form-label">问题描述 <span style="color: red;">*</span></label>
              <textarea class="form-input form-textarea" name="description" required rows="4" placeholder="请描述售后问题的详细情况..."></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addAfterSaleModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddAfterSale()">提交</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddAfterSale() {
  const form = document.getElementById('addAfterSaleForm');
  const formData = new FormData(form);
  
  const afterSaleData = {
    date: formData.get('date'),
    projectId: formData.get('projectId'),
    assigneeId: formData.get('assigneeId') || null,
    issueType: formData.get('issueType'),
    clientName: formData.get('clientName'),
    clientPhone: formData.get('clientPhone'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    status: 'pending',
    dueDate: formData.get('dueDate'),
    logs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  store.addAfterSale(afterSaleData);
  closeModal('addAfterSaleModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '售后创建成功',
    message: '售后记录已成功创建'
  });
}

function viewAfterSale(afterSaleId) {
  const state = store.getState();
  const afterSale = state.afterSales?.find(a => a.id === afterSaleId);
  if (!afterSale) return;
  
  const projects = state.projects;
  const users = state.users;
  const project = projects.find(p => p.id === afterSale.projectId);
  const assignee = users.find(u => u.id === afterSale.assigneeId);
  
  const priorityNames = {
    low: '低',
    medium: '中',
    high: '高'
  };
  const statusNames = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  };
  
  const logs = afterSale.logs || [];
  
  const html = `
    <div class="modal-overlay" id="viewAfterSaleModal">
      <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3 class="modal-title">售后详情</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('viewAfterSaleModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div>
              <label class="form-label">日期</label>
              <div class="form-input">${DateUtils.formatDate(afterSale.date)}</div>
            </div>
            <div>
              <label class="form-label">项目</label>
              <div class="form-input">${project?.name || '-'}</div>
            </div>
            <div>
              <label class="form-label">负责人</label>
              <div class="form-input">${assignee?.name || '<span class="text-muted">未分配</span>'}</div>
            </div>
            <div>
              <label class="form-label">问题类别</label>
              <div class="form-input">${afterSale.issueType || '-'}</div>
            </div>
            ${afterSale.clientName ? `
            <div>
              <label class="form-label">客户名称</label>
              <div class="form-input">${afterSale.clientName}</div>
            </div>
            ` : ''}
            ${afterSale.clientPhone ? `
            <div>
              <label class="form-label">客户电话</label>
              <div class="form-input">${afterSale.clientPhone}</div>
            </div>
            ` : ''}
            <div>
              <label class="form-label">优先级</label>
              <div class="form-input">${priorityNames[afterSale.priority]}</div>
            </div>
            <div>
              <label class="form-label">状态</label>
              <div class="form-input">${statusNames[afterSale.status]}</div>
            </div>
            <div>
              <label class="form-label">创建时间</label>
              <div class="form-input">${DateUtils.formatDateTime(afterSale.createdAt)}</div>
            </div>
            ${afterSale.dueDate ? `
            <div>
              <label class="form-label">计划完成</label>
              <div class="form-input">${DateUtils.formatDate(afterSale.dueDate)}</div>
            </div>
            ` : ''}
          </div>
          
          <div style="margin-bottom: 20px;">
            <label class="form-label">问题描述</label>
            <p style="margin-top: 8px; padding: 12px; background: var(--bg-light); border-radius: 4px;">${afterSale.description}</p>
          </div>
          
          ${afterSale.result ? `
            <div style="margin-bottom: 20px;">
              <label class="form-label">处理结果</label>
              <p style="margin-top: 8px; padding: 12px; background: var(--bg-light); border-radius: 4px;">${afterSale.result}</p>
            </div>
          ` : ''}
          
          <div>
            <label class="form-label">处理日志</label>
            ${logs.length === 0 ? `
              <p class="text-muted" style="margin-top: 8px;">暂无处理日志</p>
            ` : `
              <div style="margin-top: 8px; max-height: 200px; overflow-y: auto;">
                ${logs.map(log => `
                  <div style="display: flex; gap: 12px; padding: 8px; border-bottom: 1px solid var(--border-color);">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
                      <i class="fas fa-history"></i>
                    </div>
                    <div style="flex: 1;">
                      <div style="font-size: 13px;">${log.action}</div>
                      <div style="font-size: 12px; color: var(--text-muted);">${DateUtils.formatDateTime(log.createdAt)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('viewAfterSaleModal')">关闭</button>
          <button class="btn btn-secondary" onclick="closeModal('viewAfterSaleModal'); showAssignModal('${afterSale.id}')">分配负责人</button>
          ${afterSale.status !== 'completed' ? `
            <button class="btn btn-primary" onclick="updateAfterSaleStatus('${afterSale.id}', 'completed'); closeModal('viewAfterSaleModal');">标记完成</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function editAfterSale(afterSaleId) {
  const state = store.getState();
  const afterSale = state.afterSales?.find(a => a.id === afterSaleId);
  if (!afterSale) return;
  
  const projects = state.projects;
  const users = state.users;
  
  const html = `
    <div class="modal-overlay" id="editAfterSaleModal">
      <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
        <div class="modal-header">
          <h3 class="modal-title">编辑售后</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editAfterSaleModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="max-height: calc(90vh - 120px); overflow-y: auto;">
          <form id="editAfterSaleForm">
            <input type="hidden" name="afterSaleId" value="${afterSale.id}">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
              <div class="form-group">
                <label class="form-label">日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="date" required value="${afterSale.date}">
              </div>
              <div class="form-group">
                <label class="form-label">项目 <span style="color: red;">*</span></label>
                <select class="form-input" name="projectId" required>
                  <option value="">请选择项目</option>
                  ${projects.map(p => `<option value="${p.id}" ${p.id === afterSale.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">负责人</label>
                <select class="form-input" name="assigneeId">
                  <option value="">未分配</option>
                  ${users.map(u => `<option value="${u.id}" ${u.id === afterSale.assigneeId ? 'selected' : ''}>${u.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">问题类别</label>
                <select class="form-input" name="issueType">
                  <option value="">请选择问题类别</option>
                  <option value="设备故障" ${afterSale.issueType === '设备故障' ? 'selected' : ''}>设备故障</option>
                  <option value="工艺问题" ${afterSale.issueType === '工艺问题' ? 'selected' : ''}>工艺问题</option>
                  <option value="安装问题" ${afterSale.issueType === '安装问题' ? 'selected' : ''}>安装问题</option>
                  <option value="调试问题" ${afterSale.issueType === '调试问题' ? 'selected' : ''}>调试问题</option>
                  <option value="水质不达标" ${afterSale.issueType === '水质不达标' ? 'selected' : ''}>水质不达标</option>
                  <option value="其他" ${afterSale.issueType === '其他' ? 'selected' : ''}>其他</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">客户名称</label>
                <input type="text" class="form-input" name="clientName" value="${afterSale.clientName || ''}" placeholder="请输入客户名称">
              </div>
              <div class="form-group">
                <label class="form-label">客户电话</label>
                <input type="tel" class="form-input" name="clientPhone" value="${afterSale.clientPhone || ''}" placeholder="请输入客户电话">
              </div>
              <div class="form-group">
                <label class="form-label">计划完成日期</label>
                <input type="date" class="form-input" name="dueDate" value="${afterSale.dueDate || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">优先级 <span style="color: red;">*</span></label>
                <select class="form-input" name="priority" required>
                  <option value="low" ${afterSale.priority === 'low' ? 'selected' : ''}>低</option>
                  <option value="medium" ${afterSale.priority === 'medium' ? 'selected' : ''}>中</option>
                  <option value="high" ${afterSale.priority === 'high' ? 'selected' : ''}>高</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-input" name="status">
                  <option value="pending" ${afterSale.status === 'pending' ? 'selected' : ''}>待处理</option>
                  <option value="processing" ${afterSale.status === 'processing' ? 'selected' : ''}>处理中</option>
                  <option value="completed" ${afterSale.status === 'completed' ? 'selected' : ''}>已完成</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-top: 16px;">
              <label class="form-label">问题描述 <span style="color: red;">*</span></label>
              <textarea class="form-input form-textarea" name="description" required rows="4">${afterSale.description}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editAfterSaleModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditAfterSale()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditAfterSale() {
  const form = document.getElementById('editAfterSaleForm');
  const formData = new FormData(form);
  
  const afterSaleId = formData.get('afterSaleId');
  const afterSaleData = {
    date: formData.get('date'),
    projectId: formData.get('projectId'),
    assigneeId: formData.get('assigneeId') || null,
    issueType: formData.get('issueType'),
    clientName: formData.get('clientName'),
    clientPhone: formData.get('clientPhone'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    status: formData.get('status'),
    dueDate: formData.get('dueDate'),
    updatedAt: new Date().toISOString()
  };
  
  store.updateAfterSale(afterSaleId, afterSaleData);
  closeModal('editAfterSaleModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '售后更新成功',
    message: '售后记录已成功更新'
  });
}

function updateAfterSaleStatus(afterSaleId, status) {
  store.updateAfterSaleStatus(afterSaleId, status);
  renderContent();
  
  const statusNames = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  };
  
  store.addNotification({
    type: 'success',
    title: '状态更新成功',
    message: `售后状态已更新为${statusNames[status]}`
  });
}

function showAssignModal(afterSaleId) {
  const state = store.getState();
  const users = state.users;
  const afterSale = state.afterSales.find(a => a.id === afterSaleId);
  const currentAssignee = users.find(u => u.id === afterSale?.assigneeId);
  
  const html = `
    <div class="modal-overlay" id="assignModal">
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">分配负责人</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('assignModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="assignForm">
            <input type="hidden" name="afterSaleId" value="${afterSaleId}">
            <div class="form-group">
              <label class="form-label">当前负责人</label>
              <div class="form-input">${currentAssignee?.name || '未分配'}</div>
            </div>
            <div class="form-group">
              <label class="form-label">新负责人 <span style="color: red;">*</span></label>
              <select class="form-input" name="assigneeId" required>
                <option value="">请选择负责人</option>
                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('assignModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAssign()">确认分配</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAssign() {
  const form = document.getElementById('assignForm');
  const formData = new FormData(form);
  
  const afterSaleId = formData.get('afterSaleId');
  const assigneeId = formData.get('assigneeId');
  
  store.assignAfterSale(afterSaleId, assigneeId);
  closeModal('assignModal');
  renderContent();
  
  const user = store.getState().users.find(u => u.id === assigneeId);
  store.addNotification({
    type: 'success',
    title: '分配成功',
    message: `已分配给${user?.name}`
  });
}

function deleteAfterSaleConfirm(afterSaleId) {
  if (confirm('确定要删除这条售后记录吗？此操作不可撤销。')) {
    store.deleteAfterSale(afterSaleId);
    renderContent();
    
    store.addNotification({
      type: 'success',
      title: '删除成功',
      message: '售后记录已删除'
    });
  }
}

function exportAfterSales() {
  const state = store.getState();
  const afterSales = state.afterSales || [];
  const projects = state.projects || [];
  const users = state.users || [];
  
  let csvContent = '日期,项目,问题类别,客户名称,负责人,问题描述,优先级,计划完成,状态,处理结果,创建时间\n';
  
  afterSales.forEach(afterSale => {
    const project = projects.find(p => p.id === afterSale.projectId);
    const assignee = users.find(u => u.id === afterSale.assigneeId);
    const priorityNames = { low: '低', medium: '中', high: '高' };
    const statusNames = { pending: '待处理', processing: '处理中', completed: '已完成' };
    
    csvContent += `"${afterSale.date || ''}",`;
    csvContent += `"${project?.name || ''}",`;
    csvContent += `"${afterSale.issueType || ''}",`;
    csvContent += `"${afterSale.clientName || ''}",`;
    csvContent += `"${assignee?.name || ''}",`;
    csvContent += `"${afterSale.description || ''}",`;
    csvContent += `"${priorityNames[afterSale.priority] || ''}",`;
    csvContent += `"${afterSale.dueDate || ''}",`;
    csvContent += `"${statusNames[afterSale.status] || ''}",`;
    csvContent += `"${afterSale.result || ''}",`;
    csvContent += `"${afterSale.createdAt || ''}"\n`;
  });
  
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `售后报表_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  store.addNotification({
    type: 'success',
    title: '导出成功',
    message: '售后报表已导出'
  });
}

// ========== 临时用工管理 ==========
function renderTemporaryWorkers() {
  const state = store.getState();
  const workers = state.temporaryWorkers || [];
  const projects = state.projects || [];
  
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const totalHours = workers.reduce((sum, w) => sum + (parseFloat(w.totalHours) || 0), 0);
  const totalCost = workers.reduce((sum, w) => sum + ((parseFloat(w.hourlyRate) || 0) * (parseFloat(w.totalHours) || 0)), 0);
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">临时用工管理</h1>
        <p class="page-description">项目现场临时用工登记与工时管理</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" onclick="exportWorkerAttendance()">
          <i class="fas fa-file-export"></i>
          考勤导出
        </button>
        <button class="btn btn-secondary" onclick="exportTemporaryWorkers()">
          <i class="fas fa-file-export"></i>
          导出报表
        </button>
        <button class="btn btn-primary" onclick="showAddTemporaryWorkerModal()">
          <i class="fas fa-plus"></i>
          新增用工
        </button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-icon blue">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-card-value">${totalWorkers}</div>
        <div class="stat-card-label">用工人数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon green">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-card-value">${activeWorkers}</div>
        <div class="stat-card-label">在职人员</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon orange">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-card-value">${totalHours}</div>
        <div class="stat-card-label">总工时(h)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon purple">
          <i class="fas fa-money-bill"></i>
        </div>
        <div class="stat-card-value">${totalCost.toLocaleString()}</div>
        <div class="stat-card-label">总费用(元)</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="workerProjectFilter" onchange="filterTemporaryWorkers()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="workerStatusFilter" onchange="filterTemporaryWorkers()">
            <option value="">全部状态</option>
            <option value="active">在职</option>
            <option value="inactive">离职</option>
            <option value="completed">完工</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="card" style="background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
        <h3 style="font-size: 14px; font-weight: 600; color: #4b5563; margin: 0;">临时用工列表</h3>
      </div>
      <div style="padding: 0;">
        ${workers.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-user-plus" style="font-size: 48px; color: #9ca3af;"></i>
            <h3 style="margin-top: 16px; color: #1f2937;">暂无临时用工记录</h3>
            <p style="color: #6b7280;">点击"新增用工"按钮创建第一条记录</p>
          </div>
        ` : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">姓名</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">工种</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">项目</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">进场日期</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">工时(h)</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">单价(元/h)</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 160px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${workers.map(worker => {
                const project = projects.find(p => p.id === worker.projectId);
                const statusInfo = getWorkerStatusInfo(worker.status);
                return `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                          ${worker.name?.charAt(0) || '?'}
                        </div>
                        <span style="color: #1f2937;">${worker.name}</span>
                      </div>
                    </td>
                    <td style="padding: 14px 16px; color: #1f2937;">${worker.trade || worker.type || '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${project?.name || '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${worker.startDate ? DateUtils.formatDate(worker.startDate) : '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${worker.totalHours || 0}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${worker.hourlyRate || 0}</td>
                    <td style="padding: 14px 16px;">
                      <span style="font-size: 11px; background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 4px 10px; border-radius: 4px;">${statusInfo.name}</span>
                    </td>
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="showWorkerAttendanceModal('${worker.id}')" title="考勤">
                          <i class="fas fa-clock"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="viewTemporaryWorker('${worker.id}')" title="查看">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editTemporaryWorker('${worker.id}')" title="编辑">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteTemporaryWorkerConfirm('${worker.id}')" title="删除">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
  
  return html;
}

function getWorkerStatusInfo(status) {
  const statusMap = {
    'active': { name: '在职', bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' },
    'inactive': { name: '离职', bg: 'rgba(251, 191, 36, 0.1)', color: '#b45309' },
    'completed': { name: '完工', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }
  };
  return statusMap[status] || { name: status, bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
}

function filterTemporaryWorkers() {
  const state = store.getState();
  let workers = [...state.temporaryWorkers];
  const projects = state.projects;
  
  const projectFilter = document.getElementById('workerProjectFilter')?.value;
  const statusFilter = document.getElementById('workerStatusFilter')?.value;
  
  if (projectFilter) {
    workers = workers.filter(w => w.projectId === projectFilter);
  }
  if (statusFilter) {
    workers = workers.filter(w => w.status === statusFilter);
  }
  
  const container = document.getElementById('pageContent');
  if (container) {
    container.innerHTML = renderTemporaryWorkersFiltered(workers, projects);
  }
}

function renderTemporaryWorkersFiltered(workers, projects) {
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const totalHours = workers.reduce((sum, w) => sum + (parseFloat(w.totalHours) || 0), 0);
  const totalCost = workers.reduce((sum, w) => sum + ((parseFloat(w.hourlyRate) || 0) * (parseFloat(w.totalHours) || 0)), 0);
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">临时用工管理</h1>
        <p class="page-description">项目现场临时用工登记与工时管理</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" onclick="exportWorkerAttendance()">
          <i class="fas fa-file-export"></i>
          考勤导出
        </button>
        <button class="btn btn-secondary" onclick="exportTemporaryWorkers()">
          <i class="fas fa-file-export"></i>
          导出报表
        </button>
        <button class="btn btn-primary" onclick="showAddTemporaryWorkerModal()">
          <i class="fas fa-plus"></i>
          新增用工
        </button>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-icon blue">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-card-value">${totalWorkers}</div>
        <div class="stat-card-label">用工人数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon green">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-card-value">${activeWorkers}</div>
        <div class="stat-card-label">在职人员</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon orange">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-card-value">${totalHours}</div>
        <div class="stat-card-label">总工时(h)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon purple">
          <i class="fas fa-money-bill"></i>
        </div>
        <div class="stat-card-value">${totalCost.toLocaleString()}</div>
        <div class="stat-card-label">总费用(元)</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="workerProjectFilter" onchange="filterTemporaryWorkers()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="workerStatusFilter" onchange="filterTemporaryWorkers()">
            <option value="">全部状态</option>
            <option value="active">在职</option>
            <option value="inactive">离职</option>
            <option value="completed">完工</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="card" style="background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
        <h3 style="font-size: 14px; font-weight: 600; color: #4b5563; margin: 0;">临时用工列表</h3>
      </div>
      <div style="padding: 0;">
        ${workers.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-user-plus" style="font-size: 48px; color: #9ca3af;"></i>
            <h3 style="margin-top: 16px; color: #1f2937;">暂无临时用工记录</h3>
            <p style="color: #6b7280;">点击"新增用工"按钮创建第一条记录</p>
          </div>
        ` : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">姓名</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">工种</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">项目</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">进场日期</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">工时(h)</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">单价(元/h)</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 160px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${workers.map(worker => {
                const project = projects.find(p => p.id === worker.projectId);
                const statusInfo = getWorkerStatusInfo(worker.status);
                return `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 12px;">
                          ${worker.name?.charAt(0) || '?'}
                        </div>
                        <span style="color: #1f2937;">${worker.name}</span>
                      </div>
                    </td>
                    <td style="padding: 14px 16px; color: #1f2937;">${worker.trade || worker.type || '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${project?.name || '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937;">${worker.startDate ? DateUtils.formatDate(worker.startDate) : '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${worker.totalHours || 0}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${worker.hourlyRate || 0}</td>
                    <td style="padding: 14px 16px;">
                      <span style="font-size: 11px; background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 4px 10px; border-radius: 4px;">${statusInfo.name}</span>
                    </td>
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="showWorkerAttendanceModal('${worker.id}')" title="考勤">
                          <i class="fas fa-clock"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="viewTemporaryWorker('${worker.id}')" title="查看">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editTemporaryWorker('${worker.id}')" title="编辑">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteTemporaryWorkerConfirm('${worker.id}')" title="删除">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
  
  return html;
}

function showAddTemporaryWorkerModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="addWorkerModal">
      <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
        <div class="modal-header">
          <h3 class="modal-title">新增临时用工</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addWorkerModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="max-height: calc(90vh - 120px); overflow-y: auto;">
          <form id="addWorkerForm">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
              <div class="form-group">
                <label class="form-label">姓名 <span style="color: red;">*</span></label>
                <input type="text" class="form-input" name="name" required placeholder="请输入姓名">
              </div>
              <div class="form-group">
                <label class="form-label">工种 <span style="color: red;">*</span></label>
                <input type="text" class="form-input" name="trade" required placeholder="如：电工、木工、瓦工">
              </div>
              <div class="form-group">
                <label class="form-label">联系电话</label>
                <input type="tel" class="form-input" name="phone" placeholder="请输入联系电话">
              </div>
              <div class="form-group">
                <label class="form-label">身份证号</label>
                <input type="text" class="form-input" name="idCard" placeholder="请输入身份证号">
              </div>
              <div class="form-group">
                <label class="form-label">项目 <span style="color: red;">*</span></label>
                <select class="form-input" name="projectId" required>
                  <option value="">请选择项目</option>
                  ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">进场日期 <span style="color: red;">*</span></label>
                <input type="date" class="form-input" name="startDate" required value="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label class="form-label">小时工资(元) <span style="color: red;">*</span></label>
                <input type="number" class="form-input" name="hourlyRate" required placeholder="请输入小时工资" min="0" step="0.01">
              </div>
              <div class="form-group"></div>
            </div>
            <div class="form-group" style="margin-top: 16px;">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="remark" placeholder="其他说明信息" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addWorkerModal')">取消</button>
          <button class="btn btn-primary" onclick="handleAddTemporaryWorker()">确认添加</button>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddTemporaryWorker() {
  const form = document.getElementById('addWorkerForm');
  const formData = new FormData(form);

  const workerData = {
    name: formData.get('name'),
    trade: formData.get('trade'),
    phone: formData.get('phone'),
    idCard: formData.get('idCard'),
    projectId: formData.get('projectId'),
    startDate: formData.get('startDate'),
    hourlyRate: parseFloat(formData.get('hourlyRate')) || 0,
    totalHours: 0,
    status: 'active',
    remark: formData.get('remark')
  };

  store.addTemporaryWorker(workerData);
  closeModal('addWorkerModal');
  renderContent();

  store.addNotification({
    type: 'success',
    title: '添加成功',
    message: '临时用工记录已创建'
  });
}

function viewTemporaryWorker(workerId) {
  const worker = store.getTemporaryWorkerById(workerId);
  if (!worker) return;
  const project = store.getProjectById(worker.projectId);
  
  const statusNames = {
    active: '在职',
    inactive: '离职',
    completed: '完工'
  };
  
  const totalCost = (worker.hourlyRate || 0) * (worker.totalHours || 0);

  const html = `
    <div class="modal-overlay" id="viewWorkerModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">用工详情</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('viewWorkerModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border-color);">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), var(--purple-color)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 24px;">
              ${worker.name?.charAt(0) || '?'}
            </div>
            <div>
              <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${worker.name}</h4>
              <p class="text-muted">${worker.trade || worker.type} | ${statusNames[worker.status]}</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label class="form-label">联系电话</label>
              <div class="form-input" style="font-weight: 500;">${worker.phone || '-'}</div>
            </div>
            <div>
              <label class="form-label">身份证号</label>
              <div class="form-input" style="font-weight: 500;">${worker.idCard || '-'}</div>
            </div>
            <div>
              <label class="form-label">所属项目</label>
              <div class="form-input" style="font-weight: 500;">${project?.name || '-'}</div>
            </div>
            <div>
              <label class="form-label">进场日期</label>
              <div class="form-input" style="font-weight: 500;">${worker.startDate ? DateUtils.formatDate(worker.startDate) : '-'}</div>
            </div>
            <div>
              <label class="form-label">小时工资</label>
              <div class="form-input" style="font-weight: 500;">${worker.hourlyRate || 0} 元/h</div>
            </div>
            <div>
              <label class="form-label">累计工时</label>
              <div class="form-input" style="font-weight: 500;">${worker.totalHours || 0} 小时</div>
            </div>
          </div>
          
          <div style="margin-top: 16px;">
            <label class="form-label">累计费用</label>
            <div class="form-input" style="font-weight: 600; color: var(--primary-color); font-size: 18px;">${totalCost.toLocaleString()} 元</div>
          </div>
          
          <div style="margin-top: 16px;">
            <label class="form-label">备注</label>
            <div class="form-input" style="min-height: 60px;">${worker.remark || '-'}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('viewWorkerModal')">关闭</button>
          <button class="btn btn-primary" onclick="closeModal('viewWorkerModal'); editTemporaryWorker('${worker.id}')">编辑</button>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function editTemporaryWorker(workerId) {
  const worker = store.getTemporaryWorkerById(workerId);
  const projects = store.getState().projects;
  
  const html = `
    <div class="modal-overlay" id="editWorkerModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑用工信息</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editWorkerModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editWorkerForm">
            <input type="hidden" name="workerId" value="${worker.id}">
            <div class="form-group">
              <label class="form-label">姓名 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required value="${worker.name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">工种 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="trade" required value="${worker.trade || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">联系电话</label>
              <input type="tel" class="form-input" name="phone" value="${worker.phone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">身份证号</label>
              <input type="text" class="form-input" name="idCard" value="${worker.idCard || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">项目 <span style="color: red;">*</span></label>
              <select class="form-input" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}" ${p.id === worker.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">进场日期</label>
              <input type="date" class="form-input" name="startDate" value="${worker.startDate || new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">小时工资(元)</label>
              <input type="number" class="form-input" name="hourlyRate" value="${worker.hourlyRate || 0}" min="0" step="0.01">
            </div>
            <div class="form-group">
              <label class="form-label">累计工时(h) <span style="color: var(--text-muted); font-size: 12px;">(通过考勤记录自动计算)</span></label>
              <div class="form-input" style="background: var(--bg-light); color: var(--text-muted);">${worker.totalHours || 0}</div>
            </div>
            <div class="form-group">
              <label class="form-label">状态 <span style="color: red;">*</span></label>
              <select class="form-input" name="status" required>
                <option value="active" ${worker.status === 'active' ? 'selected' : ''}>在职</option>
                <option value="inactive" ${worker.status === 'inactive' ? 'selected' : ''}>离职</option>
                <option value="completed" ${worker.status === 'completed' ? 'selected' : ''}>完工</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="remark">${worker.remark || ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editWorkerModal')">取消</button>
          <button class="btn btn-primary" onclick="handleEditTemporaryWorker()">保存修改</button>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditTemporaryWorker() {
  const form = document.getElementById('editWorkerForm');
  const formData = new FormData(form);

  const workerId = formData.get('workerId');
  const workerData = {
    name: formData.get('name'),
    trade: formData.get('trade'),
    phone: formData.get('phone'),
    idCard: formData.get('idCard'),
    projectId: formData.get('projectId'),
    startDate: formData.get('startDate'),
    hourlyRate: parseFloat(formData.get('hourlyRate')) || 0,
    status: formData.get('status'),
    remark: formData.get('remark')
  };

  store.updateTemporaryWorker(workerId, workerData);
  closeModal('editWorkerModal');
  renderContent();

  store.addNotification({
    type: 'success',
    title: '更新成功',
    message: '用工信息已更新'
  });
}

function deleteTemporaryWorkerConfirm(workerId) {
  if (confirm('确定要删除这条用工记录吗？此操作不可撤销。')) {
    store.deleteTemporaryWorker(workerId);
    renderContent();

    store.addNotification({
      type: 'success',
      title: '删除成功',
      message: '用工记录已删除'
    });
  }
}

function exportTemporaryWorkers() {
  const workers = store.getState().temporaryWorkers || [];
  const projects = store.getState().projects || [];
  
  let csvContent = '姓名,工种,联系电话,身份证号,项目,进场日期,工时(h),单价(元/h),总费用(元),状态,备注\n';
  
  workers.forEach(worker => {
    const project = projects.find(p => p.id === worker.projectId);
    const statusNames = { active: '在职', inactive: '离职', completed: '完工' };
    const totalCost = (worker.hourlyRate || 0) * (worker.totalHours || 0);
    
    csvContent += `"${worker.name || ''}",`;
    csvContent += `"${worker.trade || ''}",`;
    csvContent += `"${worker.phone || ''}",`;
    csvContent += `"${worker.idCard || ''}",`;
    csvContent += `"${project?.name || ''}",`;
    csvContent += `"${worker.startDate || ''}",`;
    csvContent += `"${worker.totalHours || 0}",`;
    csvContent += `"${worker.hourlyRate || 0}",`;
    csvContent += `"${totalCost}",`;
    csvContent += `"${statusNames[worker.status] || ''}",`;
    csvContent += `"${worker.remark || ''}"\n`;
  });

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `临时用工报表_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  store.addNotification({
    type: 'success',
    title: '导出成功',
    message: '用工报表已导出'
  });
}

function showWorkerAttendanceModal(workerId) {
  const state = store.getState();
  const worker = store.getTemporaryWorkerById(workerId);
  const projects = state.projects;
  const project = projects.find(p => p.id === worker.projectId);
  const attendances = store.getWorkerAttendanceByWorker(workerId);
  
  const totalAttendanceHours = attendances.reduce((sum, a) => sum + (parseFloat(a.hours) || 0), 0);
  
  const html = `
    <div class="modal-overlay" id="attendanceModal">
      <div class="modal-content" style="max-width: 800px; max-height: 85vh;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">考勤管理 - ${worker.name}</h3>
            <p style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">
              工种: ${worker.trade} | 项目: ${project?.name || '-'} | 已用工: ${totalAttendanceHours}h
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('attendanceModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="overflow-y: auto;">
          <div style="margin-bottom: 16px;">
            <button class="btn btn-primary" onclick="closeModal('attendanceModal'); showAddAttendanceModal('${workerId}')">
              <i class="fas fa-plus"></i>
              登记工时
            </button>
          </div>
          
          ${attendances.length === 0 ? `
            <div class="empty-state" style="padding: 40px;">
              <i class="fas fa-clock" style="font-size: 48px; color: var(--text-muted);"></i>
              <h3 style="margin-top: 16px;">暂无考勤记录</h3>
              <p class="text-muted">点击"登记工时"添加第一条记录</p>
            </div>
          ` : `
            <table class="table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>工时(h)</th>
                  <th>工作内容</th>
                  <th>备注</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${attendances.map(attendance => `
                  <tr>
                    <td>${attendance.date ? DateUtils.formatDate(attendance.date) : '-'}</td>
                    <td>${attendance.hours || 0}</td>
                    <td>${attendance.workContent || '-'}</td>
                    <td>${attendance.remark || '-'}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="editAttendance('${attendance.id}')">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="deleteAttendanceConfirm('${attendance.id}')">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('attendanceModal')">关闭</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function showAddAttendanceModal(workerId) {
  const worker = store.getTemporaryWorkerById(workerId);
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="addAttendanceModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">登记工时 - ${worker.name}</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('addAttendanceModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="addAttendanceForm">
            <input type="hidden" name="workerId" value="${workerId}">
            <input type="hidden" name="projectId" value="${worker.projectId}">
            <div class="form-group">
              <label class="form-label">日期 <span style="color: red;">*</span></label>
              <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">工时(h) <span style="color: red;">*</span></label>
              <input type="number" class="form-input" name="hours" required placeholder="请输入工作时长" min="0" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">工作内容</label>
              <textarea class="form-input form-textarea" name="workContent" placeholder="请输入工作内容描述"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="remark" placeholder="其他说明信息"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('addAttendanceModal'); showWorkerAttendanceModal('${workerId}')">返回</button>
          <button class="btn btn-primary" onclick="handleAddAttendance()">提交</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleAddAttendance() {
  const form = document.getElementById('addAttendanceForm');
  const formData = new FormData(form);
  
  const workerId = formData.get('workerId');
  const attendanceData = {
    workerId: workerId,
    projectId: formData.get('projectId'),
    date: formData.get('date'),
    hours: parseFloat(formData.get('hours')) || 0,
    workContent: formData.get('workContent'),
    remark: formData.get('remark')
  };
  
  store.addWorkerAttendance(attendanceData);
  closeModal('addAttendanceModal');
  
  store.addNotification({
    type: 'success',
    title: '登记成功',
    message: '工时已登记'
  });
  
  renderContent();
  showWorkerAttendanceModal(workerId);
}

function editAttendance(attendanceId) {
  const attendance = store.getWorkerAttendanceById(attendanceId);
  const worker = store.getTemporaryWorkerById(attendance.workerId);
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="editAttendanceModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">编辑工时 - ${worker.name}</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('editAttendanceModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="editAttendanceForm">
            <input type="hidden" name="attendanceId" value="${attendanceId}">
            <input type="hidden" name="workerId" value="${attendance.workerId}">
            <div class="form-group">
              <label class="form-label">日期 <span style="color: red;">*</span></label>
              <input type="date" class="form-input" name="date" required value="${attendance.date || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">工时(h) <span style="color: red;">*</span></label>
              <input type="number" class="form-input" name="hours" required value="${attendance.hours || 0}" min="0" step="0.5">
            </div>
            <div class="form-group">
              <label class="form-label">工作内容</label>
              <textarea class="form-input form-textarea" name="workContent">${attendance.workContent || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea class="form-input form-textarea" name="remark">${attendance.remark || ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('editAttendanceModal'); showWorkerAttendanceModal('${attendance.workerId}')">返回</button>
          <button class="btn btn-primary" onclick="handleEditAttendance()">保存</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleEditAttendance() {
  const form = document.getElementById('editAttendanceForm');
  const formData = new FormData(form);
  
  const attendanceId = formData.get('attendanceId');
  const workerId = formData.get('workerId');
  const attendanceData = {
    date: formData.get('date'),
    hours: parseFloat(formData.get('hours')) || 0,
    workContent: formData.get('workContent'),
    remark: formData.get('remark')
  };
  
  store.updateWorkerAttendance(attendanceId, attendanceData);
  closeModal('editAttendanceModal');
  
  store.addNotification({
    type: 'success',
    title: '更新成功',
    message: '工时记录已更新'
  });
  
  renderContent();
  showWorkerAttendanceModal(workerId);
}

function deleteAttendanceConfirm(attendanceId) {
  const attendance = store.getWorkerAttendanceById(attendanceId);
  
  if (confirm('确定要删除这条考勤记录吗？此操作将同时更新该员工的总工时。')) {
    const workerId = attendance.workerId;
    store.deleteWorkerAttendance(attendanceId);
    
    store.addNotification({
      type: 'success',
      title: '删除成功',
      message: '考勤记录已删除'
    });
    
    closeModal('attendanceModal');
    renderContent();
    showWorkerAttendanceModal(workerId);
  }
}

function exportWorkerAttendance() {
  const state = store.getState();
  const attendances = state.workerAttendance || [];
  const workers = state.temporaryWorkers || [];
  const projects = state.projects || [];
  
  let csvContent = '姓名,工种,项目,日期,工时(h),工作内容,备注\n';
  
  attendances.forEach(attendance => {
    const worker = workers.find(w => w.id === attendance.workerId);
    const project = projects.find(p => p.id === attendance.projectId);
    
    csvContent += `"${worker?.name || ''}",`;
    csvContent += `"${worker?.trade || ''}",`;
    csvContent += `"${project?.name || ''}",`;
    csvContent += `"${attendance.date || ''}",`;
    csvContent += `"${attendance.hours || 0}",`;
    csvContent += `"${attendance.workContent || ''}",`;
    csvContent += `"${attendance.remark || ''}"\n`;
  });
  
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `临时用工考勤_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  store.addNotification({
    type: 'success',
    title: '导出成功',
    message: '考勤报表已导出'
  });
}
