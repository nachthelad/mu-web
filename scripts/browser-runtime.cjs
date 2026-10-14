// Prefer the project's dependency; the Codex desktop bundle is a local fallback.
const path = require('node:path');
const fs = require('node:fs');
// The desktop sandbox may redirect LOCALAPPDATA; reuse installed test browsers.
const installedBrowsers=path.join(process.env.USERPROFILE||'', 'AppData/Local/ms-playwright');
if(!process.env.PLAYWRIGHT_BROWSERS_PATH&&fs.existsSync(installedBrowsers))process.env.PLAYWRIGHT_BROWSERS_PATH=installedBrowsers;
try { module.exports = require('playwright'); }
catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  const bundled = path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  try { module.exports = require(bundled); }
  catch { throw new Error('Playwright no disponible. Ejecutá npm install y npx playwright install chromium.'); }
}
