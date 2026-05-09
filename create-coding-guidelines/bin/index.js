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
      res.on('error', reject);
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
