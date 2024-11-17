// utils.js
let organizationId = null;

// Helper function to check if we're on a project page
function isProjectPage() {
  return window.location.pathname.includes('/project/');
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