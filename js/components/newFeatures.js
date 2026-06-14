// ========== 进度计划管理 ==========
function renderProgress() {
  const state = store.getState();
  const progressReports = state.progressReports || [];
  const warnings = state.warnings || [];
  const projects = state.projects || [];
  const tasks = state.tasks || [];
  
  const warningCount = warnings.filter(w => !w.isRead).length;
  const delayedReports = progressReports.filter(r => r.status === 'delayed' || (r.description || '').includes('滞后'));
  const aheadReports = progressReports.filter(r => r.status === 'ahead' || (r.description || '').includes('提前'));
  
  const commissioningProjects = projects.filter(p => p.phase === 'commissioning' || p.phase === 'trial-run');
  const commissioningProgress = commissioningProjects.length > 0
    ? Math.round(commissioningProjects.reduce((sum, p) => sum + store.getProjectProgress(p.id), 0) / commissioningProjects.length)
    : 0;

  const overallProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + store.getProjectProgress(p.id), 0) / projects.length)
    : 0;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;

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
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #3b82f6, #60a5fa);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-chart-line" style="color: #3b82f6; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总进度报告</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #1e40af; margin-bottom: 6px; line-height: 1;">${progressReports.length}</div>
        <div style="font-size: 12px; color: #93c5fd;">${progressReports.length} 条记录</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #f59e0b, #fbbf24);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">滞后工序</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #92400e; margin-bottom: 6px; line-height: 1;">${delayedReports.length}</div>
        <div style="font-size: 12px; color: #d97706;">需要关注的进度</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #8b5cf6, #a78bfa);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(139, 92, 246, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-sliders-h" style="color: #8b5cf6; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">调试进度</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #6d28d9; margin-bottom: 6px; line-height: 1;">${commissioningProgress}%</div>
        <div style="margin-top: 12px; height: 6px; background: rgba(139, 92, 246, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${commissioningProgress}%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #a78bfa); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #7c3aed; margin-top: 6px;">${commissioningProjects.length} 个项目在调试</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #ef4444, #f87171);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(239, 68, 68, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-bell" style="color: #ef4444; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">待处理预警</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #991b1b; margin-bottom: 6px; line-height: 1;">${warningCount}</div>
        <div style="font-size: 12px; color: #dc2626;">需要处理的预警</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #22c55e, #4ade80);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34, 197, 94, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-tasks" style="color: #22c55e; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总体进度</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #166534; margin-bottom: 6px; line-height: 1;">${overallProgress}%</div>
        <div style="margin-top: 12px; height: 6px; background: rgba(34, 197, 94, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${overallProgress}%; height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #15803d; margin-top: 6px;">所有项目平均进度</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border: 1px solid #fbcfe8; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #ec4899, #f472b6);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(236, 72, 153, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #ec4899; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">任务完成率</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #9d174d; margin-bottom: 6px; line-height: 1;">${taskCompletionRate}%</div>
        <div style="margin-top: 12px; height: 6px; background: rgba(236, 72, 153, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${taskCompletionRate}%; height: 100%; background: linear-gradient(90deg, #ec4899, #f472b6); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #be185d; margin-top: 6px;">${completedTasks}/${totalTasks} 个任务</div>
      </div>
    </div>

    <style>
      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.12);
      }
    </style>

    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <h3 class="card-title">进度报告列表</h3>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <label style="font-size: 13px; color: var(--text-secondary);">项目：</label>
          <select class="form-input" id="progressProjectFilter" onchange="filterProgress()" style="width: 160px; padding: 6px 10px; font-size: 13px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <option value="">全部项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <label style="font-size: 13px; color: var(--text-secondary);">阶段：</label>
          <select class="form-input" id="progressPhaseFilter" onchange="filterProgress()" style="width: 130px; padding: 6px 10px; font-size: 13px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <option value="">全部阶段</option>
            <option value="preparation">前期准备</option>
            <option value="civil">土建施工</option>
            <option value="mechanical">机电安装</option>
            <option value="commissioning">工艺调试</option>
            <option value="trial-run">试运行</option>
            <option value="acceptance">竣工验收</option>
          </select>
          <label style="font-size: 13px; color: var(--text-secondary);">状态：</label>
          <select class="form-input" id="progressStatusFilter" onchange="filterProgress()" style="width: 100px; padding: 6px 10px; font-size: 13px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <option value="">全部</option>
            <option value="normal">正常</option>
            <option value="delayed">滞后</option>
            <option value="ahead">提前</option>
          </select>
          <label style="font-size: 13px; color: var(--text-secondary);">日期：</label>
          <input type="date" id="progressStartDate" onchange="filterProgress()" style="width: 130px; padding: 6px 10px; font-size: 13px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <span style="color: var(--text-tertiary);">至</span>
          <input type="date" id="progressEndDate" onchange="filterProgress()" style="width: 130px; padding: 6px 10px; font-size: 13px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="clearProgressFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
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
  const selectedStatus = document.getElementById('progressStatusFilter')?.value || '';
  const startDate = document.getElementById('progressStartDate')?.value || '';
  const endDate = document.getElementById('progressEndDate')?.value || '';
  
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

  if (selectedStatus) {
    filtered = filtered.filter(r => {
      if (selectedStatus === 'normal') {
        return r.status === 'normal' || !r.status || (!r.description?.includes('滞后') && !r.description?.includes('延期'));
      } else if (selectedStatus === 'delayed') {
        return r.status === 'delayed' || r.description?.includes('滞后') || r.description?.includes('延期');
      } else if (selectedStatus === 'ahead') {
        return r.status === 'ahead' || r.description?.includes('提前');
      }
      return true;
    });
  }

  if (startDate || endDate) {
    filtered = filtered.filter(r => {
      if (!r.reportDate) return true;
      const reportDate = r.reportDate.split('T')[0];
      if (startDate && reportDate < startDate) return false;
      if (endDate && reportDate > endDate) return false;
      return true;
    });
  }

  if (filtered.length === 0) {
    return `
      <div class="empty-state" style="padding: 60px; text-align: center;">
        <i class="fas fa-chart-line" style="font-size: 64px; color: var(--text-muted);"></i>
        <h3 style="margin-top: 20px; font-size: 18px;">暂无进度报告</h3>
        <p class="text-muted" style="margin-top: 8px;">点击"进度填报"按钮创建第一条报告</p>
      </div>`;
  }

  return `
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table class="table" style="margin: 0; border: none; width: 100%;">
        <thead>
          <tr style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">日期</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">项目</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">工程阶段</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">进度对比</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">状态</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">进度描述</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">填报人</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((report, index) => {
            const project = store.getProjectById(report.projectId);
            const reporterId = report.reportedBy || report.reporterId;
            const reporter = store.getUserById(reporterId);
            
            const progressValue = report.overallProgress !== undefined ? report.overallProgress : report.actualProgress || 0;
            const hasComparison = report.plannedProgress !== undefined && report.actualProgress !== undefined;
            const progressDiff = hasComparison ? report.actualProgress - report.plannedProgress : 0;
            
            const description = report.description || '';
            let statusName = '正常';
            let statusColor = 'tag-success';
            
            if (report.status === 'delayed' || description.includes('滞后') || description.includes('延期')) {
              statusName = '滞后';
              statusColor = 'tag-danger';
            } else if (report.status === 'ahead' || description.includes('提前')) {
              statusName = '提前';
              statusColor = 'tag-info';
            } else if (description.includes('放缓')) {
              statusName = '注意';
              statusColor = 'tag-warning';
            }
            
            const phaseNames = {
              preparation: '前期准备',
              civil: '土建施工',
              mechanical: '机电安装',
              commissioning: '工艺调试',
              'trial-run': '试运行',
              acceptance: '竣工验收'
            };
            
            const shortDesc = description.length > 45 ? description.substring(0, 45) + '...' : description;
            
            return `
              <tr style="border-bottom: 1px solid #e5e7eb; background: ${index % 2 === 0 ? 'white' : '#fafafa'}; transition: background 0.2s;">
                <td style="padding: 16px; color: #1f2937; font-weight: 500;">${DateUtils.formatDate(report.date)}</td>
                <td style="padding: 16px; color: #1f2937;">${project?.name || '-'}</td>
                <td style="padding: 16px; color: #1f2937;">${phaseNames[project?.phase] || project?.phase || '-'}</td>
                <td style="padding: 16px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    ${hasComparison ? `
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="display: flex; flex-direction: column;">
                          <span style="font-size: 11px; color: #9ca3af;">计划</span>
                          <span style="font-weight: 600; color: #6b7280;">${report.plannedProgress}%</span>
                        </div>
                        <div class="progress-bar" style="width: 100px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                          <div class="progress-bar-fill" style="width: ${report.plannedProgress}%; height: 100%; background: #9ca3af; border-radius: 4px;"></div>
                        </div>
                      </div>
                      <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 11px; color: ${progressDiff >= 0 ? '#10b981' : '#ef4444'};">实际</span>
                        <span style="font-weight: 600; color: ${progressDiff >= 0 ? '#10b981' : '#ef4444'};">${report.actualProgress}%</span>
                      </div>
                      <div class="progress-bar" style="width: 100px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                        <div class="progress-bar-fill" style="width: ${report.actualProgress}%; height: 100%; background: ${progressDiff >= 0 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)'}; border-radius: 4px;"></div>
                      </div>
                      ${progressDiff !== 0 ? `
                        <span style="font-size: 12px; font-weight: 600; color: ${progressDiff > 0 ? '#10b981' : '#ef4444'};">
                          ${progressDiff > 0 ? '+' : ''}${progressDiff}%
                        </span>
                      ` : ''}
                    ` : `
                      <div class="progress-bar" style="width: 120px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                        <div class="progress-bar-fill" style="width: ${progressValue}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 4px;"></div>
                      </div>
                      <span style="font-weight: 600; color: #1f2937; min-width: 40px;">${progressValue}%</span>
                    `}
                  </div>
                </td>
                <td style="padding: 16px;">
                  <span class="tag ${statusColor}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${statusName}</span>
                </td>
                <td style="padding: 16px; max-width: 300px; color: #4b5563;" title="${report.description || ''}">${shortDesc || '-'}</td>
                <td style="padding: 16px; color: #1f2937;">${reporter?.name || '-'}</td>
                <td style="padding: 16px;">
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" style="padding: 6px 12px; border-radius: 8px;" onclick="viewProgressReport('${report.id}')" title="查看详情">
                      <i class="fas fa-eye"></i>
                    </button>
                    ${statusName === '滞后' ? `
                      <button class="btn btn-warning btn-sm" style="padding: 6px 12px; border-radius: 8px;" onclick="showProgressAdjustModal('${report.id}')" title="调整进度">
                        <i class="fas fa-sliders-h"></i>
                      </button>
                    ` : ''}
                  </div>
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

function clearProgressFilters() {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };
  setValue('progressProjectFilter', '');
  setValue('progressPhaseFilter', '');
  setValue('progressStatusFilter', '');
  setValue('progressStartDate', '');
  setValue('progressEndDate', '');
  filterProgress();
}

function showAddProgressReportModal() {
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">进度填报</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addProgressReportModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="addProgressReportForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">选择项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required onchange="updateTaskOptions(this.value)">
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">选择任务 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="taskId" id="taskSelect" required>
              <option value="">请先选择项目</option>
            </select>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">计划进度(%) <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="plannedProgress" min="0" max="100" required value="0">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">实际进度(%) <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="actualProgress" min="0" max="100" required value="0">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">进度说明</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="description" placeholder="请描述当前进度情况"></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">填报人</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="reporterId">
              ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('addProgressReportModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);" onclick="handleAddProgressReport()">提交</button>
      </div>
    </div>
  `;
  
  showModal('addProgressReportModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">进度报告详情</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewProgressReportModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; gap: 16px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">报告日期</span>
            <span>${DateUtils.formatDate(report.date)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">项目</span>
            <span>${project?.name || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">填报人</span>
            <span>${reporter?.name || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">总体进度</span>
            <span>${report.overallProgress || 0}%</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">状态</span>
            <span><span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; background: ${statusTag === 'tag-success' ? '#d1fae5' : statusTag === 'tag-warning' ? '#fef3c7' : '#dbeafe'}; color: ${statusTag === 'tag-success' ? '#065f46' : statusTag === 'tag-warning' ? '#92400e' : '#0369a1'};">${statusName}</span></span>
          </div>
          ${phaseProgressHtml ? `
            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 4px;">
              <div style="color: #64748b; margin-bottom: 8px; font-weight: 600;">各阶段进度</div>
              ${phaseProgressHtml}
            </div>
          ` : ''}
          <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 4px;">
            <div style="color: #64748b; margin-bottom: 8px; font-weight: 600;">进度描述</div>
            <p style="line-height: 1.8; color: #1e293b;">${report.description || '暂无描述'}</p>
          </div>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 8px 16px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewProgressReportModal')">关闭</button>
      </div>
    </div>
  `;
  
  showModal('viewProgressReportModal', contentHtml);
}

function showProgressAdjustModal(reportId) {
  const state = store.getState();
  const report = state.progressReports?.find(r => r.id === reportId);
  if (!report) return;

  const project = store.getProjectById(report.projectId);

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 550px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">
          <i class="fas fa-sliders-h" style="color: #f59e0b; margin-right: 8px;"></i>
          调整进度
        </h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('progressAdjustModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="progressAdjustForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">报告编号</label>
            <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; font-size: 14px; color: #64748b;">${report.id}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">所属项目</label>
            <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; font-size: 14px; color: #1e293b;">${project?.name || '-'}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">调整进度 <span style="color: red;">*</span></label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="progress" min="0" max="100" value="${report.progress || 0}" required>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">调整说明 <span style="color: red;">*</span></label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="adjustReason" rows="3" placeholder="请说明调整原因" required></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('progressAdjustModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);" onclick="handleProgressAdjust('${reportId}')">确认调整</button>
      </div>
    </div>
  `;

  showModal('progressAdjustModal', contentHtml);
}

function handleProgressAdjust(reportId) {
  const form = document.getElementById('progressAdjustForm');
  const formData = new FormData(form);

  const progress = parseInt(formData.get('progress'));
  const adjustReason = formData.get('adjustReason');

  if (isNaN(progress) || progress < 0 || progress > 100) {
    alert('请输入有效的进度值（0-100）');
    return;
  }
  if (!adjustReason || !adjustReason.trim()) {
    alert('请填写调整说明');
    return;
  }

  store.updateProgressReport(reportId, { progress, adjustReason: adjustReason.trim(), adjustedAt: new Date().toISOString() });
  closeModal('progressAdjustModal');
  renderContent();

  store.addNotification({
    type: 'success',
    title: '进度调整成功',
    message: '进度已成功调整'
  });
}

function showWarningsModal() {
  const state = store.getState();
  const warnings = state.warnings || [];
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">工期预警</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('warningsModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        ${warnings.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-check-circle" style="font-size: 48px; color: #10b981;"></i>
            <h3 style="margin-top: 16px; color: #1e293b;">暂无预警</h3>
            <p style="color: #64748b;">所有工序正常进行中</p>
          </div>
        ` : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0;">
                <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">预警日期</th>
                <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">预警信息</th>
                <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">级别</th>
                <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">状态</th>
                <th style="text-align: left; padding: 12px; color: #64748b; font-weight: 600;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${warnings.map(warning => {
                const levelColors = {
                  urgent: '#ef4444',
                  high: '#ef4444',
                  medium: '#f59e0b',
                  low: '#3b82f6'
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
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;">${dueDate ? DateUtils.formatDate(dueDate) : '-'}</td>
                    <td style="padding: 12px;">${message}</td>
                    <td style="padding: 12px;"><span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; color: white; background: ${levelColors[level]};">${levelNames[level]}</span></td>
                    <td style="padding: 12px;"><span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; color: white; background: ${isRead ? '#10b981' : '#f59e0b'};">${isRead ? '已处理' : '未处理'}</span></td>
                    <td style="padding: 12px;">
                      ${!isRead ? `
                        <button style="padding: 6px 16px; border-radius: 8px; font-size: 12px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; cursor: pointer;" onclick="markWarningAsRead('${warning.id}')">
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
  `;
  
  showModal('warningsModal', contentHtml);
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
  const users = state.users || [];
  
  const totalLogs = dailyLogs.length;
  const normalLogs = dailyLogs.filter(log => {
    const content = log.content || '';
    return !content.includes('停工') && !content.includes('暂停') && !content.includes('滞后') && !content.includes('延误');
  }).length;
  const abnormalLogs = totalLogs - normalLogs;
  const abnormalRate = totalLogs > 0 ? Math.round(abnormalLogs / totalLogs * 100) : 0;
  
  const todayLogs = dailyLogs.filter(log => {
    const logDate = new Date(log.date);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

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
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #3b82f6, #60a5fa);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-book" style="color: #3b82f6; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总日志数</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #1e40af; margin-bottom: 6px; line-height: 1;">${totalLogs}</div>
        <div style="font-size: 12px; color: #93c5fd;">条记录</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #22c55e, #4ade80);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34, 197, 94, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #22c55e; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">正常记录</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #166534; margin-bottom: 6px; line-height: 1;">${normalLogs}</div>
        <div style="margin-top: 12px; height: 6px; background: rgba(34, 197, 94, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${totalLogs > 0 ? Math.round(normalLogs / totalLogs * 100) : 0}%; height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #15803d; margin-top: 6px;">占比 ${totalLogs > 0 ? Math.round(normalLogs / totalLogs * 100) : 0}%</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #f59e0b, #fbbf24);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-circle" style="color: #f59e0b; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">异常记录</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #92400e; margin-bottom: 6px; line-height: 1;">${abnormalLogs}</div>
        <div style="margin-top: 12px; height: 6px; background: rgba(245, 158, 11, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${abnormalRate}%; height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #d97706; margin-top: 6px;">占比 ${abnormalRate}%</div>
      </div>
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden; transition: all 0.3s ease;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #8b5cf6, #a78bfa);"></div>
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(139, 92, 246, 0.12); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-calendar-day" style="color: #8b5cf6; font-size: 22px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">今日记录</div>
        </div>
        <div style="font-size: 36px; font-weight: 700; color: #6d28d9; margin-bottom: 6px; line-height: 1;">${todayLogs}</div>
        <div style="font-size: 12px; color: #7c3aed;">今日新增</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3 class="card-title">施工日志列表</h3>
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
          <label style="font-size: 13px; color: var(--text-secondary);">日期范围：</label>
          <input type="date" id="dailyLogStartDate" onchange="filterDailyLog()" style="width: 140px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="color: var(--text-muted);">至</span>
          <input type="date" id="dailyLogEndDate" onchange="filterDailyLog()" style="width: 140px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <label style="font-size: 13px; color: var(--text-secondary);">项目：</label>
          <select class="form-input" id="dailyLogProjectFilter" onchange="filterDailyLog()" style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <option value="">全部项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <label style="font-size: 13px; color: var(--text-secondary);">阶段：</label>
          <select class="form-input" id="dailyLogPhaseFilter" onchange="filterDailyLog()" style="width: 130px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <option value="">全部阶段</option>
            <option value="preparation">前期准备</option>
            <option value="civil">土建施工</option>
            <option value="mechanical">机电安装</option>
            <option value="commissioning">工艺调试</option>
            <option value="trial-run">试运行</option>
            <option value="acceptance">竣工验收</option>
          </select>
          <label style="font-size: 13px; color: var(--text-secondary);">天气：</label>
          <select class="form-input" id="dailyLogWeatherFilter" onchange="filterDailyLog()" style="width: 100px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <option value="">全部天气</option>
            <option value="晴">晴天</option>
            <option value="多云">多云</option>
            <option value="阴">阴天</option>
            <option value="雨">雨天</option>
            <option value="雪">雪天</option>
          </select>
          <label style="font-size: 13px; color: var(--text-secondary);">状态：</label>
          <select class="form-input" id="dailyLogStatusFilter" onchange="filterDailyLog()" style="width: 100px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <option value="">全部状态</option>
            <option value="normal">正常</option>
            <option value="abnormal">异常</option>
          </select>

          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="clearDailyLogFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
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
  const selectedWeather = document.getElementById('dailyLogWeatherFilter')?.value || '';
  const selectedStatus = document.getElementById('dailyLogStatusFilter')?.value || '';
  const selectedPhase = document.getElementById('dailyLogPhaseFilter')?.value || '';
  const selectedPerformance = document.getElementById('dailyLogPerformanceFilter')?.value || '';
  const selectedEquipment = document.getElementById('dailyLogEquipmentFilter')?.value || '';
  const startDate = document.getElementById('dailyLogStartDate')?.value || '';
  const endDate = document.getElementById('dailyLogEndDate')?.value || '';
  
  let filtered = dailyLogs;
  
  if (selectedProject) {
    filtered = filtered.filter(log => log.projectId === selectedProject);
  }
  
  if (selectedWeather) {
    filtered = filtered.filter(log => log.weather?.includes(selectedWeather));
  }
  
  if (selectedStatus) {
    filtered = filtered.filter(log => {
      const content = log.content || '';
      const isAbnormal = content.includes('停工') || content.includes('暂停') || content.includes('滞后') || content.includes('延误');
      return selectedStatus === 'normal' ? !isAbnormal : isAbnormal;
    });
  }
  
  if (selectedPhase) {
    filtered = filtered.filter(log => log.phase === selectedPhase);
  }
  
  if (selectedPerformance) {
    filtered = filtered.filter(log => {
      const content = log.content || '';
      if (selectedPerformance === 'excellent') {
        return content.includes('提前') || content.includes('超标');
      } else if (selectedPerformance === 'good') {
        return content.includes('正常') || content.includes('达标') || content.includes('安全');
      } else if (selectedPerformance === 'average') {
        return !content.includes('提前') && !content.includes('超标') && !content.includes('正常') && !content.includes('达标') && !content.includes('安全');
      }
      return true;
    });
  }
  
  if (selectedEquipment) {
    filtered = filtered.filter(log => {
      const status = log.equipmentStatus;
      if (selectedEquipment === 'normal') {
        return status === '正常' || status === 'normal';
      } else if (selectedEquipment === 'fault') {
        return status === '故障' || status === 'fault';
      } else if (selectedEquipment === 'maintenance') {
        return status === '维护中' || status === 'maintenance';
      }
      return true;
    });
  }
  
  if (startDate) {
    filtered = filtered.filter(log => log.date >= startDate);
  }
  
  if (endDate) {
    filtered = filtered.filter(log => log.date <= endDate);
  }

  if (filtered.length === 0) {
    return `
      <div class="empty-state" style="padding: 60px; text-align: center;">
        <i class="fas fa-book" style="font-size: 64px; color: var(--text-muted);"></i>
        <h3 style="margin-top: 20px; font-size: 18px;">暂无施工日志</h3>
        <p class="text-muted" style="margin-top: 8px;">点击"新建日志"按钮创建第一条记录</p>
      </div>
    `;
  }

  const phaseNames = { preparation: '前期准备', civil: '土建施工', mechanical: '机电安装', commissioning: '工艺调试', 'trial-run': '试运行', acceptance: '竣工验收' };
  
  const weatherIcons = {
    '晴': 'sun',
    '多云': 'cloud-sun',
    '阴': 'cloud',
    '小雨': 'cloud-rain',
    '中雨': 'cloud-rain',
    '大雨': 'cloud-showers-heavy',
    '雪': 'snowflake',
    '雷阵雨': 'cloud-lightning'
  };
  
  const equipmentMap = {
    '正常': { name: '正常', cls: 'tag-success' },
    '故障': { name: '故障', cls: 'tag-danger' },
    '维护中': { name: '维护中', cls: 'tag-warning' },
    'normal': { name: '正常', cls: 'tag-success' },
    'fault': { name: '故障', cls: 'tag-danger' },
    'maintenance': { name: '维护中', cls: 'tag-warning' }
  };
  
  function getLogStatus(log) {
    const content = log.content || '';
    if (content.includes('停工') || content.includes('暂停')) return { name: '停工', cls: 'tag-danger' };
    if (content.includes('滞后') || content.includes('延误')) return { name: '滞后', cls: 'tag-warning' };
    return { name: '正常', cls: 'tag-success' };
  }
  
  function getPerformance(log) {
    const content = log.content || '';
    if (content.includes('提前') || content.includes('超标')) return { name: '优秀', cls: 'tag-success' };
    if (content.includes('正常') || content.includes('达标') || content.includes('安全')) return { name: '良好', cls: 'tag-info' };
    return { name: '一般', cls: 'tag-warning' };
  }
  
  function extractWorkerCount(log) {
    const content = log.content || '';
    const match = content.match(/(\d+)人/);
    return match ? match[1] : null;
  }

  return `
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table class="table" style="margin: 0; border: none; width: 100%;">
        <thead>
          <tr style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">日期</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">天气</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">项目</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">工程阶段</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">人数</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">状态</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">设备状态</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">绩效</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">填报人</th>
            <th style="padding: 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border: none;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((log, index) => {
            const project = projects.find(p => p.id === log.projectId);
            const reporterId = log.reporter || log.reporterId;
            const reporter = store.getUserById(reporterId);
            const status = getLogStatus(log);
            const performance = getPerformance(log);
            const equipStatus = log.equipmentStatus ? (equipmentMap[log.equipmentStatus] || { name: log.equipmentStatus, cls: 'tag-success' }) : null;
            const workerCount = log.workers || extractWorkerCount(log);
            const weatherIcon = weatherIcons[log.weather] || 'sun';
            const weatherColor = log.weather === '晴' ? '#f59e0b' : log.weather?.includes('雨') ? '#3b82f6' : log.weather === '雪' ? '#60a5fa' : '#6b7280';
            
            return `
              <tr style="border-bottom: 1px solid #e5e7eb; background: ${index % 2 === 0 ? 'white' : '#fafafa'}; transition: background 0.2s;">
                <td style="padding: 16px; color: #1f2937; font-weight: 500;">${DateUtils.formatDate(log.date)}</td>
                <td style="padding: 16px;">
                  <span style="display: flex; align-items: center; gap: 8px; color: ${weatherColor};">
                    <i class="fas fa-${weatherIcon}" style="font-size: 16px;"></i>
                    <span>${log.weather || '-'}</span>
                  </span>
                </td>
                <td style="padding: 16px; color: #1f2937;">${project?.name || '-'}</td>
                <td style="padding: 16px; color: #1f2937;">${phaseNames[log.phase] || log.phase || '-'}</td>
                <td style="padding: 16px; color: #1f2937;">${workerCount ? workerCount + '人' : '-'}</td>
                <td style="padding: 16px;">
                  <span class="tag ${status.cls}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${status.name}</span>
                </td>
                <td style="padding: 16px;">${equipStatus ? `<span class="tag ${equipStatus.cls}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${equipStatus.name}</span>` : '-'}</td>
                <td style="padding: 16px;">
                  <span class="tag ${performance.cls}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${performance.name}</span>
                </td>
                <td style="padding: 16px; color: #1f2937;">${reporter?.name || '-'}</td>
                <td style="padding: 16px;">
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" style="padding: 6px 12px; border-radius: 8px;" onclick="viewDailyLog('${log.id}')" title="查看详情">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" style="padding: 6px 12px; border-radius: 8px;" onclick="editDailyLog('${log.id}')" title="编辑">
                      <i class="fas fa-edit"></i>
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

function clearDailyLogFilters() {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };
  
  setValue('dailyLogStartDate', '');
  setValue('dailyLogEndDate', '');
  setValue('dailyLogProjectFilter', '');
  setValue('dailyLogPhaseFilter', '');
  setValue('dailyLogWeatherFilter', '');
  setValue('dailyLogStatusFilter', '');
  
  filterDailyLog();
}

function showAddDailyLogModal() {
  const state = store.getState();
  const projects = state.projects;
  const users = state.users;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建施工日志</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addDailyLogModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="addDailyLogForm">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">天气 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="weather" required>
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
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">施工人数 <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="workers" min="0" required value="0">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">施工状态 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status" required>
                <option value="normal">正常</option>
                <option value="delayed">滞后</option>
                <option value="stopped">停工</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">今日施工内容</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="content" placeholder="请描述今日施工内容"></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">明日计划</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="tomorrowPlan" placeholder="请描述明日工作计划"></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">工艺参数</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="processParams" placeholder="请填写今日工艺参数（如进水量、COD、氨氮等）"></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">存在问题</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="issues" placeholder="请描述存在的问题"></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">填报人</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="reporterId">
              ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('addDailyLogModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);" onclick="handleAddDailyLog()">提交</button>
      </div>
    </div>
  `;
  
  showModal('addDailyLogModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">施工日志详情</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewDailyLogModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; gap: 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <span style="color: #64748b; display: block; margin-bottom: 4px;">日期</span>
              <span style="font-weight: 500;">${DateUtils.formatDate(log.date)}</span>
            </div>
            <div>
              <span style="color: #64748b; display: block; margin-bottom: 4px;">天气</span>
              <span style="font-weight: 500;">${log.weather}</span>
            </div>
          </div>
          <div>
            <span style="color: #64748b; display: block; margin-bottom: 4px;">项目</span>
            <span style="font-weight: 500;">${project?.name || '-'}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div>
              <span style="color: #64748b; display: block; margin-bottom: 4px;">施工人数</span>
              <span style="font-weight: 500;">${getWorkerCount()}人</span>
            </div>
            <div>
              <span style="color: #64748b; display: block; margin-bottom: 4px;">状态</span>
              <span style="font-weight: 500;">${getStatus()}</span>
            </div>
            <div>
              <span style="color: #64748b; display: block; margin-bottom: 4px;">绩效</span>
              <span style="font-weight: 500;">${getPerformance()}</span>
            </div>
          </div>
            <div class="grid grid-cols-2 gap-16">
              <div>
                <span style="color: #64748b;">工程阶段</span>
                <span style="font-weight: 500;">${phaseNames[log.phase] || log.phase || '-'}</span>
              </div>
              <div>
                <span style="color: #64748b;">设备运行状态</span>
                <span style="font-weight: 500;">${log.equipmentStatus ? (equipmentMap[log.equipmentStatus] || log.equipmentStatus) : '-'}</span>
              </div>
            </div>
            <div>
              <span style="color: #64748b;">填报人</span>
              <span style="font-weight: 500;">${reporter?.name || '-'}</span>
            </div>
            ${log.content ? `
              <div>
                <span style="color: #64748b;">今日施工内容</span>
                <p style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 4px; line-height: 1.6;">${log.content}</p>
              </div>
            ` : ''}
            ${log.processParams ? `
              <div>
                <span style="color: #64748b;">今日工艺参数</span>
                <p style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 4px; line-height: 1.6;">${log.processParams}</p>
              </div>
            ` : ''}
            ${log.tomorrowPlan ? `
              <div>
                <span style="color: #64748b;">明日计划</span>
                <p style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 4px; line-height: 1.6;">${log.tomorrowPlan}</p>
              </div>
            ` : ''}
            ${log.issues ? `
              <div>
                <span style="color: #64748b;">存在问题</span>
                <p style="margin-top: 8px; padding: 12px; background: #fef2f2; border-radius: 4px; line-height: 1.6; color: #991b1b;">${log.issues}</p>
              </div>
            ` : ''}
            <div>
              <span style="color: #64748b;">填报人</span>
              <span style="font-weight: 500;">${reporter?.name || '-'}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end;">
        <button style="padding: 8px 16px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewDailyLogModal')">关闭</button>
      </div>
    </div>
  `;
  
  showModal('viewDailyLogModal', contentHtml);
}

function editDailyLog(logId) {
  const state = store.getState();
  const log = state.dailyLogs?.find(l => l.id === logId);
  if (!log) return;
  
  const projects = state.projects;
  const users = state.users;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 700px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑施工日志</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editDailyLogModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="editDailyLogForm">
          <input type="hidden" name="logId" value="${log.id}">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="date" required value="${log.date}">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">天气 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="weather" required>
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
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="projectId" required>
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}" ${p.id === log.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">施工人数 <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="workers" min="0" required value="${log.workers}">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">施工状态 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="status" required>
                <option value="normal" ${log.status === 'normal' ? 'selected' : ''}>正常</option>
                <option value="delayed" ${log.status === 'delayed' ? 'selected' : ''}>滞后</option>
                <option value="stopped" ${log.status === 'stopped' ? 'selected' : ''}>停工</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">工程阶段</label>
            <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="phase">
              <option value="">请选择阶段</option>
              <option value="preparation" ${log.phase === 'preparation' ? 'selected' : ''}>前期准备</option>
              <option value="civil" ${log.phase === 'civil' ? 'selected' : ''}>土建施工</option>
              <option value="mechanical" ${log.phase === 'mechanical' ? 'selected' : ''}>机电安装</option>
              <option value="commissioning" ${log.phase === 'commissioning' ? 'selected' : ''}>工艺调试</option>
              <option value="trial-run" ${log.phase === 'trial-run' ? 'selected' : ''}>试运行</option>
              <option value="acceptance" ${log.phase === 'acceptance' ? 'selected' : ''}>竣工验收</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">设备运行状态</label>
            <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="equipmentStatus">
              <option value="normal" ${log.equipmentStatus === 'normal' ? 'selected' : ''}>正常</option>
              <option value="fault" ${log.equipmentStatus === 'fault' ? 'selected' : ''}>故障</option>
              <option value="maintenance" ${log.equipmentStatus === 'maintenance' ? 'selected' : ''}>维护中</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">绩效评估</label>
            <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="performance">
              <option value="excellent" ${log.performance === 'excellent' ? 'selected' : ''}>优秀</option>
              <option value="good" ${log.performance === 'good' ? 'selected' : ''}>良好</option>
              <option value="average" ${log.performance === 'average' ? 'selected' : ''}>一般</option>
              <option value="poor" ${log.performance === 'poor' ? 'selected' : ''}>较差</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">今日施工内容</label>
            <textarea style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; min-height: 80px;" name="content">${log.content || ''}</textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">今日工艺参数</label>
            <textarea style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; min-height: 80px;" name="processParams">${log.processParams || ''}</textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">明日计划</label>
            <textarea style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; min-height: 80px;" name="tomorrowPlan">${log.tomorrowPlan || ''}</textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">存在问题</label>
            <textarea style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; min-height: 80px;" name="issues">${log.issues || ''}</textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">填报人</label>
            <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="reporterId">
              ${users.map(u => `<option value="${u.id}" ${u.id === log.reporterId ? 'selected' : ''}>${u.name}</option>`).join('')}
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 8px 16px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editDailyLogModal')">取消</button>
        <button style="padding: 8px 16px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditDailyLog()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editDailyLogModal', contentHtml);
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
  
  let csvContent = '日期,天气,项目,工程阶段,施工人数,施工状态,设备状态,绩效,填报人,今日施工内容,明日计划,存在问题,工艺参数\n';
  dailyLogs.forEach(log => {
    const project = projects.find(p => p.id === log.projectId);
    const reporterId = log.reporter || log.reporterId;
    const reporter = store.getUserById(reporterId);
    const phaseNames = { preparation: '前期准备', civil: '土建施工', mechanical: '机电安装', commissioning: '工艺调试', 'trial-run': '试运行', acceptance: '竣工验收' };
    const equipmentMap = { '正常': '正常', '故障': '故障', '维护中': '维护中', 'normal': '正常', 'fault': '故障', 'maintenance': '维护中' };
    const statusMap = { 'normal': '正常', 'delayed': '滞后', 'stopped': '停工' };
    
    const content = log.content || '';
    const tomorrowPlan = log.tomorrowPlan || '';
    const issues = log.issues || '';
    const processParams = log.processParams || '';
    
    function getStatus() { 
      if (log.status) return statusMap[log.status] || log.status;
      if (content.includes('停工') || content.includes('暂停')) return '停工'; 
      if (content.includes('滞后') || content.includes('延误')) return '滞后'; 
      return '正常'; 
    }
    function getPerformance() { 
      if (log.performance) return log.performance;
      if (content.includes('提前') || content.includes('超标')) return '优秀'; 
      if (content.includes('正常') || content.includes('达标')) return '良好'; 
      return '一般'; 
    }
    function getWorkerCount() { 
      if (log.workers) return log.workers;
      const m = content.match(/(\d+)人/); 
      return m ? m[1] : '-'; 
    }
    const equipStatus = log.equipmentStatus ? (equipmentMap[log.equipmentStatus] || log.equipmentStatus) : '-';
    
    const escapedContent = content.replace(/"/g, '""');
    const escapedPlan = tomorrowPlan.replace(/"/g, '""');
    const escapedIssues = issues.replace(/"/g, '""');
    const escapedParams = processParams.replace(/"/g, '""');
    
    csvContent += `${log.date},${log.weather},"${project?.name || '-'}",${phaseNames[log.phase] || log.phase || '-'},${getWorkerCount()},${getStatus()},${equipStatus},${getPerformance()},${reporter?.name || '-'},"${escapedContent}","${escapedPlan}","${escapedIssues}","${escapedParams}"\n`;
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
  const expenses = state.expenses || [];
  const payments = state.payments || [];
  
  const categories = ['人工费用', '设备采购', '材料费用', '设备租赁', '施工费用', '安装费用', '调试费用', '管理费用', '其他'];
  const totalBudget = budgets.reduce((sum, item) => sum + (item.totalAmount || item.budget || 0), 0);
  const totalSpent = budgets.reduce((sum, item) => sum + (item.spentAmount || item.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const overBudget = budgets.filter(item => (item.spentAmount || item.spent || 0) > (item.totalAmount || item.budget || 0));
  
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  
  const budgetVsActualDiff = totalExpenses - totalBudget;
  const isOverBudget = budgetVsActualDiff > 0;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">预算与费用管理</h1>
        <p class="page-description">按项目、按类别设置预算，详细记录费用支出，实时追踪预算与实际费用差异</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showAddBudgetItemModal()">
          <i class="fas fa-plus"></i>
          新增预算项
        </button>
        <button class="btn btn-secondary" onclick="router.navigate('payment'); renderContent();">
          <i class="fas fa-arrow-right"></i>
          查看费用统计
        </button>
      </div>
    </div>
    
    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-coins" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总预算</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">¥${totalBudget.toLocaleString()}</div>
        <div style="font-size: 12px; color: #93c5fd;">${budgets.length} 项预算</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-chart-line" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">预算已使用</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 12px;">¥${totalSpent.toLocaleString()}</div>
        <div style="height: 6px; background: rgba(239, 68, 68, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%; height: 100%; background: linear-gradient(90deg, #ef4444, #f87171); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #dc2626; margin-top: 6px;">占比 ${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-piggy-bank" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">剩余可用</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">¥${remaining.toLocaleString()}</div>
        <div style="font-size: 12px; color: #15803d;">可用余额</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-file-invoice" style="color: #8b5cf6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">实际费用</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #6d28d9; margin-bottom: 8px;">¥${totalExpenses.toLocaleString()}</div>
        <div style="font-size: 12px; color: #7c3aed;">${expenses.length} 条记录</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-balance-scale" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">预算差异</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: ${isOverBudget ? '#ef4444' : '#10b981'}; margin-bottom: 8px;">${isOverBudget ? '超支' : '结余'} ¥${Math.abs(budgetVsActualDiff).toLocaleString()}</div>
        <div style="font-size: 12px; color: ${isOverBudget ? '#dc2626' : '#15803d'};">${isOverBudget ? '超出预算' : '预算充足'}</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, ${overBudget.length > 0 ? '#fecaca 0%, #fee2e2' : '#d1fae5 0%, #ecfdf5'} 100%); border: 1px solid ${overBudget.length > 0 ? '#fca5a5' : '#a7f3d0'}; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${overBudget.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)'}; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-circle" style="color: ${overBudget.length > 0 ? '#ef4444' : '#22c55e'}; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">超预算项</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: ${overBudget.length > 0 ? '#991b1b' : '#166534'}; margin-bottom: 8px;">${overBudget.length}</div>
        <div style="font-size: 12px; color: ${overBudget.length > 0 ? '#dc2626' : '#15803d'};">${overBudget.length > 0 ? '需关注' : '状态良好'}</div>
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
          
          const projectExpenses = expenses.filter(e => e.projectId === project.id);
          const projActualExpense = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
          const projDiff = projActualExpense - projTotal;
          const isActualOverBudget = projDiff > 0;
          
          const projCategories = {};
          projectBudgets.forEach(b => {
            const cat = b.category || '其他';
            if (!projCategories[cat]) projCategories[cat] = { total: 0, spent: 0, actual: 0 };
            projCategories[cat].total += (b.totalAmount || b.budget || 0);
            projCategories[cat].spent += (b.spentAmount || b.spent || 0);
          });
          
          projectExpenses.forEach(e => {
            const cat = e.category || '其他';
            if (!projCategories[cat]) projCategories[cat] = { total: 0, spent: 0, actual: 0 };
            projCategories[cat].actual += (e.amount || 0);
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
                      ${isActualOverBudget ? `<span class="tag" style="font-size: 11px; background: rgba(239, 68, 68, 0.15); color: #ef4444;">实际超支 ¥${projDiff.toLocaleString()}</span>` : ''}
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
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px;">
                  <div style="text-align: center; padding: 14px 10px; background: rgba(0,0,0,0.04); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: ${color};">¥${projTotal.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">总预算</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(245, 158, 11, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">¥${projSpent.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">预算已用</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #10b981;">¥${projRemaining.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">剩余预算</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(139, 92, 246, 0.1); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #8b5cf6;">¥${projActualExpense.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">实际费用</div>
                  </div>
                  <div style="text-align: center; padding: 14px 10px; background: rgba(245, 158, 11, ${isActualOverBudget ? '0.2' : '0.1'}); border-radius: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: ${isActualOverBudget ? '#ef4444' : '#10b981'};">${isActualOverBudget ? '超支' : '结余'} ¥${Math.abs(projDiff).toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">预算差异</div>
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
                  <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">预算与实际费用对比</div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    ${Object.entries(projCategories).map(([cat, s]) => {
                      const catRate = s.total > 0 ? Math.round((s.spent / s.total) * 100) : 0;
                      const catDiff = s.actual - s.total;
                      const isCatOver = catDiff > 0;
                      return `
                        <div style="padding: 12px 16px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                          <div style="font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 8px;">${cat}</div>
                          <div style="display: flex; justify-content: space-between; font-size: 12px;">
                            <span style="color: var(--text-muted);">预算</span>
                            <span style="font-weight: 600; color: ${color};">¥${s.total.toLocaleString()}</span>
                          </div>
                          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
                            <span style="color: var(--text-muted);">实际费用</span>
                            <span style="font-weight: 600; color: #8b5cf6;">¥${s.actual.toLocaleString()}</span>
                          </div>
                          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
                            <span style="color: var(--text-muted);">差异</span>
                            <span style="font-weight: 600; color: ${isCatOver ? '#ef4444' : '#10b981'};">${isCatOver ? '超支' : '结余'} ¥${Math.abs(catDiff).toLocaleString()}</span>
                          </div>
                        </div>
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
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #10b981 0%, #38ef7d 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">预算明细</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select class="form-input" id="budgetProjectFilter" onchange="filterBudgetItems()" style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;">
            <option value="">全部项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <select class="form-input" id="budgetCategoryFilter" onchange="filterBudgetItems()" style="width: 130px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;">
            <option value="">全部类别</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
          <select class="form-input" id="budgetStatusFilter" onchange="filterBudgetItems()" style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;">
            <option value="">全部状态</option>
            <option value="normal">正常</option>
            <option value="warning">接近超支</option>
            <option value="overbudget">已超支</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetBudgetFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
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
      <div style="margin-bottom: 20px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 4px; height: 20px; border-radius: 2px; background: ${color};"></div>
              <span style="font-weight: 600; color: #1e293b; font-size: 14px;">${projectName}</span>
              <span style="font-size: 12px; color: #9ca3af;">(预算总计: ¥${groupTotal.toLocaleString()})</span>
            </div>
          </div>
          <table class="table" style="margin: 0; border: none; width: 100%;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="width: 160px; padding: 10px 12px; font-weight: 500; color: #64748b; font-size: 12px; text-align: left; border: none;">类别</th>
                <th style="width: 300px; padding: 10px 12px; font-weight: 500; color: #64748b; font-size: 12px; text-align: left; border: none;">预算名称</th>
                <th style="width: 90px; padding: 10px 12px; font-weight: 500; color: #64748b; font-size: 12px; text-align: right; border: none;">预算</th>
                <th style="width: 90px; padding: 10px 12px; font-weight: 500; color: #64748b; font-size: 12px; text-align: right; border: none;">已用</th>
                <th style="width: 90px; padding: 10px 12px; font-weight: 500; color: #64748b; font-size: 12px; text-align: right; border: none;">剩余</th>
                <th style="width: 100px; padding: 10px 12px; font-weight: 500; color: #64748b; font-size: 12px; text-align: left; border: none;">使用率</th>
                <th style="width: 70px; padding: 10px 12px; font-weight: 500; color: #64748b; font-size: 12px; text-align: center; border: none;">状态</th>
                <th style="width: 90px; padding: 10px 12px; font-weight: 500; color: #64748b; font-size: 12px; text-align: center; border: none;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${group.items.map(item => {
                const itemBudget = item.totalAmount || item.budget || 0;
                const itemSpent = item.spentAmount || item.spent || 0;
                const usageRate = itemBudget > 0 ? Math.round((itemSpent / itemBudget) * 100) : 0;
                const remainingAmount = itemBudget - itemSpent;
                let statusBg = '#ecfdf5';
                let statusColor = '#10b981';
                let statusText = '正常';
                let progressColor = '#10b981';
                if (usageRate >= 100) {
                  statusBg = '#fef2f2';
                  statusColor = '#ef4444';
                  statusText = '超支';
                  progressColor = '#ef4444';
                } else if (usageRate >= 80) {
                  statusBg = '#fffbeb';
                  statusColor = '#f59e0b';
                  statusText = '预警';
                  progressColor = '#f59e0b';
                }
                return `
                  <tr style="border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#fafafa';" onmouseout="this.style.background='white';">
                    <td style="padding: 12px;"><span style="font-size: 11px; background: #e0e7ff; color: #4f46e5; padding: 3px 8px; border-radius: 4px;">${item.category || '其他'}</span></td>
                    <td style="padding: 12px;">
                      <div style="font-weight: 500; color: #1f2937; font-size: 13px;">${item.name}</div>
                      ${item.description ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 1px;">${item.description}</div>` : ''}
                    </td>
                    <td style="padding: 12px; text-align: right;"><span style="font-weight: 600; color: #1f2937; font-size: 13px;">¥${itemBudget.toLocaleString()}</span></td>
                    <td style="padding: 12px; text-align: right;"><span style="color: #64748b; font-size: 13px;">¥${itemSpent.toLocaleString()}</span></td>
                    <td style="padding: 12px; text-align: right;"><span style="font-weight: 500; color: ${remainingAmount < 0 ? '#ef4444' : '#374151'}; font-size: 13px;">¥${remainingAmount.toLocaleString()}</span></td>
                    <td style="padding: 12px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; max-width: 80px; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                          <div style="height: 100%; width: ${Math.min(usageRate, 100)}%; border-radius: 2px; background: ${progressColor};"></div>
                        </div>
                        <span style="font-size: 11px; font-weight: 600; color: ${progressColor}; min-width: 30px; text-align: right;">${usageRate}%</span>
                      </div>
                    </td>
                    <td style="padding: 12px; text-align: center;"><span style="font-size: 11px; background: ${statusBg}; color: ${statusColor}; padding: 3px 10px; border-radius: 4px; font-weight: 500;">${statusText}</span></td>
                    <td style="padding: 12px; text-align: center;">
                      <div style="display: flex; justify-content: center; gap: 3px;">
                        <button class="btn btn-secondary btn-sm" onclick="showEditBudgetItemModal('${item.id}')" title="编辑" style="padding: 5px 8px; border-radius: 4px; background: #f1f5f9; border: none; color: #64748b;"><i class="fas fa-edit" style="font-size: 12px;"></i></button>
                        <button class="btn btn-secondary btn-sm" onclick="showAddExpenseModal('${item.id}')" title="记录支出" style="padding: 5px 8px; border-radius: 4px; background: #dbeafe; border: none; color: #3b82f6;"><i class="fas fa-plus" style="font-size: 12px;"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBudgetItem('${item.id}')" title="删除" style="padding: 5px 8px; border-radius: 4px; background: #fee2e2; border: none; color: #ef4444;"><i class="fas fa-trash" style="font-size: 12px;"></i></button>
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
  const statusFilter = document.getElementById('budgetStatusFilter')?.value;
  
  if (projectFilter) {
    budgets = budgets.filter(b => b.projectId === projectFilter);
  }
  if (categoryFilter) {
    budgets = budgets.filter(b => (b.category || '其他') === categoryFilter);
  }
  if (statusFilter) {
    budgets = budgets.filter(b => {
      const budget = b.totalAmount || b.budget || 0;
      const spent = b.spentAmount || b.spent || 0;
      const usageRate = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      if (statusFilter === 'normal') return usageRate < 80;
      if (statusFilter === 'warning') return usageRate >= 80 && usageRate < 100;
      if (statusFilter === 'overbudget') return usageRate >= 100;
      return true;
    });
  }
  
  const container = document.getElementById('budgetTableContainer');
  if (container) {
    container.innerHTML = renderBudgetTableBody(budgets, projects);
  }
}

function resetBudgetFilters() {
  const projectFilter = document.getElementById('budgetProjectFilter');
  const categoryFilter = document.getElementById('budgetCategoryFilter');
  const statusFilter = document.getElementById('budgetStatusFilter');
  if (projectFilter) projectFilter.value = '';
  if (categoryFilter) categoryFilter.value = '';
  if (statusFilter) statusFilter.value = '';
  filterBudgetItems();
}

// ========== 费用明细相关函数 ==========
function renderExpenseTableBody(expenseList, projects) {
  if (expenseList.length === 0) {
    return `
      <div class="empty-state" style="padding: 60px 0;">
        <i class="fas fa-receipt" style="font-size: 56px; color: var(--text-muted); opacity: 0.4;"></i>
        <h3 style="margin-top: 16px; font-weight: 600;">暂无费用记录</h3>
        <p class="text-muted">点击"记录费用"按钮添加费用支出记录</p>
      </div>
    `;
  }
  
  // 按项目分组
  const grouped = {};
  expenseList.forEach(item => {
    const pid = item.projectId || 'no-project';
    if (!grouped[pid]) grouped[pid] = { items: [], project: null };
    grouped[pid].items.push(item);
    grouped[pid].project = projects.find(p => p.id === item.projectId);
  });
  
  let html = '';
  Object.keys(grouped).forEach(pid => {
    const group = grouped[pid];
    const projectName = group.project?.name || '未分配项目';
    const groupTotal = group.items.reduce((sum, i) => sum + (i.amount || 0), 0);
    const projectColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];
    const colorIndex = group.project ? projects.findIndex(p => p.id === group.project.id) % projectColors.length : 0;
    const color = projectColors[colorIndex];
    
    // 按类别统计
    const categoryStats = {};
    group.items.forEach(item => {
      const cat = item.category || '其他';
      if (!categoryStats[cat]) categoryStats[cat] = 0;
      categoryStats[cat] += item.amount || 0;
    });
    
    html += `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; background: rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.06); border-radius: 12px; border: 1px solid ${color}20;">
          <div style="width: 36px; height: 36px; background: ${color}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-building" style="color: white; font-size: 14px;"></i>
          </div>
          <span style="font-weight: 600; font-size: 15px; color: ${color};">${projectName}</span>
          <span class="tag" style="font-size: 11px; background: rgba(0,0,0,0.06);">${group.items.length}笔费用</span>
          <span style="margin-left: auto; font-size: 14px; color: var(--text-secondary);">
            费用合计: <b style="color: #f59e0b;">¥${groupTotal.toLocaleString()}</b>
          </span>
        </div>
        
        <!-- 类别汇总 -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; padding: 0 16px;">
          ${Object.entries(categoryStats).map(([cat, amount]) => `
            <span style="padding: 6px 12px; background: rgba(245, 158, 11, 0.08); border-radius: 20px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--text-secondary);">${cat}:</span>
              <b style="color: #f59e0b;">¥${amount.toLocaleString()}</b>
            </span>
          `).join('')}
        </div>
        
        <div style="background: var(--bg-primary); border-radius: 12px; overflow: hidden;">
          <table class="table" style="margin: 0; border: none;">
            <thead>
              <tr style="background: var(--bg-secondary);">
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">费用日期</th>
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">费用类别</th>
                <th style="padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">费用名称</th>
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: right; border: none;">金额</th>
                <th style="padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">说明</th>
                <th style="width: 120px; padding: 14px 16px; font-weight: 600; color: var(--text-secondary); font-size: 13px; text-align: left; border: none;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${group.items.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)).map(item => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 14px 16px; color: var(--text-primary); font-size: 13px; border: none;">${item.expenseDate || '-'}</td>
                  <td style="padding: 14px 16px; border: none;">
                    <span class="tag" style="font-size: 11px; background: rgba(245, 158, 11, 0.1); color: #f59e0b;">${item.category || '其他'}</span>
                  </td>
                  <td style="padding: 14px 16px; color: var(--text-primary); font-size: 13px; font-weight: 500; border: none;">${item.name}</td>
                  <td style="padding: 14px 16px; color: #f59e0b; font-size: 14px; font-weight: 600; text-align: right; border: none;">¥${(item.amount || 0).toLocaleString()}</td>
                  <td style="padding: 14px 16px; color: var(--text-secondary); font-size: 12px; border: none;">${item.description || '-'}</td>
                  <td style="padding: 14px 16px; border: none;">
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm" onclick="showEditExpenseModal('${item.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="deleteExpense('${item.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
  
  return html;
}

function filterExpenses() {
  const state = store.getState();
  let expenses = state.expenses || [];
  const projects = state.projects || [];
  
  const projectFilter = document.getElementById('expenseProjectFilter')?.value;
  const categoryFilter = document.getElementById('expenseCategoryFilter')?.value;
  
  if (projectFilter) {
    expenses = expenses.filter(e => e.projectId === projectFilter);
  }
  if (categoryFilter) {
    expenses = expenses.filter(e => (e.category || '其他') === categoryFilter);
  }
  
  const container = document.getElementById('expenseTableContainer');
  if (container) {
    container.innerHTML = renderExpenseTableBody(expenses, projects);
  }
}

function showAddGeneralExpenseModal() {
  const state = store.getState();
  const projects = state.projects || [];
  const categories = ['人工费用', '设备采购', '材料费用', '设备租赁', '施工费用', '安装费用', '调试费用', '管理费用', '其他'];
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 550px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">
          <i class="fas fa-receipt" style="color: #10b981; margin-right: 8px;"></i>
          记录费用
        </h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addExpenseModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="addExpenseForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">所属项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required onchange="updateExpenseBudgetInfo()">
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">费用名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="如：钢筋采购、人工工资等">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">费用类别 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category" required onchange="updateExpenseBudgetInfo()">
                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">费用金额 <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="amount" min="0" required placeholder="请输入金额">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">费用日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="expenseDate" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">支付方式</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="paymentMethod">
                <option value="cash">现金</option>
                <option value="bank">银行转账</option>
                <option value="check">支票</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">费用说明</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" rows="2" placeholder="请输入费用详细说明"></textarea>
          </div>
          <div id="budgetWarning" style="display: none; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; margin-top: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 13px;">
              <i class="fas fa-exclamation-triangle"></i>
              <span id="budgetWarningText"></span>
            </div>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('addExpenseModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);" onclick="handleAddGeneralExpense()">
          <i class="fas fa-check"></i> 确认记录
        </button>
      </div>
    </div>
  `;
  
  showModal('addExpenseModal', contentHtml);
}

function handleAddGeneralExpense() {
  const form = document.getElementById('addExpenseForm');
  const formData = new FormData(form);
  
  const projectId = formData.get('projectId');
  const name = formData.get('name');
  const category = formData.get('category');
  const amount = parseFloat(formData.get('amount'));
  const expenseDate = formData.get('expenseDate');
  const paymentMethod = formData.get('paymentMethod');
  const description = formData.get('description');
  
  if (!projectId || !name || !category || isNaN(amount) || !expenseDate) {
    alert('请填写所有必填字段');
    return;
  }
  
  store.addExpense({
    projectId,
    name,
    category,
    amount,
    expenseDate,
    paymentMethod,
    description
  });
  
  closeModal('addExpenseModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '费用记录成功',
    message: '费用已成功记录'
  });
}

function updateExpenseBudgetInfo() {
  const form = document.getElementById('addExpenseForm');
  const formData = new FormData(form);
  
  const projectId = formData.get('projectId');
  const name = formData.get('name');
  const amount = parseFloat(formData.get('amount'));
  const category = formData.get('category');
  const expenseDate = formData.get('expenseDate');
  
  if (!projectId || !name || !amount || !category || !expenseDate) {
    store.addNotification({
      type: 'error',
      title: '请填写完整信息',
      message: '项目、费用名称、类别、金额和日期为必填项'
    });
    return;
  }
  
  const expenseData = {
    projectId,
    name,
    amount,
    category,
    expenseDate,
    paymentMethod: formData.get('paymentMethod'),
    description: formData.get('description')
  };
  
  store.addExpense(expenseData);
  
  // 更新对应预算项的已用金额
  const state = store.getState();
  const budget = state.budgets.find(b => b.projectId === projectId && b.category === category);
  if (budget) {
    const currentSpent = budget.spentAmount || budget.spent || 0;
    store.updateBudget(budget.id, { 
      spentAmount: currentSpent + amount,
      spent: currentSpent + amount
    });
  }
  
  closeModal('addExpenseModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '费用记录成功',
    message: `已记录费用: ${name} ¥${amount.toLocaleString()}`
  });
}

function showEditExpenseModal(expenseId) {
  const state = store.getState();
  const expense = state.expenses?.find(e => e.id === expenseId);
  if (!expense) return;
  
  const projects = state.projects || [];
  const categories = ['人工费用', '设备采购', '材料费用', '设备租赁', '施工费用', '安装费用', '调试费用', '管理费用', '其他'];
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 550px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">
          <i class="fas fa-edit" style="color: #3b82f6; margin-right: 8px;"></i>
          编辑费用
        </h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editExpenseModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="editExpenseForm">
          <input type="hidden" name="expenseId" value="${expense.id}">
          <input type="hidden" name="originalAmount" value="${expense.amount}">
          <input type="hidden" name="originalProjectId" value="${expense.projectId}">
          <input type="hidden" name="originalCategory" value="${expense.category}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">所属项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="projectId" required>
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}" ${p.id === expense.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">费用名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="name" required value="${expense.name}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">费用类别 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="category" required>
                ${categories.map(cat => `<option value="${cat}" ${cat === expense.category ? 'selected' : ''}>${cat}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">费用金额 <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="amount" min="0" required value="${expense.amount}">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">费用日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="expenseDate" required value="${expense.expenseDate}">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">支付方式</label>
              <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="paymentMethod">
                <option value="cash" ${expense.paymentMethod === 'cash' ? 'selected' : ''}>现金</option>
                <option value="bank" ${expense.paymentMethod === 'bank' ? 'selected' : ''}>银行转账</option>
                <option value="check" ${expense.paymentMethod === 'check' ? 'selected' : ''}>支票</option>
                <option value="other" ${expense.paymentMethod === 'other' ? 'selected' : ''}>其他</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">费用说明</label>
            <textarea style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; min-height: 60px;" name="description" rows="2">${expense.description || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 8px 16px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editExpenseModal')">取消</button>
        <button style="padding: 8px 16px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditExpense()">
          <i class="fas fa-save"></i> 保存修改
        </button>
      </div>
    </div>
  `;
  
  showModal('editExpenseModal', contentHtml);
}

function handleEditExpense() {
  const form = document.getElementById('editExpenseForm');
  const formData = new FormData(form);
  
  const expenseId = formData.get('expenseId');
  const originalAmount = parseFloat(formData.get('originalAmount'));
  const originalProjectId = formData.get('originalProjectId');
  const originalCategory = formData.get('originalCategory');
  
  const newAmount = parseFloat(formData.get('amount'));
  const newProjectId = formData.get('projectId');
  const newCategory = formData.get('category');
  
  const updates = {
    projectId: newProjectId,
    name: formData.get('name'),
    amount: newAmount,
    category: newCategory,
    expenseDate: formData.get('expenseDate'),
    paymentMethod: formData.get('paymentMethod'),
    description: formData.get('description')
  };
  
  store.updateExpense(expenseId, updates);
  
  // 更新预算项的已用金额
  const state = store.getState();
  
  // 如果项目或类别发生变化，需要调整两个预算项
  if (originalProjectId === newProjectId && originalCategory === newCategory) {
    // 同一预算项，只更新差额
    const budget = state.budgets.find(b => b.projectId === newProjectId && b.category === newCategory);
    if (budget) {
      const currentSpent = budget.spentAmount || budget.spent || 0;
      const diff = newAmount - originalAmount;
      store.updateBudget(budget.id, {
        spentAmount: currentSpent + diff,
        spent: currentSpent + diff
      });
    }
  } else {
    // 不同预算项，需要分别调整
    const oldBudget = state.budgets.find(b => b.projectId === originalProjectId && b.category === originalCategory);
    if (oldBudget) {
      const currentSpent = oldBudget.spentAmount || oldBudget.spent || 0;
      store.updateBudget(oldBudget.id, {
        spentAmount: Math.max(0, currentSpent - originalAmount),
        spent: Math.max(0, currentSpent - originalAmount)
      });
    }
    
    const newBudget = state.budgets.find(b => b.projectId === newProjectId && b.category === newCategory);
    if (newBudget) {
      const currentSpent = newBudget.spentAmount || newBudget.spent || 0;
      store.updateBudget(newBudget.id, {
        spentAmount: currentSpent + newAmount,
        spent: currentSpent + newAmount
      });
    }
  }
  
  closeModal('editExpenseModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '费用修改成功',
    message: '费用记录已更新'
  });
}

function deleteExpense(expenseId) {
  if (!confirm('确定要删除此费用记录吗？')) return;
  
  const state = store.getState();
  const expense = state.expenses.find(e => e.id === expenseId);
  
  if (expense) {
    // 更新对应预算项的已用金额
    const budget = state.budgets.find(b => b.projectId === expense.projectId && b.category === expense.category);
    if (budget) {
      const currentSpent = budget.spentAmount || budget.spent || 0;
      store.updateBudget(budget.id, {
        spentAmount: Math.max(0, currentSpent - expense.amount),
        spent: Math.max(0, currentSpent - expense.amount)
      });
    }
  }
  
  store.deleteExpense(expenseId);
  renderContent();
  
  store.addNotification({
    type: 'info',
    title: '费用已删除',
    message: '费用记录已从系统中移除'
  });
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新增预算</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addBudgetItemModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="addBudgetItemForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">预算名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入预算名称">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">费用类别 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category" required>
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
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">预算金额 <span style="color: red;">*</span></label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="budget" min="0" required placeholder="请输入预算金额">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" placeholder="请输入备注"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('addBudgetItemModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);" onclick="handleAddBudgetItem()">提交</button>
      </div>
    </div>
  `;
  
  showModal('addBudgetItemModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑预算</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editBudgetItemModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="editBudgetItemForm">
          <input type="hidden" name="itemId" value="${item.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="projectId" required>
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}" ${p.id === item.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">费用类别</label>
            <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="category">
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
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">预算名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="name" required value="${item.name}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">预算金额 <span style="color: red;">*</span></label>
            <input type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="budget" min="0" required value="${item.totalAmount || item.budget || 0}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">已用金额</label>
            <input type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="spent" min="0" value="${item.spentAmount || item.spent || 0}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">备注</label>
            <textarea style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; min-height: 60px;" name="description">${item.description || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 8px 16px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editBudgetItemModal')">取消</button>
        <button style="padding: 8px 16px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditBudgetItem()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editBudgetItemModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">添加支出</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addExpenseModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">项目</div>
          <div style="font-weight: 500; color: #1e293b;">${project?.name || '-'}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 8px; margin-bottom: 4px;">预算名称</div>
          <div style="font-weight: 500; color: #1e293b;">${item.name}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
            <div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">预算金额</div>
              <div style="font-weight: 500; color: #1e293b;">¥${(item.totalAmount || item.budget || 0).toLocaleString()}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">已用金额</div>
              <div style="font-weight: 500; color: #1e293b;">¥${(item.spentAmount || item.spent || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <form id="addExpenseForm">
          <input type="hidden" name="itemId" value="${item.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">支出金额 <span style="color: red;">*</span></label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="amount" min="0" required placeholder="请输入支出金额">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">支出说明</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" placeholder="请输入支出说明"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addExpenseModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddExpense()">确认支出</button>
      </div>
    </div>
  `;
  
  showModal('addExpenseModal', contentHtml);
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
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  
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
        <button class="btn btn-secondary" onclick="showImportPaymentModal()">
          <i class="fas fa-file-import"></i>
          批量导入
        </button>
        <button class="btn btn-secondary" onclick="exportPayments()">
          <i class="fas fa-download"></i>
          导出报表
        </button>
      </div>
    </div>
    
    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-coins" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总费用</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">¥${totalAmount.toLocaleString()}</div>
        <div style="font-size: 12px; color: #93c5fd;">${payments.length} 条记录</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已支付</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 12px;">¥${completedAmount.toLocaleString()}</div>
        <div style="height: 6px; background: rgba(34, 197, 94, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0}%; height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #15803d; margin-top: 6px;">占比 ${totalAmount > 0 ? Math.round((completedAmount / totalAmount) * 100) : 0}%</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-clock" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">待支付</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">¥${pendingAmount.toLocaleString()}</div>
        <div style="font-size: 12px; color: #d97706;">${pendingCount} 笔待处理</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-file-invoice" style="color: #8b5cf6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">费用笔数</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #6d28d9; margin-bottom: 8px;">${payments.length}</div>
        <div style="font-size: 12px; color: #7c3aed;">笔费用记录</div>
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
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select class="form-input" id="paymentProjectFilter" onchange="filterPayments()" style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;">
            <option value="all">全部项目</option>
            ${projects.map(p => '<option value="' + p.id + '">' + p.name + '</option>').join('')}
          </select>
          <select class="form-input" id="paymentCategoryFilter" onchange="filterPayments()" style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;">
            <option value="all">全部类别</option>
            ${categories.map(c => '<option value="' + c + '">' + c + '</option>').join('')}
          </select>
          <select class="form-input" id="paymentStatusFilter" onchange="filterPayments()" style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;">
            <option value="all">全部状态</option>
            <option value="pending">待支付</option>
            <option value="completed">已支付</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetPaymentFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
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
  
  const categories = ['人工费用', '设备采购', '材料费用', '设备租赁', '施工费用', '安装费用', '调试费用', '管理费用', '其他'];
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新增费用记录</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addPaymentModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="addPaymentForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">费用类别 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category" required>
                <option value="">请选择类别</option>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">金额 <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="amount" min="0" step="0.01" required placeholder="请输入金额">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">合同号</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="contractNo" placeholder="请输入合同号">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">计划支付日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="pending">待支付</option>
                <option value="completed">已支付</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="remark" placeholder="请输入备注"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addPaymentModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddPayment()">提交</button>
      </div>
    </div>
  `;
  
  showModal('addPaymentModal', contentHtml);
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

function resetPaymentFilters() {
  const projectFilter = document.getElementById('paymentProjectFilter');
  const categoryFilter = document.getElementById('paymentCategoryFilter');
  const statusFilter = document.getElementById('paymentStatusFilter');
  if (projectFilter) projectFilter.value = 'all';
  if (categoryFilter) categoryFilter.value = 'all';
  if (statusFilter) statusFilter.value = 'all';
  filterPayments();
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
    const completedCount = group.items.filter(p => p.status === 'completed').length;
    const pendingCount = group.items.filter(p => p.status === 'pending').length;
    
    html += '<div class="card" style="margin-bottom: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">' +
      '<div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">' +
        '<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">' +
          '<div style="display: flex; align-items: center; gap: 12px;">' +
            '<div style="width: 8px; height: 24px; background: linear-gradient(180deg, ' + color + ' 0%, ' + adjustColor(color, -30) + ' 100%); border-radius: 4px;"></div>' +
            '<div>' +
              '<h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">' + (group.project?.name || '未分配项目') + '</h3>' +
              '<p style="font-size: 13px; color: #64748b; margin: 2px 0 0;">' + group.items.length + ' 条记录 · ¥' + groupTotal.toLocaleString() + '</p>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; gap: 20px;">' +
            '<div style="text-align: center;">' +
              '<div style="font-size: 20px; font-weight: 600; color: #10b981;">' + completedCount + '</div>' +
              '<div style="font-size: 12px; color: #64748b;">已支付</div>' +
            '</div>' +
            '<div style="text-align: center;">' +
              '<div style="font-size: 20px; font-weight: 600; color: #f59e0b;">' + pendingCount + '</div>' +
              '<div style="font-size: 12px; color: #64748b;">待支付</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="padding: 0;">' +
      '<table style="width: 100%; border-collapse: collapse;">' +
        '<thead>' +
          '<tr style="background: #f9fafb;">' +
            '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">日期</th>' +
            '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">类别</th>' +
            '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">金额</th>' +
            '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">合同号</th>' +
            '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">支付日期</th>' +
            '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>' +
            '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">备注</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
        group.items.map((p, idx) => '<tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseenter="this.style.background=\'#fafafa\'" onmouseleave="this.style.background=\'transparent\'">' +
          '<td style="padding: 12px 16px; color: #64748b; font-size: 13px;">' + DateUtils.formatDate(p.date) + '</td>' +
          '<td style="padding: 12px 16px; color: #1e293b; font-size: 13px; font-weight: 500;"><span style="font-size: 11px; background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 3px 8px; border-radius: 4px; font-weight: 500;">' + (p.category || '其他') + '</span></td>' +
          '<td style="padding: 12px 16px; color: #374151; font-size: 13px; font-weight: 500;">¥' + p.amount.toLocaleString() + '</td>' +
          '<td style="padding: 12px 16px; color: #374151; font-size: 13px;">' + (p.contractNo || '-') + '</td>' +
          '<td style="padding: 12px 16px; color: #374151; font-size: 13px;">' + DateUtils.formatDate(p.dueDate) + '</td>' +
          '<td style="padding: 12px 16px;">' + (p.status === 'completed' ? '<span style="font-size: 11px; background: rgba(34, 197, 94, 0.1); color: #16a34a; padding: 3px 8px; border-radius: 4px; font-weight: 500;">已支付</span>' : '<span style="font-size: 11px; background: rgba(251, 191, 36, 0.1); color: #b45309; padding: 3px 8px; border-radius: 4px; font-weight: 500;">待支付</span>') + '</td>' +
          '<td style="padding: 12px 16px; color: #64748b; font-size: 13px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + (p.remark || '') + '">' + (p.remark || '-') + '</td>' +
        '</tr>').join('') +
        '</tbody>' +
      '</table>' +
      '</div>' +
    '</div>';
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">费用详情</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewPaymentModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; gap: 16px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">项目</span>
            <span>${project?.name || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">费用类别</span>
            <span><span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #f1f5f9; color: #64748b;">${payment.category || '其他'}</span></span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">金额</span>
            <span style="font-size: 24px; font-weight: bold; color: #3b82f6;">¥${payment.amount.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">状态</span>
            <span><span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; background: ${payment.status === 'completed' ? '#d1fae5' : payment.status === 'processing' ? '#dbeafe' : payment.status === 'pending' ? '#fef3c7' : '#f3f4f6'}; color: ${payment.status === 'completed' ? '#065f46' : payment.status === 'processing' ? '#0369a1' : payment.status === 'pending' ? '#92400e' : '#6b7280'};">${statusNames[payment.status]}</span></span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">合同号</span>
            <span>${payment.contractNo || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">计划支付日期</span>
            <span>${DateUtils.formatDate(payment.dueDate)}</span>
          </div>
          ${payment.remark ? `
            <div>
              <span style="color: #64748b;">备注</span>
              <p style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 4px;">${payment.remark}</p>
            </div>
          ` : ''}
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 8px 16px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewPaymentModal')">关闭</button>
        ${payment.status !== 'completed' && payment.status !== 'cancelled' ? `
          <button style="padding: 8px 16px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="updatePaymentStatus('${payment.id}', 'completed'); closeModal('viewPaymentModal');">确认支付</button>
        ` : ''}
      </div>
    </div>
  `;
  
  showModal('viewPaymentModal', contentHtml);
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

function showImportPaymentModal() {
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 80vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">批量导入费用</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('importPaymentModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
            <p style="font-size: 13px; color: #92400e; margin: 0;">
              <strong>导入说明：</strong>请上传 CSV 格式文件，文件需包含以下列（顺序不限）：
            </p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
            <table style="width: 100%; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <th style="text-align: left; padding: 8px; color: #64748b;">列名</th>
                  <th style="text-align: left; padding: 8px; color: #64748b;">必填</th>
                  <th style="text-align: left; padding: 8px; color: #64748b;">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 8px;">费用名称</td><td style="padding: 8px; color: #ef4444;">是</td><td style="padding: 8px;">费用项目名称</td></tr>
                <tr><td style="padding: 8px;">所属项目</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">项目名称或项目ID</td></tr>
                <tr><td style="padding: 8px;">类别</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">人工费用/设备采购/材料费用等（默认其他）</td></tr>
                <tr><td style="padding: 8px;">金额</td><td style="padding: 8px; color: #ef4444;">是</td><td style="padding: 8px;">费用金额</td></tr>
                <tr><td style="padding: 8px;">日期</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">费用发生日期（默认今天）</td></tr>
                <tr><td style="padding: 8px;">供应商</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">供应商名称</td></tr>
                <tr><td style="padding: 8px;">状态</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">待审批/处理中/已完成/已取消（默认待审批）</td></tr>
                <tr><td style="padding: 8px;">备注</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">备注说明</td></tr>
              </tbody>
            </table>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0;">
            <i class="fas fa-download"></i> 
            <button style="background: none; border: none; color: #3b82f6; cursor: pointer; text-decoration: underline;" onclick="downloadPaymentTemplate()">下载导入模板</button>
          </p>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">选择CSV文件</label>
          <div style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.2s;" id="paymentImportDropZone" ondragover="event.preventDefault()" ondrop="handlePaymentFileDrop(event)" onclick="document.getElementById('paymentImportFile').click()">
            <i class="fas fa-file-csv" style="font-size: 48px; color: #94a3b8; margin-bottom: 12px;"></i>
            <p style="font-size: 14px; color: #374151; margin: 0 0 4px;">点击或拖拽CSV文件到此处</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">支持 .csv 格式文件</p>
            <input type="file" id="paymentImportFile" accept=".csv" style="display: none;" onchange="handlePaymentFileSelect(event)">
          </div>
        </div>
        
        <div id="paymentImportPreview" style="display: none; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 0;">预览数据</h4>
            <button style="padding: 4px 8px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer;" onclick="document.getElementById('paymentImportPreview').style.display='none'; document.getElementById('paymentImportFile').value=''; document.getElementById('paymentImportDropZone').style.display='block';">清除</button>
          </div>
          <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <table id="paymentPreviewTable" style="width: 100%; font-size: 12px; border-collapse: collapse;">
            </table>
          </div>
          <p id="paymentImportError" style="color: #ef4444; font-size: 12px; margin: 8px 0 0; display: none;"></p>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('importPaymentModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleImportPayments()" id="paymentImportBtn" disabled>导入</button>
      </div>
    </div>
  `;
  
  showModal('importPaymentModal', contentHtml);
}

let importedPaymentData = [];

function downloadPaymentTemplate() {
  const headers = ['费用名称', '所属项目', '类别', '金额', '日期', '供应商', '状态', '备注'];
  const rows = [
    ['人工费用-项目经理', '城北污水处理厂一期工程', '人工费用', '15000', '2026-05-15', '-', '已完成', '5月工资'],
    ['设备采购-离心泵', '城北污水处理厂一期工程', '设备采购', '85000', '2026-05-20', 'XX设备公司', '已完成', '4台潜水离心泵']
  ];
  
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '费用导入模板.csv';
  link.click();
}

function handlePaymentFileDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processPaymentFile(files[0]);
  }
}

function handlePaymentFileSelect(event) {
  const files = event.target.files;
  if (files.length > 0) {
    processPaymentFile(files[0]);
  }
}

function processPaymentFile(file) {
  if (!file.name.endsWith('.csv')) {
    alert('请选择CSV格式文件');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    parsePaymentCSV(content);
  };
  reader.readAsText(file, 'UTF-8');
}

function parsePaymentCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    document.getElementById('paymentImportError').textContent = 'CSV文件内容为空或格式不正确';
    document.getElementById('paymentImportError').style.display = 'block';
    return;
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/["']/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parsePaymentCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].replace(/["']/g, '').trim() : '';
    });
    data.push(row);
  }
  
  importedPaymentData = data;
  renderPaymentPreview(headers, data);
}

function parsePaymentCSVLine(line) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && line[i+1] === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"' && inQuotes) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  
  return values;
}

function renderPaymentPreview(headers, data) {
  const table = document.getElementById('paymentPreviewTable');
  let html = '<thead><tr>';
  headers.forEach(header => {
    html += `<th style="text-align: left; padding: 10px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 12px;">${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  data.slice(0, 10).forEach((row, index) => {
    html += `<tr style="${index % 2 === 0 ? 'background: #ffffff;' : 'background: #fafafa;'}">`;
    headers.forEach(header => {
      html += `<td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #374151;">${row[header] || '-'}</td>`;
    });
    html += '</tr>';
  });
  
  if (data.length > 10) {
    html += `<tr><td colspan="${headers.length}" style="padding: 8px; text-align: center; color: #94a3b8; font-size: 12px;">... 还有 ${data.length - 10} 条记录</td></tr>`;
  }
  
  table.innerHTML = html;
  
  document.getElementById('paymentImportDropZone').style.display = 'none';
  document.getElementById('paymentImportPreview').style.display = 'block';
  document.getElementById('paymentImportBtn').disabled = false;
  document.getElementById('paymentImportError').style.display = 'none';
}

function handleImportPayments() {
  const state = store.getState();
  const projects = state.projects;
  let successCount = 0;
  let failCount = 0;
  
  importedPaymentData.forEach((row, index) => {
    if (!row['费用名称'] || !row['费用名称'].trim()) {
      failCount++;
      return;
    }
    if (!row['金额'] || isNaN(parseFloat(row['金额']))) {
      failCount++;
      return;
    }
    
    let projectId = '';
    if (row['所属项目']) {
      const project = projects.find(p => p.name === row['所属项目'] || p.id === row['所属项目']);
      if (project) {
        projectId = project.id;
      }
    }
    
    const paymentData = {
      name: row['费用名称'],
      projectId: projectId,
      category: row['类别'] || '其他',
      amount: parseFloat(row['金额']),
      date: row['日期'] || new Date().toISOString().split('T')[0],
      supplier: row['供应商'] || '',
      status: mapPaymentStatus(row['状态']),
      notes: row['备注'] || ''
    };
    
    store.addPayment(paymentData);
    successCount++;
  });
  
  closeModal('importPaymentModal');
  renderContent();
  
  let message = `成功导入 ${successCount} 条记录`;
  if (failCount > 0) {
    message += `，失败 ${failCount} 条记录`;
  }
  
  store.addNotification({
    type: successCount > 0 ? 'success' : 'error',
    title: '批量导入完成',
    message: message
  });
}

function mapPaymentStatus(status) {
  const statusMap = {
    '待审批': 'pending',
    '处理中': 'processing',
    '已完成': 'completed',
    '已取消': 'cancelled'
  };
  return statusMap[status] || 'pending';
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
        <button class="btn btn-secondary" onclick="showImportMaterialModal()">
          <i class="fas fa-file-import"></i>
          批量导入
        </button>
      </div>
    </div>

    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-boxes" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">材料总数</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${materials.length}</div>
        <div style="font-size: 12px; color: #93c5fd;">种材料</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-shopping-cart" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已下单</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${ordered}</div>
        <div style="font-size: 12px; color: #d97706;">已采购</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-truck" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">运输中</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">${inTransit}</div>
        <div style="font-size: 12px; color: #dc2626;">配送中</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已到货</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${received}</div>
        <div style="font-size: 12px; color: #15803d;">已签收</div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">材料筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="materialProjectFilter" onchange="filterMaterials()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
          <select style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="materialCategoryFilter" onchange="filterMaterials()">
            <option value="">全部类别</option>
            <option value="土建材料">土建材料</option>
            <option value="安装材料">安装材料</option>
            <option value="电气材料">电气材料</option>
            <option value="管材管件">管材管件</option>
            <option value="调试耗材">调试耗材</option>
            <option value="其他">其他</option>
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="materialStatusFilter" onchange="filterMaterials()">
            <option value="">全部状态</option>
            <option value="ordered">已下单</option>
            <option value="in_transit">运输中</option>
            <option value="received">已到货</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetMaterialFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
        </div>
      </div>
    </div>
    
    ${renderProjectMaterialCards(projects, materials)}
  `;
  
  return html;
}

function renderProjectMaterialCards(projects, materials) {
  const grouped = {};
  materials.forEach(m => {
    const pid = m.projectId || '_unassigned';
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(m);
  });
  
  if (Object.keys(grouped).length === 0) {
    return `
      <div class="card" style="background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <div style="padding: 40px; text-align: center;">
          <i class="fas fa-boxes" style="font-size: 48px; color: #9ca3af;"></i>
          <h3 style="margin-top: 16px; color: #1f2937;">暂无材料数据</h3>
          <p style="color: #6b7280;">请在项目下添加材料</p>
        </div>
      </div>
    `;
  }
  
  const projectColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];
  
  return projects.map((project, idx) => {
    const color = projectColors[idx % projectColors.length];
    const projectMaterials = grouped[project.id];
    if (!projectMaterials || projectMaterials.length === 0) return '';
    
    const totalValue = projectMaterials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);
    const receivedCount = projectMaterials.filter(m => m.status === 'received').length;
    const inTransitCount = projectMaterials.filter(m => m.status === 'in_transit').length;
    
    return `
      <div class="card" style="margin-bottom: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 8px; height: 24px; background: linear-gradient(180deg, ${color} 0%, ${adjustColor(color, -30)} 100%); border-radius: 4px;"></div>
              <div>
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">${project.name}</h3>
                <p style="font-size: 13px; color: #64748b; margin: 2px 0 0;">${projectMaterials.length} 种材料 · ¥${totalValue.toLocaleString()}</p>
              </div>
            </div>
            <div style="display: flex; gap: 20px;">
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 600; color: #10b981;">${receivedCount}</div>
                <div style="font-size: 12px; color: #64748b;">已到货</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 600; color: #f59e0b;">${inTransitCount}</div>
                <div style="font-size: 12px; color: #64748b;">运输中</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 600; color: #6366f1;">${projectMaterials.length - receivedCount - inTransitCount}</div>
                <div style="font-size: 12px; color: #64748b;">已下单</div>
              </div>
            </div>
          </div>
        </div>
        <div style="padding: 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">日期</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">材料名称</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">类别</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">数量</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">单价</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">总价</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; width: 100px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${projectMaterials.map(material => {
                const statusInfo = getMaterialStatusInfo(material.status);
                return `
                  <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseenter="this.style.background='#fafafa'" onmouseleave="this.style.background='transparent'">
                    <td style="padding: 12px 16px; color: #64748b; font-size: 13px;">${DateUtils.formatDate(material.date)}</td>
                    <td style="padding: 12px 16px; color: #1e293b; font-size: 13px; font-weight: 500;">${material.name}</td>
                    <td style="padding: 12px 16px; color: #64748b; font-size: 13px;">${material.category || '-'}</td>
                    <td style="padding: 12px 16px; color: #374151; font-size: 13px; text-align: right;">${material.quantity} ${material.unit || ''}</td>
                    <td style="padding: 12px 16px; color: #374151; font-size: 13px; text-align: right;">¥${material.unitPrice.toLocaleString()}</td>
                    <td style="padding: 12px 16px; color: #374151; font-size: 13px; text-align: right; font-weight: 500;">¥${(material.quantity * material.unitPrice).toLocaleString()}</td>
                    <td style="padding: 12px 16px;">
                      <span style="font-size: 11px; background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 3px 8px; border-radius: 4px; font-weight: 500;">${statusInfo.name}</span>
                    </td>
                    <td style="padding: 12px 16px;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <button style="padding: 4px 8px; border: none; border-radius: 6px; background: #f1f5f9; color: #64748b; cursor: pointer; transition: all 0.2s;" onclick="viewMaterial('${material.id}')" title="查看详情">
                          <i class="fas fa-eye" style="font-size: 12px;"></i>
                        </button>
                        <button style="padding: 4px 8px; border: none; border-radius: 6px; background: #f1f5f9; color: #64748b; cursor: pointer; transition: all 0.2s;" onclick="editMaterial('${material.id}')" title="编辑">
                          <i class="fas fa-edit" style="font-size: 12px;"></i>
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
  }).join('');
}

function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
  let materials = [...(state.materials || [])];
  const projects = state.projects || [];
  
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
  
  const container = document.getElementById('content');
  if (container) {
    container.innerHTML = renderMaterialsFiltered(materials, projects, {
      projectFilter,
      categoryFilter,
      statusFilter
    });
  }
}

function clearMaterialFilters() {
  const projectFilter = document.getElementById('materialProjectFilter');
  const categoryFilter = document.getElementById('materialCategoryFilter');
  const statusFilter = document.getElementById('materialStatusFilter');

  if (projectFilter) projectFilter.value = '';
  if (categoryFilter) categoryFilter.value = '';
  if (statusFilter) statusFilter.value = '';

  filterMaterials();
}

function resetMaterialFilters() {
  const projectFilter = document.getElementById('materialProjectFilter');
  const categoryFilter = document.getElementById('materialCategoryFilter');
  const statusFilter = document.getElementById('materialStatusFilter');

  if (projectFilter) projectFilter.value = '';
  if (categoryFilter) categoryFilter.value = '';
  if (statusFilter) statusFilter.value = '';

  filterMaterials();
}

function renderMaterialsFiltered(materials, projects, filters = {}) {
  const { projectFilter = '', categoryFilter = '', statusFilter = '' } = filters;
  
  const filteredStats = {
    total: materials.length,
    ordered: materials.filter(m => m.status === 'ordered').length,
    inTransit: materials.filter(m => m.status === 'in_transit').length,
    received: materials.filter(m => m.status === 'received').length
  };
  
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
        <button class="btn btn-secondary" onclick="showImportMaterialModal()">
          <i class="fas fa-file-import"></i>
          批量导入
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
        <div class="stat-card-value">${filteredStats.total}</div>
        <div class="stat-card-label">材料总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-shopping-cart"></i>
          </div>
        </div>
        <div class="stat-card-value">${filteredStats.ordered}</div>
        <div class="stat-card-label">已下单</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">
            <i class="fas fa-truck"></i>
          </div>
        </div>
        <div class="stat-card-value">${filteredStats.inTransit}</div>
        <div class="stat-card-label">运输中</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-card-value">${filteredStats.received}</div>
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
              <option value="${p.id}" ${p.id === projectFilter ? 'selected' : ''}>${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">类别筛选</label>
          <select class="form-input" id="materialCategoryFilter" onchange="filterMaterials()">
            <option value="">全部类别</option>
            <option value="土建材料" ${categoryFilter === '土建材料' ? 'selected' : ''}>土建材料</option>
            <option value="安装材料" ${categoryFilter === '安装材料' ? 'selected' : ''}>安装材料</option>
            <option value="电气材料" ${categoryFilter === '电气材料' ? 'selected' : ''}>电气材料</option>
            <option value="管材管件" ${categoryFilter === '管材管件' ? 'selected' : ''}>管材管件</option>
            <option value="调试耗材" ${categoryFilter === '调试耗材' ? 'selected' : ''}>调试耗材</option>
            <option value="其他" ${categoryFilter === '其他' ? 'selected' : ''}>其他</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">状态筛选</label>
          <select class="form-input" id="materialStatusFilter" onchange="filterMaterials()">
            <option value="">全部状态</option>
            <option value="ordered" ${statusFilter === 'ordered' ? 'selected' : ''}>已下单</option>
            <option value="in_transit" ${statusFilter === 'in_transit' ? 'selected' : ''}>运输中</option>
            <option value="received" ${statusFilter === 'received' ? 'selected' : ''}>已到货</option>
          </select>
        </div>
      </div>
    </div>
    
    ${renderProjectMaterialCards(projects, materials)}
  `;
  
  return html;
}

function renderProjectMaterialCards(projects, materials) {
  const grouped = {};
  materials.forEach(m => {
    const pid = m.projectId || '_unassigned';
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(m);
  });
  
  if (Object.keys(grouped).length === 0) {
    return `
      <div class="card" style="background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <div style="padding: 40px; text-align: center;">
          <i class="fas fa-boxes" style="font-size: 48px; color: #9ca3af;"></i>
          <h3 style="margin-top: 16px; color: #1f2937;">暂无材料数据</h3>
          <p style="color: #6b7280;">请在项目下添加材料</p>
        </div>
      </div>
    `;
  }
  
  const projectColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];
  
  return projects.map((project, idx) => {
    const color = projectColors[idx % projectColors.length];
    const projectMaterials = grouped[project.id];
    if (!projectMaterials || projectMaterials.length === 0) return '';
    
    const totalValue = projectMaterials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);
    const receivedCount = projectMaterials.filter(m => m.status === 'received').length;
    const inTransitCount = projectMaterials.filter(m => m.status === 'in_transit').length;
    
    return `
      <div class="card" style="margin-bottom: 24px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 8px; height: 24px; background: linear-gradient(180deg, ${color} 0%, ${adjustColor(color, -30)} 100%); border-radius: 4px;"></div>
              <div>
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">${project.name}</h3>
                <p style="font-size: 13px; color: #64748b; margin: 2px 0 0;">${projectMaterials.length} 种材料 · ¥${totalValue.toLocaleString()}</p>
              </div>
            </div>
            <div style="display: flex; gap: 20px;">
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 600; color: #10b981;">${receivedCount}</div>
                <div style="font-size: 12px; color: #64748b;">已到货</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 600; color: #f59e0b;">${inTransitCount}</div>
                <div style="font-size: 12px; color: #64748b;">运输中</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: 600; color: #6366f1;">${projectMaterials.length - receivedCount - inTransitCount}</div>
                <div style="font-size: 12px; color: #64748b;">已下单</div>
              </div>
            </div>
          </div>
        </div>
        <div style="padding: 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">日期</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">材料名称</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">类别</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">数量</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">单价</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">总价</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; width: 100px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${projectMaterials.map(material => {
                const statusInfo = getMaterialStatusInfo(material.status);
                return `
                  <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseenter="this.style.background='#fafafa'" onmouseleave="this.style.background='transparent'">
                    <td style="padding: 12px 16px; color: #64748b; font-size: 13px;">${DateUtils.formatDate(material.date)}</td>
                    <td style="padding: 12px 16px; color: #1e293b; font-size: 13px; font-weight: 500;">${material.name}</td>
                    <td style="padding: 12px 16px; color: #64748b; font-size: 13px;">${material.category || '-'}</td>
                    <td style="padding: 12px 16px; color: #374151; font-size: 13px; text-align: right;">${material.quantity} ${material.unit || ''}</td>
                    <td style="padding: 12px 16px; color: #374151; font-size: 13px; text-align: right;">¥${material.unitPrice.toLocaleString()}</td>
                    <td style="padding: 12px 16px; color: #374151; font-size: 13px; text-align: right; font-weight: 500;">¥${(material.quantity * material.unitPrice).toLocaleString()}</td>
                    <td style="padding: 12px 16px;">
                      <span style="font-size: 11px; background: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 3px 8px; border-radius: 4px; font-weight: 500;">${statusInfo.name}</span>
                    </td>
                    <td style="padding: 12px 16px;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <button style="padding: 4px 8px; border: none; border-radius: 6px; background: #f1f5f9; color: #64748b; cursor: pointer; transition: all 0.2s;" onclick="viewMaterial('${material.id}')" title="查看详情">
                          <i class="fas fa-eye" style="font-size: 12px;"></i>
                        </button>
                        <button style="padding: 4px 8px; border: none; border-radius: 6px; background: #f1f5f9; color: #64748b; cursor: pointer; transition: all 0.2s;" onclick="editMaterial('${material.id}')" title="编辑">
                          <i class="fas fa-edit" style="font-size: 12px;"></i>
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
  }).join('');
}

function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function showAddMaterialModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新增材料</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addMaterialModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px; max-height: calc(90vh - 120px); overflow-y: auto;">
        <form id="addMaterialForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">项目 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">类别</label>
              <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="category">
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
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">材料名称 <span style="color: red;">*</span></label>
              <input type="text" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="name" required placeholder="请输入材料名称">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">数量 <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="quantity" min="0" required value="0">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">单价 <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="unitPrice" min="0" required value="0">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">状态 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="status" required>
                <option value="ordered">已下单</option>
                <option value="in_transit">运输中</option>
                <option value="received">已到货</option>
              </select>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">发货日期</label>
              <input type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="shipDate">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">预计到达</label>
              <input type="date" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="estimatedArrival">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">物流单号</label>
            <input type="text" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;" name="trackingNumber" placeholder="物流/快递单号">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">备注</label>
            <textarea style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; min-height: 60px;" name="notes" placeholder="请输入备注" rows="3"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 8px 16px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addMaterialModal')">取消</button>
        <button style="padding: 8px 16px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddMaterial()">提交</button>
      </div>
    </div>
  `;
  
  showModal('addMaterialModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">材料详情</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewMaterialModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; gap: 16px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">日期</span>
            <span style="color: #1e293b;">${DateUtils.formatDate(material.date)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">项目</span>
            <span style="color: #1e293b;">${project?.name || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">材料名称</span>
            <span style="color: #1e293b;">${material.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">类别</span>
            <span style="color: #1e293b;">${material.category || '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">数量</span>
            <span style="color: #1e293b;">${material.quantity}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">单价</span>
            <span style="color: #1e293b;">¥${material.unitPrice.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">总价</span>
            <span style="font-weight: 600; color: #1e293b;">¥${(material.quantity * material.unitPrice).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">状态</span>
            <span style="color: #1e293b;">${statusNames[material.status]}</span>
          </div>
          ${material.shipDate ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">发货日期</span>
              <span style="color: #1e293b;">${material.shipDate}</span>
            </div>
          ` : ''}
          ${material.trackingNumber ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">物流单号</span>
              <span style="color: #1e293b;">${material.trackingNumber}</span>
            </div>
          ` : ''}
          ${material.estimatedArrival ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">预计到达</span>
              <span style="color: #1e293b;">${material.estimatedArrival}</span>
            </div>
          ` : ''}
          ${material.notes ? `
            <div>
              <span style="color: #64748b;">备注</span>
              <p style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 8px; color: #1e293b;">${material.notes}</p>
            </div>
          ` : ''}
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewMaterialModal')">关闭</button>
      </div>
    </div>
  `;
  
  showModal('viewMaterialModal', contentHtml);
}

function editMaterial(materialId) {
  const state = store.getState();
  const material = state.materials?.find(m => m.id === materialId);
  if (!material) return;
  
  const projects = state.projects;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑材料</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editMaterialModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editMaterialForm">
          <input type="hidden" name="materialId" value="${material.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">日期 <span style="color: red;">*</span></label>
            <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="date" required value="${material.date}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}" ${p.id === material.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">材料名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${material.name}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">类别</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="category">
                <option value="">请选择类别</option>
                <option value="土建材料" ${material.category === '土建材料' ? 'selected' : ''}>土建材料</option>
                <option value="安装材料" ${material.category === '安装材料' ? 'selected' : ''}>安装材料</option>
                <option value="电气材料" ${material.category === '电气材料' ? 'selected' : ''}>电气材料</option>
                <option value="管材管件" ${material.category === '管材管件' ? 'selected' : ''}>管材管件</option>
                <option value="调试耗材" ${material.category === '调试耗材' ? 'selected' : ''}>调试耗材</option>
                <option value="其他" ${material.category === '其他' ? 'selected' : ''}>其他</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">数量 <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="quantity" min="0" required value="${material.quantity}">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">单价 <span style="color: red;">*</span></label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="unitPrice" min="0" required value="${material.unitPrice}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status" required>
              <option value="ordered" ${material.status === 'ordered' ? 'selected' : ''}>已下单</option>
              <option value="in_transit" ${material.status === 'in_transit' ? 'selected' : ''}>运输中</option>
              <option value="received" ${material.status === 'received' ? 'selected' : ''}>已到货</option>
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">发货日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="shipDate" value="${material.shipDate || ''}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">物流单号</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="trackingNumber" value="${material.trackingNumber || ''}" placeholder="物流/快递单号">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">预计到达</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="estimatedArrival" value="${material.estimatedArrival || ''}">
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="notes">${material.notes || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editMaterialModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditMaterial()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editMaterialModal', contentHtml);
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

function showImportMaterialModal() {
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 80vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">批量导入材料</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('importMaterialModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
            <p style="font-size: 13px; color: #92400e; margin: 0;">
              <strong>导入说明：</strong>请上传 CSV 格式文件，文件需包含以下列（顺序不限）：
            </p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
            <table style="width: 100%; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <th style="text-align: left; padding: 8px; color: #64748b;">列名</th>
                  <th style="text-align: left; padding: 8px; color: #64748b;">必填</th>
                  <th style="text-align: left; padding: 8px; color: #64748b;">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 8px;">材料名称</td><td style="padding: 8px; color: #ef4444;">是</td><td style="padding: 8px;">材料名称</td></tr>
                <tr><td style="padding: 8px;">类别</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">土建材料/安装材料/电气材料/管材管件/调试耗材/其他（默认其他）</td></tr>
                <tr><td style="padding: 8px;">所属项目</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">项目名称或项目ID</td></tr>
                <tr><td style="padding: 8px;">数量</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">数量（默认1）</td></tr>
                <tr><td style="padding: 8px;">单位</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">台/套/米/吨等（默认台）</td></tr>
                <tr><td style="padding: 8px;">单价</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">单价（默认0）</td></tr>
                <tr><td style="padding: 8px;">供应商</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">供应商名称</td></tr>
                <tr><td style="padding: 8px;">状态</td><td style="padding: 8px; color: #10b981;">否</td><td style="padding: 8px;">已下单/运输中/已到货（默认已下单）</td></tr>
              </tbody>
            </table>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0;">
            <i class="fas fa-download"></i> 
            <button style="background: none; border: none; color: #3b82f6; cursor: pointer; text-decoration: underline;" onclick="downloadMaterialTemplate()">下载导入模板</button>
          </p>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">选择CSV文件</label>
          <div style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.2s;" id="materialImportDropZone" ondragover="event.preventDefault()" ondrop="handleMaterialFileDrop(event)" onclick="document.getElementById('materialImportFile').click()">
            <i class="fas fa-file-csv" style="font-size: 48px; color: #94a3b8; margin-bottom: 12px;"></i>
            <p style="font-size: 14px; color: #374151; margin: 0 0 4px;">点击或拖拽CSV文件到此处</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">支持 .csv 格式文件</p>
            <input type="file" id="materialImportFile" accept=".csv" style="display: none;" onchange="handleMaterialFileSelect(event)">
          </div>
        </div>
        
        <div id="materialImportPreview" style="display: none; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 0;">预览数据</h4>
            <button style="padding: 4px 8px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer;" onclick="document.getElementById('materialImportPreview').style.display='none'; document.getElementById('materialImportFile').value=''; document.getElementById('materialImportDropZone').style.display='block';">清除</button>
          </div>
          <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <table id="materialPreviewTable" style="width: 100%; font-size: 12px; border-collapse: collapse;">
            </table>
          </div>
          <p id="materialImportError" style="color: #ef4444; font-size: 12px; margin: 8px 0 0; display: none;"></p>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('importMaterialModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleImportMaterials()" id="materialImportBtn" disabled>导入</button>
      </div>
    </div>
  `;
  
  showModal('importMaterialModal', contentHtml);
}

let importedMaterialData = [];

function downloadMaterialTemplate() {
  const headers = ['材料名称', '类别', '所属项目', '数量', '单位', '单价', '供应商', '状态'];
  const rows = [
    ['钢筋 HRB400', '土建材料', '城北污水处理厂一期工程', '10', '吨', '5800', 'XX钢铁公司', '已到货'],
    ['PE给水管 DN300', '管材管件', '城北污水处理厂一期工程', '500', '米', '120', 'XX管材公司', '运输中']
  ];
  
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '材料导入模板.csv';
  link.click();
}

function handleMaterialFileDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processMaterialFile(files[0]);
  }
}

function handleMaterialFileSelect(event) {
  const files = event.target.files;
  if (files.length > 0) {
    processMaterialFile(files[0]);
  }
}

function processMaterialFile(file) {
  if (!file.name.endsWith('.csv')) {
    alert('请选择CSV格式文件');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    parseMaterialCSV(content);
  };
  reader.readAsText(file, 'UTF-8');
}

function parseMaterialCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    document.getElementById('materialImportError').textContent = 'CSV文件内容为空或格式不正确';
    document.getElementById('materialImportError').style.display = 'block';
    return;
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/["']/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseMaterialCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].replace(/["']/g, '').trim() : '';
    });
    data.push(row);
  }
  
  importedMaterialData = data;
  renderMaterialPreview(headers, data);
}

function parseMaterialCSVLine(line) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && line[i+1] === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"' && inQuotes) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  
  return values;
}

function renderMaterialPreview(headers, data) {
  const table = document.getElementById('materialPreviewTable');
  let html = '<thead><tr>';
  headers.forEach(header => {
    html += `<th style="text-align: left; padding: 10px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 12px;">${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  data.slice(0, 10).forEach((row, index) => {
    html += `<tr style="${index % 2 === 0 ? 'background: #ffffff;' : 'background: #fafafa;'}">`;
    headers.forEach(header => {
      html += `<td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #374151;">${row[header] || '-'}</td>`;
    });
    html += '</tr>';
  });
  
  if (data.length > 10) {
    html += `<tr><td colspan="${headers.length}" style="padding: 8px; text-align: center; color: #94a3b8; font-size: 12px;">... 还有 ${data.length - 10} 条记录</td></tr>`;
  }
  
  table.innerHTML = html;
  
  document.getElementById('materialImportDropZone').style.display = 'none';
  document.getElementById('materialImportPreview').style.display = 'block';
  document.getElementById('materialImportBtn').disabled = false;
  document.getElementById('materialImportError').style.display = 'none';
}

function handleImportMaterials() {
  const state = store.getState();
  const projects = state.projects;
  let successCount = 0;
  let failCount = 0;
  
  importedMaterialData.forEach((row, index) => {
    if (!row['材料名称'] || !row['材料名称'].trim()) {
      failCount++;
      return;
    }
    
    let projectId = '';
    if (row['所属项目']) {
      const project = projects.find(p => p.name === row['所属项目'] || p.id === row['所属项目']);
      if (project) {
        projectId = project.id;
      }
    }
    
    const materialData = {
      name: row['材料名称'],
      category: row['类别'] || '其他',
      projectId: projectId,
      quantity: parseInt(row['数量'] || '1'),
      unit: row['单位'] || '台',
      unitPrice: parseFloat(row['单价'] || '0'),
      supplier: row['供应商'] || '',
      status: mapMaterialStatus(row['状态']),
      date: new Date().toISOString().split('T')[0],
      notes: ''
    };
    
    store.addMaterial(materialData);
    successCount++;
  });
  
  closeModal('importMaterialModal');
  renderContent();
  
  let message = `成功导入 ${successCount} 条记录`;
  if (failCount > 0) {
    message += `，失败 ${failCount} 条记录`;
  }
  
  store.addNotification({
    type: successCount > 0 ? 'success' : 'error',
    title: '批量导入完成',
    message: message
  });
}

function mapMaterialStatus(status) {
  const statusMap = {
    '已下单': 'ordered',
    '运输中': 'in_transit',
    '已到货': 'received'
  };
  return statusMap[status] || 'ordered';
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
    
    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-clock" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">待处理</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${pending}</div>
        <div style="font-size: 12px; color: #d97706;">需处理工单</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-spinner" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">处理中</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${processing}</div>
        <div style="font-size: 12px; color: #93c5fd;">进行中工单</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-check-circle" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已完成</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${completed}</div>
        <div style="font-size: 12px; color: #15803d;">已完成工单</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-exclamation-triangle" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">已超期</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">${overdue}</div>
        <div style="font-size: 12px; color: #dc2626;">超期工单</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-flag" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">高优先级</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">${highPriority}</div>
        <div style="font-size: 12px; color: #dc2626;">紧急工单</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-calendar" style="color: #8b5cf6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">平均处理天数</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #6d28d9; margin-bottom: 8px;">${avgDays}</div>
        <div style="font-size: 12px; color: #7c3aed;">平均耗时</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%); border: 1px solid #a7f3d0; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-ticket-alt" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总记录数</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${afterSales.length}</div>
        <div style="font-size: 12px; color: #15803d;">售后工单总数</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-percentage" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">完成率</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 12px;">${afterSales.length > 0 ? Math.round((completed / afterSales.length) * 100) : 0}%</div>
        <div style="height: 6px; background: rgba(59, 130, 246, 0.2); border-radius: 3px; overflow: hidden;">
          <div style="width: ${afterSales.length > 0 ? Math.round((completed / afterSales.length) * 100) : 0}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 3px;"></div>
        </div>
        <div style="font-size: 12px; color: #3b82f6; margin-top: 6px;">工单完成比例</div>
      </div>
    </div>
    
    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #8b5cf6 0%, #a855f7 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">售后工单筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <input 
            type="text" 
            style="width: 200px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;"
            placeholder="搜索问题描述或客户..." 
            value="${afterSaleFilter.search || ''}"
            oninput="afterSaleFilter.search = this.value; renderContent()"
          >
          <select style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" value="${afterSaleFilter.projectId || ''}" onchange="afterSaleFilter.projectId = this.value; renderContent()">
            <option value="">全部项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <select style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" value="${afterSaleFilter.issueType || ''}" onchange="afterSaleFilter.issueType = this.value; renderContent()">
            <option value="">全部类别</option>
            <option value="设备故障">设备故障</option>
            <option value="工艺问题">工艺问题</option>
            <option value="安装问题">安装问题</option>
            <option value="调试问题">调试问题</option>
            <option value="水质不达标">水质不达标</option>
            <option value="其他">其他</option>
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" value="${afterSaleFilter.status || ''}" onchange="afterSaleFilter.status = this.value; renderContent()">
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
          </select>
          <select style="width: 100px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" value="${afterSaleFilter.priority || ''}" onchange="afterSaleFilter.priority = this.value; renderContent()">
            <option value="">全部优先级</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="afterSaleFilter = {search: '', projectId: '', status: '', priority: '', issueType: ''}; renderContent()">
            <i class="fas fa-redo"></i> 重置
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
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">添加处理日志</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addLogModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="addLogForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">处理内容 <span style="color: red;">*</span></label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="action" required placeholder="请输入处理进展、采取的措施等..."></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">下一步计划</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 60px; box-sizing: border-box;" name="nextStep" placeholder="请输入下一步计划（可选）"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addLogModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddAfterSaleLog('${afterSaleId}')">保存</button>
      </div>
    </div>
  `;
  
  showModal('addLogModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新增售后</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addAfterSaleModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="addAfterSaleForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">负责人</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId">
                <option value="">未分配</option>
                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题类别 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="issueType" required>
                <option value="">请选择问题类别</option>
                <option value="设备故障">设备故障</option>
                <option value="工艺问题">工艺问题</option>
                <option value="安装问题">安装问题</option>
                <option value="调试问题">调试问题</option>
                <option value="水质不达标">水质不达标</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">客户名称</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="clientName" placeholder="请输入客户名称">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">客户电话</label>
              <input type="tel" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="clientPhone" placeholder="请输入客户电话">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">计划完成日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority" required>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题描述 <span style="color: red;">*</span></label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="description" required placeholder="请描述售后问题的详细情况..."></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addAfterSaleModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddAfterSale()">提交</button>
      </div>
    </div>
  `;
  
  showModal('addAfterSaleModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">售后详情</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewAfterSaleModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">日期</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${DateUtils.formatDate(afterSale.date)}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${project?.name || '-'}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">负责人</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${assignee?.name || '<span style="color: #9ca3af;">未分配</span>'}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题类别</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${afterSale.issueType || '-'}</div>
          </div>
          ${afterSale.clientName ? `
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">客户名称</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${afterSale.clientName}</div>
          </div>
          ` : ''}
          ${afterSale.clientPhone ? `
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">客户电话</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${afterSale.clientPhone}</div>
          </div>
          ` : ''}
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${priorityNames[afterSale.priority]}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${statusNames[afterSale.status]}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">创建时间</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${DateUtils.formatDateTime(afterSale.createdAt)}</div>
          </div>
          ${afterSale.dueDate ? `
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">计划完成</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb;">${DateUtils.formatDate(afterSale.dueDate)}</div>
          </div>
          ` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题描述</label>
          <p style="margin-top: 8px; padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 14px; color: #374151;">${afterSale.description}</p>
        </div>
        
        ${afterSale.result ? `
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">处理结果</label>
            <p style="margin-top: 8px; padding: 12px; background: #f9fafb; border-radius: 8px; font-size: 14px; color: #374151;">${afterSale.result}</p>
          </div>
        ` : ''}
        
        <div>
          <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">处理日志</label>
          ${logs.length === 0 ? `
            <p style="margin-top: 8px; color: #9ca3af; font-size: 14px;">暂无处理日志</p>
          ` : `
            <div style="margin-top: 8px; max-height: 200px; overflow-y: auto;">
              ${logs.map(log => `
                <div style="display: flex; gap: 12px; padding: 8px; border-bottom: 1px solid #e2e8f0;">
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
                    <i class="fas fa-history"></i>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-size: 13px; color: #374151;">${log.action}</div>
                    <div style="font-size: 12px; color: #9ca3af;">${DateUtils.formatDateTime(log.createdAt)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewAfterSaleModal')">关闭</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewAfterSaleModal'); showAssignModal('${afterSale.id}')">分配负责人</button>
        ${afterSale.status !== 'completed' ? `
          <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="updateAfterSaleStatus('${afterSale.id}', 'completed'); closeModal('viewAfterSaleModal');">标记完成</button>
        ` : ''}
      </div>
    </div>
  `;
  
  showModal('viewAfterSaleModal', contentHtml);
}

function editAfterSale(afterSaleId) {
  const state = store.getState();
  const afterSale = state.afterSales?.find(a => a.id === afterSaleId);
  if (!afterSale) return;
  
  const projects = state.projects;
  const users = state.users;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑售后</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editAfterSaleModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px; max-height: calc(90vh - 120px); overflow-y: auto;">
        <form id="editAfterSaleForm">
          <input type="hidden" name="afterSaleId" value="${afterSale.id}">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="date" required value="${afterSale.date}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}" ${p.id === afterSale.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">负责人</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId">
                <option value="">未分配</option>
                ${users.map(u => `<option value="${u.id}" ${u.id === afterSale.assigneeId ? 'selected' : ''}>${u.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题类别</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="issueType">
                <option value="">请选择问题类别</option>
                <option value="设备故障" ${afterSale.issueType === '设备故障' ? 'selected' : ''}>设备故障</option>
                <option value="工艺问题" ${afterSale.issueType === '工艺问题' ? 'selected' : ''}>工艺问题</option>
                <option value="安装问题" ${afterSale.issueType === '安装问题' ? 'selected' : ''}>安装问题</option>
                <option value="调试问题" ${afterSale.issueType === '调试问题' ? 'selected' : ''}>调试问题</option>
                <option value="水质不达标" ${afterSale.issueType === '水质不达标' ? 'selected' : ''}>水质不达标</option>
                <option value="其他" ${afterSale.issueType === '其他' ? 'selected' : ''}>其他</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">客户名称</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="clientName" value="${afterSale.clientName || ''}" placeholder="请输入客户名称">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">客户电话</label>
              <input type="tel" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="clientPhone" value="${afterSale.clientPhone || ''}" placeholder="请输入客户电话">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">计划完成日期</label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="dueDate" value="${afterSale.dueDate || ''}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">优先级 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="priority" required>
                <option value="low" ${afterSale.priority === 'low' ? 'selected' : ''}>低</option>
                <option value="medium" ${afterSale.priority === 'medium' ? 'selected' : ''}>中</option>
                <option value="high" ${afterSale.priority === 'high' ? 'selected' : ''}>高</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status">
                <option value="pending" ${afterSale.status === 'pending' ? 'selected' : ''}>待处理</option>
                <option value="processing" ${afterSale.status === 'processing' ? 'selected' : ''}>处理中</option>
                <option value="completed" ${afterSale.status === 'completed' ? 'selected' : ''}>已完成</option>
              </select>
            </div>
          </div>
          <div style="margin-top: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">问题描述 <span style="color: red;">*</span></label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; box-sizing: border-box;" name="description" required>${afterSale.description}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editAfterSaleModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditAfterSale()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editAfterSaleModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 400px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">分配负责人</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('assignModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="assignForm">
          <input type="hidden" name="afterSaleId" value="${afterSaleId}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">当前负责人</label>
            <div style="padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f9fafb; color: #374151;">${currentAssignee?.name || '未分配'}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">新负责人 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="assigneeId" required>
              <option value="">请选择负责人</option>
              ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
            </select>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('assignModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAssign()">确认分配</button>
      </div>
    </div>
  `;
  
  showModal('assignModal', contentHtml);
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
    
    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-users" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">用工人数</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${totalWorkers}</div>
        <div style="font-size: 12px; color: #93c5fd;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-user-check" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">在职人员</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${activeWorkers}</div>
        <div style="font-size: 12px; color: #15803d;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-clock" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总工时</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${totalHours}</div>
        <div style="font-size: 12px; color: #d97706;">小时</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-money-bill" style="color: #8b5cf6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总费用</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #6d28d9; margin-bottom: 8px;">¥${totalCost.toLocaleString()}</div>
        <div style="font-size: 12px; color: #7c3aed;">元</div>
      </div>
    </div>
    
    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">用工筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select style="width: 200px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="workerProjectFilter" onchange="filterTemporaryWorkers()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
          <select style="width: 120px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="workerStatusFilter" onchange="filterTemporaryWorkers()">
            <option value="">全部状态</option>
            <option value="active">在职</option>
            <option value="inactive">离职</option>
            <option value="completed">完工</option>
          </select>
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetWorkerFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
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
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">项目状态</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">进场日期</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">工时(h)</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">单价(元/h)</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">施工记录</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 160px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${workers.map(worker => {
                const project = projects.find(p => p.id === worker.projectId);
                const statusInfo = getWorkerStatusInfo(worker.status);
                const projectStatusInfo = getProjectStatusInfo(project?.status);
                const dailyLogs = state.dailyLogs || [];
                const workerLogs = dailyLogs.filter(log => log.workers && log.workers.some(w => w.id === worker.id));
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
                    <td style="padding: 14px 16px;">
                      <span style="font-size: 11px; background: ${projectStatusInfo.bg}; color: ${projectStatusInfo.color}; padding: 4px 10px; border-radius: 4px;">${projectStatusInfo.name}</span>
                    </td>
                    <td style="padding: 14px 16px; color: #1f2937;">${worker.startDate ? DateUtils.formatDate(worker.startDate) : '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${worker.totalHours || 0}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${worker.hourlyRate || 0}</td>
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 12px; color: var(--text-secondary);">${workerLogs.length} 条记录</span>
                        ${workerLogs.length > 0 ? `<span style="font-size: 11px; color: var(--text-tertiary);">最近: ${DateUtils.formatDate(workerLogs[0].date)}</span>` : ''}
                      </div>
                    </td>
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

function getProjectStatusInfo(status) {
  const statusMap = {
    'planning': { name: '筹备中', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
    'active': { name: '进行中', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
    'completed': { name: '已完成', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' },
    'paused': { name: '已暂停', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    'terminated': { name: '已终止', bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
  };
  return statusMap[status] || { name: status || '-', bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
}

function filterTemporaryWorkers() {
  const state = store.getState();
  let workers = [...state.temporaryWorkers];
  const projects = state.projects;

  const projectFilter = document.getElementById('workerProjectFilter')?.value;
  const statusFilter = document.getElementById('workerStatusFilter')?.value;
  const projectStatusFilter = document.getElementById('projectStatusFilter')?.value;

  if (projectFilter) {
    workers = workers.filter(w => w.projectId === projectFilter);
  }

  if (projectStatusFilter && projectStatusFilter !== 'all') {
    workers = workers.filter(w => {
      const project = projects.find(p => p.id === w.projectId);
      return project && project.status === projectStatusFilter;
    });
  }

  if (statusFilter) {
    workers = workers.filter(w => w.status === statusFilter);
  }

  const container = document.getElementById('content');
  if (container) {
    container.innerHTML = renderTemporaryWorkersFiltered(workers, projects, {
      projectFilter,
      statusFilter,
      projectStatusFilter
    });
  }
}

function resetWorkerFilters() {
  const projectFilter = document.getElementById('workerProjectFilter');
  const statusFilter = document.getElementById('workerStatusFilter');
  const projectStatusFilter = document.getElementById('projectStatusFilter');

  if (projectFilter) projectFilter.value = '';
  if (statusFilter) statusFilter.value = '';
  if (projectStatusFilter) projectStatusFilter.value = '';

  filterTemporaryWorkers();
}

function renderTemporaryWorkersFiltered(workers, projects, filters = {}) {
  const { projectFilter = '', statusFilter = '', projectStatusFilter = '' } = filters;
  
  const state = store.getState();
  const dailyLogs = state.dailyLogs || [];
  
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const totalHours = workers.reduce((sum, w) => sum + (parseFloat(w.totalHours) || 0), 0);
  const totalCost = workers.reduce((sum, w) => sum + ((parseFloat(w.hourlyRate) || 0) * (parseFloat(w.totalHours) || 0)), 0);
  
  const workerLogStats = {};
  workers.forEach(worker => {
    const logs = dailyLogs.filter(log => {
      if (!log.workers) return false;
      return log.workers.some(w => w.id === worker.id);
    });
    workerLogStats[worker.id] = {
      logCount: logs.length,
      lastLogDate: logs.length > 0 ? logs[0].date : null
    };
  });
  
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
    
    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-users" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">用工人数</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${totalWorkers}</div>
        <div style="font-size: 12px; color: #93c5fd;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-user-check" style="color: #22c55e; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">在职人员</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${activeWorkers}</div>
        <div style="font-size: 12px; color: #15803d;">人</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px solid #fde68a; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-clock" style="color: #f59e0b; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总工时</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 8px;">${totalHours}</div>
        <div style="font-size: 12px; color: #d97706;">小时</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border: 1px solid #ddd6fe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-money-bill" style="color: #8b5cf6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总费用</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #6d28d9; margin-bottom: 8px;">¥${totalCost.toLocaleString()}</div>
        <div style="font-size: 12px; color: #7c3aed;">元</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目状态</label>
          <select class="form-input" id="projectStatusFilter" onchange="filterTemporaryWorkers()">
            <option value="all" ${projectStatusFilter === 'all' ? 'selected' : ''}>全部状态</option>
            <option value="pending" ${projectStatusFilter === 'pending' ? 'selected' : ''}>待开始</option>
            <option value="in_progress" ${projectStatusFilter === 'in_progress' ? 'selected' : ''}>进行中</option>
            <option value="completed" ${projectStatusFilter === 'completed' ? 'selected' : ''}>已完成</option>
            <option value="suspended" ${projectStatusFilter === 'suspended' ? 'selected' : ''}>已暂停</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="workerProjectFilter" onchange="filterTemporaryWorkers()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}" ${p.id === projectFilter ? 'selected' : ''}>${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">用工状态</label>
          <select class="form-input" id="workerStatusFilter" onchange="filterTemporaryWorkers()">
            <option value="">全部状态</option>
            <option value="active" ${statusFilter === 'active' ? 'selected' : ''}>在职</option>
            <option value="inactive" ${statusFilter === 'inactive' ? 'selected' : ''}>离职</option>
            <option value="completed" ${statusFilter === 'completed' ? 'selected' : ''}>完工</option>
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
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">项目状态</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">进场日期</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">工时(h)</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">单价(元/h)</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">施工记录</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 160px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${workers.map(worker => {
                const project = projects.find(p => p.id === worker.projectId);
                const statusInfo = getWorkerStatusInfo(worker.status);
                const projectStatusInfo = getProjectStatusInfo(project?.status);
                const dailyLogs = state.dailyLogs || [];
                const workerLogs = dailyLogs.filter(log => log.workers && log.workers.some(w => w.id === worker.id));
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
                    <td style="padding: 14px 16px;">
                      <span style="font-size: 11px; background: ${projectStatusInfo.bg}; color: ${projectStatusInfo.color}; padding: 4px 10px; border-radius: 4px;">${projectStatusInfo.name}</span>
                    </td>
                    <td style="padding: 14px 16px; color: #1f2937;">${worker.startDate ? DateUtils.formatDate(worker.startDate) : '-'}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${worker.totalHours || 0}</td>
                    <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${worker.hourlyRate || 0}</td>
                    <td style="padding: 14px 16px;">
                      <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 12px; color: var(--text-secondary);">${workerLogs.length} 条记录</span>
                        ${workerLogs.length > 0 ? `<span style="font-size: 11px; color: var(--text-tertiary);">最近: ${DateUtils.formatDate(workerLogs[0].date)}</span>` : ''}
                      </div>
                    </td>
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新增临时用工</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addWorkerModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="addWorkerForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">姓名 <span style="color: red;">*</span></label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入姓名">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">工种 <span style="color: red;">*</span></label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="trade" required placeholder="如：电工、木工、瓦工">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">联系电话</label>
              <input type="tel" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="phone" placeholder="请输入联系电话">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">身份证号</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="idCard" placeholder="请输入身份证号">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目 <span style="color: red;">*</span></label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
                <option value="">请选择项目</option>
                ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">进场日期 <span style="color: red;">*</span></label>
              <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="startDate" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">小时工资(元) <span style="color: red;">*</span></label>
              <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="hourlyRate" required placeholder="请输入小时工资" min="0" step="0.01">
            </div>
          </div>
          <div style="margin-top: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="remark" placeholder="其他说明信息"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addWorkerModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddTemporaryWorker()">确认添加</button>
      </div>
    </div>
  `;
  
  showModal('addWorkerModal', contentHtml);
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

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">用工详情</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewWorkerModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 24px;">
            ${worker.name?.charAt(0) || '?'}
          </div>
          <div>
            <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 4px; color: #1e293b;">${worker.name}</h4>
            <p style="color: #64748b; font-size: 14px;">${worker.trade || worker.type} | ${statusNames[worker.status]}</p>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 6px;">联系电话</label>
            <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; font-weight: 500; color: #1e293b;">${worker.phone || '-'}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 6px;">身份证号</label>
            <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; font-weight: 500; color: #1e293b;">${worker.idCard || '-'}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 6px;">所属项目</label>
            <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; font-weight: 500; color: #1e293b;">${project?.name || '-'}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 6px;">进场日期</label>
            <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; font-weight: 500; color: #1e293b;">${worker.startDate ? DateUtils.formatDate(worker.startDate) : '-'}</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 6px;">小时工资</label>
            <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; font-weight: 500; color: #1e293b;">${worker.hourlyRate || 0} 元/h</div>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 6px;">累计工时</label>
            <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; font-weight: 500; color: #1e293b;">${worker.totalHours || 0} 小时</div>
          </div>
        </div>
        
        <div style="margin-top: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 6px;">累计费用</label>
          <div style="padding: 11px 14px; background: #eff6ff; border-radius: 8px; font-weight: 600; color: #3b82f6; font-size: 18px;">${totalCost.toLocaleString()} 元</div>
        </div>
        
        <div style="margin-top: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 6px;">备注</label>
          <div style="padding: 11px 14px; background: #f8fafc; border-radius: 8px; min-height: 60px; color: #1e293b;">${worker.remark || '-'}</div>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewWorkerModal')">关闭</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="closeModal('viewWorkerModal'); editTemporaryWorker('${worker.id}')">编辑</button>
      </div>
    </div>
  `;
  
  showModal('viewWorkerModal', contentHtml);
}

function editTemporaryWorker(workerId) {
  const worker = store.getTemporaryWorkerById(workerId);
  const projects = store.getState().projects;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑用工信息</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editWorkerModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editWorkerForm">
          <input type="hidden" name="workerId" value="${worker.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">姓名 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${worker.name || ''}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">工种 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="trade" required value="${worker.trade || ''}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">联系电话</label>
            <input type="tel" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="phone" value="${worker.phone || ''}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">身份证号</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="idCard" value="${worker.idCard || ''}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">项目 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId" required>
              <option value="">请选择项目</option>
              ${projects.map(p => `<option value="${p.id}" ${p.id === worker.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">进场日期</label>
            <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="startDate" value="${worker.startDate || new Date().toISOString().split('T')[0]}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">小时工资(元)</label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="hourlyRate" value="${worker.hourlyRate || 0}" min="0" step="0.01">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">累计工时(h) <span style="color: #9ca3af; font-size: 12px;">(通过考勤记录自动计算)</span></label>
            <div style="padding: 11px 14px; background: #f3f4f6; border-radius: 8px; color: #9ca3af;">${worker.totalHours || 0}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">状态 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="status" required>
              <option value="active" ${worker.status === 'active' ? 'selected' : ''}>在职</option>
              <option value="inactive" ${worker.status === 'inactive' ? 'selected' : ''}>离职</option>
              <option value="completed" ${worker.status === 'completed' ? 'selected' : ''}>完工</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="remark">${worker.remark || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editWorkerModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditTemporaryWorker()">保存修改</button>
      </div>
    </div>
  `;
  
  showModal('editWorkerModal', contentHtml);
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">考勤管理 - ${worker.name}</h3>
          <p style="font-size: 14px; color: #64748b; margin-top: 4px;">
            工种: ${worker.trade} | 项目: ${project?.name || '-'} | 已用工: ${totalAttendanceHours}h
          </p>
        </div>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('attendanceModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 16px;">
          <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="closeModal('attendanceModal'); showAddAttendanceModal('${workerId}')">
            <i class="fas fa-plus"></i>
            登记工时
          </button>
        </div>
        
        ${attendances.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-clock" style="font-size: 48px; color: #9ca3af;"></i>
            <h3 style="margin-top: 16px; color: #374151;">暂无考勤记录</h3>
            <p style="color: #9ca3af;">点击"登记工时"添加第一条记录</p>
          </div>
        ` : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">日期</th>
                <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">工时(h)</th>
                <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">工作内容</th>
                <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">备注</th>
                <th style="padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${attendances.map(attendance => `
                <tr>
                  <td style="padding: 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #e2e8f0;">${attendance.date ? DateUtils.formatDate(attendance.date) : '-'}</td>
                  <td style="padding: 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #e2e8f0;">${attendance.hours || 0}</td>
                  <td style="padding: 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #e2e8f0;">${attendance.workContent || '-'}</td>
                  <td style="padding: 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #e2e8f0;">${attendance.remark || '-'}</td>
                  <td style="padding: 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #e2e8f0;">
                    <button style="padding: 6px 12px; font-size: 12px; background: #f1f5f9; color: #3b82f6; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; margin-right: 4px;" onclick="editAttendance('${attendance.id}')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button style="padding: 6px 12px; font-size: 12px; background: #f1f5f9; color: #ef4444; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer;" onclick="deleteAttendanceConfirm('${attendance.id}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('attendanceModal')">关闭</button>
      </div>
    </div>
  `;
  
  showModal('attendanceModal', contentHtml);
}

function showAddAttendanceModal(workerId) {
  const worker = store.getTemporaryWorkerById(workerId);
  const state = store.getState();
  const projects = state.projects;
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">登记工时 - ${worker.name}</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addAttendanceModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="addAttendanceForm">
          <input type="hidden" name="workerId" value="${workerId}">
          <input type="hidden" name="projectId" value="${worker.projectId}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">日期 <span style="color: red;">*</span></label>
            <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="date" required value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">工时(h) <span style="color: red;">*</span></label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="hours" required placeholder="请输入工作时长" min="0" step="0.5">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">工作内容</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="workContent" placeholder="请输入工作内容描述"></textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="remark" placeholder="其他说明信息"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addAttendanceModal'); showWorkerAttendanceModal('${workerId}')">返回</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleAddAttendance()">提交</button>
      </div>
    </div>
  `;
  
  showModal('addAttendanceModal', contentHtml);
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
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑工时 - ${worker.name}</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editAttendanceModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editAttendanceForm">
          <input type="hidden" name="attendanceId" value="${attendanceId}">
          <input type="hidden" name="workerId" value="${attendance.workerId}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">日期 <span style="color: red;">*</span></label>
            <input type="date" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="date" required value="${attendance.date || ''}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">工时(h) <span style="color: red;">*</span></label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="hours" required value="${attendance.hours || 0}" min="0" step="0.5">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">工作内容</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="workContent">${attendance.workContent || ''}</textarea>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="remark">${attendance.remark || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editAttendanceModal'); showWorkerAttendanceModal('${attendance.workerId}')">返回</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleEditAttendance()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editAttendanceModal', contentHtml);
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
