# npx Coding Guidelines Installer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an `npx create-coding-guidelines` CLI that installs coding guidelines into the correct location for Claude, Antigravity, or Opencode.

**Architecture:** Single Node.js entrypoint (`bin/index.js`) with no build step. Uses `@clack/prompts` for interactive menus, Node built-ins for file I/O and HTTP fetch. Fetches `CLAUDE.md` from GitHub raw at runtime.

**Tech Stack:** Node.js 18+, `@clack/prompts` (interactive UI), `picocolors` (terminal colors, peer dep of clack)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `create-coding-guidelines/package.json` | Create | Package metadata, bin entry, deps |
| `create-coding-guidelines/bin/index.js` | Create | Full CLI logic: prompts, fetch, write |
| `create-coding-guidelines/README.md` | Create | Usage docs |

---

### Task 1: Scaffold package

**Files:**
- Create: `create-coding-guidelines/package.json`

- [ ] **Step 1: Create the package directory and package.json**

```bash
mkdir -p /home/luis/projects/coding-agent-guidelines/create-coding-guidelines/bin
```

Create `create-coding-guidelines/package.json`:

```json
{
  "name": "create-coding-guidelines",
  "version": "1.0.0",
  "description": "Install LLM coding guidelines for Claude, Antigravity, or Opencode",
  "bin": {
    "create-coding-guidelines": "./bin/index.js"
  },
  "type": "module",
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "@clack/prompts": "^0.9.0"
  },
  "keywords": ["claude", "llm", "coding-guidelines", "ai-agent"],
  "license": "MIT"
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd create-coding-guidelines && npm install
```

Expected: `node_modules/@clack/prompts` installed, `package-lock.json` created.

- [ ] **Step 3: Commit scaffold**

```bash
git add create-coding-guidelines/package.json create-coding-guidelines/package-lock.json
git commit -m "feat: scaffold create-coding-guidelines package"
```

---

### Task 2: Implement fetch helper

**Files:**
- Create: `create-coding-guidelines/bin/index.js` (partial — fetch function only)

This task builds and manually tests the one network-dependent piece before wiring up the CLI.

- [ ] **Step 1: Create bin/index.js with shebang and fetch helper**

Create `create-coding-guidelines/bin/index.js`:

```js
#!/usr/bin/env node
import https from 'https';

const SOURCE_URL =
  'https://raw.githubusercontent.com/luiscrsilveira/coding-agent-guidelines/main/CLAUDE.md';

function fetchGuidelines() {
  return new Promise((resolve, reject) => {
    https.get(SOURCE_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} fetching guidelines`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

// Smoke test — remove after Task 3
fetchGuidelines().then((content) => {
  console.log('Fetched OK, length:', content.length);
}).catch((err) => {
  console.error('Fetch failed:', err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Make it executable and run smoke test**

```bash
chmod +x create-coding-guidelines/bin/index.js
node create-coding-guidelines/bin/index.js
```

Expected output: `Fetched OK, length: <number greater than 500>`

If it prints `HTTP 404`: verify the GitHub URL and that `CLAUDE.md` exists in the repo.

- [ ] **Step 3: Commit fetch helper**

```bash
git add create-coding-guidelines/bin/index.js
git commit -m "feat: add GitHub fetch helper for guidelines content"
```

---

### Task 3: Implement install targets map and write helper

**Files:**
- Modify: `create-coding-guidelines/bin/index.js`

- [ ] **Step 1: Replace smoke test with targets map and writeGuidelines function**

Replace the contents of `create-coding-guidelines/bin/index.js` after the `fetchGuidelines` function with:

```js
import fs from 'fs';
import path from 'path';
import os from 'os';

const TARGETS = {
  claude: {
    project: () => path.resolve(process.cwd(), 'CLAUDE.md'),
    global: () => path.join(os.homedir(), '.claude', 'CLAUDE.md'),
  },
  antigravity: {
    project: () => path.resolve(process.cwd(), '.agent', 'rules', 'coding-guidelines.md'),
  },
  opencode: {
    project: () => path.resolve(process.cwd(), '.opencode', 'instructions', 'coding-guidelines.md'),
  },
};

const SEPARATOR = '\n\n<!-- coding-guidelines: appended by create-coding-guidelines -->\n';

function writeGuidelines(targetPath, content) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  if (fs.existsSync(targetPath)) {
    fs.appendFileSync(targetPath, SEPARATOR + content, 'utf8');
  } else {
    fs.writeFileSync(targetPath, content, 'utf8');
  }
}
```

Full file at this point (replace everything):

```js
#!/usr/bin/env node
import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';

const SOURCE_URL =
  'https://raw.githubusercontent.com/luiscrsilveira/coding-agent-guidelines/main/CLAUDE.md';

const TARGETS = {
  claude: {
    project: () => path.resolve(process.cwd(), 'CLAUDE.md'),
    global: () => path.join(os.homedir(), '.claude', 'CLAUDE.md'),
  },
  antigravity: {
    project: () => path.resolve(process.cwd(), '.agent', 'rules', 'coding-guidelines.md'),
  },
  opencode: {
    project: () => path.resolve(process.cwd(), '.opencode', 'instructions', 'coding-guidelines.md'),
  },
};

const SEPARATOR = '\n\n<!-- coding-guidelines: appended by create-coding-guidelines -->\n';

function fetchGuidelines() {
  return new Promise((resolve, reject) => {
    https.get(SOURCE_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} fetching guidelines`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

function writeGuidelines(targetPath, content) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  if (fs.existsSync(targetPath)) {
    fs.appendFileSync(targetPath, SEPARATOR + content, 'utf8');
  } else {
    fs.writeFileSync(targetPath, content, 'utf8');
  }
}
```

- [ ] **Step 2: Verify no syntax errors**

```bash
node --input-type=module < create-coding-guidelines/bin/index.js 2>&1 | head -5
```

Expected: process exits with no output (no syntax errors). It will hang waiting for `main()` — that's fine, Ctrl+C after 1 second.

Actually just check syntax:

```bash
node --check create-coding-guidelines/bin/index.js
```

Expected: no output (clean parse).

- [ ] **Step 3: Commit**

```bash
git add create-coding-guidelines/bin/index.js
git commit -m "feat: add install targets map and write helper"
```

---

### Task 4: Implement interactive CLI (main function)

**Files:**
- Modify: `create-coding-guidelines/bin/index.js`

- [ ] **Step 1: Add main() to the end of bin/index.js**

Append this to the bottom of `create-coding-guidelines/bin/index.js`:

```js
import { intro, outro, select, cancel, isCancel, spinner } from '@clack/prompts';
import pc from 'picocolors';

async function main() {
  intro(pc.bgCyan(pc.black(' create-coding-guidelines ')));

  const agent = await select({
    message: 'Which coding agent?',
    options: [
      { value: 'claude', label: 'Claude Code', hint: 'CLAUDE.md' },
      { value: 'antigravity', label: 'Antigravity', hint: '.agent/rules/' },
      { value: 'opencode', label: 'Opencode', hint: '.opencode/instructions/' },
    ],
  });

  if (isCancel(agent)) {
    cancel('Cancelled.');
    process.exit(0);
  }

  let scope = 'project';
  if (agent === 'claude') {
    const scopeAnswer = await select({
      message: 'Install scope?',
      options: [
        { value: 'project', label: 'Project', hint: './CLAUDE.md' },
        { value: 'global', label: 'Global', hint: '~/.claude/CLAUDE.md' },
      ],
    });

    if (isCancel(scopeAnswer)) {
      cancel('Cancelled.');
      process.exit(0);
    }
    scope = scopeAnswer;
  }

  const targetPath = TARGETS[agent][scope]();

  const spin = spinner();
  spin.start('Fetching guidelines from GitHub...');

  let content;
  try {
    content = await fetchGuidelines();
  } catch (err) {
    spin.stop('Fetch failed.');
    console.error(pc.red(`Error: ${err.message}`));
    console.error(pc.dim(`Manual install: curl -o <target> ${SOURCE_URL}`));
    process.exit(1);
  }

  spin.stop('Guidelines fetched.');

  try {
    writeGuidelines(targetPath, content);
  } catch (err) {
    console.error(pc.red(`Write failed: ${err.message}`));
    process.exit(1);
  }

  outro(pc.green(`✓ Guidelines installed → ${pc.bold(targetPath)}`));
}

main();
```

- [ ] **Step 2: Run the tool end-to-end manually**

```bash
cd /tmp && node /home/luis/projects/coding-agent-guidelines/create-coding-guidelines/bin/index.js
```

Select **Antigravity** → verify `.agent/rules/coding-guidelines.md` is created in `/tmp/.agent/rules/`.

```bash
ls /tmp/.agent/rules/coding-guidelines.md && head -5 /tmp/.agent/rules/coding-guidelines.md
```

Expected: file exists, first line is `# CLAUDE.md` (or whatever the guidelines file starts with).

- [ ] **Step 3: Test append behavior**

```bash
cd /tmp && node /home/luis/projects/coding-agent-guidelines/create-coding-guidelines/bin/index.js
```

Select **Antigravity** again. Then verify the separator was appended:

```bash
grep "appended by create-coding-guidelines" /tmp/.agent/rules/coding-guidelines.md
```

Expected: line found.

- [ ] **Step 4: Test Ctrl+C cancel**

Run the tool, press Ctrl+C at the first prompt. Expected: prints `Cancelled.`, exits cleanly (exit code 0), no partial files written.

- [ ] **Step 5: Commit**

```bash
git add create-coding-guidelines/bin/index.js
git commit -m "feat: add interactive CLI prompts and main entry point"
```

---

### Task 5: Write README and finalize

**Files:**
- Create: `create-coding-guidelines/README.md`

- [ ] **Step 1: Create README**

Create `create-coding-guidelines/README.md`:

```markdown
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
```

- [ ] **Step 2: Verify npx works from a temp directory**

```bash
cd /tmp/npx-test && mkdir -p /tmp/npx-test && cd /tmp/npx-test && node /home/luis/projects/coding-agent-guidelines/create-coding-guidelines/bin/index.js
```

Select **Claude / project**. Verify `./CLAUDE.md` created in `/tmp/npx-test/`.

- [ ] **Step 3: Commit and tag**

```bash
git add create-coding-guidelines/README.md
git commit -m "docs: add README for create-coding-guidelines"
```

---

## Self-Review

**Spec coverage:**
- ✓ Agent selection: Claude / Antigravity / Opencode — Task 4
- ✓ Scope selection (Claude only) — Task 4
- ✓ Fetch from GitHub — Tasks 2, 4
- ✓ All 4 install targets — Task 3
- ✓ Append with separator on conflict — Task 3
- ✓ Parent dir creation — Task 3
- ✓ Network error handling — Task 4
- ✓ Write permission error handling — Task 4
- ✓ Ctrl+C clean exit — Task 4
- ✓ Success output with path — Task 4

**Placeholders:** None.

**Type consistency:** `TARGETS[agent][scope]` used consistently in Tasks 3 and 4. `writeGuidelines(targetPath, content)` defined Task 3, called Task 4. `fetchGuidelines()` defined Task 2, called Task 4.
