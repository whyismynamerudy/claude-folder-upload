# Claude Folder Upload Helper

A Chrome extension that enhances Claude.ai's file management capabilities by enabling folder uploads while maintaining directory structure. This extension also provides features for managing file exclusions and bulk file removal.

![Chrome Web Store](https://img.shields.io/badge/Platform-Chrome-brightgreen.svg)

## Features

- 📁 **Folder Upload**: Upload entire folders while preserving directory structure
- 🔍 **Smart File Filtering**: Built-in patterns to exclude common unnecessary files
- ⚙️ **Customizable Exclusions**: Add your own regex patterns to exclude specific files
- 🗑️ **Bulk Removal**: Remove all files from a project with one click
- 📊 **Progress Tracking**: Real-time progress indication for uploads and removals
- 🎨 **Modern UI**: Clean, intuitive interface that matches Claude.ai's design

## Usage

### Uploading Folders

1. Navigate to any Claude.ai project
2. Click the "Upload Folder" button in the bottom right corner
3. Select the folder you want to upload
4. Wait for the upload to complete - progress will be shown in real-time

### Managing File Exclusions

1. Click the extension icon in your Chrome toolbar
2. Add new regex patterns to exclude specific files or folders
3. Use the "Reset to Defaults" button to restore default exclusions

Default exclusions include:
- Common image files (jpg, png, gif, etc.)
- Font files (woff, ttf, etc.)
- Configuration files (.config, .eslintrc, etc.)
- Build and cache directories
- Version control folders (.git, .svn)
- Editor settings (.vscode, .idea)
- System files (.DS_Store, Thumbs.db)

### Removing Files

1. Click the trash icon button in the bottom right corner
2. Confirm the deletion in the dialog
3. Wait for the removal process to complete

## Security

This extension only requests necessary permissions:
- `storage`: For saving exclusion patterns
- `https://claude.ai/*`: For interacting with Claude.ai's API

No data is collected or transmitted outside of Claude.ai's official API endpoints.

## Support

For bugs, feature requests, or questions, please [open an issue](https://github.com/yourusername/claude-folder-upload/issues).