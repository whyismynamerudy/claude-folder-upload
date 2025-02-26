async function initializeExcludePatterns() {
    const defaultPatterns = [
        '\\.(?:jpg|jpeg|png|gif|svg|ico|webp|bmp)$',
        '\\.(?:woff|woff2|eot|ttf|otf)$',
        '.*node_modules.*',
        'package-lock\\.json$',
        'yarn\\.lock$',
        '\\.config\\.[^/]+$',
        '\\.eslintrc(?:\\.[^/]+)?$',
        '\\.prettierrc(?:\\.[^/]+)?$',
        '\\.babelrc(?:\\.[^/]+)?$',
        '/dist/',
        '/build/',
        '/out/',
        '^dist/',
        '^build/',
        '^out/',
        'dist$',
        'build$',
        'out$',
        '\\.cache(?:/|$)',
        '\\.git(?:/|$)',
        '\\.svn(?:/|$)',
        '\\.vscode(?:/|$)',
        '\\.idea(?:/|$)',
        '\\.DS_Store$',
        'Thumbs\\.db$'
    ];

    // Check if patterns exist in storage
    const { excludePatterns } = await chrome.storage.sync.get(['excludePatterns']);
    
    // If no patterns exist, initialize with defaults
    if (!excludePatterns || excludePatterns.length === 0) {
        await chrome.storage.sync.set({ excludePatterns: defaultPatterns });
        console.log('Initialized default exclude patterns');
        return defaultPatterns;
    }
    
    return excludePatterns;
}

function cleanupUploadUI() {
    const existingContainer = document.getElementById('folder-upload-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    const existingProgress = document.getElementById('folder-upload-progress');
    if (existingProgress) {
        existingProgress.remove();
    }
}

async function initFolderUpload() {
    cleanupUploadUI();

    if (!isProjectPage()) return;
  
    const projectId = window.location.pathname.split('/').pop();
    
    const container = document.createElement('div');
    container.id = 'folder-upload-container';
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

        console.log('Selected files count:', files.length);
        // Debug log all files to help diagnose issues
        console.log('All files selected:', files.map(f => f.webkitRelativePath));

        // Get patterns, initializing if necessary
        const patterns = await initializeExcludePatterns();
        console.log('Loaded exclusion patterns:', patterns);
        
        // Compile all patterns into RegExp objects - make them case insensitive
        const regexPatterns = patterns.map(pattern => {
            try {
                return new RegExp(pattern, 'i');
            } catch (error) {
                console.error(`Invalid regex pattern: ${pattern}`, error);
                return null;
            }
        }).filter(Boolean);
        
        console.log(`Compiled ${regexPatterns.length} valid regex patterns`);
      
        const { container, progressBar, statusText } = createProgressUI();
        document.body.appendChild(container);
      
        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;
        let excludedCount = 0;
        
        // Track folders for debugging
        const processedFolders = new Set();
        const excludedFolders = new Set();
        const failedFolders = new Set();
      
        const rootFolder = files[0].webkitRelativePath.split('/')[0];
        const rootFolderRegex = new RegExp(`^${rootFolder}/`);
        
        // Create a folder structure map to ensure all directories are processed
        const folderStructure = {};
        files.forEach(file => {
            const path = file.webkitRelativePath.replace(rootFolderRegex, '');
            const parts = path.split('/');
            
            // Build the folder structure
            let current = folderStructure;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            }
        });
        
        console.log("Folder structure:", folderStructure);

        // Create filtered files array first
        const filesToUpload = files.filter(file => {
            const relativePath = file.webkitRelativePath.replace(rootFolderRegex, '');
            const folderPath = relativePath.split('/').slice(0, -1).join('/');
            
            if (folderPath) {
                processedFolders.add(folderPath);
            }
            
            // Skip dot files/folders
            const isDotFile = relativePath.split('/').some(part => part.startsWith('.'));
            if (isDotFile) {
                console.log(`Skipping dot file/folder: ${relativePath}`);
                skippedCount++;
                return false;
            }

            // Check against all regex patterns
            for (const regex of regexPatterns) {
                if (regex.test(relativePath)) {
                    console.log(`Excluded by pattern '${regex}': ${relativePath}`);
                    if (folderPath) {
                        excludedFolders.add(folderPath);
                    }
                    excludedCount++;
                    return false;
                }
            }

            return true;
        });

        console.log(`After filtering: ${filesToUpload.length} files to upload`);

        // Limit concurrent uploads to avoid overwhelming the API
        const MAX_CONCURRENT_UPLOADS = 5;
        let activeUploads = 0;

        // Now process the filtered files with throttling
        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            const relativePath = file.webkitRelativePath.replace(rootFolderRegex, '');
            const folderPath = relativePath.split('/').slice(0, -1).join('/');
            
            try {
                // Throttle uploads to prevent overwhelming the API
                while (activeUploads >= MAX_CONCURRENT_UPLOADS) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                activeUploads++;
                statusText.textContent = `Uploading (${i + 1}/${filesToUpload.length}): ${relativePath}`;
                progressBar.style.width = `${Math.round((i / filesToUpload.length) * 100)}%`;
                
                await uploadFile(file, projectId, relativePath);
                console.log(`Successfully uploaded: ${relativePath}`);
                successCount++;
            } catch (error) {
                console.error(`Failed to upload ${relativePath}:`, error);
                if (folderPath) {
                    failedFolders.add(folderPath);
                }
                failCount++;
            } finally {
                activeUploads--;
            }
        }

        // Log folder tracking results
        console.log("Processed folders:", Array.from(processedFolders));
        console.log("Excluded folders:", Array.from(excludedFolders));
        console.log("Failed folders:", Array.from(failedFolders));
      
        progressBar.style.width = '100%';
        const totals = `${successCount} successful, ${failCount} failed, ${skippedCount} skipped (dot files), ${excludedCount} excluded (patterns)`;
        statusText.textContent = `Upload complete: ${totals}`;
        console.log(`Upload summary: ${totals}`);
        
        // Wait for all uploads to complete
        while (activeUploads > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Add a diagnostic button to show information about upload issues
        if (failCount > 0 || excludedCount > 0) {
            const diagButton = document.createElement('button');
            diagButton.textContent = "Show Details";
            diagButton.style.cssText = `
                background: #4a4a47;
                color: #f0f0f0;
                padding: 4px 8px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                margin-top: 8px;
                font-size: 12px;
            `;
            diagButton.onclick = () => {
                alert(`
Failed folders: ${Array.from(failedFolders).join(', ')}
Excluded folders: ${Array.from(excludedFolders).join(', ')}
                `);
            };
            container.appendChild(diagButton);
        }
        
        setTimeout(() => {
            window.location.href = window.location.href;
        }, 3000);
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

let lastUrl = location.href;

// Function to check URL changes
function checkForUrlChange() {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        cleanupUploadUI();
        if (isProjectPage()) {
            initFolderUpload();
        }
    }
}

const observer = new MutationObserver(() => {
    checkForUrlChange();
});

observer.observe(document, {subtree: true, childList: true});

window.addEventListener('popstate', checkForUrlChange);

const pushState = history.pushState;
history.pushState = function() {
    pushState.apply(history, arguments);
    checkForUrlChange();
};

const replaceState = history.replaceState;
history.replaceState = function() {
    replaceState.apply(history, arguments);
    checkForUrlChange();
};

initFolderUpload();