async function initFolderUpload() {
    if (!isProjectPage()) return;
  
    const projectId = window.location.pathname.split('/').pop();
    
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        gap: 8px;
    `;

    const uploadButton = document.createElement('button');
    uploadButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0ZM93.66,85.66,120,59.31V152a8,8,0,0,0,16,0V59.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,85.66Z"/>
      </svg>
      Upload Folder
    `;
    uploadButton.id = 'folder-upload-btn';
    uploadButton.style.cssText = `
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
      transition: background-color 0.2s;
    `;

    const removeButton = document.createElement('button');
    removeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192Z"></path>
      </svg>
    `;
    removeButton.id = 'remove-all-btn';
    removeButton.style.cssText = `
      background: #dc3545;
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
      transition: background-color 0.2s;
    `;

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

    removeButton.addEventListener('mouseover', () => {
        removeButton.style.backgroundColor = '#c82333';
    });
    removeButton.addEventListener('mouseout', () => {
        removeButton.style.backgroundColor = '#dc3545';
    });

    uploadButton.onclick = () => fileInput.click();
    fileInput.addEventListener('change', async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const { excludePatterns } = await chrome.storage.sync.get(['excludePatterns']);
        const patterns = excludePatterns || [];
        const regexPatterns = patterns.map(pattern => new RegExp(pattern));
      
        const { container, progressBar, statusText } = createProgressUI();
        document.body.appendChild(container);
      
        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;
        let excludedCount = 0;
      
        const rootFolder = files[0].webkitRelativePath.split('/')[0];
        const rootFolderRegex = new RegExp(`^${rootFolder}/`);
    
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const relativePath = file.webkitRelativePath.replace(rootFolderRegex, '');

            const isDotFile = relativePath.split('/').some(part => part.startsWith('.'));
            if (isDotFile) {
                console.log(`Skipping dot file/folder: ${relativePath}`);
                skippedCount++;
                continue;
            }

            const isExcluded = regexPatterns.some(regex => regex.test(relativePath));
            if (isExcluded) {
                console.log(`Excluding file based on pattern: ${relativePath}`);
                excludedCount++;
                continue;
            }
            
            try {
                statusText.textContent = `Uploading: ${relativePath}`;
                progressBar.style.width = `${Math.round((i / files.length) * 100)}%`;
                
                await uploadFile(file, projectId, relativePath);
                successCount++;
            } catch (error) {
                console.log(`Failed to upload ${relativePath}:`, error);
                failCount++;
            }
        }
      
        progressBar.style.width = '100%';
        statusText.textContent = `Upload complete: ${successCount} successful, ${failCount} failed, ${skippedCount} skipped (dot files), ${excludedCount} excluded (patterns)`;        
        setTimeout(() => {
            window.location.href = window.location.href;
        }, 2000);
    });
    
    removeButton.addEventListener('click', async () => {
        if (!organizationId) {
            await fetchOrganizationId();
        }

        if (!organizationId) {
            showErrorMessage("Failed to retrieve organization ID. Please try again.");
            return;
        }

        const projectId = window.location.pathname.split('/').pop();
        const apiUrl = `https://claude.ai/api/organizations/${organizationId}/projects/${projectId}/docs`;

        showConfirmationDialog(
            "Are you sure you want to remove all files? This action cannot be undone.",
            async () => {
                try {
                    const response = await fetch(apiUrl, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Origin: "https://claude.ai",
                            Referer: window.location.href,
                        },
                        credentials: "include",
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const documents = await response.json();
                    console.log("Documents fetched successfully:", documents);

                    const { container, progressBar, statusText } = createProgressUI();
                    document.body.appendChild(container);
                    statusText.textContent = 'Removing files...';

                    let successCount = 0;
                    let failCount = 0;

                    for (let i = 0; i < documents.length; i++) {
                        const doc = documents[i];
                        const deleteUrl = `${apiUrl}/${doc.uuid}`;
                        
                        try {
                            const deleteResponse = await fetch(deleteUrl, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    Origin: "https://claude.ai",
                                    Referer: window.location.href,
                                },
                                credentials: "include",
                            });

                            if (!deleteResponse.ok) {
                                throw new Error(
                                    `Failed to delete document ${doc.uuid}. HTTP error! status: ${deleteResponse.status}`
                                );
                            }

                            successCount++;
                            console.log(`Document ${doc.uuid} deleted successfully`);
                        } catch (error) {
                            failCount++;
                            console.error(error.message);
                            statusText.textContent = `Error removing file: ${doc.file_name}`;
                        }

                        progressBar.style.width = `${Math.round((i + 1) / documents.length * 100)}%`;
                    }

                    progressBar.style.width = '100%';
                    if (failCount > 0) {
                        statusText.textContent = `Removed ${successCount} files successfully. Failed to remove ${failCount} files.`;
                    } else {
                        statusText.textContent = `All ${successCount} files removed successfully.`;
                    }

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);

                } catch (error) {
                    console.error("Error in removeAllFiles:", error);
                    showErrorMessage(
                        "An error occurred while removing files. Some files may have been removed."
                    );
                }
            },
            () => {
                console.log("File removal cancelled by user");
            }
        );
    });

    container.appendChild(uploadButton);
    container.appendChild(removeButton);
    container.appendChild(fileInput);
    document.body.appendChild(container);
}

initFolderUpload();

let lastUrl = location.href;
const observer = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        initFolderUpload();
    }
}).observe(document, {subtree: true, childList: true});