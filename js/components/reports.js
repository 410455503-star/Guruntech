function renderReports() {
  const state = store.getState();
  const projects = state.projects || [];
  const tasks = state.tasks || [];
  const resources = state.resources || [];
  const payments = state.payments || [];
  const warnings = state.warnings || [];
  
  const projectColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'];

  const html = `
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">项目报表</h1>
          <p class="page-description">查看项目日报、周报和月报，掌握项目进度与成本情况</p>
        </div>
        <div class="action-bar">
          <div class="view-toggle">
            <button class="active" data-view="daily" title="日报">
              <i class="fas fa-calendar-day"></i>
              日报
            </button>
            <button data-view="weekly" title="周报">
              <i class="fas fa-calendar-week"></i>
              周报
            </button>
            <button data-view="monthly" title="月报">
              <i class="fas fa-calendar-alt"></i>
              月报
            </button>
          </div>
          <button class="btn btn-primary btn-sm" onclick="exportReport('daily')">
            <i class="fas fa-download"></i>
            导出报表
          </button>
        </div>
      </div>
      
      <div class="grid" style="grid-template-columns: 1fr 3fr; gap: 24px;">
        <div>
          <div class="card" style="border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 20px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px;"></div>
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">选择项目</h3>
              </div>
            </div>
            <div style="padding: 12px;">
              <div class="project-select-list" style="display: flex; flex-direction: column; gap: 4px;">
                <div class="project-select-item active" data-project-id="all" style="padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s; background: #eff6ff; border: 1px solid #bfdbfe;">
                  <div style="font-size: 14px; font-weight: 500; color: #1e293b;">全部项目</div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${projects.length} 个项目</div>
                </div>
                ${projects.length > 0 ? projects.map((project, idx) => `
                  <div class="project-select-item" data-project-id="${project.id}" style="padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s; background: white; border: 1px solid #f1f5f9; hover:background: #f8fafc; hover:border-color: #e2e8f0;">
                    <div style="font-size: 14px; font-weight: 500; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                      <div style="width: 8px; height: 8px; border-radius: 50%; background: ${projectColors[idx % projectColors.length]};"></div>
                      ${project.name}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${getStatusName(project.status)}</div>
                  </div>
                `).join('') : '<div style="padding: 20px; color: var(--text-muted); text-align: center;">暂无项目</div>'}
              </div>
            </div>
          </div>
          
          <div class="card" style="margin-top: 24px; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 20px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px;"></div>
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">时间范围</h3>
              </div>
            </div>
            <div style="padding: 20px;">
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 500; color: #4b5563; margin-bottom: 6px;">开始日期</label>
                  <input type="date" id="reportStartDate" value="${getDefaultStartDate()}" style="width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; background: white;">
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 500; color: #4b5563; margin-bottom: 6px;">结束日期</label>
                  <input type="date" id="reportEndDate" value="${getToday()}" style="width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; background: white;">
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="setDateRange('today')" style="flex: 1; padding: 10px; font-size: 12px; background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; hover:background: #e2e8f0;">今日</button>
                  <button onclick="setDateRange('week')" style="flex: 1; padding: 10px; font-size: 12px; background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; hover:background: #e2e8f0;">本周</button>
                  <button onclick="setDateRange('month')" style="flex: 1; padding: 10px; font-size: 12px; background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; hover:background: #e2e8f0;">本月</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card" style="margin-top: 24px; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 20px; background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%); border-radius: 4px;"></div>
                <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">快捷统计</h3>
              </div>
            </div>
            <div style="padding: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="padding: 14px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-radius: 12px; text-align: center;">
                  <div style="font-size: 22px; font-weight: 700; color: #1e40af;">${tasks.length}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">总任务数</div>
                </div>
                <div style="padding: 14px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border-radius: 12px; text-align: center;">
                  <div style="font-size: 22px; font-weight: 700; color: #065f46;">${tasks.filter(t => t.status === 'completed').length}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">已完成</div>
                </div>
                <div style="padding: 14px; background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-radius: 12px; text-align: center;">
                  <div style="font-size: 22px; font-weight: 700; color: #92400e;">${resources.length}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">设备总数</div>
                </div>
                <div style="padding: 14px; background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border-radius: 12px; text-align: center;">
                  <div style="font-size: 22px; font-weight: 700; color: #5b21b6;">${warnings.filter(w => w.status === 'active').length}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">预警数</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div class="card" id="reportContent" style="border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
            ${renderDailyReport(tasks, resources, payments, warnings)}
          </div>
        </div>
      </div>
    </div>
  `;

  return html;
}

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function setDateRange(range) {
  const startInput = document.getElementById('reportStartDate');
  const endInput = document.getElementById('reportEndDate');
  const now = new Date();
  
  if (range === 'today') {
    startInput.value = now.toISOString().split('T')[0];
    endInput.value = now.toISOString().split('T')[0];
  } else if (range === 'week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startInput.value = startOfWeek.toISOString().split('T')[0];
    endInput.value = now.toISOString().split('T')[0];
  } else if (range === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startInput.value = startOfMonth.toISOString().split('T')[0];
    endInput.value = now.toISOString().split('T')[0];
  }
}

function renderDailyReport(tasks, resources, payments, warnings) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const taskList = tasks || [];
  const resourceList = resources || [];
  const paymentList = payments || [];
  const warningList = warnings || [];
  
  const todayTasks = taskList.filter(t => t.startDate <= todayStr && (!t.dueDate || t.dueDate >= todayStr) && t.status !== 'completed' && t.status !== 'cancelled');
  const completedToday = taskList.filter(t => t.status === 'completed');
  const inProgress = taskList.filter(t => t.status === 'in_progress');
  const todoTasks = taskList.filter(t => t.status === 'todo');
  const overdueTasks = taskList.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'completed' && t.status !== 'cancelled');
  
  const completedResources = resourceList.filter(r => r.status === 'installed').length;
  const installingResources = resourceList.filter(r => r.status === 'installing').length;
  
  const todayPayments = paymentList.filter(p => p.date === todayStr);
  const todayPaymentAmount = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const activeWarnings = warningList.filter(w => w.status === 'active');
  const urgentWarnings = warningList.filter(w => w.level === 'urgent' && w.status === 'active').length;

  return `
    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">📊 日报 - ${todayStr}</h3>
          <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">项目日报汇总 · ${new Date().toLocaleDateString('zh-CN', { weekday: 'long' })}</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary btn-sm" onclick="refreshReport()" style="padding: 8px 16px; border-radius: 8px;">
            <i class="fas fa-refresh"></i>
            刷新
          </button>
          <button class="btn btn-primary btn-sm" onclick="exportReport('daily')" style="padding: 8px 16px; border-radius: 8px;">
            <i class="fas fa-download"></i>
            导出
          </button>
        </div>
      </div>
    </div>
    
    <div style="padding: 24px;">
      <div style="grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px; display: grid;">
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-radius: 16px; padding: 20px; border: 1px solid #bfdbfe;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-tasks" style="font-size: 20px; color: #3b82f6;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">${todayTasks.length}</div>
          <div style="font-size: 12px; color: #64748b;">进行中任务</div>
        </div>
        <div style="background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border-radius: 16px; padding: 20px; border: 1px solid #86efac;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-check-circle" style="font-size: 20px; color: #10b981;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #065f46; margin-bottom: 4px;">${completedToday.length}</div>
          <div style="font-size: 12px; color: #64748b;">已完成任务</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-radius: 16px; padding: 20px; border: 1px solid #fde68a;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-clock" style="font-size: 20px; color: #f59e0b;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #92400e; margin-bottom: 4px;">${overdueTasks.length}</div>
          <div style="font-size: 12px; color: #64748b;">逾期任务</div>
        </div>
        <div style="background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border-radius: 16px; padding: 20px; border: 1px solid #ddd6fe;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-cog" style="font-size: 20px; color: #8b5cf6;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #5b21b6; margin-bottom: 4px;">${completedResources}</div>
          <div style="font-size: 12px; color: #64748b;">已安装设备</div>
        </div>
        <div style="background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); border-radius: 16px; padding: 20px; border: 1px solid #fcd34d;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(251, 146, 60, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-wrench" style="font-size: 20px; color: #f97316;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #c2410c; margin-bottom: 4px;">${installingResources}</div>
          <div style="font-size: 12px; color: #64748b;">安装中设备</div>
        </div>
        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 16px; padding: 20px; border: 1px solid #fca5a5;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 20px; color: #ef4444;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">${urgentWarnings}</div>
          <div style="font-size: 12px; color: #64748b;">紧急预警</div>
        </div>
      </div>
      
      <div style="grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; display: grid;">
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 4px; height: 16px; background: #3b82f6; border-radius: 2px;"></div>
              <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">今日任务进度</h4>
            </div>
            <span style="font-size: 12px; color: #64748b; padding: 4px 10px; background: white; border-radius: 12px;">${inProgress.length} 个任务进行中</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${inProgress.length > 0 ? inProgress.slice(0, 4).map(task => {
              const assignee = store.getUserById(task.assigneeId);
              const progressColor = task.progress >= 80 ? '#10b981' : task.progress >= 50 ? '#3b82f6' : '#f59e0b';
              return `
                <div style="padding: 14px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 14px; font-weight: 500; color: #1e293b;">${task.name}</span>
                    <span style="font-size: 12px; color: #64748b;">${assignee ? assignee.name : '未分配'}</span>
                  </div>
                  <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${task.progress || 0}%; background: ${progressColor}; border-radius: 4px; transition: width 0.3s ease;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: 6px;">
                    <span style="font-size: 12px; font-weight: 600; color: ${progressColor};">${task.progress || 0}%</span>
                    <span style="font-size: 11px; color: #94a3b8;">截止: ${task.dueDate || '未设置'}</span>
                  </div>
                </div>
              `;
            }).join('') : '<div style="padding: 20px; text-align: center; color: #94a3b8;">暂无进行中的任务</div>'}
          </div>
        </div>
        
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 4px; height: 16px; background: #f59e0b; border-radius: 2px;"></div>
              <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">待办任务</h4>
            </div>
            <span style="font-size: 12px; color: #64748b; padding: 4px 10px; background: white; border-radius: 12px;">${todoTasks.length} 个待办</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${todoTasks.length > 0 ? todoTasks.slice(0, 5).map(task => {
              const assignee = store.getUserById(task.assigneeId);
              const priorityConfig = getPriorityConfig(task.priority);
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: white; border-radius: 10px; border: 1px solid #e2e8f0; transition: all 0.2s; hover:shadow: 0 2px 8px rgba(0,0,0,0.06);">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${priorityConfig.color};"></div>
                    <span style="font-size: 14px; color: #1e293b;">${task.name}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="padding: 3px 8px; font-size: 11px; border-radius: 4px; background: ${priorityConfig.bg}; color: ${priorityConfig.color}; font-weight: 500;">${priorityConfig.name}</span>
                    <span style="font-size: 12px; color: #64748b;">${assignee ? assignee.name : '未分配'}</span>
                  </div>
                </div>
              `;
            }).join('') : '<div style="padding: 20px; text-align: center; color: #94a3b8;">暂无待办任务</div>'}
          </div>
        </div>
      </div>
      
      <div style="grid-template-columns: 1fr 1fr; gap: 24px; display: grid;">
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 4px; height: 16px; background: #10b981; border-radius: 2px;"></div>
              <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">今日费用支出</h4>
            </div>
            <span style="font-size: 16px; font-weight: 600; color: #10b981;">¥${todayPaymentAmount.toLocaleString()}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${todayPayments.length > 0 ? todayPayments.slice(0, 4).map(payment => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="padding: 4px 10px; font-size: 11px; background: rgba(99, 102, 241, 0.1); color: #6366f1; border-radius: 4px;">${payment.category || '其他'}</span>
                  <span style="font-size: 13px; color: #1e293b;">${payment.contractNo || '-'}</span>
                </div>
                <span style="font-size: 14px; font-weight: 600; color: #1e293b;">¥${payment.amount.toLocaleString()}</span>
              </div>
            `).join('') : '<div style="padding: 20px; text-align: center; color: #94a3b8;">今日暂无费用支出</div>'}
          </div>
        </div>
        
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 4px; height: 16px; background: #ef4444; border-radius: 2px;"></div>
              <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">当前预警</h4>
            </div>
            <span style="font-size: 12px; color: #64748b; padding: 4px 10px; background: white; border-radius: 12px;">${activeWarnings.length} 条预警</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${activeWarnings.length > 0 ? activeWarnings.slice(0, 4).map(warning => {
              const levelConfig = getWarningLevelConfig(warning.level);
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 10px; border-left: 3px solid ${levelConfig.color};">
                  <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 500; color: #1e293b; margin-bottom: 2px;">${warning.title}</div>
                    <div style="font-size: 12px; color: #64748b;">${warning.projectId ? (store.getProjectById(warning.projectId) ? store.getProjectById(warning.projectId).name : '未分配项目') : '未分配项目'}</div>
                  </div>
                  <span style="padding: 3px 8px; font-size: 11px; border-radius: 4px; background: ${levelConfig.bg}; color: ${levelConfig.color}; font-weight: 500; margin-left: 12px;">${levelConfig.name}</span>
                </div>
              `;
            }).join('') : '<div style="padding: 20px; text-align: center; color: #94a3b8;">暂无预警信息</div>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderWeeklyReport(tasks, resources) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const taskList = tasks || [];
  
  const weeklyTasks = taskList.filter(t => {
    return t.startDate <= endOfWeek.toISOString().split('T')[0] && 
           (!t.dueDate || t.dueDate >= startOfWeek.toISOString().split('T')[0]);
  });
  
  const completedThisWeek = weeklyTasks.filter(t => t.status === 'completed').length;
  const inProgress = weeklyTasks.filter(t => t.status === 'in_progress').length;
  const overdueWeekly = weeklyTasks.filter(t => t.dueDate && t.dueDate < now.toISOString().split('T')[0] && t.status !== 'completed').length;
  const avgProgress = weeklyTasks.length > 0 
    ? Math.round(weeklyTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / weeklyTasks.length) 
    : 0;
  
  const completedTasks = weeklyTasks.filter(t => t.status === 'completed');

  return `
    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">📊 周报 - ${startOfWeek.toISOString().split('T')[0]} 至 ${endOfWeek.toISOString().split('T')[0]}</h3>
          <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">项目周报汇总</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary btn-sm" onclick="refreshReport()" style="padding: 8px 16px; border-radius: 8px;">
            <i class="fas fa-refresh"></i>
            刷新
          </button>
          <button class="btn btn-primary btn-sm" onclick="exportReport('weekly')" style="padding: 8px 16px; border-radius: 8px;">
            <i class="fas fa-download"></i>
            导出
          </button>
        </div>
      </div>
    </div>
    
    <div style="padding: 24px;">
      <div style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; display: grid;">
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-radius: 16px; padding: 20px; border: 1px solid #bfdbfe;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-calendar-week" style="font-size: 20px; color: #3b82f6;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">${weeklyTasks.length}</div>
          <div style="font-size: 12px; color: #64748b;">本周任务数</div>
        </div>
        <div style="background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border-radius: 16px; padding: 20px; border: 1px solid #86efac;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-check-circle" style="font-size: 20px; color: #10b981;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #065f46; margin-bottom: 4px;">${completedThisWeek}</div>
          <div style="font-size: 12px; color: #64748b;">本周完成</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-radius: 16px; padding: 20px; border: 1px solid #fde68a;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-tasks" style="font-size: 20px; color: #f59e0b;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #92400e; margin-bottom: 4px;">${inProgress}</div>
          <div style="font-size: 12px; color: #64748b;">进行中</div>
        </div>
        <div style="background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border-radius: 16px; padding: 20px; border: 1px solid #ddd6fe;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-chart-line" style="font-size: 20px; color: #8b5cf6;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #5b21b6; margin-bottom: 4px;">${avgProgress}%</div>
          <div style="font-size: 12px; color: #64748b;">平均进度</div>
        </div>
      </div>
      
      <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 4px; height: 16px; background: #6366f1; border-radius: 2px;"></div>
            <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">任务完成趋势</h4>
          </div>
        </div>
        <div style="height: 200px; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; padding: 20px 0;">
          ${weeklyTrendChart(startOfWeek, weeklyTasks)}
        </div>
      </div>
      
      <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 4px; height: 16px; background: #10b981; border-radius: 2px;"></div>
            <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">本周完成任务</h4>
          </div>
          <span style="font-size: 12px; color: #64748b; padding: 4px 10px; background: white; border-radius: 12px;">${completedTasks.length} 个任务</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${completedTasks.length > 0 ? completedTasks.slice(0, 6).map(task => {
            const assignee = store.getUserById(task.assigneeId);
            return `
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 10px;">
                <div style="width: 32px; height: 32px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-check-circle" style="font-size: 16px; color: #10b981;"></i>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 14px; font-weight: 500; color: #1e293b;">${task.name}</div>
                  <div style="font-size: 12px; color: #64748b;">负责人: ${assignee ? assignee.name : '未分配'} · ${task.dueDate || '未设置'}</div>
                </div>
              </div>
            `;
          }).join('') : '<div style="padding: 20px; text-align: center; color: #94a3b8;">本周暂无完成的任务</div>'}
        </div>
      </div>
    </div>
  `;
}

function renderMonthlyReport(tasks, resources, payments) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const taskList = tasks || [];
  const resourceList = resources || [];
  const paymentList = payments || [];
  
  const monthlyTasks = taskList.filter(t => {
    return t.startDate <= endOfMonth.toISOString().split('T')[0] && 
           (!t.dueDate || t.dueDate >= startOfMonth.toISOString().split('T')[0]);
  });
  
  const completedThisMonth = monthlyTasks.filter(t => t.status === 'completed').length;
  const newTasks = monthlyTasks.filter(t => {
    const created = new Date(t.createdAt);
    return created >= startOfMonth && created <= endOfMonth;
  }).length;
  const overdueMonthly = monthlyTasks.filter(t => t.dueDate && t.dueDate < now.toISOString().split('T')[0] && t.status !== 'completed').length;
  
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
  const endOfMonthStr = endOfMonth.toISOString().split('T')[0];
  const totalBudget = resourceList.filter(r => r.purchaseDate && r.purchaseDate >= startOfMonthStr && r.purchaseDate <= endOfMonthStr).reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const spentBudget = paymentList.filter(p => p.date >= startOfMonthStr && p.date <= endOfMonthStr).reduce((sum, p) => sum + p.amount, 0);
  const budgetPercentage = totalBudget > 0 ? (spentBudget / totalBudget * 100) : 0;
  const installedCount = resourceList.filter(r => r.status === 'installed').length;
  const installingCount = resourceList.filter(r => r.status === 'installing' || r.status === 'using').length;
  const resourceTotal = resourceList.length;
  const installedPercent = resourceTotal > 0 ? (installedCount / resourceTotal * 100) : 0;
  const installingPercent = resourceTotal > 0 ? (installingCount / resourceTotal * 100) : 0;
  
  return `
    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">📊 月报 - ${now.getFullYear()}年${now.getMonth() + 1}月</h3>
          <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">项目月报汇总</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary btn-sm" onclick="refreshReport()" style="padding: 8px 16px; border-radius: 8px;">
            <i class="fas fa-refresh"></i>
            刷新
          </button>
          <button class="btn btn-primary btn-sm" onclick="exportReport('monthly')" style="padding: 8px 16px; border-radius: 8px;">
            <i class="fas fa-download"></i>
            导出
          </button>
        </div>
      </div>
    </div>
    
    <div style="padding: 24px;">
      <div style="grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; display: grid;">
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border-radius: 16px; padding: 20px; border: 1px solid #bfdbfe;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-calendar-alt" style="font-size: 20px; color: #3b82f6;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">${monthlyTasks.length}</div>
          <div style="font-size: 12px; color: #64748b;">本月任务数</div>
        </div>
        <div style="background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border-radius: 16px; padding: 20px; border: 1px solid #86efac;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-check-circle" style="font-size: 20px; color: #10b981;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #065f46; margin-bottom: 4px;">${completedThisMonth}</div>
          <div style="font-size: 12px; color: #64748b;">本月完成</div>
        </div>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border-radius: 16px; padding: 20px; border: 1px solid #fde68a;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(245, 158, 11, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-plus-circle" style="font-size: 20px; color: #f59e0b;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #92400e; margin-bottom: 4px;">${newTasks}</div>
          <div style="font-size: 12px; color: #64748b;">新增任务</div>
        </div>
        <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 16px; padding: 20px; border: 1px solid #fca5a5;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <i class="fas fa-clock" style="font-size: 20px; color: #ef4444;"></i>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">${overdueMonthly}</div>
          <div style="font-size: 12px; color: #64748b;">逾期任务</div>
        </div>
      </div>
      
      <div style="grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; display: grid;">
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 4px; height: 16px; background: #3b82f6; border-radius: 2px;"></div>
              <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">预算使用情况</h4>
            </div>
          </div>
          <div style="padding: 16px; background: white; border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-size: 14px; color: #64748b;">总预算</span>
              <span style="font-size: 14px; font-weight: 600; color: #1e293b;">¥${(totalBudget / 10000).toFixed(1)}万</span>
            </div>
            <div style="height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 12px;">
              <div style="height: 100%; width: ${budgetPercentage.toFixed(0)}%; background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%); border-radius: 6px; transition: width 0.5s ease;"></div>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-size: 14px; color: #64748b;">已使用</span>
              <span style="font-size: 14px; font-weight: 600; color: #10b981;">¥${(spentBudget / 10000).toFixed(1)}万 (${budgetPercentage.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
        
        <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 4px; height: 16px; background: #8b5cf6; border-radius: 2px;"></div>
              <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">资源安装状态</h4>
            </div>
          </div>
          <div style="padding: 16px; background: white; border-radius: 12px;">
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 13px; color: #64748b;">已安装</span>
                <span style="font-size: 13px; font-weight: 600; color: #10b981;">${installedPercent.toFixed(0)}%</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${installedPercent.toFixed(0)}%; background: #10b981; border-radius: 4px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 13px; color: #64748b;">安装中/使用中</span>
                <span style="font-size: 13px; font-weight: 600; color: #f59e0b;">${installingPercent.toFixed(0)}%</span>
              </div>
              <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${installingPercent.toFixed(0)}%; background: #f59e0b; border-radius: 4px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 4px; height: 16px; background: #1e293b; border-radius: 2px;"></div>
            <h4 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">本月任务完成明细</h4>
          </div>
          <span style="font-size: 12px; color: #64748b; padding: 4px 10px; background: white; border-radius: 12px;">${monthlyTasks.length} 个任务</span>
        </div>
        <div style="background: white; border-radius: 12px; overflow: hidden;">
          ${monthlyTasks.length > 0 ? monthlyTasksTable(monthlyTasks) : '<div style="padding: 20px; text-align: center; color: #94a3b8;">暂无任务数据</div>'}
        </div>
      </div>
    </div>
  `;
}

function weeklyTrendChart(startOfWeek, weeklyTasks) {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  let html = '';
  
  days.forEach((day, idx) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + idx);
    const dayStr = dayDate.toISOString().split('T')[0];
    const dayCompleted = weeklyTasks.filter(t => t.status === 'completed' && (!t.completedAt || t.completedAt <= dayStr)).length;
    const maxCompleted = Math.max(...weeklyTasks.filter(t => t.status === 'completed').map((_, i) => i + 1), 1);
    const height = (dayCompleted / maxCompleted) * 100;
    
    html += '<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">';
    html += '<div style="width: 100%; max-width: 40px; height: 140px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: flex-end; overflow: hidden;">';
    html += '<div style="width: 100%; height: ' + height + '%; background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; transition: height 0.5s ease;"></div>';
    html += '</div>';
    html += '<span style="font-size: 12px; color: #64748b;">' + day + '</span>';
    html += '<span style="font-size: 12px; font-weight: 600; color: #1e293b;">' + dayCompleted + '</span>';
    html += '</div>';
  });
  
  return html;
}

function monthlyTasksTable(tasks) {
  let html = '<table style="width: 100%; border-collapse: collapse;">';
  html += '<thead>';
  html += '<tr style="background: #f9fafb;">';
  html += '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">任务名称</th>';
  html += '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">负责人</th>';
  html += '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">状态</th>';
  html += '<th style="padding: 12px 16px; font-weight: 600; color: #4b5563; font-size: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">进度</th>';
  html += '</tr></thead><tbody>';
  
  tasks.slice(0, 8).forEach(task => {
    const assignee = store.getUserById(task.assigneeId);
    const progressColor = task.progress >= 80 ? '#10b981' : task.progress >= 50 ? '#3b82f6' : '#f59e0b';
    const statusClass = task.status === 'completed' ? 'tag-success' : task.status === 'in_progress' ? 'tag-warning' : 'tag-default';
    
    html += '<tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseenter="this.style.background=\'#fafafa\'" onmouseleave="this.style.background=\'transparent\'">';
    html += '<td style="padding: 12px 16px; font-size: 13px; color: #1e293b; font-weight: 500;">' + task.name + '</td>';
    html += '<td style="padding: 12px 16px; font-size: 13px; color: #64748b;">' + (assignee ? assignee.name : '未分配') + '</td>';
    html += '<td style="padding: 12px 16px;"><span style="font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 500;" class="' + statusClass + '">' + getTaskStatusName(task.status) + '</span></td>';
    html += '<td style="padding: 12px 16px;"><div style="display: flex; align-items: center; gap: 8px;"><div style="width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;"><div style="height: 100%; width: ' + (task.progress || 0) + '%; background: ' + progressColor + '; border-radius: 3px;"></div></div><span style="font-size: 12px; font-weight: 600; color: ' + progressColor + ';">' + (task.progress || 0) + '%</span></div></td>';
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
}

function getPriorityConfig(priority) {
  const configs = {
    urgent: { name: '紧急', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    high: { name: '高', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    medium: { name: '中', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    low: { name: '低', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
  };
  return configs[priority] || configs.medium;
}

function getWarningLevelConfig(level) {
  const configs = {
    urgent: { name: '紧急', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    high: { name: '高', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    medium: { name: '中', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' }
  };
  return configs[level] || configs.medium;
}

function exportReport(type) {
  const content = document.getElementById('reportContent').innerHTML;
  const blob = new Blob(['<!DOCTYPE html><html><head><meta charset="utf-8"><title>项目报表</title></head><body>' + content + '</body></html>'], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `项目${type === 'daily' ? '日报' : type === 'weekly' ? '周报' : '月报'}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  store.addNotification({
    type: 'success',
    title: '导出成功',
    message: `项目${type === 'daily' ? '日报' : type === 'weekly' ? '周报' : '月报'}已导出`
  });
}

function refreshReport() {
  renderContent();
}

function attachReportEvents() {
  const viewButtons = document.querySelectorAll('.view-toggle button');
  viewButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      viewButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const view = this.dataset.view;
      const state = store.getState();
      const tasks = state.tasks || [];
      const resources = state.resources || [];
      const payments = state.payments || [];
      const warnings = state.warnings || [];
      
      const content = document.getElementById('reportContent');
      if (content) {
        if (view === 'daily') {
          content.innerHTML = renderDailyReport(tasks, resources, payments, warnings);
        } else if (view === 'weekly') {
          content.innerHTML = renderWeeklyReport(tasks, resources);
        } else if (view === 'monthly') {
          content.innerHTML = renderMonthlyReport(tasks, resources, payments);
        }
      }
    });
  });
  
  const projectItems = document.querySelectorAll('.project-select-item');
  projectItems.forEach(item => {
    item.addEventListener('click', function() {
      projectItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      const projectId = this.dataset.projectId;
      store.setState({ currentProjectId: projectId === 'all' ? null : projectId });
      renderContent();
    });
  });
}

function initCharts() {
}

window.renderReports = renderReports;
window.attachReportEvents = attachReportEvents;
window.initCharts = initCharts;
