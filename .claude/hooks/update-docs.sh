#!/bin/bash

# Auto-documentation update hook
# Triggers when files are written or edited to keep docs in sync

# Get the file that was modified from the environment variable
MODIFIED_FILE="${CLAUDE_TOOL_ARGS:-}"

# Only trigger documentation updates for relevant code changes
if [[ "$MODIFIED_FILE" == *"/backend/"* ]] || [[ "$MODIFIED_FILE" == *"/frontend/"* ]] || [[ "$MODIFIED_FILE" == *"package.json"* ]]; then
    echo "Code change detected in: $MODIFIED_FILE"
    echo "Triggering documentation update..."
    
    # Use Claude Code to run the update-docs slash command
    # This will be handled by the PostToolUse hook in settings
    echo "Documentation will be updated automatically."
else
    # Silent exit for non-code files (like documentation updates themselves)
    exit 0
fi