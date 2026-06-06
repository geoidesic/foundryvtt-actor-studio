# Release Script

This document explains how `release.js` works and what options it supports.

## Overview

The release script automates package version updates, branch handling, builds, tagging, and GitHub release creation for the module.

It is intentionally opinionated:
- `main` is used for production releases
- `next` is used for draft and prerelease workflows
- `--suffix` creates a special pre-release branch/tag without changing package version
- `draft` does not bump version, build artifacts, or tag a release

The release script requires a clean working tree unless you use `--dry-run`.

## Supported commands

Run the script directly from the repository root:

```bash
node release.js <major|minor|patch> [draft|pre|finalize] [--suffix <name>] [--force] [--dry-run]
```

## Release modes

### Production release

Creates a normal public release from `main`.

- `major`, `minor`, `patch` are valid version increments
- updates `package.json` and `module.json`
- builds the project with `npm run build`
- commits `package.json`, `module.json`, and built assets
- tags the release and pushes the branch and tag to `origin`
- creates a GitHub release

Example:

```bash
node release.js patch
```

### Draft release

Creates a draft release without modifying package or module version.

- accepts `draft` after the version type
- does not build or commit
- does not create a git tag
- creates a GitHub draft release only
- does not trigger GitHub Actions or install artifact generation

Example:

```bash
node release.js patch draft
```

### Pre-release

Creates a prerelease version on the `next` branch.

- accepts `pre` after the version type
- increments the version and adds `-beta.1` or bumps an existing `-beta.N`
- updates `package.json` and `module.json`
- builds and commits files
- pushes branch and tag
- creates a GitHub prerelease

Example:

```bash
node release.js minor pre
```

### Finalize pre-release

Promotes an existing prerelease to a stable release.

- accepts `finalize` after the version type
- only works when the current version is a prerelease like `2.9.11-beta.3`
- finalizes the version to `2.9.11`

Example:

```bash
node release.js patch finalize
```

### Suffix release

Creates a special prerelease tag for a named branch.

- use `--suffix <name>` instead of a version increment
- does not bump the package version
- derives the tag as `<current-version>-<suffix>`
- always creates a prerelease on a suffix branch
- does not update package/module versions or build if the suffix mode is enabled
- marks the release as `--latest=false` on GitHub

Example:

```bash
node release.js --suffix aura
```

#### Force suffix release

- use `--force` only with `--suffix`
- re-publishes an existing tag/release
- deletes the existing GitHub release and tag before recreating them

Example:

```bash
node release.js --suffix aura --force
```

## Dry run

Use `--dry-run` to preview actions without making changes.

Example:

```bash
node release.js patch --dry-run
```

This mode prints the planned branch operations, version updates, package changes, tag creation, and GitHub release command.

## Branch behavior

The script performs different branch operations depending on the release type.

- `main` branch is used for production releases only
- `next` branch is used for `draft` and `pre` releases
- suffix releases use a branch named after the suffix

For `pre` and suffix releases, the target branch is created if missing and merged with the latest `main` before releasing.

For suffix releases:
- the branch is checked out
- `main` is merged into the suffix branch
- dependencies are reinstalled with `bun i`
- the script re-executes itself from the suffix branch so the correct `release.js` file is used
- after the release, the local `main` branch is restored and dependencies are reinstalled there too

For `pre` releases:
- the `next` branch is checked out or created
- `main` is merged into `next`

Production releases do not auto-merge `next` into `main`.

## Version rules

- `major`, `minor`, `patch` increment the stable version when no prerelease modifier is used
- `pre` adds or increments `-beta.N` on the next stable version
- `finalize` turns a valid prerelease into a stable version
- `draft` keeps the current version unchanged
- `--suffix` appends the suffix to the stable `package.json` version

Suffix releases and drafts do not modify `package.json` or `module.json` versions.

## Generated release notes

The script builds release notes by summarizing commit messages since the previous tag.

- it filters out routine release commit messages and manifest/version-only commits
- it attempts to generate a summary with Ollama if the Ollama server is available
- if Ollama is unavailable or fails, it falls back to a plain bullet list of commit messages

## Requirements and validations

Before running a release, the script checks:

- working directory is clean unless `--dry-run` is used
- only one modifier is passed (`draft`, `pre`, or `finalize`)
- `--suffix` is not combined with `draft`, `pre`, or `finalize`
- `--force` is only valid with `--suffix`
- `--suffix` values must use letters, numbers, dots, or dashes
- production release requires the current version to be stable (no prerelease suffix)

## GitHub release creation

The script uses the GitHub CLI (`gh`) to create releases.

- regular releases are published normally
- prereleases and suffix releases are created with `--prerelease`
- suffix releases are created with `--latest=false`
- draft releases are created with `--draft`

If `gh` is not installed or not authenticated, the release command will fail.

## `package.json` scripts

The repository includes helper scripts for common release flows:

- `npm run release` → `node release.js patch`
- `npm run release:patch` → `node release.js patch`
- `npm run release:minor` → `node release.js minor`
- `npm run release:major` → `node release.js major`
- `npm run release:draft` → `node release.js patch draft`
- `npm run release:draft:minor` → `node release.js minor draft`
- `npm run release:draft:major` → `node release.js major draft`
- `npm run release:pre` → `node release.js patch pre`
- `npm run release:pre:minor` → `node release.js minor pre`
- `npm run release:pre:major` → `node release.js major pre`
- `npm run release:aura` → `node release.js --suffix aura`
- `npm run release:aura:force` → `node release.js --suffix aura --force`

## Examples

```bash
npm run release:patch
npm run release:minor
npm run release:major
npm run release:patch -- --dry-run
npm run release:aura
npm run release:aura:force
npm run release:patch pre
npm run release:patch finalize
```

## Notes

- `draft` releases are intentionally tentative and will not produce install files or GitHub Actions artifacts.
- `pre` releases are intended for beta testing and are published from `next`.
- suffix releases preserve the current stable version while adding a branch-specific prerelease tag.
- the script always sets `packageJson.env = 'production'` for release workflows.
