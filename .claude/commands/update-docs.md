# Update Documentation

---
description: Automatically updates all project documentation files (README.md, CLAUDE.md, SETUP.md, PROGRESS.md) based on current codebase
allowed-tools: Read,Write,Edit,Glob,Bash
---

Please analyze the current codebase and update all documentation files to reflect the current state:

1. **CLAUDE.md**: Update project overview, architecture, API endpoints, key implementation files, and development status
2. **readme.md**: Update project description, features, tech stack, and setup instructions  
3. **SETUP.md**: Update installation steps, dependencies, and configuration
4. **PROGRESS.md**: Update completed features and current development status

Focus on:
- New API routes in backend/routes/
- New React components in frontend/src/components/ and frontend/src/pages/  
- Package.json changes for new dependencies
- Database schema changes in backend/scripts/migrate.js
- New configuration files or environment variables

Keep all changes minimal and accurate. Only update sections that have actually changed.