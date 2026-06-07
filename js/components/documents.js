function renderDocuments() {
  const state = store.getState();
  const projects = state.projects;
  const documents = state.documents;
  
  const html = `
    <div class="page-header">
      <div>
        <h1 class="page-title">文档管理</h1>
        <p class="page-description">管理项目文档、图纸、合同等文件</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="showCreateDocumentModal()">
          <i class="fas fa-plus"></i>
          新建文档
        </button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">
            <i class="fas fa-file-alt"></i>
          </div>
        </div>
        <div class="stat-card-value">${documents.length}</div>
        <div class="stat-card-label">总文档</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon purple">
            <i class="fas fa-file-pdf"></i>
          </div>
        </div>
        <div class="stat-card-value">${documents.filter(d => d.type === 'pdf').length}</div>
        <div class="stat-card-label">PDF文件</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon cyan">
            <i class="fas fa-file-word"></i>
          </div>
        </div>
        <div class="stat-card-value">${documents.filter(d => d.type === 'docx' || d.type === 'doc').length}</div>
        <div class="stat-card-label">Word文档</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">
            <i class="fas fa-file-excel"></i>
          </div>
        </div>
        <div class="stat-card-value">${documents.filter(d => d.type === 'xlsx' || d.type === 'xls').length}</div>
        <div class="stat-card-label">Excel表格</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">项目筛选</label>
          <select class="form-input" id="documentProjectFilter" onchange="filterDocuments()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label class="form-label">类型筛选</label>
          <select class="form-input" id="documentTypeFilter" onchange="filterDocuments()">
            <option value="">全部类型</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
            <option value="dwg">CAD图纸</option>
            <option value="png">图片</option>
          </select>
        </div>
        <div style="flex: 2; min-width: 250px;">
          <label class="form-label">搜索文档</label>
          <input type="text" class="form-input" id="documentSearch" placeholder="搜索文档名称..." oninput="filterDocuments()">
        </div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;" id="documentsGrid">
      ${renderDocumentCards(documents)}
    </div>
  `;
  
  return html;
}

function renderDocumentCards(documents) {
  const state = store.getState();
  const projects = state.projects;
  
  return documents.map(doc => {
    const project = projects.find(p => p.id === doc.projectId);
    const typeIcon = getDocumentTypeIcon(doc.type);
    const typeColor = getDocumentTypeColor(doc.type);
    
    return `
      <div class="card document-card" style="padding: 24px;">
        <div class="document-header" style="display: flex; gap: 16px; margin-bottom: 16px;">
          <div class="document-icon" style="width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; background: ${typeColor}20; color: ${typeColor};">
            <i class="${typeIcon}"></i>
          </div>
          <div class="document-info" style="flex: 1;">
            <h3 style="font-size: 15px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">${doc.name}</h3>
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px;">${project?.name || '-'}</p>
            <div class="document-meta" style="display: flex; gap: 12px; flex-wrap: wrap;">
              <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 12px;">
                <i class="fas fa-folder"></i>
                ${doc.type?.toUpperCase()}
              </span>
              <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 12px;">
                <i class="fas fa-file"></i>
                ${formatFileSize(doc.size)}
              </span>
            </div>
          </div>
        </div>
        <div class="document-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-color);">
          <span style="color: var(--text-tertiary); font-size: 12px;">${doc.uploadedAt || '-'}</span>
          <div class="document-actions" style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="openDocument('${doc.id}')" title="打开">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="downloadDocument('${doc.id}')" title="下载">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteDocument('${doc.id}')" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterDocuments() {
  const state = store.getState();
  let documents = [...state.documents];
  
  const projectFilter = document.getElementById('documentProjectFilter')?.value;
  const typeFilter = document.getElementById('documentTypeFilter')?.value;
  const searchQuery = document.getElementById('documentSearch')?.value?.toLowerCase();
  
  if (projectFilter) {
    documents = documents.filter(d => d.projectId === projectFilter);
  }
  
  if (typeFilter) {
    documents = documents.filter(d => d.type === typeFilter);
  }
  
  if (searchQuery) {
    documents = documents.filter(d => d.name.toLowerCase().includes(searchQuery));
  }
  
  const grid = document.getElementById('documentsGrid');
  if (grid) {
    grid.innerHTML = renderDocumentCards(documents);
  }
}

function getDocumentTypeIcon(type) {
  const iconMap = {
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word',
    'docx': 'fas fa-file-word',
    'xls': 'fas fa-file-excel',
    'xlsx': 'fas fa-file-excel',
    'ppt': 'fas fa-file-powerpoint',
    'pptx': 'fas fa-file-powerpoint',
    'dwg': 'fas fa-drafting-compass',
    'png': 'fas fa-file-image',
    'jpg': 'fas fa-file-image',
    'jpeg': 'fas fa-file-image',
    'zip': 'fas fa-file-archive',
    'rar': 'fas fa-file-archive'
  };
  return iconMap[type] || 'fas fa-file-alt';
}

function getDocumentTypeColor(type) {
  const colorMap = {
    'pdf': '#ef4444',
    'doc': '#2563eb',
    'docx': '#2563eb',
    'xls': '#10b981',
    'xlsx': '#10b981',
    'ppt': '#f59e0b',
    'pptx': '#f59e0b',
    'dwg': '#8b5cf6',
    'png': '#06b6d4',
    'jpg': '#06b6d4',
    'jpeg': '#06b6d4'
  };
  return colorMap[type] || '#64748b';
}

function formatFileSize(bytes) {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showCreateDocumentModal() {
  const state = store.getState();
  const projects = state.projects;
  
  const html = `
    <div class="modal-overlay" id="createDocumentModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">新建文档</h3>
          <button class="btn btn-secondary btn-sm" onclick="closeModal('createDocumentModal')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form id="createDocumentForm">
            <div class="form-group">
              <label class="form-label">文档名称 <span style="color: red;">*</span></label>
              <input type="text" class="form-input" name="name" required placeholder="请输入文档名称">
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">所属项目</label>
                <select class="form-input" name="projectId">
                  <option value="">请选择项目</option>
                  ${projects.map(p => `
                    <option value="${p.id}">${p.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">文件类型</label>
                <select class="form-input" name="type">
                  <option value="pdf">PDF</option>
                  <option value="docx">Word</option>
                  <option value="xlsx">Excel</option>
                  <option value="dwg">CAD图纸</option>
                  <option value="png">图片</option>
                  <option value="zip">压缩包</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">上传文件</label>
              <input type="file" class="form-input" name="file">
            </div>
            <div class="form-group">
              <label class="form-label">文件大小 (字节)</label>
              <input type="number" class="form-input" name="size" placeholder="0">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('createDocumentModal')">取消</button>
          <button class="btn btn-primary" onclick="handleCreateDocument()">创建</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

function handleCreateDocument() {
  const form = document.getElementById('createDocumentForm');
  const formData = new FormData(form);
  
  const documentData = {
    name: formData.get('name'),
    projectId: formData.get('projectId') || null,
    type: formData.get('type'),
    size: parseInt(formData.get('size') || 0),
    url: '#',
    uploadedBy: store.getState().currentUser?.id
  };
  
  store.addDocument(documentData);
  closeModal('createDocumentModal');
  renderContent();
  
  store.addNotification({
    type: 'success',
    title: '文档创建成功',
    message: `文档 "${documentData.name}" 已创建`
  });
}

function openDocument(docId) {
  alert('文档预览功能 - 可在此打开文档查看');
}

function downloadDocument(docId) {
  const state = store.getState();
  const doc = state.documents.find(d => d.id === docId);
  if (doc) {
    alert(`正在下载文档: ${doc.name}`);
  }
}

function confirmDeleteDocument(docId) {
  if (confirm('确定要删除这个文档吗？')) {
    store.deleteDocument(docId);
    renderContent();
    
    store.addNotification({
      type: 'info',
      title: '文档已删除',
      message: '文档已从系统中移除'
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderDocuments };
}
