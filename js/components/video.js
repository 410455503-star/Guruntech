// 视频监控管理模块

// 视频播放状态管理
let videoPlayers = {};

// EZOPEN配置
let EZOPEN_CONFIG = {
  apiUrl: 'https://open.ys7.com',
  appKey: 'f8a8cd2462554e5084b4d8e7a2b5fa70',
  appSecret: 'cd46c4413fa2e11f410ff32b6ff8e7fa',
  accessToken: '',
  tokenExpireTime: 0
};

// 加载EZOPEN配置
function loadEzopenConfig() {
  const config = localStorage.getItem('ezopen_config');
  if (config) {
    EZOPEN_CONFIG = { ...EZOPEN_CONFIG, ...JSON.parse(config) };
  } else {
    localStorage.setItem('ezopen_config', JSON.stringify({
      apiUrl: EZOPEN_CONFIG.apiUrl,
      appKey: EZOPEN_CONFIG.appKey,
      appSecret: EZOPEN_CONFIG.appSecret,
      accessToken: '',
      tokenExpireTime: 0
    }));
  }
}

// 保存EZOPEN配置
function saveEzopenConfig() {
  localStorage.setItem('ezopen_config', JSON.stringify(EZOPEN_CONFIG));
}

// 获取EZOPEN Access Token
async function getEzopenAccessToken() {
  const now = Date.now();
  
  if (EZOPEN_CONFIG.accessToken && EZOPEN_CONFIG.tokenExpireTime > now + 60000) {
    return EZOPEN_CONFIG.accessToken;
  }
  
  if (!EZOPEN_CONFIG.appKey || !EZOPEN_CONFIG.appSecret) {
    alert('请先在系统设置中配置萤石云APP Key和APP Secret');
    return null;
  }
  
  try {
    const response = await fetch(`${EZOPEN_CONFIG.apiUrl}/api/lapp/token/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `appKey=${encodeURIComponent(EZOPEN_CONFIG.appKey)}&appSecret=${encodeURIComponent(EZOPEN_CONFIG.appSecret)}`
    });
    
    const data = await response.json();
    if (data.code === '200') {
      EZOPEN_CONFIG.accessToken = data.data.accessToken;
      EZOPEN_CONFIG.tokenExpireTime = now + (data.data.expireTime * 1000);
      saveEzopenConfig();
      return data.data.accessToken;
    } else {
      console.error('获取EZOPEN Token失败:', data.msg);
      store.addNotification({
        type: 'error',
        title: '获取Token失败',
        message: data.msg || '请检查APP Key和APP Secret'
      });
      return null;
    }
  } catch (error) {
    console.error('获取EZOPEN Token异常:', error);
    store.addNotification({
      type: 'error',
      title: '获取Token失败',
      message: '网络连接问题，请稍后重试'
    });
    return null;
  }
}

// 获取萤石云EZOPEN流地址（基于官方文档 https://open.ys7.com/help/1414）
async function getEzopenUrl(camera) {
  if (!camera.serial) return null;
  
  const token = await getEzopenAccessToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${EZOPEN_CONFIG.apiUrl}/api/lapp/v2/live/address/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `accessToken=${encodeURIComponent(token)}&deviceSerial=${encodeURIComponent(camera.serial)}&channelNo=${camera.channel || 1}&protocol=1`
    });
    
    const data = await response.json();
    if (data.code === '200') {
      return { url: data.data.url, token: token };
    } else {
      console.error('获取EZOPEN地址失败:', data.msg);
      return null;
    }
  } catch (error) {
    console.error('获取EZOPEN地址异常:', error);
    return null;
  }
}

// 渲染视频监控页面
function renderVideoMonitoring() {
  const state = store.getState();
  const cameras = state.cameras || [];
  const projects = state.projects || [];

  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">视频监控</h1>
        <p class="page-description">项目现场视频监控管理，支持萤石云摄像头接入</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showAddCameraModal()">
          <i class="fas fa-plus"></i>
          添加摄像头
        </button>
        <button class="btn btn-secondary" onclick="showEzopenConfigModal()">
          <i class="fas fa-cog"></i>
          萤石云配置
        </button>
      </div>
    </div>

    <div class="stats-bar" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="stat-item" style="background: var(--bg-white); border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 28px; font-weight: 700; color: var(--primary-color);">${cameras.length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-video"></i> 摄像头总数</div>
      </div>
      <div class="stat-item" style="background: var(--bg-white); border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 28px; font-weight: 700; color: var(--success-color);">${cameras.filter(c => c.status === 'online').length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-signal"></i> 在线</div>
      </div>
      <div class="stat-item" style="background: var(--bg-white); border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 28px; font-weight: 700; color: var(--danger-color);">${cameras.filter(c => c.status === 'offline').length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-video-slash"></i> 离线</div>
      </div>
      <div class="stat-item" style="background: var(--bg-white); border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div style="font-size: 28px; font-weight: 700; color: var(--warning-color);">${projects.length}</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fas fa-building"></i> 监控项目</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header" style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 16px; font-weight: 600;">摄像头列表</h3>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <select style="padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb;" id="videoProjectFilter" onchange="filterCameras()">
            <option value="all">全部项目</option>
            <option value="unassigned">未关联项目</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
          <select style="padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb;" id="videoStatusFilter" onchange="filterCameras()">
            <option value="all">全部状态</option>
            <option value="online">在线</option>
            <option value="offline">离线</option>
          </select>
          <button style="padding: 8px 16px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: #ffffff; color: #64748b; cursor: pointer;" onclick="resetCameraFilter()">
            <i class="fas fa-undo"></i>
            重置
          </button>
        </div>
      </div>
      <div style="padding: 20px;">
        ${cameras.length === 0 ? renderEmptyVideoState() : renderCameraByProject(cameras, projects)}
      </div>
    </div>

    ${renderVideoPlayerModal()}
    ${renderEzopenConfigModal()}
  `;

  return html;
}

function renderEmptyVideoState() {
  return `
    <div class="empty-state" style="padding: 48px;">
      <i class="fas fa-video" style="font-size: 64px; color: #d1d5db;"></i>
      <h3 style="margin-top: 16px;">暂无摄像头</h3>
      <p class="text-muted">点击"添加摄像头"接入萤石云设备</p>
      <button class="btn btn-primary mt-16" onclick="showAddCameraModal()">
        <i class="fas fa-plus"></i>
        添加摄像头
      </button>
    </div>
  `;
}

function renderEmptyFilterState(projectFilter, statusFilter) {
  const state = store.getState();
  const projects = state.projects || [];
  const project = projects.find(p => p.id === projectFilter);
  const projectName = project ? project.name : (projectFilter === 'unassigned' ? '未关联项目' : '');
  
  let message = '没有找到匹配的摄像头';
  if (projectName) {
    message = `项目"${projectName}"下没有摄像头`;
  } else if (statusFilter !== 'all') {
    message = `没有${statusFilter === 'online' ? '在线' : '离线'}的摄像头`;
  }

  return `
    <div class="empty-state" style="padding: 48px;">
      <i class="fas fa-search" style="font-size: 64px; color: #d1d5db;"></i>
      <h3 style="margin-top: 16px;">${message}</h3>
      <p class="text-muted" style="margin-bottom: 16px;">请调整筛选条件或添加摄像头</p>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" onclick="resetCameraFilter()">
          <i class="fas fa-undo"></i>
          重置筛选
        </button>
        <button class="btn btn-primary" onclick="showAddCameraModal()">
          <i class="fas fa-plus"></i>
          添加摄像头
        </button>
      </div>
    </div>
  `;
}

function resetCameraFilter() {
  const projectFilter = document.getElementById('videoProjectFilter');
  const statusFilter = document.getElementById('videoStatusFilter');
  if (projectFilter) projectFilter.value = 'all';
  if (statusFilter) statusFilter.value = 'all';
  filterCameras();
}

function renderCameraByProject(cameras, projects) {
  const camerasByProject = {};
  const unassignedCameras = [];

  cameras.forEach(camera => {
    if (camera.projectId && camera.projectId !== '') {
      if (!camerasByProject[camera.projectId]) {
        camerasByProject[camera.projectId] = [];
      }
      camerasByProject[camera.projectId].push(camera);
    } else {
      unassignedCameras.push(camera);
    }
  });

  let html = '';

  projects.forEach(project => {
    const projectCameras = camerasByProject[project.id];
    if (projectCameras && projectCameras.length > 0) {
      html += `
        <div class="project-camera-group" style="margin-bottom: 32px;">
          <div class="project-group-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px;"></div>
            <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">${project.name}</h3>
            <span style="padding: 4px 10px; background: #dbeafe; color: #1d4ed8; border-radius: 12px; font-size: 12px; font-weight: 500;">${projectCameras.length} 个摄像头</span>
          </div>
          <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
            ${projectCameras.map(camera => renderCameraCard(camera)).join('')}
          </div>
        </div>
      `;
    }
  });

  if (unassignedCameras.length > 0) {
    html += `
      <div class="project-camera-group" style="margin-bottom: 32px;">
        <div class="project-group-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #6b7280 0%, #4b5563 100%); border-radius: 4px;"></div>
          <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">未关联项目</h3>
          <span style="padding: 4px 10px; background: #f3f4f6; color: #4b5563; border-radius: 12px; font-size: 12px; font-weight: 500;">${unassignedCameras.length} 个摄像头</span>
        </div>
        <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${unassignedCameras.map(camera => renderCameraCard(camera)).join('')}
        </div>
      </div>
    `;
  }

  return html;
}

function renderCameraGrid(cameras) {
  return `
    <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
      ${cameras.map(camera => renderCameraCard(camera)).join('')}
    </div>
  `;
}

function renderCameraCard(camera) {
  const project = store.getProjectById(camera.projectId);
  const isOnline = camera.status === 'online';

  return `
    <div class="camera-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
      <div class="camera-preview" style="position: relative; height: 180px; background: linear-gradient(135deg, #1f2937 0%, #374151 100%);">
        <div id="camera-preview-${camera.id}" class="camera-preview-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          ${isOnline ? `
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: white;"></i>
          ` : `
            <div style="text-align: center; color: #9ca3af;">
              <i class="fas fa-video-slash" style="font-size: 32px; margin-bottom: 8px;"></i>
              <div style="font-size: 12px;">离线</div>
            </div>
          `}
        </div>
        <div class="camera-status" style="position: absolute; top: 8px; right: 8px;">
          <span class="status-badge ${isOnline ? 'status-online' : 'status-offline'}" style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; ${isOnline ? 'background: #10b981; color: white;' : 'background: #6b7280; color: white;'}">
            <i class="fas ${isOnline ? 'fa-signal' : 'fa-wifi-slash'}" style="margin-right: 4px;"></i>
            ${isOnline ? '在线' : '离线'}
          </span>
        </div>
        <div class="camera-ptz" style="position: absolute; bottom: 8px; right: 8px; display: flex; gap: 4px;">
          <button onclick="showPtzControl('${camera.id}')" style="width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.5); border: none; color: white; cursor: pointer;" title="云台控制">
            <i class="fas fa-arrows-alt"></i>
          </button>
          <button onclick="toggleCameraPreviewFullscreen('${camera.id}')" style="width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.5); border: none; color: white; cursor: pointer;" title="全屏">
            <i class="fas fa-expand"></i>
          </button>
        </div>
      </div>
      <div class="camera-info" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <h4 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0;">${camera.name}</h4>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${camera.serial || '未配置设备序列号'}</div>
          </div>
          <span class="tag ${project ? 'tag-primary' : 'tag-default'}" style="font-size: 11px;">
            ${project ? project.name : '未关联'}
          </span>
        </div>
        <div style="font-size: 12px; color: #9ca3af; margin-bottom: 12px;">
          <i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>
          ${camera.location || '位置未设置'}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" onclick="playVideo('${camera.id}')" style="flex: 1;">
            <i class="fas fa-play"></i> 观看
          </button>
          <button class="btn btn-secondary btn-sm" onclick="showEditCameraModal('${camera.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteCamera('${camera.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderEzopenConfigModal() {
  const config = localStorage.getItem('ezopen_config');
  let appKey = '';
  let appSecret = '';
  
  if (config) {
    const parsed = JSON.parse(config);
    appKey = parsed.appKey || '';
    appSecret = parsed.appSecret || '';
  }
  
  return `
    <div class="modal-overlay" id="ezopenConfigModal" style="display: none;">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px;"></div>
            <h3 style="font-size: 18px; font-weight: 600; margin: 0;">萤石云配置</h3>
          </div>
          <button class="modal-close" onclick="closeModal('ezopenConfigModal')" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af;">&times;</button>
        </div>
        <div class="modal-body" style="padding: 24px;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">APP Key <span style="color: red;">*</span></label>
            <input type="text" id="ezopenConfigAppKey" value="${appKey}" placeholder="请输入萤石云APP Key" style="width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">APP Secret <span style="color: red;">*</span></label>
            <input type="text" id="ezopenConfigAppSecret" value="${appSecret}" placeholder="请输入萤石云APP Secret" style="width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
          </div>
          <div style="padding: 12px 16px; background: #eff6ff; border-radius: 8px; font-size: 13px; color: #1e40af;">
            <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
            在萤石开放平台(https://open.ys7.com)注册账号并创建应用，获取APP Key和APP Secret
          </div>
        </div>
        <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
          <button class="btn btn-secondary" onclick="closeModal('ezopenConfigModal')" style="padding: 10px 20px; border-radius: 8px;">
            <i class="fas fa-times"></i> 取消
          </button>
          <button class="btn btn-primary" onclick="testEzopenConfig()" style="padding: 10px 20px; border-radius: 8px;">
            <i class="fas fa-check-circle"></i> 测试连接
          </button>
          <button class="btn btn-primary" onclick="saveEzopenConfig()" style="padding: 10px 20px; border-radius: 8px;">
            <i class="fas fa-save"></i> 保存配置
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderVideoPlayerModal() {
  return `
    <div class="video-player-modal" id="videoPlayerModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 100000; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: #1f2937;">
        <h3 id="videoPlayerTitle" style="color: white; margin: 0; font-size: 18px;">视频监控</h3>
        <div style="display: flex; gap: 12px;">
          <button onclick="togglePlayerFullscreen()" style="padding: 8px 16px; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: white; cursor: pointer;">
            <i class="fas fa-expand"></i>
          </button>
          <button onclick="closeVideoPlayer()" style="padding: 8px 16px; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: white; cursor: pointer;">
            <i class="fas fa-times"></i> 关闭
          </button>
        </div>
      </div>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; position: relative;">
        <div id="videoContainer" style="width: 100%; height: 100%;"></div>
        <div id="videoLoadingOverlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white;">
          <i class="fas fa-spinner fa-spin" style="font-size: 48px;"></i>
          <div style="margin-top: 12px;">正在加载视频...</div>
        </div>
      </div>
      <div style="padding: 16px 24px; background: #1f2937; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 8px;">
          <button onclick="setVideoQuality('HD')" class="quality-btn active" data-quality="HD" style="padding: 6px 12px; background: #10b981; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">高清</button>
          <button onclick="setVideoQuality('SD')" class="quality-btn" data-quality="SD" style="padding: 6px 12px; background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">标清</button>
        </div>
        <div id="videoInfo" style="color: #9ca3af; font-size: 12px;"></div>
      </div>
    </div>
  `;
}

// 显示萤石云配置弹窗
function showEzopenConfigModal() {
  const modal = document.getElementById('ezopenConfigModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// 测试萤石云配置连接
async function testEzopenConfig() {
  const appKey = document.getElementById('ezopenConfigAppKey')?.value || '';
  const appSecret = document.getElementById('ezopenConfigAppSecret')?.value || '';
  
  if (!appKey || !appSecret) {
    store.addNotification({
      type: 'error',
      title: '配置不完整',
      message: '请填写APP Key和APP Secret'
    });
    return;
  }
  
  try {
    const response = await fetch('https://open.ys7.com/api/lapp/token/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `appKey=${encodeURIComponent(appKey)}&appSecret=${encodeURIComponent(appSecret)}`
    });
    
    const data = await response.json();
    if (data.code === '200') {
      store.addNotification({
        type: 'success',
        title: '连接成功',
        message: '萤石云配置测试成功，可以正常播放视频'
      });
    } else {
      store.addNotification({
        type: 'error',
        title: '连接失败',
        message: data.msg || '请检查APP Key和APP Secret是否正确'
      });
    }
  } catch (error) {
    store.addNotification({
      type: 'error',
      title: '连接失败',
      message: '网络连接异常，请检查网络'
    });
  }
}

// 保存萤石云配置
function saveEzopenConfig() {
  const appKey = document.getElementById('ezopenConfigAppKey')?.value || '';
  const appSecret = document.getElementById('ezopenConfigAppSecret')?.value || '';
  
  if (!appKey || !appSecret) {
    store.addNotification({
      type: 'error',
      title: '配置不完整',
      message: '请填写APP Key和APP Secret'
    });
    return;
  }
  
  localStorage.setItem('ezopen_config', JSON.stringify({
    apiUrl: 'https://open.ys7.com',
    appKey: appKey,
    appSecret: appSecret,
    accessToken: '',
    tokenExpireTime: 0
  }));
  
  loadEzopenConfig();
  
  store.addNotification({
    type: 'success',
    title: '配置保存成功',
    message: '萤石云配置已保存'
  });
  
  closeModal('ezopenConfigModal');
}

// 显示添加摄像头弹窗
function showAddCameraModal() {
  const state = store.getState();
  const projects = state.projects || [];

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">添加摄像头</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('addCameraModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="addCameraForm">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">摄像头名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="如：工地大门摄像头">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">设备序列号 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="serial" required placeholder="如：DS-2CD12345678">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">通道号</label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="channel" value="1" min="1" max="32">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">关联项目</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
              <option value="">不关联项目</option>
              ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">安装位置</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="location" placeholder="如：工地大门、搅拌站、办公区">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">摄像头类型</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type">
              <option value="fixed">固定摄像头</option>
              <option value="ptz">云台摄像头</option>
              <option value="ball">球机摄像头</option>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; min-height: 80px;" name="remark" placeholder="其他备注信息"></textarea>
          </div>
        </form>

        <div style="padding: 12px 16px; background: #eff6ff; border-radius: 8px; font-size: 13px; color: #1e40af; margin-bottom: 20px;">
          <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
          EZOPEN取流方式：需要在系统设置中配置萤石云APP Key和APP Secret<br>
          设备序列号可在萤石云客户端或设备标签上查看
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('addCameraModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);" onclick="handleAddCamera()">
          <i class="fas fa-plus"></i> 添加
        </button>
      </div>
    </div>
  `;

  showModal('addCameraModal', contentHtml);
}

// 处理添加摄像头
function handleAddCamera() {
  const form = document.getElementById('addCameraForm');
  const formData = new FormData(form);

  const data = {
    name: formData.get('name'),
    serial: formData.get('serial'),
    channel: parseInt(formData.get('channel')) || 1,
    projectId: formData.get('projectId') || null,
    location: formData.get('location'),
    type: formData.get('type') || 'fixed',
    remark: formData.get('remark'),
    status: 'offline',
    createdAt: new Date().toISOString()
  };

  if (!data.name || !data.serial) {
    alert('请填写必填项');
    return;
  }

  store.addCamera(data);
  closeModal('addCameraModal');
  renderContent();

  store.addNotification({
    type: 'success',
    title: '摄像头添加成功',
    message: `摄像头"${data.name}"已添加`
  });
}

// 显示编辑摄像头弹窗
function showEditCameraModal(cameraId) {
  const camera = store.getCameraById(cameraId);
  if (!camera) return;

  const state = store.getState();
  const projects = state.projects || [];

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑摄像头</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editCameraModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <form id="editCameraForm">
          <input type="hidden" name="id" value="${camera.id}">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">摄像头名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required value="${camera.name}">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">设备序列号 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="serial" required value="${camera.serial || ''}" placeholder="如：DS-2CD12345678">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">通道号</label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="channel" value="${camera.channel || 1}" min="1" max="32">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">关联项目</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
              <option value="">不关联项目</option>
              ${projects.map(p => `<option value="${p.id}" ${camera.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">安装位置</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="location" value="${camera.location || ''}" placeholder="如：工地大门、搅拌站、办公区">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">摄像头类型</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type">
              <option value="fixed" ${camera.type === 'fixed' ? 'selected' : ''}>固定摄像头</option>
              <option value="ptz" ${camera.type === 'ptz' ? 'selected' : ''}>云台摄像头</option>
              <option value="ball" ${camera.type === 'ball' ? 'selected' : ''}>球机摄像头</option>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">备注</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; min-height: 80px;" name="remark">${camera.remark || ''}</textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('editCameraModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #3b82f6; color: white; border: none; cursor: pointer;" onclick="handleEditCamera()">保存</button>
      </div>
    </div>
  `;

  showModal('editCameraModal', contentHtml);
}

// 处理编辑摄像头
function handleEditCamera() {
  const form = document.getElementById('editCameraForm');
  const formData = new FormData(form);

  const cameraId = formData.get('id');
  const data = {
    name: formData.get('name'),
    serial: formData.get('serial'),
    channel: parseInt(formData.get('channel')) || 1,
    projectId: formData.get('projectId') || null,
    location: formData.get('location'),
    type: formData.get('type'),
    remark: formData.get('remark')
  };

  if (!data.name || !data.serial) {
    alert('请填写必填项');
    return;
  }

  store.updateCamera(cameraId, data);
  closeModal('editCameraModal');
  renderContent();

  store.addNotification({
    type: 'success',
    title: '摄像头更新成功',
    message: `摄像头"${data.name}"信息已更新`
  });
}

// 确认删除摄像头
function confirmDeleteCamera(cameraId) {
  const camera = store.getCameraById(cameraId);
  if (!camera) return;

  if (confirm(`确定要删除摄像头"${camera.name}"吗？此操作不可恢复。`)) {
    store.deleteCamera(cameraId);
    renderContent();

    store.addNotification({
      type: 'warning',
      title: '摄像头已删除',
      message: `摄像头"${camera.name}"已被删除`
    });
  }
}

// 播放视频
async function playVideo(cameraId) {
  const camera = store.getCameraById(cameraId);
  if (!camera) return;

  const modal = document.getElementById('videoPlayerModal');
  const title = document.getElementById('videoPlayerTitle');
  const loading = document.getElementById('videoLoadingOverlay');
  const info = document.getElementById('videoInfo');
  const videoContainer = document.getElementById('videoContainer');

  if (modal && videoContainer) {
    title.textContent = camera.name;
    modal.style.display = 'flex';
    loading.style.display = 'block';
    loading.innerHTML = `
      <div style="text-align: center; color: white;">
        <i class="fas fa-spinner fa-spin" style="font-size: 48px;"></i>
        <div style="margin-top: 12px;">正在连接视频流...</div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">请稍候，首次加载可能需要几秒钟</div>
      </div>
    `;
    info.textContent = `设备序列号: ${camera.serial || '未设置'} | 位置: ${camera.location || '未设置'}`;

    if (camera.serial) {
      videoContainer.innerHTML = '';

      try {
        // 获取EZOPEN流地址
        const result = await getEzopenUrl(camera);
        if (!result) {
          loading.innerHTML = `
            <div style="text-align: center; color: #ef4444;">
              <i class="fas fa-exclamation-triangle" style="font-size: 48px;"></i>
              <div style="margin-top: 12px;">获取EZOPEN流地址失败</div>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">请检查设备配置和网络连接</div>
              <button onclick="playVideo('${cameraId}')" style="margin-top: 12px; padding: 8px 20px; background: #3b82f6; border: none; border-radius: 6px; color: white; cursor: pointer;">
                <i class="fas fa-redo"></i> 重新加载
              </button>
            </div>
          `;
          return;
        }

        // 使用萤石云官方H5播放器（iframe嵌入方式播放EZOPEN流）
        // 参考: https://icnopen.ezviz.com/help/1750
        const iframeUrl = `https://icnopen.ezviz.com/ezopen/h5/iframe?url=${encodeURIComponent(result.url)}&autoplay=1&accessToken=${result.token}`;
        
        const iframe = document.createElement('iframe');
        iframe.src = iframeUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.objectFit = 'contain';
        iframe.allowFullscreen = true;
        iframe.title = camera.name;

        iframe.onload = () => {
          loading.style.display = 'none';
        };

        iframe.onerror = () => {
          loading.innerHTML = `
            <div style="text-align: center; color: #ef4444;">
              <i class="fas fa-exclamation-triangle" style="font-size: 48px;"></i>
              <div style="margin-top: 12px;">视频加载失败</div>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">请检查设备配置和网络连接</div>
              <button onclick="playVideo('${cameraId}')" style="margin-top: 12px; padding: 8px 20px; background: #3b82f6; border: none; border-radius: 6px; color: white; cursor: pointer;">
                <i class="fas fa-redo"></i> 重新加载
              </button>
            </div>
          `;
        };

        videoContainer.appendChild(iframe);
        
        // 保存iframe引用和消息处理函数
        const messageHandler = (event) => {
          try {
            if (event.origin !== 'https://icnopen.ezviz.com') {
              return;
            }
            if (typeof event.data === 'object') {
              if (event.source && event.data && event.data.type) {
                try {
                  if (event.data.type === 'request' && event.data.requestId) {
                    event.source.postMessage({
                      type: 'response',
                      requestId: event.data.requestId,
                      data: {}
                    }, event.origin);
                  }
                } catch (e) {
                  // 忽略发送响应失败
                }
              }
            }
          } catch (e) {
            // 忽略所有错误
          }
        };
        window.addEventListener('message', messageHandler, false);
        
        videoPlayers[cameraId] = { iframe: iframe, type: 'iframe', messageHandler: messageHandler };
      } catch (error) {
        console.error('视频播放失败:', error);
        loading.innerHTML = `
          <div style="text-align: center; color: #ef4444;">
            <i class="fas fa-times-circle" style="font-size: 48px;"></i>
            <div style="margin-top: 12px;">视频播放失败</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">${error.message || '请检查网络连接'}</div>
            <button onclick="playVideo('${cameraId}')" style="margin-top: 12px; padding: 8px 20px; background: #3b82f6; border: none; border-radius: 6px; color: white; cursor: pointer;">
              <i class="fas fa-redo"></i> 重新加载
            </button>
          </div>
        `;
      }
    } else {
      loading.innerHTML = `
        <div style="text-align: center;">
          <i class="fas fa-video" style="font-size: 48px; color: #10b981;"></i>
          <div style="margin-top: 12px;">演示模式</div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">请配置设备序列号</div>
        </div>
      `;
    }
  }
}

// 关闭视频播放器
function closeVideoPlayer() {
  const modal = document.getElementById('videoPlayerModal');
  const videoContainer = document.getElementById('videoContainer');

  if (modal) {
    modal.style.display = 'none';

    // 停止播放器
    Object.keys(videoPlayers).forEach(key => {
      if (videoPlayers[key].hls) {
        videoPlayers[key].hls.destroy();
      } else if (videoPlayers[key].player && typeof videoPlayers[key].player.destroy === 'function') {
        videoPlayers[key].player.destroy();
      } else if (videoPlayers[key].messageHandler) {
        window.removeEventListener('message', videoPlayers[key].messageHandler);
      }
    });
    videoPlayers = {};

    // 清除视频容器
    if (videoContainer) {
      videoContainer.innerHTML = '';
    }
  }
}

// 云台控制
function showPtzControl(cameraId) {
  const camera = store.getCameraById(cameraId);
  if (!camera) return;

  if (camera.type !== 'ptz' && camera.type !== 'ball') {
    alert('此摄像头不支持云台控制');
    return;
  }

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 400px; width: 95%; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">云台控制 - ${camera.name}</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('ptzControlModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 180px; margin: 0 auto;">
          <div></div>
          <button onclick="controlPtz('${cameraId}', 'up')" style="width: 50px; height: 50px; border-radius: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; cursor: pointer; font-size: 18px;">
            <i class="fas fa-chevron-up"></i>
          </button>
          <div></div>

          <button onclick="controlPtz('${cameraId}', 'left')" style="width: 50px; height: 50px; border-radius: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; cursor: pointer; font-size: 18px;">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button onclick="controlPtz('${cameraId}', 'zoom')" style="width: 50px; height: 50px; border-radius: 8px; background: #3b82f6; border: none; color: white; cursor: pointer; font-size: 18px;">
            <i class="fas fa-expand"></i>
          </button>
          <button onclick="controlPtz('${cameraId}', 'right')" style="width: 50px; height: 50px; border-radius: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; cursor: pointer; font-size: 18px;">
            <i class="fas fa-chevron-right"></i>
          </button>

          <div></div>
          <button onclick="controlPtz('${cameraId}', 'down')" style="width: 50px; height: 50px; border-radius: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; cursor: pointer; font-size: 18px;">
            <i class="fas fa-chevron-down"></i>
          </button>
          <div></div>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <div style="font-size: 12px; color: #9ca3af;">提示：云台控制需要萤石云API支持</div>
        </div>
      </div>
    </div>
  `;

  showModal('ptzControlModal', contentHtml);
}

// 云台控制命令
async function controlPtz(cameraId, direction) {
  const token = await getEzopenAccessToken();
  if (!token) {
    alert('请先配置萤石云APP Key和Secret');
    return;
  }

  const camera = store.getCameraById(cameraId);
  if (!camera) return;

  const directionMap = {
    'up': 0,
    'right': 1,
    'down': 2,
    'left': 3
  };

  try {
    const response = await fetch(`${EZOPEN_CONFIG.apiUrl}/api/lapp/device/ptz/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `accessToken=${encodeURIComponent(token)}&deviceSerial=${encodeURIComponent(camera.serial)}&direction=${directionMap[direction]}&speed=1`
    });

    const data = await response.json();
    if (data.code === '200') {
      store.addNotification({
        type: 'success',
        title: '云台控制成功',
        message: `已发送${direction}方向指令`
      });
    } else {
      store.addNotification({
        type: 'error',
        title: '云台控制失败',
        message: data.msg || '请检查萤石云配置'
      });
    }
  } catch (error) {
    console.error('云台控制失败:', error);
  }
}

// 筛选摄像头
function filterCameras() {
  const projectFilter = document.getElementById('videoProjectFilter')?.value || 'all';
  const statusFilter = document.getElementById('videoStatusFilter')?.value || 'all';

  let cameras = store.getState().cameras || [];

  if (projectFilter !== 'all') {
    if (projectFilter === 'unassigned') {
      cameras = cameras.filter(c => !c.projectId || c.projectId === '' || c.projectId === null);
    } else {
      cameras = cameras.filter(c => c.projectId === projectFilter);
    }
  }

  if (statusFilter !== 'all') {
    cameras = cameras.filter(c => c.status === statusFilter);
  }

  const content = document.querySelector('.video-grid');
  if (content) {
    content.innerHTML = cameras.length === 0 ? renderEmptyFilterState(projectFilter, statusFilter) : renderCameraGrid(cameras);
  }
}

// 摄像头预览全屏切换
function toggleCameraPreviewFullscreen(cameraId) {
  const preview = document.getElementById(`camera-preview-${cameraId}`);
  if (preview) {
    if (preview.requestFullscreen) {
      preview.requestFullscreen();
    }
  }
}

// 播放器全屏
function togglePlayerFullscreen() {
  const video = document.getElementById('hlsVideoPlayer');
  if (video) {
    if (!document.fullscreenElement) {
      video.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  } else {
    // 如果没有视频元素，对整个播放器模态框全屏
    const modal = document.getElementById('videoPlayerModal');
    if (modal) {
      if (!document.fullscreenElement) {
        modal.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }
}

// 当前视频质量
let currentVideoQuality = 'HD';

// 设置视频质量（用于萤石云API获取不同质量流）
function setVideoQuality(quality) {
  currentVideoQuality = quality;
  
  const buttons = document.querySelectorAll('.quality-btn');
  buttons.forEach(btn => {
    if (btn.dataset.quality === quality) {
      btn.style.background = '#10b981';
      btn.classList.add('active');
    } else {
      btn.style.background = 'rgba(255,255,255,0.1)';
      btn.classList.remove('active');
    }
  });
}

// 初始化时加载萤石云配置
function initEzvizConfig() {
}

loadEzopenConfig();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderVideoMonitoring,
    playVideo,
    showAddCameraModal,
    showEditCameraModal,
    showEzopenConfigModal,
    testEzopenConfig,
    saveEzopenConfig,
    showPtzControl,
    filterCameras,
    loadEzopenConfig,
    getEzopenAccessToken
  };
}