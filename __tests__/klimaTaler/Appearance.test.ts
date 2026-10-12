import { darkColors, lightColors } from '../../src/config/colors';
import { getContrastRatio, toGrayscaleColor } from '../../src/helpers/themeHelper';
import { accessibleKlimaTalerConfiguration } from '../../src/klimaTaler/appearance';
import { resolveKlimaTalerWidget } from '../../src/klimaTaler/widgetConfiguration';

const defaults = {
  isHighContrastEnabled: false,
  isReduceTransparencyEnabled: false,
  isGrayscaleEnabled: false
};

test.each([lightColors, darkColors])(
  'high contrast uses readable opaque theme pairs',
  (palette) => {
    const input = resolveKlimaTalerWidget(
      { colors: { text: '#ffffff', background: '#ffffff' } },
      palette
    );
    const result = accessibleKlimaTalerConfiguration(input, palette, {
      ...defaults,
      isHighContrastEnabled: true
    });
    expect(getContrastRatio(result.colors.text, result.colors.background)).toBeGreaterThan(7);
    expect(getContrastRatio(result.colors.buttonText, result.colors.button)).toBeGreaterThan(7);
    expect(getContrastRatio(result.colors.shortcutIcon, result.colors.shortcut)).toBeGreaterThan(7);
    expect(input.colors.background).toBe('#ffffff');
  }
);

test('reduced transparency replaces translucent pairs and removes style opacity', () => {
  const input = resolveKlimaTalerWidget(
    { styles: { shortcut: { backgroundColor: 'rgba(1,2,3,0.3)', opacity: 0.4 } } },
    lightColors
  );
  const result = accessibleKlimaTalerConfiguration(input, lightColors, {
    ...defaults,
    isReduceTransparencyEnabled: true
  });
  expect(getContrastRatio(result.colors.shortcutIcon, result.colors.shortcut)).toBeGreaterThan(7);
  expect(result.styles.shortcut).toMatchObject({ opacity: 1, borderWidth: 1 });
  expect(result.styles.shortcut.backgroundColor).toBeUndefined();
  expect(result.colors.background).toBe(lightColors.primary);
});

test('grayscale adapts custom appearance without changing copy, logo URLs or actions', () => {
  const input = resolveKlimaTalerWidget(
    {
      colors: { background: '#ff0000' },
      styles: { buttonText: { color: '#00ff00' } },
      logo: { uri: 'https://example.org/logo.png', color: '#0000ff' },
      texts: { title: '#ff0000' }
    },
    lightColors
  );
  const result = accessibleKlimaTalerConfiguration(input, lightColors, {
    ...defaults,
    isGrayscaleEnabled: true
  });
  expect(result.colors.background).toBe(toGrayscaleColor('#ff0000'));
  expect(result.styles.buttonText.color).toBe(toGrayscaleColor('#00ff00'));
  expect(result.logo.color).toBe(toGrayscaleColor('#0000ff'));
  expect(result.logo.uri).toBe(input.logo.uri);
  expect(result.texts.title).toBe('#ff0000');
  expect(result.actions).toBe(input.actions);
});

test('regular display keeps customer appearance intact', () => {
  const config = resolveKlimaTalerWidget(
    { colors: { background: '#123456' }, styles: { card: { opacity: 0.9 } } },
    lightColors
  );
  expect(accessibleKlimaTalerConfiguration(config, lightColors, defaults)).toEqual(config);
});
