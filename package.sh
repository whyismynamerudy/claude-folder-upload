#!/bin/bash

# Set directory variables
EXTENSION_DIR="extension"
OUTPUT_NAME="claude-folder-upload-helper.zip"

# Navigate to the directory containing the extension folder
cd "$(dirname "$0")"

# Remove existing zip if it exists
rm -f "$OUTPUT_NAME"

# Create zip file, excluding unwanted files
cd "$EXTENSION_DIR" && zip -r "../$OUTPUT_NAME" . -x "*.DS_Store" "*.git*" "*node_modules*" "package.sh" "../README.md"

echo "Extension packaged as $OUTPUT_NAME"