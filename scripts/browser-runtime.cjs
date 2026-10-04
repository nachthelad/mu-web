// Prefer the project's dependency; the Codex desktop bundle is a local fallback.
const path = require('node:path');
try { module.exports = require('playwright'); }
catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  const bundled = path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  try { module.exports = require(bundled); }
  catch { throw new Error('Playwright no disponible. Ejecutá npm install y npx playwright install chromium.'); }
}
