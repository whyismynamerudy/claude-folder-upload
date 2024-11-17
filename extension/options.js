// options.js
let excludePatterns = [];

// Load saved patterns
chrome.storage.sync.get(['excludePatterns'], function(result) {
  excludePatterns = result.excludePatterns || [];
  updateRegexList();
});

function savePatterns() {
  chrome.storage.sync.set({ excludePatterns }, function() {
    console.log('Patterns saved:', excludePatterns);
  });
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

document.getElementById('addRegex').addEventListener('click', function() {
  const input = document.getElementById('regexInput');
  const pattern = input.value.trim();
  
  if (pattern && !excludePatterns.includes(pattern)) {
    try {
      // Test if it's a valid regex
      new RegExp(pattern);
      excludePatterns.push(pattern);
      savePatterns();
      updateRegexList();
      input.value = '';
    } catch (e) {
      alert('Invalid regex pattern');
    }
  }
});

document.getElementById('regexList').addEventListener('click', function(e) {
  if (e.target.classList.contains('remove-btn')) {
    const index = parseInt(e.target.dataset.index);
    excludePatterns.splice(index, 1);
    savePatterns();
    updateRegexList();
  }
});