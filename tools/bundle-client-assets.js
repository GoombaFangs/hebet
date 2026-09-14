/* Bundles CSS, JS, and index.html into js/shared/inline-assets.js
   so client export works when the editor is opened as file:// */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const css = {
  shell: read('css/shared/shell.css'),
  manhalan: read('css/manhalan/style.css'),
  pack: read('css/pack/pack.css'),
};
const js = {
  shell: read('js/shared/shell.js'),
  manhalan: read('js/manhalan/app.js'),
  pack: read('js/pack/pack.js'),
};
const indexHtml = read('index.html');

if (!indexHtml.includes('inline-assets.js')) {
  throw new Error('index.html must load js/shared/inline-assets.js before other scripts');
}
if (!js.shell.includes('collectExportSources') || !js.shell.includes('assembleClientHtml')) {
  throw new Error('bundled JS is missing export helpers');
}
if (!js.pack.includes('clampImageScale')) {
  throw new Error('pack.js bundle is stale/incomplete');
}

const outPath = path.join(root, 'js/shared/inline-assets.js');
const payload = 'window.HEBET_INLINE_ASSETS=' + JSON.stringify({
  version: 'client-export-6',
  css: css,
  js: js,
  indexHtml: indexHtml,
}) + ';\n';
fs.writeFileSync(outPath, payload);
console.log('wrote', path.relative(root, outPath), fs.statSync(outPath).size, 'bytes');
