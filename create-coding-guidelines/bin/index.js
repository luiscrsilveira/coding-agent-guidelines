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
