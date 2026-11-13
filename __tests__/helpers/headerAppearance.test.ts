import { darkColors, lightColors } from '../../src/config/colors';
import {
  resolveHeaderForeground,
  resolveHeaderStatusBarStyle
} from '../../src/helpers/headerAppearance';

describe('header appearance', () => {
  it.each([lightColors, darkColors])(
    'preserves semantic colors for surfaces and brand backgrounds (%j)',
    (colors) => {
      expect(resolveHeaderForeground(colors, colors.surface)).toBe(colors.text);
      expect(resolveHeaderForeground(colors, colors.primary)).toBe(colors.onPrimary);
    }
  );

  it('preserves a configured brand foreground even when automatic contrast is disabled', () => {
    expect(
      resolveHeaderForeground(
        { ...lightColors, primary: '#0091db', onPrimary: '#FFFFFF' },
        '#0091db'
      )
    ).toBe('#FFFFFF');
  });

  it('chooses contrasting content on custom surfaces and allows explicit overrides', () => {
    expect(resolveHeaderForeground(lightColors, '#000000')).toBe('#FFFFFF');
    expect(resolveHeaderForeground(darkColors, '#FFFFFF')).toBe('#000000');
    expect(resolveHeaderForeground(lightColors, '#000000', '#ABCDEF')).toBe('#ABCDEF');
  });

  it('uses the normal text fallback for backgrounds that cannot be evaluated', () => {
    expect(resolveHeaderForeground(lightColors, 'transparent')).toBe(lightColors.text);
  });

  it.each([
    ['#FFFFFF', 'light-content'],
    ['#000000', 'dark-content'],
    ['#141414', 'dark-content']
  ] as const)('matches system icons to the shared foreground %s', (foreground, style) => {
    expect(resolveHeaderStatusBarStyle(foreground)).toBe(style);
  });
});
