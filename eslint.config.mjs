import js from '@eslint/js';
import globals from 'globals';
import { readFileSync, readdirSync } from 'node:fs';

// Simboli globali del gioco (dichiarazioni di primo livello in src/), usati dal codice dei test
// che gira dentro la pagina. Ricavati dai sorgenti, così restano sempre allineati.
const gameGlobals = Object.fromEntries(
  readdirSync(new URL('./src/', import.meta.url))
    .flatMap(f => [
      ...readFileSync(new URL('./src/' + f, import.meta.url), 'utf8').matchAll(
        /^(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm
      ),
    ])
    .map(m => [m[1], 'writable'])
    .concat([
      ['VERSION', 'readonly'],
      ['T', 'writable'],
      ['MarginaliaBots', 'readonly'],
    ])
);

export default [
  { ignores: ['index.html', 'node_modules/**', 'test-results/**'] },
  js.configs.recommended,
  {
    // Sorgenti del gioco: script classici che il build concatena in un unico <script>.
    // I simboli di primo livello sono condivisi tra i file, quindi qui no-undef è spento:
    // lo controlla scripts/lint-bundle.mjs sul bundle completo, dove ogni simbolo è visibile.
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser } },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': ['error', { vars: 'local', args: 'none' }],
      'no-redeclare': 'off',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
    },
  },
  {
    files: ['build.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { ...globals.node } },
  },
  {
    files: ['tests/**/*.mjs', 'scripts/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser, ...gameGlobals },
    },
  },
  {
    // giocatori automatici: script iniettato nella pagina del gioco
    files: ['tests/helpers/bots.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser, ...gameGlobals } },
  },
];
