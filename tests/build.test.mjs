// Il gioco pubblicato è index.html, generato da src/: deve essere sempre allineato ai sorgenti.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { ROOT } from './helpers/game.mjs';

test('index.html è aggiornato rispetto ai sorgenti', () => {
  const out = execFileSync(process.execPath, ['build.js', '--check'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /aggiornato/);
});

test('index.html è un file unico senza risorse esterne', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.doesNotMatch(html, /<script[^>]+src=/, 'nessuno script esterno');
  assert.doesNotMatch(html, /<link[^>]+stylesheet/, 'nessun foglio di stile esterno');
  assert.match(html, /@font-face/, 'il font è incorporato');
});

test('la versione mostrata nel gioco è quella del package.json', () => {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, new RegExp(`const VERSION = '${version.replace(/\./g, '\\.')}'`));
});
