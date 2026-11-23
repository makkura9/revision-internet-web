#!/usr/bin/env node
/* Génère prof/guide-prof.pdf à partir de prof/guide-prof.html.
   Les corrigés du guide sont construits à partir de docs/js/data.js :
   après toute modification du contenu du site, relancer ce script.

   Prérequis : Node.js et Playwright (npm install playwright, puis
   npx playwright install chromium).
   Utilisation : node outils/generer-guide.js                          */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'prof', 'guide-prof.pdf');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json'
};

// Petit serveur local : les polices ne se chargent pas depuis file://
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, path.normalize(url).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`http://127.0.0.1:${port}/prof/guide-prof.html`);
    await page.waitForFunction(() => window.__guideReady === true, null, { timeout: 30000 });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true });
    if (errors.length) console.warn('Avertissements :\n' + errors.join('\n'));
    console.log('Guide généré : ' + path.relative(process.cwd(), OUT));
  } finally {
    await browser.close();
    server.close();
  }
});
