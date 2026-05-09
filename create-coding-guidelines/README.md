# create-coding-guidelines

Install [LLM coding guidelines](https://github.com/luiscrsilveira/coding-agent-guidelines) into your AI coding agent config.

## Usage

```bash
npx create-coding-guidelines
```

Interactive prompts will ask:
1. Which agent: **Claude Code**, **Antigravity**, or **Opencode**
2. Scope: **project** or **global** (Claude only)

## Install targets

| Agent | Scope | Path |
|---|---|---|
| Claude Code | project | `./CLAUDE.md` |
| Claude Code | global | `~/.claude/CLAUDE.md` |
| Antigravity | project | `.agent/rules/coding-guidelines.md` |
| Opencode | project | `.opencode/instructions/coding-guidelines.md` |

If the target file already exists, the guidelines are **appended** (not overwritten).

## Requirements

Node.js 18+
