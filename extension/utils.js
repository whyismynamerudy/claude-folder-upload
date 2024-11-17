// utils.js
let organizationId = null;

// Helper function to check if we're on a project page
function isProjectPage() {
  return window.location.pathname.includes('/project/');
}

function showConfirmationDialog(message, onConfirm, onCancel) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "10000";

    const dialogBox = document.createElement("div");
    dialogBox.style.position = "fixed";
    dialogBox.style.top = "50%";
    dialogBox.style.left = "50%";
    dialogBox.style.transform = "translate(-50%, -50%)";
    dialogBox.style.backgroundColor = "#2e2e2b";
    dialogBox.style.color = "#f0f0f0";
    dialogBox.style.padding = "20px";
    dialogBox.style.borderRadius = "8px";
    dialogBox.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    dialogBox.style.zIndex = "10001";
    dialogBox.style.width = "300px";
    dialogBox.style.textAlign = "center";
    dialogBox.style.fontFamily = '"Be Vietnam Pro", sans-serif';

    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.style.marginBottom = "20px";
    messageElement.style.fontSize = "16px";
    messageElement.style.fontWeight = "500";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-around";

    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirm";
    confirmButton.style.padding = "8px 16px";
    confirmButton.style.backgroundColor = "#a05a3c";
    confirmButton.style.color = "#f0f0f0";
    confirmButton.style.border = "none";
    confirmButton.style.borderRadius = "4px";
    confirmButton.style.cursor = "pointer";
    confirmButton.style.fontSize = "14px";
    confirmButton.style.fontWeight = "500";
    confirmButton.style.transition = "background-color 0.2s";

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.padding = "8px 16px";
    cancelButton.style.backgroundColor = "#4a4a47";
    cancelButton.style.color = "#f0f0f0";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "4px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontSize = "14px";
    cancelButton.style.fontWeight = "500";
    cancelButton.style.transition = "background-color 0.2s";

    confirmButton.onmouseover = () => {
        confirmButton.style.backgroundColor = "#8b4426";
    };
    confirmButton.onmouseout = () => {
        confirmButton.style.backgroundColor = "#a05a3c";
    };

    cancelButton.onmouseover = () => {
        cancelButton.style.backgroundColor = "#393937";
    };
    cancelButton.onmouseout = () => {
        cancelButton.style.backgroundColor = "#4a4a47";
    };

    confirmButton.onclick = () => {
        document.body.removeChild(overlay);
        onConfirm();
    };

    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    };

    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);

    dialogBox.appendChild(messageElement);
    dialogBox.appendChild(buttonContainer);
    overlay.appendChild(dialogBox);

    document.body.appendChild(overlay);
}

// Function to get organization ID from Claude's API
async function fetchOrganizationId() {
  try {
    const response = await fetch('https://claude.ai/api/organizations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://claude.ai',
        'Referer': window.location.href
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const organizations = await response.json();
    if (organizations && organizations.length > 0) {
      organizationId = organizations[0].uuid;
      return organizationId;
    }
    throw new Error('No organizations found');
  } catch (error) {
    console.error('Error fetching organization ID:', error);
    return null;
  }
}

// Add function to refresh UI after upload
// utils.js

async function refreshUIAfterUpload() {
    // Short delay to ensure all API operations are complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload the page
    window.location.reload();
  }

async function uploadFile(file, projectId, relativePath) {
    if (!organizationId) {
      await fetchOrganizationId();
    }
  
    const apiUrl = `https://claude.ai/api/organizations/${organizationId}/projects/${projectId}/docs`;
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // Read as text instead of base64
          const content = reader.result;
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': 'https://claude.ai',
              'Referer': window.location.href
            },
            credentials: 'include',
            body: JSON.stringify({
              file_name: relativePath,
              content: content
            })
          });
  
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
          }
  
          resolve(await response.json());
        } catch (error) {
          reject(error);
        }
      };
  
      reader.onerror = () => reject(new Error('Failed to read file'));
      // Read as text instead of DataURL
      reader.readAsText(file);
    });
  }


  async function storeFileData(projectId, fileName, filePath) {
    const key = `project_${projectId}_files`;
    const storedData = await chrome.storage.local.get(key);
    const filesData = storedData[key] || {};
    
    filesData[fileName] = {
        filePath: filePath,
        timestamp: new Date().toISOString()
    };
    
    await chrome.storage.local.set({ [key]: filesData });
}

async function getProjectFiles(projectId) {
    const key = `project_${projectId}_files`;
    const storedData = await chrome.storage.local.get(key);
    return storedData[key] || {};
}

// Function to create upload progress UI
function createProgressUI() {
  const container = document.createElement('div');
  container.id = 'folder-upload-progress';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2e2e2b;
    color: #f0f0f0;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    font-family: 'Be Vietnam Pro', sans-serif;
    min-width: 300px;
  `;

  const progress = document.createElement('div');
  progress.className = 'progress-bar';
  progress.style.cssText = `
    width: 100%;
    height: 4px;
    background: #4a4a47;
    border-radius: 2px;
    margin: 10px 0;
  `;

  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    width: 0%;
    height: 100%;
    background: #a05a3c;
    border-radius: 2px;
    transition: width 0.3s ease;
  `;

  const status = document.createElement('div');
  status.className = 'status-text';
  status.style.fontSize = '14px';

  progress.appendChild(progressFill);
  container.appendChild(progress);
  container.appendChild(status);

  return {
    container,
    progressBar: progressFill,
    statusText: status
  };
}