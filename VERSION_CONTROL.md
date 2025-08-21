# Version Control Guide - Edirne Events Platform

## Current Repository Status
- **Git Repository**: Initialized with main branch
- **Current Branch**: main
- **Alternative Branch**: replit-agent (for automated changes)
- **Remote**: GitHub integration available

## Recent Major Commits
- **Latest**: Add comprehensive administrative tools for event and venue management
- **Previous**: Fix error causing event edits to reset when admin modal reopened
- **Previous**: Improve event form to prevent data loss during edits
- **Previous**: Improve event media file handling and data parsing for accuracy

## Git Workflow Best Practices

### 1. Branch Structure
```bash
main              # Production-ready code
├── feature/*     # New features (feature/event-rotation, feature/admin-ui)
├── fix/*         # Bug fixes (fix/modal-state, fix/media-upload)
├── cleanup/*     # Code cleanup (cleanup/console-logs, cleanup/unused-files)
└── replit-agent  # Automated AI agent changes
```

### 2. Commit Message Convention
```
type(scope): brief description

Detailed explanation of what was changed and why.

- List specific changes
- Include any breaking changes
- Reference issues if applicable
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `cleanup`: Code cleanup/refactoring
- `docs`: Documentation changes
- `style`: Formatting changes
- `perf`: Performance improvements

**Examples:**
```bash
feat(admin): add event rotation controls with persistence
fix(modal): prevent form reset when admin edit modal reopens
cleanup(logs): remove debug console.log statements across components
```

### 3. File Management

#### Files to Always Commit:
- Source code (`src/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (`.md` files)
- Database schema (`shared/schema.ts`)

#### Files to Never Commit (in .gitignore):
- `node_modules/`
- `.next/`
- `.env.local` and environment files
- `public/uploads/` (user uploaded media)
- `attached_assets/` (screenshots and temp files)
- Cache and temporary files

### 4. Pre-commit Checklist
Before committing changes:
- [ ] Remove all `console.log` debug statements
- [ ] Clean up unused imports
- [ ] Test major functionality
- [ ] Update documentation if needed
- [ ] Verify no sensitive data (API keys, passwords)

## GitHub Integration

### Current Status
- Repository connected to GitHub
- GitHub token available for operations
- Can sync commits to remote repository

### Recommended Workflow
1. **Development**: Work on local branch
2. **Testing**: Verify changes work correctly
3. **Cleanup**: Remove debug code and temporary files
4. **Commit**: Create meaningful commit with proper message
5. **Push**: Sync to GitHub repository

## Backup Strategy

### Automated Checkpoints
- Replit automatically creates checkpoints during development
- Checkpoints include code, database, and chat history
- Rollback available through Replit interface

### Manual Backups
- GitHub serves as primary code backup
- Database schema maintained in code (Drizzle ORM)
- Media files stored locally (not in version control)

## Change Management

### Major Changes Tracking
All significant changes are documented in `/replit.md`:
- Feature additions/removals
- Database schema changes
- UI/UX improvements
- Performance optimizations
- Bug fixes

### Release Versioning
Current version tracking in `package.json`:
- Major releases: Breaking changes
- Minor releases: New features
- Patch releases: Bug fixes

## Recovery Procedures

### Code Recovery
1. **Recent Changes**: Use Replit rollback to previous checkpoint
2. **Older Changes**: Restore from GitHub commit history
3. **Complete Reset**: Clone fresh from GitHub repository

### Database Recovery
1. **Schema**: Rebuild using `npm run db:push`
2. **Data**: No automatic backup (manual export recommended)

## Best Practices Summary

1. **Commit frequently** with meaningful messages
2. **Clean code** before committing (no debug logs)
3. **Document changes** in commit messages and replit.md
4. **Test functionality** before pushing to main branch
5. **Keep .gitignore updated** to exclude temporary files
6. **Use branches** for experimental features
7. **Sync regularly** with GitHub for backup

## Quick Commands Reference

```bash
# Check status
git status
git log --oneline -10

# Create feature branch
git checkout -b feature/new-feature

# Stage and commit
git add .
git commit -m "feat(scope): description"

# Push to GitHub (when available)
git push origin main

# View branches
git branch -a

# Switch branches
git checkout main
git checkout replit-agent
```

## Integration Notes

- **Replit Agent**: Uses `replit-agent` branch for automated changes
- **Manual Development**: Use `main` branch or feature branches
- **GitHub Sync**: Available through Replit Git interface
- **Deployment**: Automatic from main branch