#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires, complexity, no-console */
/**
 * Migrates an app's historical src/config/colors.js into the current lightColors
 * palette and the brand-related darkColors tokens, then prints a copy-ready
 * globalSettings JSON object.
 *
 * The historical module is parsed as static JavaScript and is never executed.
 *
 * Usage:
 *   yarn theme:migrate
 *   yarn theme:migrate --dry-run
 *   yarn theme:migrate --source-ref HEAD^
 *   yarn theme:migrate --source-ref <commit> --output /tmp/globalSettings-theme.json
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const readline = require('node:readline/promises');

const { parse } = require('@babel/parser');

const DEFAULT_SOURCE_PATH = 'src/config/colors.js';
const DEFAULT_TARGET_PATH = 'src/config/colors.ts';
const TRUSTED_GIT_EXECUTABLE = process.platform === 'win32' ? 'git.exe' : '/usr/bin/git';

const LEGACY_TOKEN_FALLBACKS = {
  background: ['background', 'surface'],
  border: ['border', 'gray40'],
  calendarBackground: ['calendarBackground', 'surface'],
  calendarSelected: ['calendarSelected', 'lighterPrimary'],
  calendarSelectedDayText: ['calendarSelectedDayText', 'darkText'],
  calendarTodayText: ['calendarTodayText', 'primary'],
  onPrimary: ['onPrimary', 'lightestText'],
  refreshControl: ['refreshControl', 'darkerPrimary', 'primary'],
  surfaceElevated: ['surfaceElevated', 'surface'],
  text: ['text', 'darkText']
};

const DARK_BRAND_TOKEN_FALLBACKS = {
  accent: ['lighterPrimary', 'accent', 'primary'],
  blue: ['blue'],
  calendarSelected: ['calendarSelected', 'lighterPrimary', 'primary'],
  calendarTodayText: ['calendarTodayText', 'lighterPrimary', 'primary'],
  darkerPrimary: ['lighterPrimary', 'primary'],
  lighterPrimary: ['lighterPrimary', 'primary'],
  primary: ['lighterPrimary', 'primary'],
  refreshControl: ['lighterPrimary', 'refreshControl', 'primary'],
  secondary: ['secondary']
};

const LEGACY_PRIMITIVE_NAMES = ['white', 'black', 'gray20', 'gray40', 'gray60', 'gray80'];
const SINGLE_QUOTE = String.fromCharCode(39);
const MINIMUM_TEXT_CONTRAST = 4.5;

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const parseModule = (source, filename) =>
  parse(source, {
    plugins: ['jsx', 'typescript'],
    sourceFilename: filename,
    sourceType: 'module'
  });

const unwrapDeclaration = (statement) =>
  statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;

const evaluateStaticNode = (node, bindings) => {
  if (!node) throw new Error('Missing static value.');

  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'Identifier':
      if (hasOwn(bindings, node.name)) return bindings[node.name];
      throw new Error(`Unknown identifier "${node.name}".`);
    case 'TemplateLiteral':
      if (node.expressions.length === 0) return node.quasis[0].value.cooked;
      throw new Error('Template expressions are not supported.');
    case 'UnaryExpression': {
      const value = evaluateStaticNode(node.argument, bindings);
      if (node.operator === '-' && typeof value === 'number') return -value;
      if (node.operator === '+' && typeof value === 'number') return value;
      throw new Error(`Unsupported unary operator "${node.operator}".`);
    }
    case 'TSAsExpression':
    case 'TSTypeAssertion':
      return evaluateStaticNode(node.expression, bindings);
    case 'CallExpression':
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'Object' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'freeze' &&
        node.arguments.length === 1 &&
        node.arguments[0].type !== 'SpreadElement'
      ) {
        return evaluateStaticNode(node.arguments[0], bindings);
      }
      throw new Error('Only Object.freeze(...) calls are supported.');
    case 'ObjectExpression':
      return node.properties.reduce((object, property) => {
        if (property.type === 'SpreadElement') {
          return { ...object, ...evaluateStaticNode(property.argument, bindings) };
        }

        if (property.type !== 'ObjectProperty' || property.computed) {
          throw new Error('Computed properties and methods are not supported.');
        }

        const key =
          property.key.type === 'Identifier' ? property.key.name : String(property.key.value);
        object[key] = evaluateStaticNode(property.value, bindings);
        return object;
      }, {});
    default:
      throw new Error(`Unsupported static syntax "${node.type}".`);
  }
};

const collectBindings = (ast) => {
  const bindings = {};
  const declarations = {};

  ast.program.body.forEach((statement) => {
    const declaration = unwrapDeclaration(statement);
    if (!declaration || declaration.type !== 'VariableDeclaration') return;

    declaration.declarations.forEach((variable) => {
      if (variable.id.type !== 'Identifier' || !variable.init) return;

      declarations[variable.id.name] = variable;
      try {
        bindings[variable.id.name] = evaluateStaticNode(variable.init, bindings);
      } catch {
        // Color modules also contain functions and derived exports. Only static
        // bindings needed by the palette migration are collected.
      }
    });
  });

  return { bindings, declarations };
};

const getObjectExpression = (node) => {
  if (node?.type === 'ObjectExpression') return node;
  if (
    node?.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'Object' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'freeze' &&
    node.arguments[0]?.type === 'ObjectExpression'
  ) {
    return node.arguments[0];
  }

  return undefined;
};

const getObjectProperties = (objectExpression) =>
  objectExpression.properties.reduce((properties, property) => {
    if (
      property.type === 'ObjectProperty' &&
      !property.computed &&
      (property.key.type === 'Identifier' || property.key.type === 'StringLiteral')
    ) {
      const key =
        property.key.type === 'Identifier' ? property.key.name : String(property.key.value);
      properties[key] = property;
    }

    return properties;
  }, {});

const parseLegacyColorSource = (source, filename = DEFAULT_SOURCE_PATH) => {
  const ast = parseModule(source, filename);
  const { bindings } = collectBindings(ast);

  if (!bindings.colors || typeof bindings.colors !== 'object') {
    throw new Error(
      `Could not statically read "export const colors" from ${filename}. ` +
        'Use string literals, constant aliases, object shorthand, or Object.freeze(...).'
    );
  }

  return { bindings, colors: bindings.colors };
};

const parseCurrentPalettes = (source, filename = DEFAULT_TARGET_PATH) => {
  const ast = parseModule(source, filename);
  const { bindings } = collectBindings(ast);

  if (!bindings.lightColors || !bindings.darkColors) {
    throw new Error(`Could not statically read lightColors and darkColors from ${filename}.`);
  }

  return {
    dark: bindings.darkColors,
    light: bindings.lightColors
  };
};

const resolveLegacyToken = (token, legacyColors) => {
  const candidates = LEGACY_TOKEN_FALLBACKS[token] || [token];
  const resolvedToken = candidates.find(
    (candidate) => hasOwn(legacyColors, candidate) && typeof legacyColors[candidate] === 'string'
  );

  return resolvedToken ? legacyColors[resolvedToken] : undefined;
};

const resolveLegacyTokenFromCandidates = (candidates, legacyColors) => {
  const resolvedToken = candidates.find(
    (candidate) => hasOwn(legacyColors, candidate) && typeof legacyColors[candidate] === 'string'
  );

  return resolvedToken ? legacyColors[resolvedToken] : undefined;
};

const parseColor = (value) => {
  if (typeof value !== 'string') return undefined;

  const hexMatch = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value);
  if (hexMatch) {
    const hex =
      hexMatch[1].length === 3
        ? hexMatch[1]
            .split('')
            .map((character) => `${character}${character}`)
            .join('')
        : hexMatch[1];

    return {
      blue: Number.parseInt(hex.slice(4, 6), 16),
      green: Number.parseInt(hex.slice(2, 4), 16),
      red: Number.parseInt(hex.slice(0, 2), 16)
    };
  }

  const rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(value);
  if (!rgbMatch) return undefined;

  const [red, green, blue] = rgbMatch.slice(1, 4).map(Number);
  if ([red, green, blue].some((channel) => channel < 0 || channel > 255)) return undefined;

  return { blue, green, red };
};

const getRelativeLuminance = (color) => {
  const linearize = (channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * linearize(color.red) + 0.7152 * linearize(color.green) + 0.0722 * linearize(color.blue)
  );
};

const getContrastRatio = (firstValue, secondValue) => {
  const first = parseColor(firstValue);
  const second = parseColor(secondValue);
  if (!first || !second) return undefined;

  const firstLuminance = getRelativeLuminance(first);
  const secondLuminance = getRelativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

const selectReadableForeground = (background, preferred) => {
  const preferredContrast = getContrastRatio(preferred, background);
  if (preferredContrast !== undefined && preferredContrast >= MINIMUM_TEXT_CONTRAST) {
    return preferred;
  }

  return ['#141414', '#FFFFFF'].reduce(
    (best, candidate) => {
      const contrast = getContrastRatio(candidate, background) || 0;
      return contrast > best.contrast ? { color: candidate, contrast } : best;
    },
    { color: preferred, contrast: preferredContrast || 0 }
  ).color;
};

const toRgba = (value, alpha, fallback) => {
  const color = parseColor(value);
  return color ? `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})` : fallback;
};

const quoteString = (value) =>
  `${SINGLE_QUOTE}${value
    .replaceAll('\\', '\\\\')
    .replaceAll(SINGLE_QUOTE, `\\${SINGLE_QUOTE}`)}${SINGLE_QUOTE}`;

const collectIdentifierReferences = (objectExpression) => {
  const references = new Set();

  objectExpression.properties.forEach((property) => {
    if (property.type === 'ObjectProperty' && property.value.type === 'Identifier') {
      references.add(property.value.name);
    }
  });

  return references;
};

const applyReplacements = (source, replacements) =>
  replacements
    .sort((first, second) => second.start - first.start)
    .reduce(
      (updatedSource, replacement) =>
        `${updatedSource.slice(0, replacement.start)}${replacement.value}${updatedSource.slice(
          replacement.end
        )}`,
      source
    );

const migrateColorsSource = (
  currentSource,
  legacySource,
  { sourceFilename = DEFAULT_SOURCE_PATH, targetFilename = DEFAULT_TARGET_PATH } = {}
) => {
  const legacy = parseLegacyColorSource(legacySource, sourceFilename);
  const currentAst = parseModule(currentSource, targetFilename);
  const current = collectBindings(currentAst);
  const lightDeclaration = current.declarations.lightColors;
  const darkDeclaration = current.declarations.darkColors;
  const lightObject = getObjectExpression(lightDeclaration?.init);
  const darkObject = getObjectExpression(darkDeclaration?.init);

  if (!lightObject || !darkObject) {
    throw new Error(`Could not locate lightColors and darkColors objects in ${targetFilename}.`);
  }

  const lightProperties = getObjectProperties(lightObject);
  const darkProperties = getObjectProperties(darkObject);
  const darkPrimitiveReferences = collectIdentifierReferences(darkObject);
  const replacements = [];
  const updatedPrimitiveNames = new Set();

  LEGACY_PRIMITIVE_NAMES.forEach((name) => {
    const legacyValue = legacy.bindings[name];
    const declaration = current.declarations[name];
    if (
      typeof legacyValue !== 'string' ||
      !declaration?.init ||
      darkPrimitiveReferences.has(name)
    ) {
      return;
    }

    replacements.push({
      end: declaration.init.end,
      start: declaration.init.start,
      value: quoteString(legacyValue)
    });
    updatedPrimitiveNames.add(name);
  });

  Object.entries(lightProperties).forEach(([token, property]) => {
    const migratedValue = resolveLegacyToken(token, legacy.colors);
    if (migratedValue === undefined) return;

    if (
      property.value.type === 'Identifier' &&
      updatedPrimitiveNames.has(property.value.name) &&
      legacy.bindings[property.value.name] === migratedValue
    ) {
      return;
    }

    if (property.shorthand) {
      replacements.push({
        end: property.end,
        start: property.start,
        value: `${token}: ${quoteString(migratedValue)}`
      });
    } else {
      replacements.push({
        end: property.value.end,
        start: property.value.start,
        value: quoteString(migratedValue)
      });
    }
  });

  const darkOverrides = Object.entries(DARK_BRAND_TOKEN_FALLBACKS).reduce(
    (overrides, [token, candidates]) => {
      const migratedValue = resolveLegacyTokenFromCandidates(candidates, legacy.colors);
      if (migratedValue !== undefined) overrides[token] = migratedValue;
      return overrides;
    },
    {}
  );

  if (darkOverrides.lighterPrimary) {
    darkOverrides.lighterPrimaryRgba = toRgba(
      darkOverrides.lighterPrimary,
      0.18,
      current.bindings.darkColors.lighterPrimaryRgba
    );
  }
  if (darkOverrides.darkerPrimary) {
    darkOverrides.darkerPrimaryRgba = toRgba(
      darkOverrides.darkerPrimary,
      0.65,
      current.bindings.darkColors.darkerPrimaryRgba
    );
  }
  if (darkOverrides.primary) {
    darkOverrides.onPrimary = selectReadableForeground(
      darkOverrides.primary,
      current.bindings.darkColors.onPrimary
    );
    darkOverrides.lightestText = darkOverrides.onPrimary;
  }
  if (darkOverrides.calendarSelected) {
    darkOverrides.calendarSelectedDayText = selectReadableForeground(
      darkOverrides.calendarSelected,
      current.bindings.darkColors.calendarSelectedDayText
    );
  }

  Object.entries(darkOverrides).forEach(([token, migratedValue]) => {
    const property = darkProperties[token];
    if (!property || typeof migratedValue !== 'string') return;

    if (property.shorthand) {
      replacements.push({
        end: property.end,
        start: property.start,
        value: `${token}: ${quoteString(migratedValue)}`
      });
    } else {
      replacements.push({
        end: property.value.end,
        start: property.value.start,
        value: quoteString(migratedValue)
      });
    }
  });

  const source = applyReplacements(currentSource, replacements);
  const before = parseCurrentPalettes(currentSource, targetFilename);
  const after = parseCurrentPalettes(source, targetFilename);
  const changedLightTokens = Object.keys(after.light).filter(
    (token) => before.light[token] !== after.light[token]
  );
  const changedDarkTokens = Object.keys(after.dark).filter(
    (token) => before.dark[token] !== after.dark[token]
  );

  return {
    changedDarkTokens,
    changedLightTokens,
    legacyColors: legacy.colors,
    palettes: after,
    source
  };
};

const buildGlobalSettings = (palettes) => ({
  settings: {
    accessibility: {
      enabledFeatures: {
        theming: true
      },
      themePalettes: {
        light: palettes.light,
        dark: palettes.dark
      }
    }
  }
});

const validateRepositoryPath = (value, optionName) => {
  if (!value || path.isAbsolute(value)) {
    throw new Error(`${optionName} must be a non-empty repository-relative path.`);
  }

  const normalized = path.posix.normalize(value.replaceAll(path.sep, '/'));
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`${optionName} cannot point outside the repository.`);
  }

  return normalized;
};

const validateGitRef = (value) => {
  if (!value || value.startsWith('-') || /[\0-\x20]/.test(value)) {
    throw new Error(`Invalid Git ref "${value}".`);
  }

  return value;
};

const runGit = (args, options = {}) =>
  execFileSync(TRUSTED_GIT_EXECUTABLE, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe']
  }).trim();

const gitObjectExists = (cwd, objectName) => {
  try {
    runGit(['cat-file', '-e', objectName], { cwd });
    return true;
  } catch {
    return false;
  }
};

const findLegacyColorFile = ({
  cwd = process.cwd(),
  sourcePath = DEFAULT_SOURCE_PATH,
  sourceRef = 'HEAD'
} = {}) => {
  const safePath = validateRepositoryPath(sourcePath, '--source-path');
  const safeRef = validateGitRef(sourceRef);
  const resolvedRef = runGit(['rev-parse', '--verify', '--end-of-options', `${safeRef}^{commit}`], {
    cwd
  });
  const firstParentHistory = runGit(['rev-list', '--first-parent', resolvedRef, '--', safePath], {
    cwd
  });
  const commits = [resolvedRef, ...firstParentHistory.split('\n').filter(Boolean)];
  const uniqueCommits = [...new Set(commits)];
  let commit = uniqueCommits.find((candidate) => gitObjectExists(cwd, `${candidate}:${safePath}`));

  if (!commit) {
    const fullHistory = runGit(['rev-list', resolvedRef, '--', safePath], { cwd });
    commit = fullHistory
      .split('\n')
      .filter(Boolean)
      .find((candidate) => gitObjectExists(cwd, `${candidate}:${safePath}`));
  }

  if (!commit) {
    throw new Error(
      `Could not find ${safePath} in the history of ${safeRef}. ` +
        'Pass the pre-merge commit with --source-ref or use --source-path.'
    );
  }

  return {
    commit,
    path: safePath,
    source: runGit(['show', `${commit}:${safePath}`], { cwd })
  };
};

const parseArguments = (argv) => {
  const options = {
    dryRun: false,
    force: false,
    outputPath: undefined,
    sourcePath: DEFAULT_SOURCE_PATH,
    sourceRef: 'HEAD',
    targetPath: DEFAULT_TARGET_PATH
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const nextValue = () => {
      index += 1;
      if (!argv[index]) throw new Error(`Missing value for ${argument}.`);
      return argv[index];
    };

    switch (argument) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--output':
        options.outputPath = nextValue();
        break;
      case '--source-path':
        options.sourcePath = nextValue();
        break;
      case '--source-ref':
        options.sourceRef = nextValue();
        break;
      case '--target-path':
        options.targetPath = nextValue();
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument "${argument}". Run with --help for usage.`);
    }
  }

  return options;
};

const HELP_TEXT = `
Migrate historical app colors into the current theme palette.

Usage:
  yarn theme:migrate [options]

Options:
  --source-ref <ref>    Git ref whose first-parent history is searched (default: HEAD)
  --source-path <path>  Historical colors.js path (default: src/config/colors.js)
  --target-path <path>  Current colors.ts path (default: src/config/colors.ts)
  --output <path>       Also write the copy-ready globalSettings JSON to a file
  --dry-run             Print changes and JSON without modifying colors.ts
  --force               Skip confirmation when colors.ts has local changes
  --help                Show this help
`.trim();

const confirmTargetOverwrite = async ({
  environment = process.env,
  input = process.stdin,
  output = process.stdout,
  prompt,
  targetPath
}) => {
  if (!input.isTTY || !output.isTTY || environment.CI) {
    throw new Error(
      `${targetPath} has local changes and confirmation is unavailable in a non-interactive ` +
        'terminal. Commit/stash them first or rerun with --force.'
    );
  }

  const question = `${targetPath} has local changes. Overwrite them with migrated colors? (y/N) `;
  if (prompt) {
    const answer = await prompt(question);
    return /^(y|yes)$/i.test(answer.trim());
  }

  const promptInterface = readline.createInterface({ input, output });
  try {
    const answer = await promptInterface.question(question);
    return /^(y|yes)$/i.test(answer.trim());
  } finally {
    promptInterface.close();
  }
};

const runCli = async (argv = process.argv.slice(2), cwd = process.cwd()) => {
  const options = parseArguments(argv);
  if (options.help) {
    console.log(HELP_TEXT);
    return;
  }

  const targetPath = validateRepositoryPath(options.targetPath, '--target-path');
  const absoluteTargetPath = path.resolve(cwd, targetPath);
  if (!fs.existsSync(absoluteTargetPath)) {
    throw new Error(`Target palette file does not exist: ${targetPath}`);
  }

  if (!options.dryRun && !options.force) {
    try {
      runGit(['diff', '--quiet', 'HEAD', '--', targetPath], {
        cwd,
        stdio: ['ignore', 'ignore', 'ignore']
      });
    } catch {
      const shouldOverwrite = await confirmTargetOverwrite({ targetPath });
      if (!shouldOverwrite) {
        console.log('Theme color migration cancelled. No files were changed.');
        return;
      }
    }
  }

  const historical = findLegacyColorFile({
    cwd,
    sourcePath: options.sourcePath,
    sourceRef: options.sourceRef
  });
  const currentSource = fs.readFileSync(absoluteTargetPath, 'utf8');
  const migration = migrateColorsSource(currentSource, historical.source, {
    sourceFilename: `${historical.commit}:${historical.path}`,
    targetFilename: targetPath
  });
  const globalSettings = buildGlobalSettings(migration.palettes);
  const globalSettingsJson = `${JSON.stringify(globalSettings, null, 2)}\n`;

  if (!options.dryRun) {
    fs.writeFileSync(absoluteTargetPath, migration.source, 'utf8');
  }

  if (options.outputPath) {
    const absoluteOutputPath = path.resolve(cwd, options.outputPath);
    fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
    fs.writeFileSync(absoluteOutputPath, globalSettingsJson, 'utf8');
  }

  console.log(`Legacy colors: ${historical.commit.slice(0, 10)}:${historical.path}`);
  console.log(`Target palette: ${targetPath}${options.dryRun ? ' (dry run)' : ''}`);
  console.log(
    `Updated light tokens (${migration.changedLightTokens.length}): ${
      migration.changedLightTokens.join(', ') || 'none'
    }`
  );
  console.log(
    `Updated dark brand tokens (${migration.changedDarkTokens.length}): ${
      migration.changedDarkTokens.join(', ') || 'none'
    }`
  );
  if (options.outputPath) console.log(`JSON output: ${options.outputPath}`);
  console.log('\n--- copy into globalSettings ---');
  console.log(globalSettingsJson.trimEnd());
  console.log('--- end globalSettings ---');
};

if (require.main === module) {
  runCli().catch((error) => {
    console.error(`Theme color migration failed: ${error.message || error}`);
    process.exitCode = 1;
  });
}

module.exports = {
  buildGlobalSettings,
  confirmTargetOverwrite,
  findLegacyColorFile,
  migrateColorsSource,
  parseArguments,
  parseCurrentPalettes,
  parseLegacyColorSource,
  runCli
};
