#!/usr/bin/env node
/**
 * Accessibility PR Diff Scope
 *
 * Detects changed files for a PR diff and extracts accessibility-relevant
 * source files/components. Produces JSON + Markdown reports.
 *
 * Usage examples:
 *   node scripts/a11y-pr-diff.js
 *   node scripts/a11y-pr-diff.js --base origin/master --head HEAD
 *   node scripts/a11y-pr-diff.js --out-json .reports/a11y-pr-diff.json --out-md .reports/a11y-pr-diff.md
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const TRUSTED_GIT_EXECUTABLE = '/usr/bin/git';
const TARGET_ROOTS = [
  'src/components/',
  'src/screens/',
  'src/navigation/',
  'src/config/navigation/'
];

const args = process.argv.slice(2);

const getArg = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const base = getArg('--base', process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/master');
const head = getArg('--head', process.env.GITHUB_SHA || 'HEAD');
const outJsonPath = getArg('--out-json', '.reports/a11y-pr-diff.json');
const outMdPath = getArg('--out-md', '.reports/a11y-pr-diff.md');
const outFilesPath = getArg('--out-files', '.reports/a11y-pr-target-files.txt');

const ensureDir = (filePath) => {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
};

const isTargetSourceFile = (file) => {
  const ext = path.extname(file);
  return EXTENSIONS.has(ext) && TARGET_ROOTS.some((root) => file.startsWith(root));
};

const getComponentName = (file) => {
  const baseName = path.basename(file, path.extname(file));
  if (baseName.toLowerCase() !== 'index') {
    return baseName;
  }

  const parentDirectory = path.basename(path.dirname(file));
  return parentDirectory || baseName;
};

const getFileType = (file) => {
  if (file.startsWith('src/components/')) return 'component';
  if (file.startsWith('src/screens/')) return 'screen';
  if (file.startsWith('src/navigation/')) return 'navigation';
  if (file.startsWith('src/config/navigation/')) return 'navigation-config';
  return 'unknown';
};

const GIT_REF_REGEX = /^[A-Za-z0-9./_-]+$/;

const validateGitRef = (refName, value) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid git ref for ${refName}: value is empty.`);
  }

  if (!GIT_REF_REGEX.test(value)) {
    throw new Error(`Invalid git ref for ${refName}: "${value}"`);
  }

  return value;
};

const runDiff = () => {
  const safeBase = validateGitRef('base', base);
  const safeHead = validateGitRef('head', head);

  if (!fs.existsSync(TRUSTED_GIT_EXECUTABLE)) {
    throw new Error(`Trusted git executable not found at "${TRUSTED_GIT_EXECUTABLE}".`);
  }

  const output = execFileSync(
    TRUSTED_GIT_EXECUTABLE,
    ['diff', '--name-only', '--diff-filter=ACMRTUXB', `${safeBase}...${safeHead}`],
    { encoding: 'utf8' }
  );
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
};

const toMarkdown = ({ baseRef, headRef, changedFiles, targetFiles, components }) => {
  const lines = [
    '# Accessibility PR Diff Report',
    '',
    `- Base: \`${baseRef}\``,
    `- Head: \`${headRef}\``,
    `- Changed files (all): ${changedFiles.length}`,
    `- Accessibility scope files: ${targetFiles.length}`,
    ''
  ];

  if (!targetFiles.length) {
    lines.push('No accessibility scope files changed in this PR.');
    lines.push('');
    return lines.join('\n');
  }

  lines.push('| File | Type | Component |');
  lines.push('| --- | --- | --- |');
  components.forEach((entry) => {
    lines.push(`| \`${entry.file}\` | ${entry.type} | \`${entry.component}\` |`);
  });
  lines.push('');

  return lines.join('\n');
};

let changedFiles = [];

try {
  changedFiles = runDiff();
} catch (error) {
  console.error('Failed to collect git diff for accessibility PR scope.');
  console.error(error.message || error);
  process.exit(1);
}

const targetFiles = changedFiles.filter(isTargetSourceFile);
const components = targetFiles.map((file) => ({
  component: getComponentName(file),
  file,
  type: getFileType(file)
}));

const result = {
  base: base,
  changedFiles,
  generatedAt: new Date().toISOString(),
  head: head,
  targetFiles,
  components
};

ensureDir(outJsonPath);
ensureDir(outMdPath);
ensureDir(outFilesPath);

fs.writeFileSync(path.resolve(outJsonPath), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.resolve(outMdPath), `${toMarkdown({
  baseRef: base,
  headRef: head,
  changedFiles,
  targetFiles,
  components
})}\n`, 'utf8');
fs.writeFileSync(path.resolve(outFilesPath), `${targetFiles.join('\n')}\n`, 'utf8');

console.log(`Accessibility PR scope generated: ${targetFiles.length} target file(s).`);
console.log(`JSON report: ${outJsonPath}`);
console.log(`Markdown report: ${outMdPath}`);
console.log(`Target files list: ${outFilesPath}`);
