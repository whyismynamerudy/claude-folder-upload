# Claude Folder Upload

A Chrome extension that enhances Claude.ai's file management capabilities by enabling folder uploads while maintaining directory structure. This extension also provides features for managing file exclusions and bulk file removal.

![Chrome Web Store](https://img.shields.io/badge/Platform-Chrome-brightgreen.svg)
[![GitHub issues](https://img.shields.io/github/issues/whyismynamerudy/claude-folder-upload)](https://github.com/whyismynamerudy/claude-folder-upload/issues)
[![GitHub stars](https://img.shields.io/github/stars/whyismynamerudy/claude-folder-upload)](https://github.com/whyismynamerudy/claude-folder-upload/stargazers)
[![GitHub license](https://img.shields.io/github/license/whyismynamerudy/claude-folder-upload)](https://github.com/whyismynamerudy/claude-folder-upload/blob/main/LICENSE)

## Features

- 📁 **Folder Upload**: Upload entire folders while preserving directory structure
- 🔍 **Smart File Filtering**: Built-in patterns to exclude common unnecessary files
- ⚙️ **Customizable Exclusions**: Add your own regex patterns to exclude specific files
- 🗑️ **Bulk Removal**: Remove all files from a project with one click
- 📊 **Progress Tracking**: Real-time progress indication for uploads and removals
- 🎨 **Modern UI**: Clean, intuitive interface that matches Claude.ai's design

## Installation

### From Chrome Web Store
[Chrome Web Store](https://chromewebstore.google.com/detail/claude-folder-upload-help/kpdeinalphndoobebbkdjhokedpgalad)

### Manual Installation
1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the `extension` folder from the cloned repository

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

## Contributing

Contributions are welcome! Please check out our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

### Issue Templates

When creating a new issue, please use the appropriate template:
- **Bug Report**: For reporting bugs or unexpected behavior
- **Feature Request**: For suggesting new features or improvements

### Pull Requests

Please use the provided pull request template when submitting changes. This helps maintain consistency and provides important information about your contribution.

## Security

This extension only requests necessary permissions:
- `storage`: For saving exclusion patterns
- `https://claude.ai/*`: For interacting with Claude.ai's API

No data is collected or transmitted outside of Claude.ai's official API endpoints.

## Development

To build the extension package for distribution:

```bash
./package.sh
```

This will create a ZIP file suitable for uploading to the Chrome Web Store.

## License

[MIT License](LICENSE)

## Support

For bugs, feature requests, or questions:
- [Open an issue](https://github.com/whyismynamerudy/claude-folder-upload/issues) using one of our templates
- [Submit a pull request](https://github.com/whyismynamerudy/claude-folder-upload/pulls) with your proposed changes
