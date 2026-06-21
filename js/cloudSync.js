/**
 * 多用户实时数据同步模块 v4.0
 * 
 * 核心架构：云端为唯一可信数据源，本地仅做临时展示缓存
 * 
 * 同步流程：
 *   上行：本地操作 → 上传云端 → 云端校验版本号 → 通过则更新 → 广播所有客户端
 *   下行：云端变更 → WebSocket/轮询 → 强制覆盖本地 → 刷新UI
 *   登录：鉴权成功 → 全量拉取云端 → 清空本地 → 覆盖写入
 *
 * 异常处理：
 *   离线状态：禁止修改数据，仅可查看
 *   上传失败：本地数据不变，加入离线队列，网络恢复后自动重试
 *   版本冲突：云端版本更高时，本地修改被驳回，强制拉取云端最新数据
 *   多端同时操作：云端先到先得，后提交者版本冲突被拒绝
 */

class CloudSync {
  constructor() {
    this.supabaseUrl = '';
    this.supabaseKey = '';
    this.isConfigured = false;
    this.syncStatus = 'offline'; // offline | online | syncing | error
    this.lastSyncTime = null;
    this.listeners = [];
    
    // 状态标志
    this._initialized = false;
    this._isUploading = false;
    this._isPulling = false;
    this._isOnline = false;
    
    // 轮询相关
    this._pollMinInterval = 3000;
    this._pollMaxInterval = 60000;
    this._pollInterval = this._pollMinInterval;
    this._pollErrorCount = 0;
    this._pollTimeout = null;
    
    // WebSocket 相关
    this._realtimeSocket = null;
    this._reconnectCount = 0;
    this._reconnecting = false;
    this._maxReconnects = 10;
    this._intentionalStop = false;
    
    // 防抖相关
    this._syncDebounceTimer = null;
    this._syncDebounceMs = 300;
    
    // 离线队列
    this._offlineQueue = [];
    this._processingQueue = false;
    
    // 数据版本号映射（本地缓存各表最新版本号）
    this._versionMap = {};
    
    // 上传冷却期（防止上传后立即被旧数据覆盖）
    this._lastUploadTime = 0;
    this._uploadCooldownMs = 500;
    
    // 数据表映射
    this._tableMap = [
      { table: 'users',             key: 'users' },
      { table: 'projects',          key: 'projects' },
      { table: 'tasks',             key: 'tasks' },
      { table: 'documents',         key: 'documents' },
      { table: 'resources',         key: 'resources' },
      { table: 'milestones',        key: 'milestones' },
      { table: 'risks',             key: 'risks' },
      { table: 'issues',            key: 'issues' },
      { table: 'progress_reports',  key: 'progressReports' },
      { table: 'daily_logs',        key: 'dailyLogs' },
      { table: 'warnings',          key: 'warnings' },
      { table: 'schedule_changes',  key: 'scheduleChanges' },
      { table: 'budgets',           key: 'budgets' },
      { table: 'payments',          key: 'payments' },
      { table: 'materials',         key: 'materials' },
      { table: 'after_sales',       key: 'afterSales' },
      { table: 'temporary_workers', key: 'temporaryWorkers' },
      { table: 'worker_attendance', key: 'workerAttendance' },
      { table: 'expenses',          key: 'expenses' },
      { table: 'cameras',           key: 'cameras' },
      { table: 'notifications',     key: 'notifications' },
      { table: 'task_status_config',key: 'taskStatusConfig' },
      { table: 'custom_forms',      key: 'customForms' },
      { table: 'custom_fields',     key: 'customFields' },
      { table: 'system_settings',   key: 'systemSettings' }
    ];
    
    this.loadConfig();
    this._registerStoreListener();
    this._registerUnloadHandler();
    this._registerNetworkListener();
  }
  
  getDefaultConfig() {
    return {
      url: 'https://br-sweet-deer-58a4aa62.supabase.aidap-global.cn-beijing.volces.com',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1wbGF0Zm9ybSIsInJvbGUiOiJhbm9uIiwiZXhwIjozNjc5MTY5OTg3fQ.DwOAxdpM3GIKzSU4MiQPc7BLE96S7lJStAPkA0uoAec'
    };
  }
  
  loadConfig() {
    const savedUrl = Storage.get('cloudSyncUrl', '');
    const savedKey = Storage.get('cloudSyncKey', '');
    const cloudSyncEnabled = Storage.get('cloudSyncEnabled', false);
    
    if (savedUrl && savedKey && savedKey.length > 10) {
      this.supabaseUrl = savedUrl;
      this.supabaseKey = savedKey;
      this.isConfigured = cloudSyncEnabled;
    } else {
      const defaults = this.getDefaultConfig();
      this.supabaseUrl = defaults.url;
      this.supabaseKey = defaults.key;
      this.isConfigured = true;
    }
  }
  
  _registerNetworkListener() {
    const updateOnlineStatus = () => {
      const wasOnline = this._isOnline;
      this._isOnline = navigator.onLine;
      
      if (this._isOnline && !wasOnline) {
        console.log('[CloudSync] 网络恢复，开始自动同步');
        this._processOfflineQueue();
        if (this._initialized) {
          this._fullPullFromCloud();
        }
      }
      
      this.setStatus(this._isOnline ? this.syncStatus : 'offline');
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    this._isOnline = navigator.onLine;
  }
  
  _registerStoreListener() {
    const maxRetries = 50;
    let retryCount = 0;
    
    const tryRegister = () => {
      if (typeof store !== 'undefined' && store && store.onSave) {
        store.onSave((data) => this._onLocalDataChanged(data));
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryRegister, 100);
      }
    };
    tryRegister();
  }
  
  _registerUnloadHandler() {
    const cleanup = () => {
      this._stopPeriodicPull();
      this._stopRealtimeSync();
      if (this._syncDebounceTimer) {
        clearTimeout(this._syncDebounceTimer);
        this._syncDebounceTimer = null;
      }
    };
    
    const pauseSync = () => {
      this._stopPeriodicPull();
      this._stopRealtimeSync();
      if (this._syncDebounceTimer) {
        clearTimeout(this._syncDebounceTimer);
        this._syncDebounceTimer = null;
      }
    };
    
    const resumeSync = () => {
      if (this.isConfigured && this._initialized && this._isOnline) {
        this._startPeriodicPull();
        this._startRealtimeSubscription();
      }
    };
    
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', pauseSync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        pauseSync();
      } else {
        resumeSync();
      }
    });
  }
  
  async initComplete() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    
    this.addStatusListener((status) => this.updateSyncUI(status));
    
    if (!this.isConfigured) {
      return;
    }
    
    try {
      const result = await this.testConnection();
      this.updateSyncUI(this.syncStatus);
      
      if (result.success) {
        if (!store || !store.getState) {
          console.warn('[CloudSync] store 未初始化');
          return;
        }
        const localSnapshot = JSON.parse(JSON.stringify(store.getState()));
        const pullResult = await this._fullPullFromCloud();
        
        if (pullResult.totalRecords === 0) {
          console.log('[CloudSync] 云端为空，上传本地初始数据');
          for (const { table, key } of this._tableMap) {
            const data = store.getState()[key];
            if (Array.isArray(data) && data.length > 0) {
              for (const item of data) {
                if (!item._version) {
                  item._version = 1;
                }
              }
            }
          }
          store.saveToStorageSilent();
          await this._uploadToCloud();
        }
        
        this._startPeriodicPull();
        this._startRealtimeSubscription();
      } else {
        this._initialized = false;
        setTimeout(async () => {
          if (!this._initialized && this.isConfigured) {
            await this.initComplete();
          }
        }, 5000);
      }
    } catch (e) {
      console.error('[CloudSync] initComplete 异常:', e);
      this._initialized = false;
      setTimeout(async () => {
        if (!this._initialized && this.isConfigured) {
          await this.initComplete();
        }
      }, 5000);
    }
  }
  
  async _fullPullFromCloud() {
    if (!this.isConfigured) return { success: false };
    if (!store || !store.getState) {
      console.warn('[CloudSync] store 未初始化');
      return { success: false };
    }
    
    this._isPulling = true;
    this.setStatus('syncing');
    this.showToast('正在从云端拉取最新数据...');
    
    let successCount = 0;
    let failCount = 0;
    let totalRecords = 0;
    const failedTables = [];
    
    const pendingDeletions = this._getPendingDeletions();
    const deletionSuccessTables = new Set();
    
    for (const [tableName, ids] of Object.entries(pendingDeletions)) {
      if (ids && ids.length > 0) {
        try {
          console.log(`[CloudSync] 全量拉取前删除 ${tableName} ${ids.length} 条数据`);
          await this._deleteFromTable(tableName, ids);
          deletionSuccessTables.add(tableName);
          for (const id of ids) {
            if (this._versionMap[tableName]) {
              delete this._versionMap[tableName][id];
            }
          }
        } catch (e) {
          console.error(`[CloudSync] 全量拉取前删除 ${tableName} 失败:`, e.message);
        }
      }
    }
    
    if (deletionSuccessTables.size > 0 && typeof store !== 'undefined' && store.popPendingDeletions) {
      store.popPendingDeletions();
    }
    
    for (const { table, key } of this._tableMap) {
      try {
        const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}?select=*`, {
          method: 'GET',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          const cloudData = await response.json();
          const items = this._extractItems(cloudData, table);
          
          const localItems = store.state[key];
          const mergedItems = this._mergeLocalWithRemote(localItems, items, table);
          
          store.state[key] = mergedItems;
          totalRecords += Array.isArray(mergedItems) ? mergedItems.length : 1;
          
          this._updateVersionMap(table, cloudData);
          successCount++;
        } else if (response.status === 404) {
          successCount++;
          console.warn(`[CloudSync] 表 ${table} 不存在，需要在Supabase中创建`);
        } else {
          failCount++;
          failedTables.push(table);
        }
      } catch (error) {
        failCount++;
        failedTables.push(table);
      }
    }
    
    store.saveToStorageSilent();
    store.updateStatistics();
    
    if (store.notify) {
      store.notify();
    }
    
    this.setStatus('online');
    this._isOnline = true;
    this.lastSyncTime = new Date().toISOString();
    Storage.set('lastSyncTime', this.lastSyncTime);
    
    if (failCount === 0) {
      this.showToast(`云端数据已同步（${totalRecords}条记录）`);
    } else {
      this.showToast(`云端同步完成（${successCount}个表成功，${failCount}个表失败）`);
    }
    
    this._refreshUI();
    
    this._isPulling = false;
    return { success: failCount === 0, totalRecords, failedTables };
  }
  
  _updateVersionMap(tableName, cloudData) {
    if (!Array.isArray(cloudData) || cloudData.length === 0) {
      delete this._versionMap[tableName];
      return;
    }
    
    const pendingDeletions = this._getPendingDeletions();
    const deletedIds = pendingDeletions[tableName] || [];
    
    const cloudIds = new Set();
    
    if (!this._versionMap[tableName]) {
      this._versionMap[tableName] = {};
    }
    
    for (const item of cloudData) {
      if (item && item.id) {
        if (deletedIds.includes(item.id)) {
          continue;
        }
        const data = item.data !== undefined ? item.data : item;
        this._versionMap[tableName][item.id] = data._version || 0;
        cloudIds.add(item.id);
      }
    }
    
    for (const id of Object.keys(this._versionMap[tableName])) {
      if (!cloudIds.has(id)) {
        delete this._versionMap[tableName][id];
        console.log(`[CloudSync] 版本映射中删除已云端删除的数据 ${tableName} id=${id}`);
      }
    }
  }
  
  isOnline() {
    return this._isOnline && this.isConfigured && this.syncStatus === 'online';
  }
  
  async _onLocalDataChanged(_data) {
    if (!this.isConfigured) return;
    
    if (this._syncDebounceTimer) {
      clearTimeout(this._syncDebounceTimer);
      this._syncDebounceTimer = null;
    }
    
    this._syncDebounceTimer = setTimeout(() => {
      this._syncDebounceTimer = null;
      if (this._isUploading || this._isPulling) {
        this._syncRetryCount = (this._syncRetryCount || 0) + 1;
        if (this._syncRetryCount <= 10) {
          setTimeout(() => this._onLocalDataChanged(null), 500);
        } else {
          console.warn('[CloudSync] 同步重试已达上限，放弃本次同步');
          this._syncRetryCount = 0;
        }
        return;
      }
      this._syncRetryCount = 0;
      this._uploadChangedData();
    }, this._syncDebounceMs);
  }
  
  async uploadAndSave(tableName, data, operation) {
    if (!this.isConfigured || !this._isOnline) {
      this.showToast('离线状态，无法保存数据');
      return { success: false, message: '离线状态' };
    }
    
    this._isUploading = true;
    
    try {
      const key = this.tableToLocalKey(tableName);
      
      const response = await fetch(`${this.supabaseUrl}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal, resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: data.id,
          data: { ...data, _version: data._version || 1 }
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 409) {
          this.showToast('数据版本冲突，请刷新页面获取最新数据');
          setTimeout(() => this._fullPullFromCloud(), 1000);
          return { success: false, message: '版本冲突', conflict: true };
        }
        throw new Error(`上传失败: ${response.status}, ${errorText.substring(0, 200)}`);
      }
      
      this.lastSyncTime = new Date().toISOString();
      Storage.set('lastSyncTime', this.lastSyncTime);
      
      return { success: true, message: '保存成功' };
    } catch (error) {
      console.error('[CloudSync] uploadAndSave 失败:', error);
      
      this._offlineQueue.push({
        tableName,
        data,
        operation,
        timestamp: Date.now()
      });
      
      this.showToast('网络异常，数据已加入离线队列');
      return { success: false, message: '网络异常', queued: true };
    } finally {
      this._isUploading = false;
    }
  }
  
  async _uploadToCloud() {
    if (!this.isConfigured || this._isUploading) return { successCount: 0, failCount: 0, failedTables: [], clearedTables: [] };
    
    if (!this._isOnline) {
      return { successCount: 0, failCount: 0, failedTables: [], clearedTables: [] };
    }
    
    if (!store || !store.getState) {
      console.warn('[CloudSync] store 未初始化');
      return { successCount: 0, failCount: 0, failedTables: [], clearedTables: [] };
    }
    
    this._isUploading = true;
    this.setStatus('syncing');
    
    let successCount = 0;
    let failCount = 0;
    const failedTables = [];
    
    try {
      const state = store.getState();
      
      const pendingDeletions = this._getPendingDeletions();
      const failedDeletionTables = new Set();
      
      for (const [tableName, ids] of Object.entries(pendingDeletions)) {
        if (ids && ids.length > 0) {
          try {
            await this._deleteFromTable(tableName, ids);
            successCount++;
          } catch (e) {
            failedDeletionTables.add(tableName);
            failCount++;
          }
        }
      }
      
      if (failedDeletionTables.size === 0 && typeof store !== 'undefined' && store.popPendingDeletions) {
        store.popPendingDeletions();
      }
      
      for (const { table, key } of this._tableMap) {
        const data = state[key];
        if (data === null || data === undefined) continue;
        
        if (failedDeletionTables.has(table)) {
          continue;
        }
        
        try {
          if (Array.isArray(data)) {
            const pendingIds = pendingDeletions[table] || [];
            const filteredData = pendingIds.length > 0
              ? data.filter(item => item && !pendingIds.includes(item.id))
              : data;
            
            if (filteredData.length > 0) {
              await this._upsertToTable(table, filteredData);
            }
            for (const item of filteredData) {
              if (!this._versionMap[table]) this._versionMap[table] = {};
              if (!item._version) item._version = 1;
              this._versionMap[table][item.id] = item._version;
            }
          } else if (table === 'system_settings') {
            await this._upsertConfigTable(table, data);
          } else {
            await this._upsertToTable(table, [data]);
            if (!this._versionMap[table]) this._versionMap[table] = {};
            if (!data._version) data._version = 1;
            this._versionMap[table][data.id] = data._version;
          }
          successCount++;
        } catch (error) {
          failCount++;
          failedTables.push(table);
          console.error(`[CloudSync] 全量上传 ${table} 失败:`, error.message);
        }
      }
      
      this.lastSyncTime = new Date().toISOString();
      Storage.set('lastSyncTime', this.lastSyncTime);
      
      if (failCount > 0) {
        this.showToast(`数据同步部分失败（${failCount}个表），将自动重试`);
      }
    } catch (e) {
      console.error('[CloudSync] 上传过程发生严重错误:', e);
    } finally {
      this.setStatus('online');
      this._isUploading = false;
    }
    
    return { successCount, failCount, failedTables, clearedTables: [] };
  }
  
  async _uploadChangedData() {
    if (!this.isConfigured || !this._isOnline) return;
    if (!store || !store.getState) return;
    
    this._isUploading = true;
    this.setStatus('syncing');
    
    try {
      const state = store.getState();
      const pendingDeletions = this._getPendingDeletions();
      const deletionSuccessTables = new Set();
      
      for (const [tableName, ids] of Object.entries(pendingDeletions)) {
        if (ids && ids.length > 0) {
          try {
            console.log(`[CloudSync] 删除 ${tableName} ${ids.length} 条数据`);
            await this._deleteFromTable(tableName, ids);
            deletionSuccessTables.add(tableName);
            for (const id of ids) {
              if (this._versionMap[tableName]) {
                delete this._versionMap[tableName][id];
              }
            }
            console.log(`[CloudSync] 删除 ${tableName} 成功`);
          } catch (e) {
            console.error(`[CloudSync] 删除 ${tableName} 失败:`, e.message);
          }
        }
      }
      
      if (deletionSuccessTables.size > 0 && typeof store !== 'undefined' && store.popPendingDeletions) {
        store.popPendingDeletions();
      }
      
      for (const { table, key } of this._tableMap) {
        const data = state[key];
        if (data === null || data === undefined) continue;
        
        if (!Array.isArray(data)) continue;
        
        const changedItems = data.filter(item => {
          if (!item || !item.id) return false;
          const localVersion = item._version || 0;
          const cloudVersion = (this._versionMap[table] && this._versionMap[table][item.id]) || 0;
          const cloudHasItem = this._versionMap[table] && this._versionMap[table][item.id] !== undefined;
          return localVersion > cloudVersion || !cloudHasItem;
        });
        
        if (changedItems.length > 0) {
          console.log(`[CloudSync] 上传 ${table} 变更数据 ${changedItems.length} 条`);
          try {
            await this._upsertToTable(table, changedItems);
            for (const item of changedItems) {
              if (!this._versionMap[table]) this._versionMap[table] = {};
              if (!item._version) item._version = 1;
              this._versionMap[table][item.id] = item._version;
              delete item._uploadRetries;
            }
          } catch (e) {
            console.error(`[CloudSync] 上传 ${table} 失败:`, e.message);
            for (const item of changedItems) {
              if (!item._uploadRetries) item._uploadRetries = 0;
              item._uploadRetries++;
              if (item._uploadRetries <= 5) {
                console.log(`[CloudSync] ${table} id=${item.id} 将在下次重试（${item._uploadRetries}/5）`);
              } else {
                console.warn(`[CloudSync] ${table} id=${item.id} 重试已达上限，降级为本地缓存`);
                if (!this._versionMap[table]) this._versionMap[table] = {};
                if (!item._version) item._version = 1;
                this._versionMap[table][item.id] = item._version;
              }
            }
          }
        }
      }
      
      this.lastSyncTime = new Date().toISOString();
      Storage.set('lastSyncTime', this.lastSyncTime);
      
      store.saveToStorageSilent();
      store.updateStatistics();
      if (store.notify) {
        store.notify();
      }
      this._lastUploadTime = Date.now();
      
      setTimeout(() => {
        this._pullCloudChanges();
      }, this._uploadCooldownMs + 100);
    } catch (e) {
      console.error('[CloudSync] 增量上传失败:', e);
    } finally {
      this.setStatus('online');
      this._isUploading = false;
    }
  }
  
  async _processOfflineQueue() {
    if (this._processingQueue || !this._isOnline) return;
    
    this._processingQueue = true;
    
    try {
      const queue = [...this._offlineQueue];
      this._offlineQueue = [];
      
      console.log(`[CloudSync] 处理离线队列，共 ${queue.length} 条`);
      
      for (const item of queue) {
        try {
          await this._upsertToTable(item.tableName, [item.data]);
        } catch (e) {
          this._offlineQueue.push(item);
        }
      }
      
      if (this._offlineQueue.length > 0) {
        console.warn(`[CloudSync] 离线队列处理失败 ${this._offlineQueue.length} 条，稍后重试`);
        setTimeout(() => this._processOfflineQueue(), 3000);
      }
    } finally {
      this._processingQueue = false;
    }
  }
  
  async _upsertConfigTable(tableName, configData) {
    const items = [];
    
    for (const [configKey, configValue] of Object.entries(configData)) {
      items.push({
        id: configKey,
        data: { ...configValue, _version: configValue._version || 1 }
      });
    }
    
    await this._upsertSingle(tableName, items);
  }
  
  async _upsertToTable(tableName, data) {
    if (!data || data.length === 0) return;
    
    const formattedData = data.map(item => ({
      id: item.id || `id_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      data: { ...item, _version: item._version || 1 }
    }));
    
    await this._upsertSingle(tableName, formattedData);
  }
  
  async _upsertSingle(tableName, items) {
    let failCount = 0;
    let lastError = null;
    
    for (const item of items) {
      try {
        const itemData = item.data !== undefined ? item.data : item;
        
        const response = await fetch(`${this.supabaseUrl}/rest/v1/${tableName}`, {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal, resolution=merge-duplicates'
          },
          body: JSON.stringify({ id: item.id, data: itemData }),
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          failCount++;
          const errorText = await response.text();
          console.error(`[CloudSync] POST ${tableName} id=${item.id} 失败: ${response.status}`);
          console.error(`[CloudSync] 错误详情:`, errorText);
          console.error(`[CloudSync] 请求体:`, JSON.stringify(item).substring(0, 500));
          
          lastError = new Error(`POST ${tableName} id=${item.id} 失败: ${response.status}, ${errorText.substring(0, 200)}`);
          
          if (response.status === 409) {
            console.warn(`[CloudSync] 版本冲突 ${tableName} id=${item.id}，将拉取最新数据`);
            setTimeout(() => this._pullCloudChanges(), 500);
          } else if (response.status === 404) {
            console.warn(`[CloudSync] 表 ${tableName} 不存在，尝试自动创建`);
            await this._createTable(tableName);
          } else if (response.status === 400) {
            console.warn(`[CloudSync] 请求参数错误 ${tableName} id=${item.id}`);
          } else if (response.status === 401 || response.status === 403) {
            console.warn(`[CloudSync] 权限错误 ${tableName}`);
          }
        }
      } catch (e) {
        failCount++;
        lastError = e;
      }
    }
    
    if (failCount > 0) {
      throw lastError || new Error(`${tableName} 上传失败 ${failCount}/${items.length}`);
    }
  }
  
  async _createTable(tableName) {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (id TEXT PRIMARY KEY, data JSONB);`;
      
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        console.log(`[CloudSync] 表 ${tableName} 创建成功`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await fetch(`${this.supabaseUrl}/rest/v1/${tableName}?id=eq.__init__`, {
          method: 'DELETE',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          },
          signal: AbortSignal.timeout(10000)
        });
      }
    } catch (e) {
      console.error(`[CloudSync] 创建表 ${tableName} 异常:`, e.message);
    }
  }
  
  async _clearTable(tableName) {
    const queryResp = await fetch(`${this.supabaseUrl}/rest/v1/${tableName}?select=id`, {
      method: 'GET',
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!queryResp.ok) {
      if (queryResp.status === 404) return;
      throw new Error(`查询 ${tableName} 失败: ${queryResp.status}`);
    }
    
    const items = await queryResp.json();
    if (!items || items.length === 0) return;
    
    const ids = items.map(item => item.id).filter(id => id);
    if (ids.length === 0) return;
    
    await this._deleteFromTable(tableName, ids);
  }
  
  async _deleteFromTable(tableName, ids) {
    if (!ids || ids.length === 0) return;
    const idList = ids.map(id => encodeURIComponent(id)).join(',');
    
    const response = await fetch(`${this.supabaseUrl}/rest/v1/${tableName}?id=in.(${idList})`, {
      method: 'DELETE',
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`删除 ${tableName} 失败: HTTP ${response.status}`);
    }
  }
  
  _startPeriodicPull() {
    this._stopPeriodicPull();
    this._pollErrorCount = 0;
    this._pollInterval = this._pollMinInterval;
    this._scheduleNextPull();
  }
  
  _scheduleNextPull() {
    if (!this.isConfigured || !this._isOnline) return;
    
    this._pollTimeout = setTimeout(async () => {
      if (!this._isPulling && !this._isUploading) {
        try {
          await this._pullCloudChanges();
          this._pollErrorCount = 0;
          this._pollInterval = Math.max(this._pollMinInterval, this._pollInterval / 2);
        } catch (e) {
          console.error('[CloudSync] 轮询异常:', e);
          this._pollErrorCount++;
          this._pollInterval = Math.min(this._pollMaxInterval, this._pollInterval * 2);
        }
      }
      this._scheduleNextPull();
    }, this._pollInterval);
  }
  
  _stopPeriodicPull() {
    if (this._pollTimeout) {
      clearTimeout(this._pollTimeout);
      this._pollTimeout = null;
    }
  }
  
  async _pullCloudChanges() {
    if (!this.isConfigured || this._isPulling || this._isUploading) {
      return;
    }
    if (!store || !store.getState) {
      return;
    }
    
    const timeSinceUpload = Date.now() - this._lastUploadTime;
    if (timeSinceUpload < this._uploadCooldownMs) {
      console.log(`[CloudSync] 上传冷却期中，跳过拉取（还需 ${this._uploadCooldownMs - timeSinceUpload}ms）`);
      return;
    }
    
    console.log(`[CloudSync] 开始轮询拉取（间隔: ${this._pollInterval}ms）`);
    const startTime = Date.now();
    
    this._isPulling = true;
    
    try {
      const state = store.getState();
      let hasUpdate = false;
      
      for (const { table, key } of this._tableMap) {
        try {
          const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}?select=*`, {
            method: 'GET',
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            const cloudData = await response.json();
            const remoteItems = this._extractItems(cloudData, table);
            const localItems = state[key];
            
            const mergedItems = this._mergeLocalWithRemote(localItems, remoteItems, table);
            
            const { changed } = this._compareData(localItems, mergedItems);
            
            if (changed) {
              store.state[key] = mergedItems;
              hasUpdate = true;
            }
            
            this._updateVersionMap(table, cloudData);
          }
        } catch (error) {
          console.warn(`[CloudSync] 表 ${table} 拉取异常:`, error.message);
        }
      }
      
      if (hasUpdate) {
        store.saveToStorageSilent();
        store.updateStatistics();
        
        if (store.notify) {
          store.notify();
        }
        
        this.setStatus('online');
        this.lastSyncTime = new Date().toISOString();
        Storage.set('lastSyncTime', this.lastSyncTime);
        
        this._refreshUI();
        this._notifyPageUpdate();
        
        console.log(`[CloudSync] 轮询完成，检测到更新，耗时 ${Date.now() - startTime}ms`);
      } else {
        console.log(`[CloudSync] 轮询完成，无更新，耗时 ${Date.now() - startTime}ms`);
      }
    } finally {
      this._isPulling = false;
    }
  }
  
  _stableStringify(obj) {
    if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) {
      return '[' + obj.map(v => this._stableStringify(v)).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    const pairs = keys.map(k => JSON.stringify(k) + ':' + this._stableStringify(obj[k]));
    return '{' + pairs.join(',') + '}';
  }
  
  _mergeLocalWithRemote(localItems, remoteItems, table) {
    if (!Array.isArray(localItems)) localItems = [];
    if (!Array.isArray(remoteItems)) remoteItems = [];
    
    const pendingDeletions = this._getPendingDeletions();
    const deletedIds = pendingDeletions[table] || [];
    
    const mergedMap = {};
    const remoteIds = new Set();
    
    for (const remoteItem of remoteItems) {
      if (!remoteItem || !remoteItem.id) continue;
      if (deletedIds.includes(remoteItem.id)) {
        console.log(`[CloudSync] 跳过已标记删除的云端数据 ${table} id=${remoteItem.id}`);
        continue;
      }
      mergedMap[remoteItem.id] = remoteItem;
      remoteIds.add(remoteItem.id);
    }
    
    for (const localItem of localItems) {
      if (!localItem || !localItem.id) continue;
      if (deletedIds.includes(localItem.id)) {
        continue;
      }
      
      if (remoteIds.has(localItem.id)) {
        const localVersion = localItem._version || 0;
        const remoteVersion = (mergedMap[localItem.id] && mergedMap[localItem.id]._version) || 0;
        
        if (localVersion > remoteVersion) {
          mergedMap[localItem.id] = localItem;
        }
      } else {
        const isNewLocalItem = !this._versionMap[table] || this._versionMap[table][localItem.id] === undefined;
        if (isNewLocalItem && (localItem._version || 0) > 0) {
          console.log(`[CloudSync] 保留本地新增数据 ${table} id=${localItem.id}`);
          mergedMap[localItem.id] = localItem;
        }
      }
    }
    
    return Object.values(mergedMap);
  }
  
  _compareData(localItems, remoteItems) {
    const stripMeta = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(stripMeta);
      const cleaned = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k === '_version' || k === '_uploadRetries' || k === 'updatedAt') continue;
        cleaned[k] = v;
      }
      return cleaned;
    };
    
    if (typeof localItems === 'object' && !Array.isArray(localItems)) {
      const localStr = this._stableStringify(stripMeta(localItems));
      const remoteStr = this._stableStringify(stripMeta(remoteItems));
      return {
        changed: localStr !== remoteStr,
        added: 0,
        removed: 0,
        updated: localStr !== remoteStr ? 1 : 0
      };
    }
    
    if (!Array.isArray(localItems)) localItems = [];
    if (!Array.isArray(remoteItems)) remoteItems = [];
    
    const localValid = localItems.filter(item => item && item.id);
    const remoteValid = remoteItems.filter(item => item && item.id);
    
    let added = 0, removed = 0, updated = 0;
    
    const localMap = {};
    for (const item of localValid) {
      localMap[item.id] = item;
    }
    
    const compareWithoutMeta = (a, b) => {
      return this._stableStringify(stripMeta(a)) !== this._stableStringify(stripMeta(b));
    };
    
    const remoteMap = {};
    for (const item of remoteValid) {
      remoteMap[item.id] = item;
      
      if (!localMap[item.id]) {
        added++;
      } else {
        if (compareWithoutMeta(item, localMap[item.id])) {
          updated++;
        }
      }
    }
    
    for (const id in localMap) {
      if (!remoteMap[id]) {
        removed++;
      }
    }
    
    return {
      changed: (added + removed + updated) > 0,
      added, removed, updated
    };
  }
  
  _startRealtimeSubscription() {
    if (!this.isConfigured) return;
    if (this._reconnecting) return;
    
    this._intentionalStop = false;
    
    try {
      const wsUrl = this.supabaseUrl.replace('https://', 'wss://')
        + '/realtime/v1/websocket?apikey='
        + encodeURIComponent(this.supabaseKey)
        + '&vsn=1.0.0';
      
      const socket = new WebSocket(wsUrl);
      
      let heartbeatTimer = null;
      const startHeartbeat = () => {
        heartbeatTimer = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: '0' }));
          }
        }, 30000);
      };
      
      const timeoutTimer = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          socket.close();
        }
      }, 10000);
      
      socket.onopen = () => {
        clearTimeout(timeoutTimer);
        this._reconnectCount = 0;
        
        this._tableMap.forEach(({ table }, index) => {
          const joinMsg = {
            topic: `realtime:public:${table}`,
            event: 'phx_join',
            payload: {
              config: {
                broadcast: { self: false },
                presence: { key: '' },
                postgres_changes: [
                  { event: 'INSERT', schema: 'public', table: table },
                  { event: 'UPDATE', schema: 'public', table: table },
                  { event: 'DELETE', schema: 'public', table: table }
                ]
              }
            },
            ref: String(index + 1)
          };
          socket.send(JSON.stringify(joinMsg));
        });
        
        startHeartbeat();
      };
      
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.event === 'heartbeat') {
            return;
          }
          
          if (msg.event === 'phx_reply') {
            if (msg.payload && msg.payload.status === 'error') {
              console.warn('[CloudSync] WebSocket 订阅错误:', msg.payload.response);
            }
            return;
          }
          
          if (msg.event === 'postgres_changes' || msg.event === 'broadcast') {
            setTimeout(() => {
              this._pullCloudChanges().catch(err => {
                console.error('[CloudSync] WebSocket 触发拉取失败:', err);
              });
            }, 0);
          }
        } catch (e) {
        }
      };
      
      socket.onerror = () => {
        clearTimeout(timeoutTimer);
        console.warn('[CloudSync] WebSocket 连接错误');
      };
      
      socket.onclose = (event) => {
        clearTimeout(timeoutTimer);
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (event.code !== 1000 && event.code !== 1001) {
          this._scheduleReconnect();
        }
      };
      
      this._realtimeSocket = socket;
    } catch (e) {
      console.warn('[CloudSync] WebSocket 连接失败:', e.message);
      this._scheduleReconnect();
    }
  }
  
  _scheduleReconnect() {
    if (!this.isConfigured || this._reconnecting || this._intentionalStop) {
      return;
    }
    
    this._reconnecting = true;
    this._reconnectCount = (this._reconnectCount || 0) + 1;
    
    if (this._reconnectCount > this._maxReconnects) {
      this._reconnecting = false;
      return;
    }
    
    const interval = Math.min(5000 * Math.pow(2, this._reconnectCount - 1), 60000);
    
    setTimeout(() => {
      this._reconnecting = false;
      this._startRealtimeSubscription();
    }, interval);
  }
  
  _stopRealtimeSync() {
    this._intentionalStop = true;
    this._stopPeriodicPull();
    if (this._realtimeSocket) {
      try { this._realtimeSocket.close(); } catch (e) {}
      this._realtimeSocket = null;
    }
    if (this._syncDebounceTimer) {
      clearTimeout(this._syncDebounceTimer);
      this._syncDebounceTimer = null;
    }
  }
  
  _extractItems(cloudData, tableName) {
    if (!cloudData || !Array.isArray(cloudData) || cloudData.length === 0) return [];
    if (tableName === 'system_settings') {
      const result = {};
      for (const item of cloudData) {
        if (item && item.id) {
          result[item.id] = item.data !== undefined ? item.data : item;
        }
      }
      return result;
    }
    return cloudData.map(item => {
      if (!item) return null;
      const extracted = item.data !== undefined ? item.data : item;
      if (!extracted || typeof extracted !== 'object') {
        return null;
      }
      if (!extracted.id && item.id) {
        extracted.id = item.id;
      }
      return extracted;
    }).filter(item => item !== null);
  }
  
  _refreshUI() {
    if (typeof renderSidebar === 'function') renderSidebar();
    if (typeof renderHeader === 'function') renderHeader();
    if (typeof renderContent === 'function') renderContent();
  }
  
  _notifyPageUpdate() {
    const event = new CustomEvent('cloudSyncUpdate', {
      detail: {
        timestamp: Date.now(),
        lastSyncTime: this.lastSyncTime
      }
    });
    document.dispatchEvent(event);
  }
  
  _getPendingDeletions() {
    if (typeof store !== 'undefined' && store._pendingDeletions) {
      return store._pendingDeletions;
    }
    try {
      const saved = Storage.get('pendingDeletions', {});
      return saved || {};
    } catch (e) {
      return {};
    }
  }
  
  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, message: '未配置云端连接' };
    }
    
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/users?limit=1`, {
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok || response.status === 404) {
        this.setStatus('online');
        this._isOnline = true;
        return { success: true, message: '连接成功' };
      } else {
        this.setStatus('offline');
        return { success: false, message: `连接失败: ${response.status}` };
      }
    } catch (error) {
      this.setStatus('error');
      return { success: false, message: '连接错误: ' + error.message };
    }
  }
  
  configure(url, key, enabled = true) {
    this.supabaseUrl = url.trim();
    this.supabaseKey = key.trim();
    this.isConfigured = !!(this.supabaseUrl && this.supabaseKey) && enabled;
    
    Storage.set('cloudSyncUrl', this.supabaseUrl);
    Storage.set('cloudSyncKey', this.supabaseKey);
    Storage.set('cloudSyncEnabled', this.isConfigured);
    
    this._stopRealtimeSync();
    if (this.isConfigured && this._initialized) {
      this._startPeriodicPull();
      this._startRealtimeSubscription();
    }
    
    return this.isConfigured;
  }
  
  setStatus(status) {
    this.syncStatus = status;
    this.listeners.forEach(listener => {
      try { listener(status); } catch (e) {}
    });
  }
  
  addStatusListener(listener) {
    this.listeners.push(listener);
  }
  
  updateSyncUI(status) {
    const config = {
      'offline': { dot: 'offline', text: '离线', color: '#9ca3af', iconColor: '#9ca3af' },
      'online':  { dot: 'online', text: '已连接', color: '#10b981', iconColor: '#3b82f6' },
      'syncing': { dot: 'syncing', text: '同步中', color: '#f59e0b', iconColor: '#f59e0b' },
      'error':   { dot: 'offline', text: '连接失败', color: '#ef4444', iconColor: '#ef4444' }
    }[status] || { dot: 'offline', text: '离线', color: '#9ca3af', iconColor: '#9ca3af' };
    
    const dot = document.getElementById('syncDot');
    const text = document.getElementById('syncStatusText');
    const icon = document.getElementById('cloudIcon');
    
    if (dot) {
      dot.className = 'sync-dot';
      dot.style.backgroundColor = config.color;
      dot.style.boxShadow = (status === 'online' || status === 'syncing') ? `0 0 8px ${config.color}` : 'none';
      dot.style.animation = (status === 'syncing') ? 'pulse 1s infinite' : 'none';
    }
    if (text) { text.textContent = config.text; text.style.color = config.color; }
    if (icon) { icon.style.color = config.iconColor; }
    
    const dotM = document.getElementById('syncDotMobile');
    const textM = document.getElementById('syncTextMobile');
    if (dotM) {
      dotM.className = 'sync-dot ' + config.dot;
      if (status === 'online') dotM.classList.add('online');
      if (status === 'syncing') dotM.classList.add('syncing');
    }
    if (textM) textM.textContent = status === 'online' ? '云端' : status === 'syncing' ? '同步' : '离线';
  }
  
  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; top:20px; right:20px; background:#333; color:white;
      padding:12px 20px; border-radius:8px; z-index:99999; font-size:14px;
      box-shadow:0 4px 12px rgba(0,0,0,0.3); animation:slideIn 0.3s ease;
      max-width:320px; word-break:break-word;
    `;
    toast.textContent = '云端同步: ' + message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  }
  
  initRealtimeSync() {
    if (!this.isConfigured) {
      return;
    }
    this._startPeriodicPull();
    this._startRealtimeSubscription();
  }
  
  async pullAndOverwriteLocal() {
    return await this._fullPullFromCloud();
  }
  
  async syncToCloud() {
    if (!this.isConfigured) {
      this.showToast('未配置云端');
      return { success: false, failed: [], cleared: [] };
    }
    await this._uploadChangedData();
    return { success: true, failed: [], cleared: [] };
  }
  
  async forcePullFromCloud() {
    this.showToast('正在强制从云端拉取...');
    return await this._fullPullFromCloud();
  }
  
  async refreshFromCloud() {
    if (!this.isConfigured) {
      this.showToast('未配置云端');
      return { success: false };
    }
    this.showToast('正在从云端刷新...');
    await this._pullCloudChanges();
    return { success: true };
  }
  
  async diagnoseSync() {
    const info = {
      '云端同步已配置': this.isConfigured,
      '同步状态': this.syncStatus,
      '网络状态': this._isOnline ? '在线' : '离线',
      '已初始化': this._initialized,
      '轮询已启动': !!this._pollTimeout,
      '轮询间隔(ms)': this._pollInterval,
      'WebSocket已连接': this._realtimeSocket && this._realtimeSocket.readyState === WebSocket.OPEN,
      '重连次数': this._reconnectCount,
      '上次同步时间': this.lastSyncTime,
      '离线队列长度': this._offlineQueue.length,
      'Supabase URL': this.supabaseUrl ? '已设置' : '未设置',
      'Supabase Key': this.supabaseKey ? '已设置' : '未设置'
    };
    
    console.log('[CloudSync] 诊断报告:', info);
    
    for (const { table } of this._tableMap) {
      try {
        const resp = await fetch(`${this.supabaseUrl}/rest/v1/${table}?select=*`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        });
        if (resp.ok) {
          const data = await resp.json();
          console.log(`[CloudSync] 云端 ${table}: ${Array.isArray(data) ? data.length : 0} 条`);
        }
      } catch (e) {}
    }
    
    let msg = '=== 云端同步诊断 ===\n';
    for (const [key, value] of Object.entries(info)) {
      msg += `${key}: ${value}\n`;
    }
    msg += '\n请查看浏览器控制台获取详细日志。';
    
    alert(msg);
    return info;
  }
  
  startAutoSync(_minutes = 5) {
    this._startPeriodicPull();
  }
  
  stopAutoSync() {
    this._stopRealtimeSync();
  }
  
  getTables() {
    return this._tableMap.map(t => t.table);
  }
  
  tableToLocalKey(tableName) {
    const entry = this._tableMap.find(t => t.table === tableName);
    return entry ? entry.key : tableName;
  }
  
  openSettings() {
    const html = `
      <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:flex-start;justify-content:center;z-index:10000;padding-top:50px;overflow-y:auto;">
        <div style="background:white;border-radius:16px;padding:24px;max-width:500px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.2);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="font-size:18px;font-weight:600;">云端同步设置</h3>
            <button onclick="closeModal('cloud-settings-modal')" style="background:none;border:none;font-size:24px;cursor:pointer;color:#666;">&times;</button>
          </div>
          <div style="margin-bottom:20px;">
            <p style="color:#666;font-size:14px;margin-bottom:16px;">
              配置 Supabase 云端数据库，实现多设备数据同步。
            </p>
            <div style="background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <h4 style="font-size:14px;font-weight:600;">建表SQL（在 Supabase SQL Editor 执行）:</h4>
                <button onclick="copySQL()" style="background:#3b82f6;color:white;border:none;padding:4px 10px;border-radius:4px;font-size:12px;cursor:pointer;">复制</button>
              </div>
              <pre id="cloud-sync-sql" style="font-size:11px;color:#666;white-space:pre-wrap;overflow-x:auto;max-height:200px;overflow-y:auto;">${this.getCreateTableSQL()}</pre>
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;">Supabase URL</label>
            <input type="text" id="cloud-url-input" value="${this.supabaseUrl}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;">
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:6px;">Anon Key</label>
            <input type="text" id="cloud-key-input" value="${this.supabaseKey}" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;">
          </div>
          <div style="margin-bottom:16px;padding:12px;background:#fef3c7;border-radius:8px;border:1px solid #fbbf24;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:14px;color:#92400e;">使用预设配置</span>
              <button onclick="applyCloudConfig();closeModal('cloud-settings-modal');" style="padding:8px 16px;background:#f59e0b;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">一键配置</button>
            </div>
          </div>
          <div style="display:flex;gap:12px;">
            <button onclick="testCloudConnection();" style="flex:1;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:white;cursor:pointer;font-size:14px;">测试连接</button>
            <button onclick="createCloudTables();" style="flex:1;padding:10px;border:1px solid #10b981;border-radius:8px;background:#ecfdf5;color:#10b981;cursor:pointer;font-size:14px;">创建数据表</button>
            <button onclick="saveCloudSettings();closeModal('cloud-settings-modal');" style="flex:1;padding:10px;border:none;border-radius:8px;background:#3b82f6;color:white;cursor:pointer;font-size:14px;font-weight:500;">保存设置</button>
          </div>
        </div>
      </div>
    `;
    const modal = document.createElement('div');
    modal.id = 'cloud-settings-modal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
  }
  
  getCreateTableSQL() {
    let sql = '';
    for (const { table } of this._tableMap) {
      sql += `CREATE TABLE IF NOT EXISTS ${table} (id TEXT PRIMARY KEY, data JSONB);\n`;
      sql += `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;\n`;
      sql += `CREATE POLICY "Allow all" ON ${table} FOR ALL USING (true) WITH CHECK (true);\n\n`;
    }
    return sql;
  }
}

let cloudSync = new CloudSync();

function initCloudSync() {
  if (typeof cloudSync === 'undefined') return;
  
  const maxRetries = 50;
  let retryCount = 0;
  
  const tryInit = () => {
    if (typeof store !== 'undefined' && store && store.getState) {
      cloudSync.initComplete();
    } else if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(tryInit, 100);
    } else {
      console.warn('[CloudSync] 等待 store 初始化超时');
    }
  };
  
  tryInit();
}

function saveCloudSettings() {
  const url = document.getElementById('cloud-url-input').value.trim();
  const key = document.getElementById('cloud-key-input').value.trim();
  if (!url || !key) { cloudSync.showToast('请输入完整配置'); return; }
  
  cloudSync.configure(url, key);
  setTimeout(async () => {
    const result = await cloudSync.testConnection();
    cloudSync.updateSyncUI(cloudSync.syncStatus);
    if (result.success) {
      cloudSync.showToast('已连接到云端，开始实时同步');
      cloudSync._startPeriodicPull();
      cloudSync._startRealtimeSubscription();
    } else {
      cloudSync.showToast('配置已保存，但连接失败');
    }
  }, 100);
}

function applyCloudConfig() {
  const defaults = cloudSync.getDefaultConfig();
  cloudSync.configure(defaults.url, defaults.key);
  cloudSync.showToast('云端同步配置成功');
  setTimeout(async () => {
    const result = await cloudSync.testConnection();
    if (result.success) {
      cloudSync.setStatus('online');
      cloudSync.startAutoSync(5);
    }
    cloudSync.updateSyncUI(cloudSync.syncStatus);
  }, 200);
}

function copySQL() {
  const el = document.getElementById('cloud-sync-sql');
  if (el) {
    navigator.clipboard.writeText(el.textContent).then(() => alert('SQL已复制！')).catch(() => alert('复制失败，请手动复制'));
  }
}

async function testCloudConnection() {
  const url = document.getElementById('cloud-url-input').value.trim();
  const key = document.getElementById('cloud-key-input').value.trim();
  if (!url || !key) { alert('请先输入配置'); return; }
  
  try {
    const response = await fetch(`${url}/rest/v1/users?limit=1`, {
      method: 'GET',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    alert(response.ok || response.status === 404 ? '连接成功！' : `连接失败: ${response.status}`);
  } catch (error) {
    alert('连接失败: ' + error.message);
  }
}

async function createCloudTables() {
  const url = document.getElementById('cloud-url-input').value.trim();
  const key = document.getElementById('cloud-key-input').value.trim();
  if (!url || !key) { alert('请先输入配置'); return; }
  
  try {
    const resp = await fetch(`${url}/rest/v1/users?limit=1`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      signal: AbortSignal.timeout(5000)
    });
    if (!resp.ok && resp.status !== 404) { alert(`连接失败: ${resp.status}`); return; }
  } catch (e) { alert('连接失败: ' + e.message); return; }
  
  const tables = cloudSync.getTables();
  const missing = [];
  for (const t of tables) {
    try {
      const r = await fetch(`${url}/rest/v1/${t}?limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
        signal: AbortSignal.timeout(5000)
      });
      if (r.status === 404) missing.push(t);
    } catch (e) { missing.push(t); }
  }
  
  if (missing.length === 0) {
    alert('所有数据表已存在！');
    return;
  }
  
  if (confirm(`${missing.length} 个表不存在，请在 Supabase SQL Editor 中执行建表SQL。\n\n表名: ${missing.join(', ')}`)) {
    copySQL();
    alert('SQL已复制到剪贴板，请登录 Supabase 控制台执行。');
  }
}