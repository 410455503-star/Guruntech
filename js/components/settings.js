﻿﻿﻿﻿﻿﻿const SettingsModule = {
  init() {
    this.registerRoutes();
    this.registerSidebarItems();
  },

  registerRoutes() {
    if (window.routeHandlers) {
      window.routeHandlers['settings'] = () => renderSettingsPage();
      window.routeHandlers['form-designer'] = () => renderFormDesigner();
      window.routeHandlers['custom-fields'] = () => renderCustomFields();
      window.routeHandlers['import-data'] = () => renderImportData();
    }
  },

  registerSidebarItems() {
    if (window.registerSidebarItem) {
      window.registerSidebarItem({
        id: 'settings',
        name: '系统设置',
        icon: 'fa-cog',
        route: 'settings',
        children: [
          { id: 'settings-general', name: '基础设置', route: 'settings' },
          { id: 'form-designer', name: '表单设计器', route: 'form-designer' },
          { id: 'custom-fields', name: '自定义字段', route: 'custom-fields' },
          { id: 'import-data', name: '数据导入', route: 'import-data' }
        ]
      });
    }
  }
};

function renderSettingsPage() {
  const state = store.getState();
  const settings = state.systemSettings || getDefaultSettings();

  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">系统设置</h1>
        <p class="page-description">管理系统基础配置和全局设置</p>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">基础配置</h3>
        </div>
      </div>
      <div class="card-body" style="padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">系统名称</label>
            <input type="text" style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;" id="systemName" value="${settings.systemName}" placeholder="请输入系统名称">
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">系统版本</label>
            <input type="text" style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #f3f4f6; cursor: not-allowed;" id="systemVersion" value="${settings.systemVersion}" readonly>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">日期格式</label>
            <select style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;" id="dateFormat">
              <option value="YYYY-MM-DD" ${settings.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
              <option value="DD/MM/YYYY" ${settings.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
              <option value="MM/DD/YYYY" ${settings.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
              <option value="YYYY年MM月DD日" ${settings.dateFormat === 'YYYY年MM月DD日' ? 'selected' : ''}>YYYY年MM月DD日</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">时间格式</label>
            <select style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;" id="timeFormat">
              <option value="24" ${settings.timeFormat === '24' ? 'selected' : ''}>24小时制</option>
              <option value="12" ${settings.timeFormat === '12' ? 'selected' : ''}>12小时制</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #f59e0b 0%, #f97316 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">数据配置</h3>
        </div>
      </div>
      <div class="card-body" style="padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">自动保存间隔(秒)</label>
            <input type="number" style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;" id="autoSaveInterval" value="${settings.autoSaveInterval}" min="10" max="300">
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">数据保留天数</label>
            <input type="number" style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;" id="dataRetentionDays" value="${settings.dataRetentionDays}" min="30" max="3650">
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">萤石云配置</h3>
        </div>
      </div>
      <div class="card-body" style="padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">APP Key <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;" id="ezopenAppKey" placeholder="请输入萤石云APP Key">
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">APP Secret <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;" id="ezopenAppSecret" placeholder="请输入萤石云APP Secret">
          </div>
        </div>
        <div style="margin-top: 16px; padding: 12px 16px; background: #eff6ff; border-radius: 8px; font-size: 13px; color: #1e40af;">
          <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
          在萤石开放平台(https://open.ys7.com)注册账号并创建应用，获取APP Key和APP Secret
        </div>
        <div style="margin-top: 12px; display: flex; gap: 12px;">
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="testEzopenConnection()">
            <i class="fas fa-check-circle"></i> 测试连接
          </button>
        </div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px;">
      <div style="padding: 24px; display: flex; justify-content: flex-end; gap: 12px;">
        <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetSettings()">
          <i class="fas fa-redo"></i> 重置
        </button>
        <button class="btn btn-primary" style="padding: 10px 20px; border-radius: 8px;" onclick="saveSettings()">
          <i class="fas fa-save"></i> 保存设置
        </button>
      </div>
    </div>
    <script>
      (function() {
        const ezopenConfig = localStorage.getItem('ezopen_config');
        const appKeyInput = document.getElementById('ezopenAppKey');
        const appSecretInput = document.getElementById('ezopenAppSecret');
        
        if (ezopenConfig) {
          const config = JSON.parse(ezopenConfig);
          if (appKeyInput) appKeyInput.value = config.appKey || 'f8a8cd2462554e5084b4d8e7a2b5fa70';
          if (appSecretInput) appSecretInput.value = config.appSecret || 'cd46c4413fa2e11f410ff32b6ff8e7fa';
        } else {
          if (appKeyInput) appKeyInput.value = 'f8a8cd2462554e5084b4d8e7a2b5fa70';
          if (appSecretInput) appSecretInput.value = 'cd46c4413fa2e11f410ff32b6ff8e7fa';
        }
      })();
    </script>
  `;

  return html;
}

function getDefaultSettings() {
  return {
    systemName: '工程项目管理系统',
    systemVersion: '1.0.0',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24',
    autoSaveInterval: 30,
    dataRetentionDays: 365
  };
}

function saveSettings() {
  const settings = {
    systemName: document.getElementById('systemName')?.value || '',
    systemVersion: '1.0.0',
    dateFormat: document.getElementById('dateFormat')?.value || 'YYYY-MM-DD',
    timeFormat: document.getElementById('timeFormat')?.value || '24',
    autoSaveInterval: parseInt(document.getElementById('autoSaveInterval')?.value) || 30,
    dataRetentionDays: parseInt(document.getElementById('dataRetentionDays')?.value) || 365
  };

  store.setState({ systemSettings: settings });
  store.saveToStorage();

  const ezopenAppKey = document.getElementById('ezopenAppKey')?.value || '';
  const ezopenAppSecret = document.getElementById('ezopenAppSecret')?.value || '';
  
  if (ezopenAppKey || ezopenAppSecret) {
    localStorage.setItem('ezopen_config', JSON.stringify({
      apiUrl: 'https://open.ys7.com',
      appKey: ezopenAppKey,
      appSecret: ezopenAppSecret,
      accessToken: '',
      tokenExpireTime: 0
    }));
    
    if (typeof loadEzopenConfig === 'function') {
      loadEzopenConfig();
    }
  }

  store.addNotification({
    type: 'success',
    title: '设置保存成功',
    message: '系统设置已成功保存'
  });
}

async function testEzopenConnection() {
  const appKey = document.getElementById('ezopenAppKey')?.value || '';
  const appSecret = document.getElementById('ezopenAppSecret')?.value || '';
  
  if (!appKey || !appSecret) {
    store.addNotification({
      type: 'error',
      title: '配置不完整',
      message: '请填写APP Key和APP Secret'
    });
    return;
  }

  store.addNotification({
    type: 'info',
    title: '测试连接中',
    message: '正在连接萤石云服务器...'
  });

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
        message: '萤石云配置正确，Token获取成功'
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
      message: '网络连接问题，请检查网络设置'
    });
  }
}

function resetSettings() {
  const defaultSettings = getDefaultSettings();
  
  document.getElementById('systemName').value = defaultSettings.systemName;
  document.getElementById('dateFormat').value = defaultSettings.dateFormat;
  document.getElementById('timeFormat').value = defaultSettings.timeFormat;
  document.getElementById('autoSaveInterval').value = defaultSettings.autoSaveInterval;
  document.getElementById('dataRetentionDays').value = defaultSettings.dataRetentionDays;
}

function renderFormDesigner() {
  const state = store.getState();
  const forms = state.customForms || [];

  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">表单设计器</h1>
        <p class="page-description">创建和管理自定义表单</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showCreateFormModal()">
          <i class="fas fa-plus"></i> 新建表单
        </button>
      </div>
    </div>

    <div class="card">
      <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
        <h3 style="font-size: 14px; font-weight: 600; color: #4b5563; margin: 0;">表单列表</h3>
      </div>
      <div style="padding: 0;">
        ${forms.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-file-alt" style="font-size: 48px; color: #9ca3af;"></i>
            <h3 style="margin-top: 16px; color: #1f2937;">暂无自定义表单</h3>
            <p style="color: #6b7280;">点击"新建表单"按钮创建第一个表单</p>
          </div>
        ` : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">表单名称</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">关联模块</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: right; border-bottom: 1px solid #e5e7eb;">字段数量</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">创建时间</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 160px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${forms.map(form => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 14px 16px; color: #1f2937;">${form.name}</td>
                  <td style="padding: 14px 16px; color: #1f2937;">${getModuleName(form.module)}</td>
                  <td style="padding: 14px 16px; color: #1f2937; text-align: right;">${form.fields?.length || 0}</td>
                  <td style="padding: 14px 16px; color: #1f2937;">${DateUtils.formatDate(form.createdAt)}</td>
                  <td style="padding: 14px 16px;">
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm" onclick="editForm('${form.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="previewForm('${form.id}')" title="预览">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="deleteFormConfirm('${form.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;

  return html;
}

function getModuleName(module) {
  const moduleMap = {
    project: '项目管理',
    task: '任务管理',
    material: '材料管理',
    worker: '临时用工',
    document: '文档管理',
    custom: '自定义'
  };
  return moduleMap[module] || module;
}

function showCreateFormModal() {
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建表单</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createFormModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">表单名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入表单名称">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">关联模块</label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="module">
              <option value="custom">自定义</option>
              <option value="project">项目管理</option>
              <option value="task">任务管理</option>
              <option value="material">材料管理</option>
              <option value="worker">用工管理</option>
              <option value="document">文档管理</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">表单描述</label>
            <textarea style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; box-sizing: border-box;" name="description" placeholder="请输入表单描述"></textarea>
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createFormModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="createForm()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createFormModal', contentHtml);
}

function createForm() {
  const form = document.getElementById('createForm');
  const formData = new FormData(form);

  const newForm = {
    id: `form-${Date.now()}`,
    name: formData.get('name'),
    module: formData.get('module'),
    description: formData.get('description'),
    fields: [],
    createdAt: new Date().toISOString()
  };

  const state = store.getState();
  store.setState({ customForms: [...(state.customForms || []), newForm] });
  store.saveToStorage();

  store.addNotification({
    type: 'success',
    title: '表单创建成功',
    message: `表单"${newForm.name}"已创建`
  });

  closeModal('createFormModal');
  renderFormDesigner();
}

function editForm(formId) {
  const state = store.getState();
  const form = state.customForms?.find(f => f.id === formId);
  if (!form) return;

  const fieldTypes = [
    { value: 'text', label: '单行文本' },
    { value: 'textarea', label: '多行文本' },
    { value: 'number', label: '数字' },
    { value: 'date', label: '日期' },
    { value: 'datetime', label: '日期时间' },
    { value: 'select', label: '下拉选择' },
    { value: 'radio', label: '单选框' },
    { value: 'checkbox', label: '多选框' },
    { value: 'file', label: '文件上传' },
    { value: 'email', label: '邮箱' },
    { value: 'phone', label: '电话' },
    { value: 'url', label: '网址' },
    { value: 'switch', label: '开关' },
    { value: 'textarea', label: '富文本' }
  ];

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑表单: ${form.name}</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editFormModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px; display: flex; gap: 20px;">
        <div style="flex: 1;">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">表单名称</label>
            <input type="text" id="formName" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" value="${form.name}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段列表</label>
            <div id="fieldsContainer">
              ${form.fields?.map((field, index) => renderFieldEditor(field, index)).join('')}
            </div>
            <button style="width: 100%; padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; margin-top: 12px;" onclick="addFieldRow()">
              <i class="fas fa-plus"></i> 添加字段
            </button>
          </div>
        </div>
        <div style="width: 280px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">字段类型</h4>
          <div id="fieldTypePalette">
            ${fieldTypes.map(type => `
              <div class="field-type-item" onclick="addField('${type.value}')" style="padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-${getFieldIcon(type.value)}"></i>
                <span style="font-size: 13px; color: #374151;">${type.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editFormModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="saveForm('${formId}')">保存</button>
      </div>
    </div>
  `;

  showModal('editFormModal', contentHtml);
}

function getFieldIcon(type) {
  const iconMap = {
    text: 'font',
    textarea: 'align-left',
    number: 'hash',
    date: 'calendar',
    datetime: 'clock',
    select: 'list',
    radio: 'circle',
    checkbox: 'check-square',
    file: 'paperclip',
    email: 'envelope',
    phone: 'phone',
    url: 'link',
    switch: 'toggle-on'
  };
  return iconMap[type] || 'circle';
}

function renderFieldEditor(field, index) {
  return `
    <div class="field-row" data-index="${index}" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <div style="cursor: move; padding: 4px; color: #9ca3af;">
          <i class="fas fa-grip-vertical"></i>
        </div>
        <div style="flex: 1;">
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input type="text" class="form-input" placeholder="字段名称" value="${field.label}" style="flex: 1;">
            <select class="form-input" style="width: 140px;">
              <option value="text" ${field.type === 'text' ? 'selected' : ''}>单行文本</option>
              <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>多行文本</option>
              <option value="number" ${field.type === 'number' ? 'selected' : ''}>数字</option>
              <option value="date" ${field.type === 'date' ? 'selected' : ''}>日期</option>
              <option value="datetime" ${field.type === 'datetime' ? 'selected' : ''}>日期时间</option>
              <option value="select" ${field.type === 'select' ? 'selected' : ''}>下拉选择</option>
              <option value="radio" ${field.type === 'radio' ? 'selected' : ''}>单选框</option>
              <option value="checkbox" ${field.type === 'checkbox' ? 'selected' : ''}>多选框</option>
              <option value="file" ${field.type === 'file' ? 'selected' : ''}>文件上传</option>
              <option value="email" ${field.type === 'email' ? 'selected' : ''}>邮箱</option>
              <option value="phone" ${field.type === 'phone' ? 'selected' : ''}>电话</option>
              <option value="url" ${field.type === 'url' ? 'selected' : ''}>网址</option>
              <option value="switch" ${field.type === 'switch' ? 'selected' : ''}>开关</option>
            </select>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="text" class="form-input" placeholder="字段标签(英文)" value="${field.name}" style="flex: 1;">
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
              <input type="checkbox" ${field.required ? 'checked' : ''}> 必填
            </label>
            <button class="btn btn-danger btn-sm" onclick="removeField(this)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          ${field.type === 'select' || field.type === 'radio' || field.type === 'checkbox' ? `
            <div style="margin-top: 8px;">
              <input type="text" class="form-input" placeholder="选项值，用逗号分隔" value="${field.options?.join(', ') || ''}">
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function addFieldRow() {
  const container = document.getElementById('fieldsContainer');
  const count = container.children.length;
  const newField = {
    id: `field-${Date.now()}`,
    label: '',
    name: '',
    type: 'text',
    required: false,
    options: []
  };
  container.innerHTML += renderFieldEditor(newField, count);
}

function addField(type) {
  const container = document.getElementById('fieldsContainer');
  const count = container.children.length;
  const newField = {
    id: `field-${Date.now()}`,
    label: '',
    name: '',
    type: type,
    required: false,
    options: []
  };
  container.innerHTML += renderFieldEditor(newField, count);
}

function removeField(btn) {
  btn.closest('.field-row').remove();
}

function saveForm(formId) {
  const state = store.getState();
  const forms = [...(state.customForms || [])];
  const formIndex = forms.findIndex(f => f.id === formId);
  
  if (formIndex === -1) return;

  const fieldRows = document.querySelectorAll('.field-row');
  const fields = Array.from(fieldRows).map(row => {
    const inputs = row.querySelectorAll('input');
    const select = row.querySelector('select');
    const checkbox = row.querySelector('input[type="checkbox"]');
    
    const optionsInput = row.querySelector('input[placeholder*="选项值"]');
    const options = optionsInput ? optionsInput.value.split(',').map(o => o.trim()).filter(o => o) : [];

    return {
      id: `field-${Date.now()}`,
      label: inputs[0].value,
      name: inputs[1].value || inputs[0].value.toLowerCase().replace(/\s+/g, '_'),
      type: select.value,
      required: checkbox?.checked || false,
      options: options
    };
  }).filter(f => f.label);

  forms[formIndex] = {
    ...forms[formIndex],
    name: document.getElementById('formName').value,
    fields: fields,
    updatedAt: new Date().toISOString()
  };

  store.setState({ customForms: forms });
  store.saveToStorage();

  store.addNotification({
    type: 'success',
    title: '表单保存成功',
    message: '表单已成功更新'
  });

  closeModal('editFormModal');
  renderFormDesigner();
}

function deleteFormConfirm(formId) {
  if (confirm('确定要删除这个表单吗？此操作无法撤销。')) {
    const state = store.getState();
    const forms = state.customForms?.filter(f => f.id !== formId) || [];
    store.setState({ customForms: forms });
    store.saveToStorage();
    
    store.addNotification({
      type: 'success',
      title: '表单删除成功',
      message: '表单已删除'
    });
    
    renderFormDesigner();
  }
}

function previewForm(formId) {
  const state = store.getState();
  const form = state.customForms?.find(f => f.id === formId);
  if (!form) return;

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">表单预览: ${form.name}</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('previewFormModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form>
          ${form.fields?.map(field => renderFieldPreview(field)).join('')}
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('previewFormModal')">关闭</button>
      </div>
    </div>
  `;

  showModal('previewFormModal', contentHtml);
}

function renderFieldPreview(field) {
  const required = field.required ? 'required' : '';
  
  switch(field.type) {
    case 'textarea':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <textarea class="form-input" ${required} rows="3"></textarea>
        </div>
      `;
    case 'number':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <input type="number" class="form-input" ${required}>
        </div>
      `;
    case 'date':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <input type="date" class="form-input" ${required}>
        </div>
      `;
    case 'datetime':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <input type="datetime-local" class="form-input" ${required}>
        </div>
      `;
    case 'select':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <select class="form-input" ${required}>
            <option value="">请选择</option>
            ${field.options?.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </div>
      `;
    case 'radio':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <div style="display: flex; gap: 16px;">
            ${field.options?.map((opt, i) => `
              <label style="display: flex; align-items: center; gap: 4px;">
                <input type="radio" name="${field.name}" value="${opt}" ${i === 0 && field.required ? 'checked' : ''}>
                ${opt}
              </label>
            `).join('')}
          </div>
        </div>
      `;
    case 'checkbox':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            ${field.options?.map(opt => `
              <label style="display: flex; align-items: center; gap: 4px;">
                <input type="checkbox" name="${field.name}" value="${opt}">
                ${opt}
              </label>
            `).join('')}
          </div>
        </div>
      `;
    case 'file':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <input type="file" class="form-input" ${required}>
        </div>
      `;
    case 'email':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <input type="email" class="form-input" ${required}>
        </div>
      `;
    case 'phone':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <input type="tel" class="form-input" ${required}>
        </div>
      `;
    case 'url':
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <input type="url" class="form-input" ${required}>
        </div>
      `;
    case 'switch':
      return `
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center;">
          <label class="form-label">${field.label}</label>
          <label class="switch">
            <input type="checkbox">
            <span class="slider"></span>
          </label>
        </div>
      `;
    default:
      return `
        <div class="form-group">
          <label class="form-label">${field.label} ${field.required ? '<span style="color: red;">*</span>' : ''}</label>
          <input type="text" class="form-input" ${required}>
        </div>
      `;
  }
}

function renderCustomFields() {
  const state = store.getState();
  const customFields = state.customFields || [];

  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">自定义字段</h1>
        <p class="page-description">为各模块添加自定义字段</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="showCreateFieldModal()">
          <i class="fas fa-plus"></i> 新增字段
        </button>
      </div>
    </div>

    <div class="card">
      <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
        <h3 style="font-size: 14px; font-weight: 600; color: #4b5563; margin: 0;">自定义字段列表</h3>
      </div>
      <div style="padding: 0;">
        ${customFields.length === 0 ? `
          <div style="padding: 40px; text-align: center;">
            <i class="fas fa-columns" style="font-size: 48px; color: #9ca3af;"></i>
            <h3 style="margin-top: 16px; color: #1f2937;">暂无自定义字段</h3>
            <p style="color: #6b7280;">点击"新增字段"按钮创建第一个字段</p>
          </div>
        ` : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">字段名称</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">所属模块</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">字段类型</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">必填</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb;">创建时间</th>
                <th style="padding: 14px 16px; font-weight: 600; color: #4b5563; font-size: 13px; text-align: left; border-bottom: 1px solid #e5e7eb; width: 120px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${customFields.map(field => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 14px 16px; color: #1f2937;">${field.label}</td>
                  <td style="padding: 14px 16px; color: #1f2937;">${getModuleName(field.module)}</td>
                  <td style="padding: 14px 16px; color: #1f2937;">${getFieldTypeName(field.type)}</td>
                  <td style="padding: 14px 16px;">
                    ${field.required ? '<i class="fas fa-check-circle" style="color: #10b981;"></i>' : '<i class="fas fa-circle" style="color: #9ca3af;"></i>'}
                  </td>
                  <td style="padding: 14px 16px; color: #1f2937;">${DateUtils.formatDate(field.createdAt)}</td>
                  <td style="padding: 14px 16px;">
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm" onclick="editCustomField('${field.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="deleteCustomFieldConfirm('${field.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;
}

function getFieldTypeName(type) {
  const typeMap = {
    text: '单行文本',
    textarea: '多行文本',
    number: '数字',
    date: '日期',
    datetime: '日期时间',
    select: '下拉选择',
    radio: '单选框',
    checkbox: '多选框',
    file: '文件上传',
    email: '邮箱',
    phone: '电话',
    url: '网址',
    switch: '开关'
  };
  return typeMap[type] || type;
}

function showCreateFieldModal() {
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新增自定义字段</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createFieldModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createFieldForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="label" required placeholder="请输入字段名称">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段标签</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" placeholder="自动生成，可自定义（英文）">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属模块 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="module" required>
              <option value="project">项目管理</option>
              <option value="task">任务管理</option>
              <option value="material">材料管理</option>
              <option value="worker">临时用工</option>
              <option value="document">文档管理</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段类型 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type" required>
              <option value="text">单行文本</option>
              <option value="textarea">多行文本</option>
              <option value="number">数字</option>
              <option value="date">日期</option>
              <option value="datetime">日期时间</option>
              <option value="select">下拉选择</option>
              <option value="radio">单选框</option>
              <option value="checkbox">多选框</option>
              <option value="file">文件上传</option>
              <option value="email">邮箱</option>
              <option value="phone">电话</option>
              <option value="url">网址</option>
              <option value="switch">开关</option>
            </select>
          </div>
          <div style="margin-bottom: 16px; display: none;" id="optionsField">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">选项值</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="options" placeholder="选项值，用逗号分隔">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" name="required">
              <span style="font-size: 14px; color: #374151;">设为必填字段</span>
            </label>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段描述</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="description" placeholder="字段说明（可选）">
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createFieldModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="createCustomField()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createFieldModal', contentHtml);
  
  setTimeout(() => {
    const typeSelect = document.querySelector('#createFieldModal select[name="type"]');
    const optionsField = document.getElementById('optionsField');
    
    typeSelect?.addEventListener('change', (e) => {
      const typesWithOptions = ['select', 'radio', 'checkbox'];
      optionsField.style.display = typesWithOptions.includes(e.target.value) ? 'block' : 'none';
    });
  }, 100);
}

function createCustomField() {
  const form = document.getElementById('createFieldForm');
  const formData = new FormData(form);

  const newField = {
    id: `field-${Date.now()}`,
    label: formData.get('label'),
    name: formData.get('name') || formData.get('label').toLowerCase().replace(/\s+/g, '_'),
    module: formData.get('module'),
    type: formData.get('type'),
    required: formData.get('required') === 'on',
    options: formData.get('options') ? formData.get('options').split(',').map(o => o.trim()).filter(o => o) : [],
    description: formData.get('description'),
    createdAt: new Date().toISOString()
  };

  const state = store.getState();
  store.setState({ customFields: [...(state.customFields || []), newField] });
  store.saveToStorage();

  store.addNotification({
    type: 'success',
    title: '字段创建成功',
    message: `字段"${newField.label}"已创建`
  });

  closeModal('createFieldModal');
  renderCustomFields();
}

function editCustomField(fieldId) {
  const state = store.getState();
  const field = state.customFields?.find(f => f.id === fieldId);
  if (!field) return;

  const typesWithOptions = ['select', 'radio', 'checkbox'];
  const showOptions = typesWithOptions.includes(field.type);

  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">编辑字段: ${field.label}</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editFieldModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="editFieldForm">
          <input type="hidden" name="id" value="${field.id}">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="label" required value="${field.label}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段标签</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #f3f4f6; cursor: not-allowed;" name="name" value="${field.name}" readonly>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属模块 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="module" required>
              <option value="project" ${field.module === 'project' ? 'selected' : ''}>项目管理</option>
              <option value="task" ${field.module === 'task' ? 'selected' : ''}>任务管理</option>
              <option value="material" ${field.module === 'material' ? 'selected' : ''}>材料管理</option>
              <option value="worker" ${field.module === 'worker' ? 'selected' : ''}>临时用工</option>
              <option value="document" ${field.module === 'document' ? 'selected' : ''}>文档管理</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段类型 <span style="color: red;">*</span></label>
            <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type" required>
              <option value="text" ${field.type === 'text' ? 'selected' : ''}>单行文本</option>
              <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>多行文本</option>
              <option value="number" ${field.type === 'number' ? 'selected' : ''}>数字</option>
              <option value="date" ${field.type === 'date' ? 'selected' : ''}>日期</option>
              <option value="datetime" ${field.type === 'datetime' ? 'selected' : ''}>日期时间</option>
              <option value="select" ${field.type === 'select' ? 'selected' : ''}>下拉选择</option>
              <option value="radio" ${field.type === 'radio' ? 'selected' : ''}>单选框</option>
              <option value="checkbox" ${field.type === 'checkbox' ? 'selected' : ''}>多选框</option>
              <option value="file" ${field.type === 'file' ? 'selected' : ''}>文件上传</option>
              <option value="email" ${field.type === 'email' ? 'selected' : ''}>邮箱</option>
              <option value="phone" ${field.type === 'phone' ? 'selected' : ''}>电话</option>
              <option value="url" ${field.type === 'url' ? 'selected' : ''}>网址</option>
              <option value="switch" ${field.type === 'switch' ? 'selected' : ''}>开关</option>
            </select>
          </div>
          <div style="margin-bottom: 16px; display: ${showOptions ? 'block' : 'none'};" id="editOptionsField">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">选项值</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="options" value="${field.options?.join(', ') || ''}">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" name="required" ${field.required ? 'checked' : ''}>
              <span style="font-size: 14px; color: #374151;">设为必填字段</span>
            </label>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">字段描述</label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="description" value="${field.description || ''}">
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('editFieldModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="saveCustomField()">保存</button>
      </div>
    </div>
  `;
  
  showModal('editFieldModal', contentHtml);
  
  setTimeout(() => {
    const typeSelect = document.querySelector('#editFieldModal select[name="type"]');
    const optionsField = document.getElementById('editOptionsField');
    
    typeSelect?.addEventListener('change', (e) => {
      optionsField.style.display = typesWithOptions.includes(e.target.value) ? 'block' : 'none';
    });
  }, 0);
}

function saveCustomField() {
  const form = document.getElementById('editFieldForm');
  const formData = new FormData(form);

  const state = store.getState();
  const fields = [...(state.customFields || [])];
  const fieldIndex = fields.findIndex(f => f.id === formData.get('id'));
  
  if (fieldIndex === -1) return;

  fields[fieldIndex] = {
    ...fields[fieldIndex],
    label: formData.get('label'),
    module: formData.get('module'),
    type: formData.get('type'),
    required: formData.get('required') === 'on',
    options: formData.get('options') ? formData.get('options').split(',').map(o => o.trim()).filter(o => o) : [],
    description: formData.get('description'),
    updatedAt: new Date().toISOString()
  };

  store.setState({ customFields: fields });
  store.saveToStorage();

  store.addNotification({
    type: 'success',
    title: '字段保存成功',
    message: '字段已成功更新'
  });

  closeModal('editFieldModal');
  renderCustomFields();
}

function deleteCustomFieldConfirm(fieldId) {
  if (confirm('确定要删除这个字段吗？此操作无法撤销。')) {
    const state = store.getState();
    const fields = state.customFields?.filter(f => f.id !== fieldId) || [];
    store.setState({ customFields: fields });
    store.saveToStorage();
    
    store.addNotification({
      type: 'success',
      title: '字段删除成功',
      message: '字段已删除'
    });
    
    renderCustomFields();
  }
}

function renderImportData() {
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">数据导入</h1>
        <p class="page-description">导入外部数据文件到系统</p>
      </div>
    </div>

    <div class="card mb-24">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px;">支持的文件格式</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
        <div class="import-format-card">
          <i class="fas fa-file-excel" style="font-size: 32px; color: #10b981;"></i>
          <div style="margin-top: 12px;">
            <div style="font-weight: 600;">Excel (.xlsx)</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">支持 .xlsx 格式文件</div>
          </div>
        </div>
        <div class="import-format-card">
          <i class="fas fa-file-csv" style="font-size: 32px; color: #3b82f6;"></i>
          <div style="margin-top: 12px;">
            <div style="font-weight: 600;">CSV (.csv)</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">逗号分隔值文件</div>
          </div>
        </div>
        <div class="import-format-card">
          <i class="fas fa-file-code" style="font-size: 32px; color: #8b5cf6;"></i>
          <div style="margin-top: 12px;">
            <div style="font-weight: 600;">JSON (.json)</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">JSON 数据格式</div>
          </div>
        </div>
        <div class="import-format-card">
          <i class="fas fa-file-text" style="font-size: 32px; color: #f59e0b;"></i>
          <div style="margin-top: 12px;">
            <div style="font-weight: 600;">XML (.xml)</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">XML 数据格式</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 20px;">选择导入模块</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <button class="import-module-card" onclick="startImport('project')">
          <i class="fas fa-building"></i>
          <div>项目数据</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">导入项目信息</div>
        </button>
        <button class="import-module-card" onclick="startImport('task')">
          <i class="fas fa-list-checks"></i>
          <div>任务数据</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">导入任务信息</div>
        </button>
        <button class="import-module-card" onclick="startImport('material')">
          <i class="fas fa-boxes"></i>
          <div>材料数据</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">导入材料信息</div>
        </button>
        <button class="import-module-card" onclick="startImport('worker')">
          <i class="fas fa-users"></i>
          <div>用工数据</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">导入临时用工</div>
        </button>
        <button class="import-module-card" onclick="startImport('document')">
          <i class="fas fa-file-text"></i>
          <div>文档数据</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">导入文档信息</div>
        </button>
        <button class="import-module-card" onclick="startImport('budget')">
          <i class="fas fa-money-bill"></i>
          <div>预算数据</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">导入预算信息</div>
        </button>
      </div>
    </div>

    <div class="card" style="margin-top: 24px;">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">导入说明</h3>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
        <li style="margin-bottom: 8px;">导入前请确保数据格式正确，建议先下载模板文件参考格式</li>
        <li style="margin-bottom: 8px;">Excel文件仅支持.xlsx 格式，不支持 .xls 格式</li>
        <li style="margin-bottom: 8px;">CSV文件请确保使用UTF-8编码，列分隔符为逗号</li>
        <li style="margin-bottom: 8px;">导入的数据会根据唯一标识进行匹配，已存在的数据会被更新</li>
        <li style="margin-bottom: 8px;">建议在导入前备份数据，以防数据冲突</li>
      </ul>
    </div>
  `;

  return html;
}

function startImport(module) {
  const moduleName = getModuleName(module);
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">导入${moduleName}数据</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('importModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <div style="text-align: center; padding: 40px; border: 2px dashed #e5e7eb; border-radius: 12px; margin-bottom: 20px; cursor: pointer;" id="dropZone">
          <i class="fas fa-upload" style="font-size: 48px; color: #9ca3af;"></i>
          <h3 style="margin-top: 16px; color: #1f2937;">拖拽文件到此处</h3>
          <p style="color: #6b7280; margin-top: 4px;">或点击选择文件</p>
          <input type="file" id="importFile" accept=".xlsx,.csv,.json,.xml" style="display: none;">
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="display: flex; gap: 12px;">
            <button style="padding: 10px 20px; font-size: 14px; background: #f1f5f9; color: #374151; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="document.getElementById('importFile').click()">
              <i class="fas fa-folder-open"></i> 选择文件
            </button>
            <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 8px; cursor: pointer;" onclick="downloadImportTemplate('${module}')">
              <i class="fas fa-download"></i> 下载模板
            </button>
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            支持: .xlsx .csv .json .xml
          </div>
        </div>

        <div id="importPreview" style="display: none; margin-top: 20px;">
          <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #1e293b;">数据预览</h4>
          <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
            <table id="previewTable" style="width: 100%; border-collapse: collapse;">
            </table>
          </div>
        </div>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('importModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" id="importBtn" disabled onclick="processImport('${module}')">
          <i class="fas fa-upload"></i> 导入数据
        </button>
      </div>
    </div>
  `;
  
  showModal('importModal', contentHtml);
  
  setTimeout(() => {
    const dropZone = document.getElementById('dropZone');
    const importFileInput = document.getElementById('importFile');
    
    if (!dropZone || !importFileInput) return;
    
    dropZone.addEventListener('click', () => importFileInput.click());
  
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#3b82f6';
      dropZone.style.background = '#dbeafe';
    });
  
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '#e5e7eb';
      dropZone.style.background = 'transparent';
    });
  
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#e5e7eb';
      dropZone.style.background = 'transparent';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0], module);
      }
    });
  
    importFileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        handleFile(files[0], module);
      }
    });
  }, 100);
}

function handleFile(file, module) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const ext = file.name.split('.').pop().toLowerCase();
      
      let data = [];
      if (ext === 'json') {
        data = JSON.parse(content);
      } else if (ext === 'csv') {
        data = parseCSV(content);
      } else if (ext === 'xml') {
        data = parseXML(content);
      } else if (ext === 'xlsx') {
        const dz = document.getElementById('dropZone');
        if (dz) {
          dz.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #3b82f6;"></i><h3 style="margin-top: 16px;">正在解析...</h3>';
        }
        setTimeout(() => {
          data = parseExcelMock();
          showPreview(data);
        }, 500);
        return;
      }
      
      showPreview(data);
    } catch (error) {
      store.addNotification({
        type: 'error',
        title: '文件解析失败',
        message: '无法解析文件内容，请检查文件格式'
      });
    }
  };
  
  if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
    reader.readAsText(file);
  } else if (file.name.endsWith('.xml')) {
    reader.readAsText(file);
  } else if (file.name.endsWith('.xlsx')) {
    reader.readAsArrayBuffer(file);
  }
}

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const row = {};
      const values = lines[i].split(',');
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || '';
      });
      data.push(row);
    }
  }
  
  return data;
}

function parseXML(content) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(content, 'text/xml');
  const items = xml.querySelectorAll('row, item, record');
  const data = [];
  
  items.forEach(item => {
    const row = {};
    item.querySelectorAll('*').forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        row[child.tagName] = child.textContent;
      }
    });
    data.push(row);
  });
  
  return data;
}

function parseExcelMock() {
  return [
    { name: '测试项目A', category: '污水处理厂', phase: '土建施工', progress: 35, budget: 50000000 },
    { name: '测试项目B', category: '供水工程', phase: '机电安装', progress: 72, budget: 35000000 },
    { name: '测试项目C', category: '泵站改造', phase: '前期准备', progress: 15, budget: 12000000 }
  ];
}

function showPreview(data) {
  if (!data || data.length === 0) {
    store.addNotification({
      type: 'warning',
      title: '数据为空',
      message: '文件中没有数据'
    });
    return;
  }
  
  const headers = Object.keys(data[0]);
  const previewData = data.slice(0, 5);
  
  let html = '<thead><tr>';
  headers.forEach(header => {
    html += `<th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  previewData.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      html += `<td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${row[header] || '-'}</td>`;
    });
    html += '</tr>';
  });
  
  if (data.length > 5) {
    html += `<tr><td colspan="${headers.length}" style="padding: 10px; text-align: center; color: #6b7280;">... 还有 ${data.length - 5} 条记录</td></tr>`;
  }
  
  html += '</tbody>';
  
  document.getElementById('previewTable').innerHTML = html;
  document.getElementById('importPreview').style.display = 'block';
  document.getElementById('importBtn').disabled = false;
  
  sessionStorage.setItem('importData', JSON.stringify(data));
}

function downloadImportTemplate(module) {
  const templates = {
    project: [
      ['name', 'category', 'phase', 'location', 'capacity', 'description', 'status', 'priority', 'progress', 'budget', 'startDate', 'endDate'],
      ['示例项目', '污水处理厂', '土建施工', '北京市', '5万吨/日', '项目描述', 'in_progress', 'high', '50', '100000000', '2024-01-01', '2024-12-31']
    ],
    task: [
      ['name', 'projectId', 'description', 'assigneeId', 'priority', 'status', 'progress', 'startDate', 'dueDate'],
      ['示例任务', 'proj-001', '任务描述', 'user-001', 'high', 'in_progress', '50', '2024-01-01', '2024-01-15']
    ],
    material: [
      ['name', 'projectId', 'category', 'quantity', 'unitPrice', 'status', 'supplier', 'deliveryDate'],
      ['钢筋', 'proj-001', '建筑材料', '1000', '5000', 'pending', '供应商A', '2024-01-10']
    ],
    worker: [
      ['name', 'projectId', 'position', 'dailyRate', 'startDate', 'endDate', 'status'],
      ['张三', 'proj-001', '电工', '300', '2024-01-01', '2024-01-31', 'active']
    ],
    document: [
      ['name', 'projectId', 'category', 'size', 'uploadedBy', 'uploadDate'],
      ['项目计划书', 'proj-001', '规划文档', '2048', 'user-001', '2024-01-01']
    ],
    budget: [
      ['name', 'projectId', 'category', 'budgetAmount', 'spentAmount', 'status'],
      ['人工费用', 'proj-001', '人工费', '500000', '200000', 'active']
    ]
  };

  const template = templates[module] || templates.project;
  const csvContent = template.map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${module}_template.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function processImport(module) {
  const data = JSON.parse(sessionStorage.getItem('importData'));
  if (!data || data.length === 0) {
    store.addNotification({
      type: 'error',
      title: '导入失败',
      message: '没有可导入的数据'
    });
    return;
  }

  let importedCount = 0;
  const state = store.getState();

  switch(module) {
    case 'project':
      data.forEach(row => {
        const existingProject = state.projects.find(p => p.name === row.name);
        if (!existingProject) {
          store.addProject({
            name: row.name || '',
            category: row.category || '',
            phase: row.phase || '',
            location: row.location || '',
            capacity: row.capacity || '',
            description: row.description || '',
            status: row.status || 'pending',
            priority: row.priority || 'medium',
            progress: parseInt(row.progress) || 0,
            budget: parseFloat(row.budget) || 0,
            startDate: row.startDate || new Date().toISOString().split('T')[0],
            endDate: row.endDate || '',
            members: []
          });
          importedCount++;
        }
      });
      break;

    case 'task':
      data.forEach(row => {
        const existingTask = state.tasks.find(t => t.name === row.name && t.projectId === row.projectId);
        if (!existingTask) {
          store.addTask({
            name: row.name || '',
            projectId: row.projectId || '',
            description: row.description || '',
            assigneeId: row.assigneeId || null,
            priority: row.priority || 'medium',
            status: row.status || 'todo',
            progress: parseInt(row.progress) || 0,
            startDate: row.startDate || new Date().toISOString().split('T')[0],
            dueDate: row.dueDate || ''
          });
          importedCount++;
        }
      });
      break;

    case 'material':
      data.forEach(row => {
        const existingMaterial = state.materials.find(m => m.name === row.name && m.projectId === row.projectId);
        if (!existingMaterial) {
          store.addMaterial({
            name: row.name || '',
            projectId: row.projectId || '',
            category: row.category || '',
            quantity: parseFloat(row.quantity) || 0,
            unitPrice: parseFloat(row.unitPrice) || 0,
            status: row.status || 'pending',
            supplier: row.supplier || '',
            deliveryDate: row.deliveryDate || ''
          });
          importedCount++;
        }
      });
      break;

    case 'worker':
      data.forEach(row => {
        const existingWorker = state.temporaryWorkers.find(w => w.name === row.name && w.projectId === row.projectId);
        if (!existingWorker) {
          store.addTemporaryWorker({
            name: row.name || '',
            projectId: row.projectId || '',
            position: row.position || '',
            dailyRate: parseFloat(row.dailyRate) || 0,
            startDate: row.startDate || new Date().toISOString().split('T')[0],
            endDate: row.endDate || '',
            status: row.status || 'active',
            totalHours: 0
          });
          importedCount++;
        }
      });
      break;

    case 'document':
      data.forEach(row => {
        const existingDoc = state.documents.find(d => d.name === row.name && d.projectId === row.projectId);
        if (!existingDoc) {
          store.addDocument({
            name: row.name || '',
            projectId: row.projectId || '',
            category: row.category || '',
            size: parseInt(row.size) || 0,
            uploadedBy: row.uploadedBy || state.currentUser?.id,
            uploadedAt: row.uploadDate || new Date().toISOString()
          });
          importedCount++;
        }
      });
      break;

    case 'budget':
      data.forEach(row => {
        const existingBudget = state.budgets.find(b => b.name === row.name && b.projectId === row.projectId);
        if (!existingBudget) {
          store.addBudget({
            name: row.name || '',
            projectId: row.projectId || '',
            category: row.category || '',
            budgetAmount: parseFloat(row.budgetAmount) || 0,
            spentAmount: parseFloat(row.spentAmount) || 0,
            status: row.status || 'active'
          });
          importedCount++;
        }
      });
      break;
  }

  store.addNotification({
    type: 'success',
    title: '导入成功',
    message: `成功导入 ${importedCount} 条${getModuleName(module)}数据`
  });

  sessionStorage.removeItem('importData');
  closeModal('importModal');
  renderImportData();
}
