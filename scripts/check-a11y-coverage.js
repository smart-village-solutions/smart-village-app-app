#!/usr/bin/env node
/**
 * Accessibility Coverage Script
 *
 * Scans all React Native source files and reports which interactive
 * elements (JSX usage only) have an accessibilityLabel and which do not.
 * Outputs a coverage percentage and a file-by-file breakdown.
 *
 * Usage:
 *   node scripts/check-a11y-coverage.js
 *   node scripts/check-a11y-coverage.js --threshold 80   (exit 1 if below 80%)
 *   node scripts/check-a11y-coverage.js --verbose        (also list labeled elements)
 *   node scripts/check-a11y-coverage.js --files src/components/Button.js,src/screens/HomeScreen.js
 *   node scripts/check-a11y-coverage.js --files-file .reports/a11y-pr-target-files.txt
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SRC_DIR = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Matches the OPENING of a JSX interactive element tag (< followed by name)
// We require `<` immediately before the component name to skip imports/types.
const INTERACTIVE_OPEN_TAG =
  /<(TouchableOpacity|TouchableNativeFeedback|TouchableHighlight|Pressable|Touchable)\b/;

const IGNORE_DIRS = ['node_modules', '__tests__', '__mocks__'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const thresholdIdx = args.indexOf('--threshold');
const threshold = thresholdIdx !== -1 ? parseInt(args[thresholdIdx + 1], 10) : null;
const filesIdx = args.indexOf('--files');
const filesArg = filesIdx !== -1 ? args[filesIdx + 1] : null;
const filesFileIdx = args.indexOf('--files-file');
const filesFileArg = filesFileIdx !== -1 ? args[filesFileIdx + 1] : null;
const hasScopeArgs = !!filesArg || !!filesFileArg;

function normalizeFilePath(filePath) {
  if (!filePath) return '';
  return path.isAbsolute(filePath) ? filePath : path.join(path.join(__dirname, '..'), filePath);
}

function getScopedFiles() {
  const scopedFiles = new Set();

  if (filesArg) {
    filesArg
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map(normalizeFilePath)
      .forEach((file) => scopedFiles.add(file));
  }

  if (filesFileArg) {
    const resolvedPath = normalizeFilePath(filesFileArg);
    let fileContents = '';
    try {
      fileContents = fs.readFileSync(resolvedPath, 'utf8');
    } catch (error) {
      throw new Error(
        `Failed to read --files-file "${filesFileArg}": ${error.message || error}`
      );
    }

    const listedFiles = fileContents
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean)
      .map(normalizeFilePath);

    if (!listedFiles.length) {
      console.warn(
        `Warning: --files-file "${filesFileArg}" is empty. Scoped run will scan zero files.`
      );
    }

    listedFiles.forEach((file) => scopedFiles.add(file));
  }

  return [...scopedFiles].filter(
    (file) =>
      fs.existsSync(file) &&
      file.startsWith(SRC_DIR) &&
      EXTENSIONS.includes(path.extname(file))
  );
}

function getAllFiles(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (IGNORE_DIRS.some((d) => entry.name === d)) continue;
    if (entry.isDirectory()) getAllFiles(fullPath, files);
    else if (EXTENSIONS.includes(path.extname(entry.name))) files.push(fullPath);
  }
  return files;
}

function extractInteractiveElements(source, filePath) {
  const results = [];
  const lines = source.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (!INTERACTIVE_OPEN_TAG.test(lines[i])) continue;

    const elementName = (lines[i].match(INTERACTIVE_OPEN_TAG) || [])[1] || 'unknown';

    // Collect the opening tag block (until we find the closing `>` or `/>`)
    let block = '';
    let j = i;
    while (j < lines.length && j < i + 20) {
      block += lines[j] + '\n';
      // Stop only on a real JSX tag close: `/>` anywhere, or `>` at end of
      // the trimmed line that is NOT an arrow function `=>`.
      const trimmed = lines[j].trimEnd();
      const isSelfClose = trimmed.includes('/>');
      const isTagClose = trimmed.endsWith('>') && !trimmed.endsWith('=>');
      if (isSelfClose || isTagClose) break;
      j++;
    }

    const hasLabel = /accessibilityLabel\s*=/.test(block);

    results.push({
      file: path.relative(SRC_DIR, filePath),
      line: i + 1,
      element: elementName,
      hasLabel,
      snippet: lines[i].trim().slice(0, 90)
    });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const allElements = [];
let scopedFiles = [];
try {
  scopedFiles = getScopedFiles();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
const filesToScan = hasScopeArgs ? scopedFiles : getAllFiles(SRC_DIR);

for (const file of filesToScan) {
  const source = fs.readFileSync(file, 'utf8');
  allElements.push(...extractInteractiveElements(source, file));
}

const total = allElements.length;
const labeled = allElements.filter((e) => e.hasLabel).length;
const unlabeled = allElements.filter((e) => !e.hasLabel);
const percent = total === 0 ? 100 : Math.round((labeled / total) * 100);

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
const bar = (pct) => {
  const filled = Math.round(pct / 5);
  return '[' + '█'.repeat(filled) + '░'.repeat(20 - filled) + ']';
};

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Accessibility Coverage Report');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`  ${bar(percent)} ${percent}%\n`);
console.log(`  Interactive elements (JSX)  : ${total}`);
console.log(`  ✓ With accessibilityLabel   : ${labeled}`);
console.log(`  ✗ Missing accessibilityLabel: ${unlabeled.length}`);

if (unlabeled.length > 0) {
  // Group by file
  const byFile = {};
  for (const el of unlabeled) {
    (byFile[el.file] = byFile[el.file] || []).push(el);
  }
  console.log('\n  ── Missing accessibilityLabel ─────────────────────────────────');
  for (const [file, items] of Object.entries(byFile)) {
    console.log(`\n  📄 src/${file}`);
    for (const item of items) {
      console.log(`     L${String(item.line).padEnd(5)} <${item.element}> ${item.snippet}`);
    }
  }
}

if (verbose) {
  const labeled_els = allElements.filter((e) => e.hasLabel);
  console.log('\n  ── With accessibilityLabel ────────────────────────────────────');
  for (const el of labeled_els) {
    console.log(`  ✓  src/${el.file}:${el.line}  <${el.element}>`);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (threshold !== null) {
  if (percent < threshold) {
    console.error(`  ✗ Coverage ${percent}% is below the required threshold of ${threshold}%.\n`);
    process.exit(1);
  }
  console.log(`  ✓ Coverage ${percent}% meets the required threshold of ${threshold}%.\n`);
}
