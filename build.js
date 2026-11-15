/**
 * Costruisce index.html: un unico file autonomo con font, stile e codice incorporati.
 *
 *   node build.js           scrive index.html
 *   node build.js --check   verifica che index.html sia allineato ai sorgenti (per la CI)
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SOURCES = ['core', 'levels', 'game', 'render', 'ui']; // l'ordine conta: ogni file usa i precedenti
const FONTS = [
  ['eb-garamond-latin-500-normal.woff2', 'normal'],
  ['eb-garamond-latin-500-italic.woff2', 'italic'],
];

function build() {
  const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const js =
    `const VERSION = '${version}';\n` +
    SOURCES.map(f => fs.readFileSync(path.join(ROOT, 'src', f + '.js'), 'utf8')).join('\n');
  // EB Garamond — SIL Open Font License 1.1 (vedi fonts/)
  const fonts = FONTS.map(([file, style]) => {
    const data = fs.readFileSync(path.join(ROOT, 'fonts', file)).toString('base64');
    return `@font-face{font-family:"EB Garamond";font-style:${style};font-weight:500;font-display:block;src:url(data:font/woff2;base64,${data}) format("woff2")}`;
  }).join('\n');
  return fs
    .readFileSync(path.join(ROOT, 'index.tpl.html'), 'utf8')
    .replace('/*__FONTS__*/', () => fonts)
    .replace('/*__JS__*/', () => js);
}

const html = build();
const out = path.join(ROOT, 'index.html');
if (process.argv.includes('--check')) {
  const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  if (current !== html) {
    console.error('index.html non è aggiornato: esegui "npm run build" e fai il commit del risultato.');
    process.exit(1);
  }
  console.log('index.html aggiornato');
} else {
  fs.writeFileSync(out, html);
  console.log('index.html', (fs.statSync(out).size / 1024).toFixed(1) + ' KB');
}
