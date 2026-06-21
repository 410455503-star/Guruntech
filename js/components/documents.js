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

    <!-- 总体统计卡片 -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-file-alt" style="color: #3b82f6; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">总文档</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${documents.length}</div>
        <div style="font-size: 12px; color: #93c5fd;">文档总数</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #fecaca 0%, #fee2e2 100%); border: 1px solid #fca5a5; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-file-pdf" style="color: #ef4444; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">PDF文件</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">${documents.filter(d => d.type === 'pdf').length}</div>
        <div style="font-size: 12px; color: #dc2626;">份文档</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(37, 99, 235, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-file-word" style="color: #2563eb; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">Word文档</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">${documents.filter(d => d.type === 'docx' || d.type === 'doc').length}</div>
        <div style="font-size: 12px; color: #3b82f6;">份文档</div>
      </div>
      
      <div class="stat-card" style="border-radius: 16px; padding: 24px; background: linear-gradient(135deg, #a7f3d0 0%, #d1fae5 100%); border: 1px solid #6ee7b7; position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-file-excel" style="color: #10b981; font-size: 20px;"></i>
          </div>
          <div style="font-size: 14px; font-weight: 500; color: #64748b;">Excel表格</div>
        </div>
        <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 8px;">${documents.filter(d => d.type === 'xlsx' || d.type === 'xls').length}</div>
        <div style="font-size: 12px; color: #15803d;">份表格</div>
      </div>
    </div>

    <div class="card" style="border-radius: 16px; margin-bottom: 24px;">
      <div class="card-header" style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 8px; height: 24px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px;"></div>
          <h3 class="card-title" style="font-size: 18px; font-weight: 600;">文档筛选</h3>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
          <select style="width: 180px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="documentProjectFilter" onchange="filterDocuments()">
            <option value="">全部项目</option>
            ${projects.map(p => `
              <option value="${p.id}">${p.name}</option>
            `).join('')}
          </select>
          <select style="width: 150px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="documentTypeFilter" onchange="filterDocuments()">
            <option value="">全部类型</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
            <option value="dwg">CAD图纸</option>
            <option value="png">图片</option>
          </select>
          <input type="text" style="width: 200px; padding: 8px 12px; font-size: 13px; border-radius: 8px; border: 1px solid #e5e7eb; background: white;" id="documentSearch" placeholder="搜索文档名称..." oninput="filterDocuments()">
          <button class="btn btn-secondary btn-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="resetDocumentFilters()">
            <i class="fas fa-redo"></i> 重置
          </button>
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

function resetDocumentFilters() {
  const projectFilter = document.getElementById('documentProjectFilter');
  const typeFilter = document.getElementById('documentTypeFilter');
  const searchInput = document.getElementById('documentSearch');
  if (projectFilter) projectFilter.value = '';
  if (typeFilter) typeFilter.value = '';
  if (searchInput) searchInput.value = '';
  filterDocuments();
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
  
  const contentHtml = `
    <div style="background: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 500px; width: 95%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 100000;">
      <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">新建文档</h3>
        <button style="padding: 4px 12px; font-size: 12px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createDocumentModal')"><i class="fas fa-times"></i></button>
      </div>
      <div style="padding: 24px;">
        <form id="createDocumentForm">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">文档名称 <span style="color: red;">*</span></label>
            <input type="text" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="name" required placeholder="请输入文档名称">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">所属项目</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="projectId">
                <option value="">请选择项目</option>
                ${projects.map(p => `
                  <option value="${p.id}">${p.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">文件类型</label>
              <select style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="type">
                <option value="pdf">PDF</option>
                <option value="docx">Word</option>
                <option value="xlsx">Excel</option>
                <option value="dwg">CAD图纸</option>
                <option value="png">图片</option>
                <option value="zip">压缩包</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">上传文件</label>
            <input type="file" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="file">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px;">文件大小 (字节)</label>
            <input type="number" style="width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box;" name="size" placeholder="0">
          </div>
        </form>
      </div>
      <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
        <button style="padding: 10px 20px; font-size: 14px; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;" onclick="closeModal('createDocumentModal')">取消</button>
        <button style="padding: 10px 20px; font-size: 14px; background: #3b82f6; color: #ffffff; border: none; border-radius: 8px; cursor: pointer;" onclick="handleCreateDocument()">创建</button>
      </div>
    </div>
  `;
  
  showModal('createDocumentModal', contentHtml);
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
