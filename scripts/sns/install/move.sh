#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Move the quill script to /usr/local/bin
 mv "$SCRIPT_DIR/bin/quill" /usr/local/bin/quill #sudo deleted
 mv "$SCRIPT_DIR/bin/didc" /usr/local/bin/didc #sudo deleted
 mv "$SCRIPT_DIR/bin/sns-quill" /usr/local/bin/sns-quill #sudo deleted
 mv "$SCRIPT_DIR/bin/sns" /usr/local/bin/sns-cli #sudo deleted

# Make the scripts executable
 chmod +x /usr/local/bin/quill #sudo deleted
 chmod +x /usr/local/bin/didc #sudo deleted
 chmod +x /usr/local/bin/sns-quill #sudo deleted
 chmod +x /usr/local/bin/sns-cli #sudo deleted
