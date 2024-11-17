// content.js
async function initFolderUpload() {
    if (!isProjectPage()) return;
  
    const projectId = window.location.pathname.split('/').pop();
    
    // Create the upload button
    const uploadButton = document.createElement('button');
    uploadButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0ZM93.66,85.66,120,59.31V152a8,8,0,0,0,16,0V59.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,85.66Z"/>
      </svg>
      Upload Folder
    `;
    uploadButton.id = 'folder-upload-btn';
    uploadButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #a05a3c;
      color: #f0f0f0;
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-family: 'Be Vietnam Pro', sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 9999;
      transition: background-color 0.2s;
    `;
  
    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;
    fileInput.style.display = 'none';
  
    uploadButton.addEventListener('mouseover', () => {
      uploadButton.style.backgroundColor = '#8b4426';
    });
  
    uploadButton.addEventListener('mouseout', () => {
      uploadButton.style.backgroundColor = '#a05a3c';
    });
  
    // Handle folder selection
    uploadButton.onclick = () => fileInput.click();
    
    fileInput.addEventListener('change', async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
      
        // Create and show progress UI
        const { container, progressBar, statusText } = createProgressUI();
        document.body.appendChild(container);
      
        let successCount = 0;
        let failCount = 0;
      
        // Get the root folder name to remove from paths
        const rootFolder = files[0].webkitRelativePath.split('/')[0];
        const rootFolderRegex = new RegExp(`^${rootFolder}/`);
      
        // Process files
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Remove the root folder name from the path
          const relativePath = file.webkitRelativePath.replace(rootFolderRegex, '');
          
          try {
            statusText.textContent = `Uploading: ${relativePath}`;
            progressBar.style.width = `${Math.round((i / files.length) * 100)}%`;
            
            await uploadFile(file, projectId, relativePath);
            successCount++;
          } catch (error) {
            console.error(`Failed to upload ${relativePath}:`, error);
            failCount++;
          }
        }
      
        // Show final status
        progressBar.style.width = '100%';
        statusText.textContent = `Uploaded ${successCount} files successfully. ${failCount} files failed.`;
        
        setTimeout(() => {
            window.location.href = window.location.href;  // Force a full page reload
        }, 2000);

    });
  
    document.body.appendChild(fileInput);
    document.body.appendChild(uploadButton);
  }
  
  // Initialize when page loads and when URL changes
  initFolderUpload();
  
  // Watch for URL changes
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      initFolderUpload();
    }
  }).observe(document, {subtree: true, childList: true});