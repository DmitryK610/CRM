// Removes block comments (/* */) and non-essential single-line comments (// ...)
// across the src directory while preserving license/preserve, TODO/FIXME, eslint, ts- hints.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const SRC_DIR = path.join(ROOT, 'src');
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', '.git']);
const JS_LIKE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx']);
const CSS_LIKE_EXT = new Set(['.css', '.scss']);

const keepLineRe = /(TODO|FIXME|@license|@preserve|eslint|ts-)/i;

function isIgnoredDir(name) {
  return IGNORE_DIRS.has(name);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (isIgnoredDir(e.name)) continue;
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

function stripBlockComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, (m) => {
    return /@license|@preserve/i.test(m) ? m : '';
  });
}

function removeStandaloneLineComments(code) {
  const lines = code.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') && !keepLineRe.test(trimmed)) {
      lines[i] = '';
    }
  }
  return lines.join('\n');
}

function cleanJsLike(code) {
  let out = stripBlockComments(code);
  out = removeStandaloneLineComments(out);
  return out;
}

function cleanCssLike(code) {
  return stripBlockComments(code);
}

function cleanVueSFC(code) {
  // Clean inside <script> and <style> blocks; leave template (HTML) comments intact.
  const scriptRe = /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi;
  const styleRe = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi;

  const cleanedScripts = code.replace(scriptRe, (_, open, inner, close) => {
    let c = stripBlockComments(inner);
    c = removeStandaloneLineComments(c);
    return `${open}${c}${close}`;
  });

  const cleanedAll = cleanedScripts.replace(styleRe, (_, open, inner, close) => {
    const c = cleanCssLike(inner);
    return `${open}${c}${close}`;
  });

  return cleanedAll;
}

function shouldProcess(file) {
  const ext = path.extname(file).toLowerCase();
  return JS_LIKE_EXT.has(ext) || CSS_LIKE_EXT.has(ext) || ext === '.vue';
}

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  const raw = await fs.readFile(file, 'utf8');
  let cleaned = raw;

  if (JS_LIKE_EXT.has(ext)) cleaned = cleanJsLike(raw);
  else if (CSS_LIKE_EXT.has(ext)) cleaned = cleanCssLike(raw);
  else if (ext === '.vue') cleaned = cleanVueSFC(raw);
  else return false;

  if (cleaned !== raw) {
    await fs.writeFile(file, cleaned, 'utf8');
    return true;
  }
  return false;
}

(async function main() {
  try {
    const all = await walk(SRC_DIR);
    const targetFiles = all.filter(shouldProcess);
    let changed = 0;
    for (const f of targetFiles) {
      const ok = await processFile(f);
      if (ok) changed++;
    }
    console.log(`Processed ${targetFiles.length} files. Changed: ${changed}.`);
  } catch (err) {
    console.error('Comment removal failed:', err);
    process.exit(1);
  }
})();
