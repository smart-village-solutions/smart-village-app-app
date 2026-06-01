#!/usr/bin/env node
/**
 * Accessibility PR Component Gate
 *
 * Runs ESLint accessibility rules only on files changed in the PR scope.
 * Produces JSON + Markdown reports and exits with non-zero if violations exist.
 *
 * Usage:
 *   node scripts/check-a11y-pr-components.js
 *   node scripts/check-a11y-pr-components.js --input-json .reports/a11y-pr-diff.json
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ACCESSIBILITY_RULES = new Set([
  'react-native-a11y/has-accessibility-props',
  'react-native-a11y/has-valid-accessibility-role',
  'react-native-a11y/has-valid-accessibility-state',
  'react-native-a11y/no-nested-touchables'
]);

const RULE_TITLES = {
  'react-native-a11y/has-accessibility-props': 'Missing accessibility props',
  'react-native-a11y/has-valid-accessibility-role': 'Missing or invalid accessibilityRole',
  'react-native-a11y/has-valid-accessibility-state': 'Invalid accessibilityState',
  'react-native-a11y/no-nested-touchables': 'Nested touchables'
};

const args = process.argv.slice(2);

const getArg = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const inputJsonPath = getArg('--input-json', '.reports/a11y-pr-diff.json');
const outJsonPath = getArg('--out-json', '.reports/a11y-pr-report.json');
const outMdPath = getArg('--out-md', '.reports/a11y-pr-report.md');

const ensureDir = (filePath) => {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
};

const readScope = () => {
  const fullPath = path.resolve(inputJsonPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Scope file not found: ${inputJsonPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  return {
    base: parsed.base,
    head: parsed.head,
    components: parsed.components || [],
    files: parsed.targetFiles || []
  };
};

const toRelative = (absoluteFilePath) =>
  path.relative(process.cwd(), absoluteFilePath).replace(/\\/g, '/');

const runEslint = (files) => {
  const eslintBin = path.resolve(
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'eslint.cmd' : 'eslint'
  );

  const eslintArgs = ['-f', 'json', ...files];
  const result = spawnSync(eslintBin, eslintArgs, {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  if (!result.stdout && result.error) {
    throw result.error;
  }

  let parsed = [];
  let parseError = null;
  if (result.stdout && result.stdout.trim().length) {
    try {
      parsed = JSON.parse(result.stdout);
    } catch (error) {
      parseError = error;
    }
  }

  return {
    parsed,
    parseError,
    status: result.status || 0,
    stderr: result.stderr || ''
  };
};

const normalizeFindings = (eslintResults, componentMapByFile) => {
  const findings = [];

  eslintResults.forEach((fileResult) => {
    const file = toRelative(fileResult.filePath);
    const fileComponent = componentMapByFile.get(file);

    (fileResult.messages || []).forEach((msg) => {
      if (!ACCESSIBILITY_RULES.has(msg.ruleId || '')) return;
      if (msg.severity !== 2) return;

      findings.push({
        file,
        component: fileComponent || path.basename(file, path.extname(file)),
        type: RULE_TITLES[msg.ruleId] || msg.ruleId,
        ruleId: msg.ruleId,
        message: msg.message,
        line: msg.line || 1,
        column: msg.column || 1
      });
    });
  });

  return findings;
};

const toMarkdown = ({ base, head, files, findings }) => {
  const lines = [
    '# Accessibility PR Component Report',
    '',
    `- Base: \`${base}\``,
    `- Head: \`${head}\``,
    `- Checked files: ${files.length}`,
    `- Findings: ${findings.length}`,
    ''
  ];

  if (!files.length) {
    lines.push('No accessibility scope files changed in this PR.');
    lines.push('');
    return lines.join('\n');
  }

  if (!findings.length) {
    lines.push('No accessibility violations found in changed files.');
    lines.push('');
    return lines.join('\n');
  }

  lines.push('| Component | File | Line | Issue | Details |');
  lines.push('| --- | --- | --- | --- | --- |');
  findings.forEach((finding) => {
    const message = finding.message.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(
      `| \`${finding.component}\` | \`${finding.file}\` | ${finding.line}:${finding.column} | ${finding.type} | ${message} |`
    );
  });
  lines.push('');

  return lines.join('\n');
};

let scope;
try {
  scope = readScope();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

const files = scope.files.filter((file) => fs.existsSync(path.resolve(file)));
const componentMapByFile = new Map(
  (scope.components || []).map((entry) => [entry.file, entry.component])
);

let findings = [];

if (files.length) {
  const eslintResult = runEslint(files);
  const hasFatalErrors = eslintResult.parsed.some(
    (fileResult) =>
      (fileResult.fatalErrorCount || 0) > 0 ||
      (fileResult.messages || []).some((message) => message.fatal)
  );

  if (eslintResult.parseError) {
    console.error('Failed to parse ESLint JSON output for accessibility PR gate.');
    console.error(eslintResult.parseError.message || eslintResult.parseError);
    if (eslintResult.stderr.trim()) {
      console.error(eslintResult.stderr.trim());
    }
    process.exit(1);
  }

  findings = normalizeFindings(eslintResult.parsed, componentMapByFile);

  if (eslintResult.status !== 0 && (hasFatalErrors || !findings.length)) {
    console.error('ESLint exited with errors while running accessibility PR gate.');
    if (eslintResult.stderr.trim()) {
      console.error(eslintResult.stderr.trim());
    }
    process.exit(1);
  }
}

const report = {
  base: scope.base,
  head: scope.head,
  files,
  findings,
  generatedAt: new Date().toISOString()
};

ensureDir(outJsonPath);
ensureDir(outMdPath);

fs.writeFileSync(path.resolve(outJsonPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.resolve(outMdPath), `${toMarkdown(report)}\n`, 'utf8');

if (findings.length) {
  console.error(`Accessibility PR gate failed with ${findings.length} finding(s).`);
  process.exit(1);
}

console.log(`Accessibility PR gate passed. Checked ${files.length} file(s).`);
