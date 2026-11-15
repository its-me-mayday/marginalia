// Controlla il gioco come lo vede il browser: tutti i sorgenti uniti in un solo script.
// Qui ogni simbolo è definito nello stesso file, quindi si possono attivare le regole
// che sui singoli sorgenti vanno spente: variabili non definite e codice mai usato.
import { readFileSync } from 'node:fs';
import { ESLint } from 'eslint';
import js from '@eslint/js';
import globals from 'globals';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const code = html.split('<script>')[1].split('</script>')[0];
const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: [
    js.configs.recommended,
    {
      languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser } },
      rules: { 'no-undef': 'error', 'no-unused-vars': ['error', { vars: 'all', args: 'none' }] },
    },
  ],
});
const [result] = await eslint.lintText(code, { filePath: 'bundle.js' });
if (result.messages.length) {
  for (const m of result.messages) console.error(`bundle.js:${m.line}:${m.column}  ${m.message}  (${m.ruleId})`);
  console.error(
    `\n${result.messages.length} problemi nel bundle. Rigenera con "npm run build" se hai modificato src/.`
  );
  process.exit(1);
}
console.log('bundle: nessun simbolo non definito o inutilizzato');
