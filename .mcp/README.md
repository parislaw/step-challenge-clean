# Supabase MCP Integration Setup

This directory contains the configuration for Model Context Protocol (MCP) integration with Supabase.

## Features Available

The Supabase MCP server provides 20+ tools for:
- **Database Operations**: Create tables, read data, execute SQL queries
- **Project Management**: Control Supabase projects programmatically  
- **Safety Features**: Three-tier safety system (safe, write, destructive operations)
- **Auth Management**: Create and manage users
- **Logs & Analytics**: Access logs from Supabase services
- **Migration Versioning**: Track database changes

## Current Configuration

- **Mode**: Read-only (recommended for safety)
- **Project-scoped**: Limited to specific Supabase project
- **Access Token**: Personal Access Token for authentication

## Setup Steps

### 1. ✅ Project Configuration Complete
- **Project Reference**: kxhasnftfxwveepopgti
- **Access Token**: Configured and secured
- **Mode**: Read-only (safe mode enabled)

### 2. ✅ Installation Complete
Server successfully installed and connected:
```
supabase: npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=kxhasnftfxwveepopgti - ✓ Connected
```

### 3. Ready to Use
The Supabase MCP server is now active and ready for database operations.

## Security Configuration

Current safety features enabled:
- ✅ Read-only mode (prevents accidental writes)
- ✅ Project-scoped access (limited to one project)
- ✅ Personal Access Token authentication
- ✅ Three-tier safety system for operation classification

## Usage Examples

Once configured, you can use natural language commands like:
- "Show me all tables in the database"
- "What's the schema for the users table?"
- "How many challenges are currently active?"
- "List all submissions from the last week"
- "Show me the database logs"
- "What's the current user count?"

## Upgrading to Write Mode

⚠️ **Only for development/testing**: To enable write operations, remove `--read-only` from the args in config.json:

```json
"args": [
  "-y", 
  "@supabase/mcp-server-supabase@latest",
  "--project-ref=YOUR_PROJECT_REF"
]
```

## Security Best Practices

- ✅ Use development projects, not production
- ✅ Keep access tokens secure and rotate regularly
- ✅ Use read-only mode by default
- ✅ Test changes in database branches when available
- ✅ Monitor MCP server logs for unexpected activity

## Troubleshooting

**Connection Issues:**
- Verify your access token is valid
- Check that project reference is correct
- Ensure npm can install packages

**Permission Errors:**
- Confirm your access token has proper permissions
- Check project-level access settings in Supabase dashboard

**Package Issues:**
```bash
# Clear npm cache if needed
npm cache clean --force
```