// 视频监控管理模块

// 萤石云配置
const EZVIZ_CONFIG = {
  appKey: '',        // 萤石云AppKey
  appSecret: '',     // 萤石云AppSecret
  apiUrl: 'https://open.ys7.com/api/lapp',  // 萤石云API地址
  videoUrl: 'https://hls.open.ys7.com/openlive'  // 直播地址
};

// 视频播放状态管理
let videoPlayers = {};

// 获取萤石云AccessToken
async function getEzvizAccessToken() {
  const token = Storage.get('ezviz_access_token', null);
  const expireTime = Storage.get('ezviz_token_expire', 0);

  if (token && Date.now() < expireTime) {
    return token;
  }

  const appKey = Storage.get('ezviz_app_key', '');
  const appSecret = Storage.get('ezviz_app_secret', '');
  
  if (!appKey || !appSecret) {
    return null;
  }

  try {
    const response = await fetch(`${EZVIZ_CONFIG.apiUrl}/token/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `appKey=${appKey}&appSecret=${appSecret}`
    });

    const data = await response.json();
    if (data.code === '200') {
      const expire = Date.now() + (data.data.expireIn - 60) * 1000;
      Storage.set('ezviz_access_token', data.data.accessToken);
      Storage.set('ezviz_token_expire', expire);
      return data.data.accessToken;
    }
  } catch (error) {
    console.error('获取萤石云Token失败:', error);
  }
  return null;
}

// 获取摄像头直播地址
async function getCameraLiveUrl(cameraSerial, verifyCode) {
  const token = await getEzvizAccessToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${EZVIZ_CONFIG.apiUrl}/live/address/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'access_token': token
      },
      body: `cameraSerial=${cameraSerial}&verifyCode=${verifyCode}&quality=SQ&protocol=hls`
    });

    const data = await response.json();
    if (data.code === '200') {
      return {
        hls: data.data.url,
        rtmp: data.data.rtmp,
        flv: data.data.flv
      };
    }
  } catch (error) {
    console.error('获取直播地址失败:', error);
  }
  return null;
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
        <button class="btn btn-secondary" onclick="showEzvizConfigModal()">
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
          <button onclick="toggleFullscreen('${camera.id}')" style="width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.5); border: none; color: white; cursor: pointer;" title="全屏">
            <i class="fas fa-expand"></i>
          </button>
        </div>
      </div>
      <div class="camera-info" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <h4 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0;">${camera.name}</h4>
            <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${camera.serial}</div>
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
        <video id="mainVideoPlayer" style="width: 100%; height: 100%; object-fit: contain;" controls autoplay>
        </video>
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

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">设备序列号 <span style="color: red;">*</span></label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="serial" required placeholder="萤石设备序列号">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">验证码 <span style="color: red;">*</span></label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="verifyCode" required placeholder="设备验证码">
            </div>
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
          设备序列号和验证码可在萤石云APP或萤石云开放平台查看
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
    verifyCode: formData.get('verifyCode'),
    projectId: formData.get('projectId') || null,
    location: formData.get('location'),
    type: formData.get('type') || 'fixed',
    remark: formData.get('remark'),
    status: 'offline',
    createdAt: new Date().toISOString()
  };

  if (!data.name || !data.serial || !data.verifyCode) {
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

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">设备序列号</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #f3f4f6;" name="serial" value="${camera.serial}" readonly>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">验证码</label>
              <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #f3f4f6;" name="verifyCode" value="${camera.verifyCode}" readonly>
              <small style="color: #9ca3af; font-size: 11px; margin-top: 4px; display: block;">序列号和验证码不可修改</small>
            </div>
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
    projectId: formData.get('projectId') || null,
    location: formData.get('location'),
    type: formData.get('type'),
    remark: formData.get('remark')
  };

  if (!data.name) {
    alert('请填写摄像头名称');
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
  const video = document.getElementById('mainVideoPlayer');
  const loading = document.getElementById('videoLoadingOverlay');
  const info = document.getElementById('videoInfo');

  if (modal) {
    title.textContent = camera.name;
    modal.style.display = 'flex';
    loading.style.display = 'block';
    info.textContent = `设备: ${camera.serial} | 位置: ${camera.location || '未设置'}`;

    // 尝试获取视频流地址
    const videoUrl = await getCameraLiveUrl(camera.serial, camera.verifyCode);

    if (videoUrl && videoUrl.hls) {
      // 使用HLS.js播放HLS流
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl.hls);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
          loading.style.display = 'none';
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS加载错误:', data);
          loading.innerHTML = '<div style="color: #ef4444;">视频加载失败</div>';
        });
        videoPlayers[cameraId] = { hls, type: 'hls' };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari原生支持
        video.src = videoUrl.hls;
        video.play();
        loading.style.display = 'none';
      }
    } else if (Storage.get('ezviz_app_key', '') && Storage.get('ezviz_app_secret', '')) {
      // 如果没有配置或获取失败，显示模拟画面提示
      loading.innerHTML = `
        <div style="text-align: center;">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b;"></i>
          <div style="margin-top: 12px;">请检查萤石云配置</div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">设备序列号或验证码可能不正确</div>
        </div>
      `;
    } else {
      // 演示模式
      loading.innerHTML = `
        <div style="text-align: center;">
          <i class="fas fa-video" style="font-size: 48px; color: #10b981;"></i>
          <div style="margin-top: 12px;">演示模式</div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">请在"萤石云配置"中设置AppKey和AppSecret</div>
        </div>
      `;
    }
  }
}

// 关闭视频播放器
function closeVideoPlayer() {
  const modal = document.getElementById('videoPlayerModal');
  const video = document.getElementById('mainVideoPlayer');

  if (modal) {
    modal.style.display = 'none';

    // 停止视频播放
    if (video) {
      video.pause();
      video.src = '';
    }

    // 销毁HLS实例
    Object.keys(videoPlayers).forEach(key => {
      if (videoPlayers[key].hls) {
        videoPlayers[key].hls.destroy();
      }
    });
    videoPlayers = {};
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
  const token = await getEzvizAccessToken();
  if (!token) {
    alert('请先配置萤石云API密钥');
    return;
  }

  const camera = store.getCameraById(cameraId);
  if (!camera) return;

  // 萤石云API方向映射
  const directionMap = {
    'up': 0,
    'right': 1,
    'down': 2,
    'left': 3
  };

  try {
    const response = await fetch(`${EZVIZ_CONFIG.apiUrl}/ptz/absolute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'access_token': token
      },
      body: `cameraSerial=${camera.serial}&direction=${directionMap[direction]}&speed=1`
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

// 显示萤石云配置弹窗
function showEzvizConfigModal() {
  const appKey = Storage.get('ezviz_app_key', '');
  const appSecret = Storage.get('ezviz_app_secret', '');

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">
          <i class="fas fa-cloud" style="color: #3b82f6; margin-right: 8px;"></i>
          萤石云配置
        </h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('ezvizConfigModal')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div style="padding: 24px;">
        <div style="padding: 16px; background: #eff6ff; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #1e40af; line-height: 1.6;">
            <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
            萤石云视频接入需要以下步骤：<br>
            1. 在 <a href="https://open.ys7.com" target="_blank" style="color: #3b82f6;">萤石开放平台</a> 注册账号<br>
            2. 创建应用获取 AppKey 和 AppSecret<br>
            3. 将设备添加到萤石云并获取序列号和验证码
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">AppKey</label>
          <input type="text" id="ezvizAppKey" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" value="${appKey}" placeholder="萤石云应用的AppKey">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">AppSecret</label>
          <input type="password" id="ezvizAppSecret" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" value="${appSecret}" placeholder="萤石云应用的AppSecret">
        </div>

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="ezvizEnabled" style="width: 18px; height: 18px;">
            <span style="font-size: 14px; color: #374151;">启用萤石云视频</span>
          </label>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; cursor: pointer;" onclick="closeModal('ezvizConfigModal')">取消</button>
        <button style="padding: 11px 22px; border-radius: 12px; font-size: 14px; background: #3b82f6; color: white; border: none; cursor: pointer;" onclick="saveEzvizConfig()">保存配置</button>
      </div>
    </div>
  `;

  showModal('ezvizConfigModal', contentHtml);
}

// 保存萤石云配置
function saveEzvizConfig() {
  const appKey = document.getElementById('ezvizAppKey')?.value || '';
  const appSecret = document.getElementById('ezvizAppSecret')?.value || '';
  const enabled = document.getElementById('ezvizEnabled')?.checked || false;

  Storage.set('ezviz_app_key', appKey);
  Storage.set('ezviz_app_secret', appSecret);
  Storage.set('ezviz_enabled', enabled);

  // 更新全局配置
  EZVIZ_CONFIG.appKey = appKey;
  EZVIZ_CONFIG.appSecret = appSecret;

  // 清除旧的token，强制重新获取
  Storage.remove('ezviz_access_token');
  Storage.remove('ezviz_token_expire');

  closeModal('ezvizConfigModal');

  store.addNotification({
    type: 'success',
    title: '配置已保存',
    message: enabled ? '萤石云视频功能已启用' : '萤石云视频功能已禁用'
  });

  renderContent();
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

// 全屏切换
function toggleFullscreen(cameraId) {
  const preview = document.getElementById(`camera-preview-${cameraId}`);
  if (preview) {
    if (preview.requestFullscreen) {
      preview.requestFullscreen();
    }
  }
}

// 播放器全屏
function togglePlayerFullscreen() {
  const video = document.getElementById('mainVideoPlayer');
  if (video) {
    if (!document.fullscreenElement) {
      video.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

// 设置视频质量
function setVideoQuality(quality) {
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
  // TODO: 根据质量切换视频流
}

// 初始化时加载萤石云配置
function initEzvizConfig() {
  EZVIZ_CONFIG.appKey = Storage.get('ezviz_app_key', '');
  EZVIZ_CONFIG.appSecret = Storage.get('ezviz_app_secret', '');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderVideoMonitoring,
    playVideo,
    showAddCameraModal,
    showEditCameraModal,
    showEzvizConfigModal,
    showPtzControl,
    filterCameras
  };
}
