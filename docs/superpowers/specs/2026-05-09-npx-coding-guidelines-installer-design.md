# Design: npx Coding Guidelines Installer

**Date:** 2026-05-09  
**Package:** `create-coding-guidelines`  
**Status:** Approved

## Overview

An `npx`-runnable CLI that installs the `coding-agent-guidelines` CLAUDE.md into the correct location for the user's chosen AI coding agent. Interactive prompts guide the user through agent selection and install scope.

## Architecture

Single Node.js file (`bin/index.js`) with no build step. Dependencies: `@clack/prompts` for interactive UI, Node built-ins (`fs`, `path`, `os`, `https`) for everything else.

```
create-coding-guidelines/
├── bin/
│   └── index.js          # main entrypoint (#!/usr/bin/env node)
├── package.json
└── README.md
```

## User Flow

```
npx create-coding-guidelines
  1. prompt: which agent? [Claude / Antigravity / Opencode]
  2. prompt: scope? [project / global]   ← Claude only; others are always project
  3. fetch CLAUDE.md from GitHub raw URL
  4. write/append to target path
  5. print success message + resolved path
```

## Install Targets

| Agent | Scope | Target path |
|---|---|---|
| Claude | project | `./CLAUDE.md` |
| Claude | global | `~/.claude/CLAUDE.md` |
| Antigravity | project | `.agent/rules/coding-guidelines.md` |
| Opencode | project | `.opencode/instructions/coding-guidelines.md` |

Global scope is only offered when Claude is selected. Antigravity and Opencode are always project-scoped.

## Source

Guidelines fetched at runtime from:
```
https://raw.githubusercontent.com/luiscrsilveira/coding-agent-guidelines/main/CLAUDE.md
```

No content bundled in the package — always fetches latest.

## Conflict Handling

If the target file already exists: **append** the guidelines block with a separator comment:

```
<!-- coding-guidelines: appended by create-coding-guidelines -->
<content>
```

Parent directories are created if they don't exist (`fs.mkdirSync` with `recursive: true`).

## Error Cases

- Network failure fetching from GitHub → exit with clear message, suggest manual install URL
- No write permission to target path → surface OS error message
- User cancels prompt (Ctrl+C) → clean exit, no partial writes

## Success Output

```
✓ Guidelines installed → .agent/rules/coding-guidelines.md
```

## Non-Goals

- No `--update` flag (out of scope for v1)
- No interactive diff/merge on conflict (append-only)
- No Windows path special-casing (Node `path` handles it)
- No rollback/uninstall command
