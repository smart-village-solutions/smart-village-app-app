/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('node:fs');
const path = require('node:path');

const {
  buildGlobalSettings,
  confirmTargetOverwrite,
  findLegacyColorFile,
  migrateColorsSource,
  parseLegacyColorSource
} = require('../../scripts/migrate-theme-colors');

const repositoryRoot = path.resolve(__dirname, '../..');
const currentColorsSource = fs.readFileSync(
  path.join(repositoryRoot, 'src/config/colors.ts'),
  'utf8'
);

const legacyColorsSource = `
  const white = '#FAFAFA';
  const black = '#111111';
  const gray20 = '#EEEEEE';
  const gray40 = '#444444';
  const gray60 = '#666666';
  const gray80 = '#888888';

  export const colors = {
    lighterPrimaryRgba: 'rgba(51, 102, 153, 0.1)',
    lighterPrimary: '#6699CC',
    primary: '#336699',
    darkerPrimary: 'rgb(32, 64, 96)',
    darkerPrimaryRgba: 'rgba(32, 64, 96, 0.6)',
    secondary: '#993366',
    accent: '#204060',
    blue: '#1234AA',
    error: '#AA0011',
    darkText: black,
    lightestText: white,
    shadow: gray60,
    placeholder: gray80,
    surface: white,
    gray20,
    gray40,
    gray60,
    refreshControl: '#204060'
  };
`;

describe('migrate-theme-colors', () => {
  it('asks before overwriting a locally modified target in an interactive terminal', async () => {
    const prompt = jest.fn().mockResolvedValue('yes');

    await expect(
      confirmTargetOverwrite({
        environment: {},
        input: { isTTY: true },
        output: { isTTY: true },
        prompt,
        targetPath: 'src/config/colors.ts'
      })
    ).resolves.toBe(true);
    expect(prompt).toHaveBeenCalledWith(
      'src/config/colors.ts has local changes. Overwrite them with migrated colors? (y/N) '
    );
  });

  it('keeps the target unchanged when overwrite confirmation is declined', async () => {
    await expect(
      confirmTargetOverwrite({
        environment: {},
        input: { isTTY: true },
        output: { isTTY: true },
        prompt: jest.fn().mockResolvedValue('n'),
        targetPath: 'src/config/colors.ts'
      })
    ).resolves.toBe(false);
  });

  it('requires --force when overwrite confirmation cannot be requested', async () => {
    await expect(
      confirmTargetOverwrite({
        environment: { CI: 'true' },
        input: { isTTY: true },
        output: { isTTY: true },
        prompt: jest.fn(),
        targetPath: 'src/config/colors.ts'
      })
    ).rejects.toThrow('rerun with --force');
  });

  it('statically resolves constants and shorthand properties without executing the module', () => {
    const legacy = parseLegacyColorSource(legacyColorsSource);

    expect(legacy.colors.primary).toBe('#336699');
    expect(legacy.colors.darkText).toBe('#111111');
    expect(legacy.colors.gray40).toBe('#444444');
  });

  it('maps legacy colors into lightColors and migrates only dark brand tokens', () => {
    const migration = migrateColorsSource(currentColorsSource, legacyColorsSource);

    expect(migration.palettes.light).toMatchObject({
      background: '#FAFAFA',
      border: '#444444',
      onPrimary: '#FAFAFA',
      primary: '#336699',
      surface: '#FAFAFA',
      surfaceElevated: '#FAFAFA',
      text: '#111111'
    });
    expect(migration.palettes.dark).toMatchObject({
      accent: '#6699CC',
      background: '#121212',
      border: '#54545A',
      darkerPrimary: '#6699CC',
      lighterPrimary: '#6699CC',
      onPrimary: '#141414',
      primary: '#6699CC',
      secondary: '#993366',
      surface: '#1E1E1E',
      text: '#F5F5F5'
    });
    expect(migration.palettes.dark.onPrimary).toBe('#141414');
    expect(migration.changedLightTokens).toEqual(
      expect.arrayContaining([
        'background',
        'border',
        'onPrimary',
        'primary',
        'surface',
        'surfaceElevated',
        'text'
      ])
    );
    expect(migration.changedDarkTokens).toEqual(
      expect.arrayContaining(['accent', 'darkerPrimary', 'lighterPrimary', 'primary', 'secondary'])
    );
  });

  it('creates a complete copy-ready globalSettings palette object', () => {
    const migration = migrateColorsSource(currentColorsSource, legacyColorsSource);
    const globalSettings = buildGlobalSettings(migration.palettes);

    expect(globalSettings.settings.accessibility.enabledFeatures.theming).toBe(true);
    expect(globalSettings.settings.accessibility.themePalettes.light.primary).toBe('#336699');
    expect(globalSettings.settings.accessibility.themePalettes.dark.primary).toBe('#6699CC');
  });

  it('selects readable dark content colors for migrated dark brand backgrounds', () => {
    const darkBrandSource = legacyColorsSource.replace(/lighterPrimary: '#6699CC'/, (entry) =>
      entry.replace('#6699CC', '#1A3553')
    );
    const migration = migrateColorsSource(currentColorsSource, darkBrandSource);

    expect(migration.palettes.dark.primary).toBe('#1A3553');
    expect(migration.palettes.dark.onPrimary).toBe('#FFFFFF');
    expect(migration.palettes.dark.lightestText).toBe('#FFFFFF');
    expect(migration.palettes.dark.calendarSelected).toBe('#1A3553');
    expect(migration.palettes.dark.calendarSelectedDayText).toBe('#FFFFFF');
  });

  it('finds the nearest colors.js on the current branch first-parent history', () => {
    const historical = findLegacyColorFile({ cwd: repositoryRoot });

    expect(historical.path).toBe('src/config/colors.js');
    expect(historical.source).toContain('export const colors');
  });
});
