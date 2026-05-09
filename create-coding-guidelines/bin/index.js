#!/usr/bin/env node
import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { intro, outro, select, cancel, isCancel, spinner } from '@clack/prompts';
import pc from 'picocolors';

const SOURCE_URL =
  'https://raw.githubusercontent.com/luiscrsilveira/llm-rigor/master/RULES.md';

const TARGETS = {
  claude:      { project: () => path.resolve(process.cwd(), 'CLAUDE.md'),
                 global:  () => path.join(os.homedir(), '.claude', 'CLAUDE.md') },
  codex:       { project: () => path.resolve(process.cwd(), 'AGENTS.md') },
  cursor:      { project: () => path.resolve(process.cwd(), '.cursorrules') },
  gemini:      { project: () => path.resolve(process.cwd(), 'GEMINI.md') },
  windsurf:    { project: () => path.resolve(process.cwd(), '.windsurfrules') },
  antigravity: { project: () => path.resolve(process.cwd(), 'AGENTS.md') },
  opencode:    { project: () => path.resolve(process.cwd(), 'AGENTS.md') },
  cline:       { project: () => path.resolve(process.cwd(), '.clinerules') },
  roo:         { project: () => path.resolve(process.cwd(), '.roorules') },
  copilot:     { project: () => path.resolve(process.cwd(), '.github', 'copilot-instructions.md') },
  aider:       { project: () => path.resolve(process.cwd(), 'CONVENTIONS.md') },
  amazonq:     { project: () => path.resolve(process.cwd(), '.amazonq', 'rules', 'llm-rigor.md') },
};

const SEPARATOR = '\n\n<!-- llm-rigor: appended by llm-rigor -->\n';

function fetchGuidelines() {
  return new Promise((resolve, reject) => {
    const req = https.get(SOURCE_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} fetching guidelines`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('error', reject);
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.setTimeout(10000, () => req.destroy(new Error('Request timed out after 10s')));
    req.on('error', reject);
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

async function main() {
  intro(pc.bgCyan(pc.black(' llm-rigor ')));

  const agent = await select({
    message: 'Which coding agent?',
    options: [
      { value: 'claude',      label: 'Claude Code',        hint: 'CLAUDE.md' },
      { value: 'codex',       label: 'Codex',              hint: 'AGENTS.md' },
      { value: 'cursor',      label: 'Cursor',             hint: '.cursorrules' },
      { value: 'gemini',      label: 'Gemini CLI',         hint: 'GEMINI.md' },
      { value: 'windsurf',    label: 'Windsurf',           hint: '.windsurfrules' },
      { value: 'antigravity', label: 'Antigravity',        hint: 'AGENTS.md' },
      { value: 'opencode',    label: 'Opencode',           hint: 'AGENTS.md' },
      { value: 'cline',       label: 'Cline',              hint: '.clinerules' },
      { value: 'roo',         label: 'Roo Code',           hint: '.roorules' },
      { value: 'copilot',     label: 'GitHub Copilot',     hint: '.github/copilot-instructions.md' },
      { value: 'aider',       label: 'Aider',              hint: 'CONVENTIONS.md' },
      { value: 'amazonq',     label: 'Amazon Q Developer', hint: '.amazonq/rules/llm-rigor.md' },
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
        { value: 'global',  label: 'Global',  hint: '~/.claude/CLAUDE.md' },
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
    console.error(pc.dim(`Manual install: curl -o ${targetPath} ${SOURCE_URL}`));
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

main().catch((err) => {
  console.error(pc.red(`Unexpected error: ${err.message}`));
  process.exit(1);
});
