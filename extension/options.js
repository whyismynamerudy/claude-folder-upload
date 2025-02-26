let excludePatterns = [];

const defaultPatterns = [
    '\\.(?:jpg|jpeg|png|gif|svg|ico|webp|bmp)$',  // Match file extensions at the end of the path

    '\\.(?:woff|woff2|eot|ttf|otf)$',  // Common font file formats
    
    '.*node_modules.*',          // node_modules folder or its contents
    'package-lock\\.json$',         // package-lock.json files
    'yarn\\.lock$',                 // yarn.lock files
    
    '\\.config\\.[^/]+$',          // Any .config.* files
    '\\.eslintrc(?:\\.[^/]+)?$',   // ESLint config files
    '\\.prettierrc(?:\\.[^/]+)?$', // Prettier config files
    '\\.babelrc(?:\\.[^/]+)?$',    // Babel config files
    '\\.cache(?:/|$)',             // Cache folders

    '/dist/',
    '/build/',
    '/out/',
    '^dist/',
    '^build/',
    '^out/',
    'dist$',
    'build$',
    'out$',
    
    '\\.git(?:/|$)',               // Git folders
    '\\.svn(?:/|$)',               // SVN folders
    
    '\\.vscode(?:/|$)',            // VS Code settings
    '\\.idea(?:/|$)',              // IntelliJ settings
    
    '\\.DS_Store$',                // Mac OS files
    'Thumbs\\.db$'                 // Windows thumbnail cache
];


chrome.storage.sync.get(['excludePatterns'], function(result) {
    excludePatterns = [...defaultPatterns];
    
    if (result.excludePatterns && result.excludePatterns.length > 0) {
        result.excludePatterns.forEach(pattern => {
            if (!excludePatterns.includes(pattern)) {
                excludePatterns.push(pattern);
            }
        });
    }
    
    savePatterns();
    updateRegexList();
});


function addResetButton() {
  const container = document.querySelector('.section');
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset to Defaults';
  resetButton.style.marginLeft = '10px';
  resetButton.style.backgroundColor = '#6c757d';
  
  resetButton.addEventListener('click', function() {
    if (confirm('This will replace all current patterns with default patterns. Continue?')) {
      excludePatterns = [...defaultPatterns];
      savePatterns();
      updateRegexList();
    }
  });
  
  const addButton = document.getElementById('addRegex');
  addButton.parentNode.insertBefore(resetButton, addButton.nextSibling);
}

function savePatterns() {
  chrome.storage.sync.set({ excludePatterns }, function() {
    console.log('Patterns saved:', excludePatterns);
  });
}

function validatePattern(pattern) {
  try {
    new RegExp(pattern);
    return true;
  } catch (e) {
    return false;
  }
}

function updateRegexList() {
  const list = document.getElementById('regexList');
  list.innerHTML = '';
  
  excludePatterns.forEach((pattern, index) => {
    const item = document.createElement('div');
    item.className = 'regex-item';
    item.innerHTML = `
      <span>${pattern}</span>
      <button class="remove-btn" data-index="${index}">Remove</button>
    `;
    list.appendChild(item);
  });
}

function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  errorElement.textContent = message;
  setTimeout(() => {
    errorElement.textContent = '';
  }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
  addResetButton();
});

document.getElementById('addRegex').addEventListener('click', function() {
  const input = document.getElementById('regexInput');
  const pattern = input.value.trim();
  
  if (!pattern) {
    showError('Pattern cannot be empty');
    return;
  }
  
  if (excludePatterns.includes(pattern)) {
    showError('Pattern already exists');
    return;
  }
  
  if (!validatePattern(pattern)) {
    showError('Invalid regex pattern');
    return;
  }
  
  excludePatterns.push(pattern);
  savePatterns();
  updateRegexList();
  input.value = '';
});

document.getElementById('regexList').addEventListener('click', function(e) {
  if (e.target.classList.contains('remove-btn')) {
    const index = parseInt(e.target.dataset.index);
    excludePatterns.splice(index, 1);
    savePatterns();
    updateRegexList();
  }
});

document.getElementById('regexInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('addRegex').click();
  }
});