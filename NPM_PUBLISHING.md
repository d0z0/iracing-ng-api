# npm Package Publishing Guide

## Overview

`iracing-data-api` is now configured as a production-ready npm package that can be published to the npm registry.

## Package Details

- **Package Name**: `iracing-data-api`
- **Version**: `1.0.0`
- **Main Entry**: `dist/index.js`
- **Types**: `dist/index.d.ts`
- **License**: MIT
- **Node Version**: >=14.0.0

## What Gets Published

The `files` field in `package.json` controls what gets included in the npm package:

- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Package documentation
- `LICENSE` - MIT license file

Everything else (source files, tests, examples, config files) is excluded via `.npmignore`.

## Building the Package

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Verify the build output
ls dist/
```

## Publishing to npm

### Option 1: Publish to Public npm Registry

1. **Create an npm account** (if you don't have one):

   ```bash
   npm adduser
   # or
   npm login
   ```

2. **Update package metadata** in `package.json`:

   ```json
   {
     "author": "Your Name <your.email@example.com>",
     "repository": {
       "type": "git",
       "url": "https://github.com/yourusername/iracing-data-api"
     },
     "homepage": "https://github.com/yourusername/iracing-data-api#readme",
     "bugs": {
       "url": "https://github.com/yourusername/iracing-data-api/issues"
     }
   }
   ```

3. **Publish the package**:
   ```bash
   npm publish
   ```

### Option 2: Publish to GitHub Packages

1. **Add to package.json**:

   ```json
   {
     "publishConfig": {
       "registry": "https://npm.pkg.github.com"
     }
   }
   ```

2. **Create a `.npmrc` file**:

   ```
   @yourusername:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

3. **Publish**:
   ```bash
   npm publish
   ```

### Option 3: Publish to a Private npm Registry

1. **Configure your private registry** in `.npmrc`:

   ```
   registry=https://your-private-registry.com
   ```

2. **Publish**:
   ```bash
   npm publish
   ```

## Version Management

### Semantic Versioning

This package follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0) - Breaking changes
- **MINOR** version (0.Y.0) - New features (backward compatible)
- **PATCH** version (0.0.Z) - Bug fixes (backward compatible)

### Updating Version

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major

# Custom version
npm version 1.0.0
```

Then publish:

```bash
npm publish
```

## Package Installation

Once published, users can install it with:

```bash
npm install iracing-data-api
```

Or add to `package.json` dependencies:

```json
{
  "dependencies": {
    "iracing-data-api": "^1.0.0"
  }
}
```

## Usage After Installation

Users can import and use the package:

```typescript
import { IRacingAPIClient } from 'iracing-data-api';

const client = new IRacingAPIClient({
  auth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    username: 'your-username',
    password: 'your-password',
  },
});

// Use the client...
```

## Package Configuration Files

### `.npmignore`

Specifies files to exclude from the npm package. Currently excludes:

- TypeScript source files (`src/`)
- Examples (`examples/`)
- Configuration files (`tsconfig.json`, `jest.config.json`)
- Documentation files (except README.md)
- Test files

### `package.json` Key Fields

- **name** - Package identifier on npm (must be unique)
- **version** - Current version (follows semver)
- **description** - Package description
- **main** - Entry point for CommonJS imports
- **types** - TypeScript definitions location
- **exports** - ESM/CJS export configuration
- **files** - Explicit list of files to include
- **scripts** - npm commands (build runs before publish)
- **keywords** - Search terms for npm registry
- **engines** - Node.js version requirement
- **dependencies** - Runtime dependencies (only axios)
- **devDependencies** - Build/dev dependencies
- **repository** - Source code repository URL
- **homepage** - Package homepage
- **bugs** - Issue tracker URL
- **license** - License type

## Pre-Publication Checklist

Before publishing, ensure:

- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes with no errors
- [ ] `dist/` directory contains compiled JavaScript and `.d.ts` files
- [ ] `package.json` version is updated
- [ ] Git repository URL is set in `package.json`
- [ ] Author information is complete
- [ ] README.md is up-to-date
- [ ] All breaking changes are documented
- [ ] LICENSE file exists

## Troubleshooting

### "Package name is invalid"

- Package name must be lowercase
- Can only contain letters, numbers, hyphens, and underscores
- Must not exceed 214 characters

### "You do not have permission to publish"

- Ensure you're logged in: `npm whoami`
- Check package name isn't already taken on npm registry
- For private packages, ensure proper registry configuration

### "npm ERR! no files in package"

- Run `npm run build` first to generate `dist/` directory
- Verify `package.json` `files` field includes `dist/`

### Build errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

## After Publishing

### Updating the Package

1. Make code changes
2. Update version: `npm version [patch|minor|major]`
3. Build: `npm run build`
4. Publish: `npm publish`

### Viewing Package Info

```bash
# View on npm.js
npm info iracing-data-api

# View locally
npm view
```

## Additional Resources

- [npm Docs - Publishing](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
- [npm package.json Documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)

## Quick Start Commands

```bash
# Build for publishing
npm run build

# Verify package contents
npm pack --dry-run

# Login to npm
npm login

# Publish package
npm publish

# Update version and publish
npm version patch && npm publish
```

---

Your iRacing Data API client is now ready to be shared with the Node.js community! 🚀
