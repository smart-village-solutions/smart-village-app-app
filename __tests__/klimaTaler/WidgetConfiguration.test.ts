import { darkColors, lightColors } from '../../src/config/colors';
import { resolveKlimaTalerWidget } from '../../src/klimaTaler/widgetConfiguration';
import { klimaTalerWidgets, isKlimaTalerConfigured } from '../../src/klimaTaler/settings';

test('defaults use the app palette and a generic icon without requiring customer config', () => {
  const config = resolveKlimaTalerWidget(true, lightColors);
  expect(config.logo).toMatchObject({ uri: '', icon: 'leaf' });
  expect(config.colors.background).toBe(lightColors.primary);
  expect(config.actions.main.target).toBe('provider');
  expect(config.actions.wallet.target).toBe('comingSoon');
});

test('partial overrides preserve unspecified fields and reject wrong scalar types', () => {
  const config = resolveKlimaTalerWidget(
    {
      texts: { title: 'Hello', balance: 42 },
      logo: null,
      colors: [],
      show: { logo: false },
      actions: { wallet: false, main: { label: 'Start' } }
    },
    lightColors
  );
  expect(config.texts.title).toBe('Hello');
  expect(config.texts.balance).toBe('Deine Klima-Taler');
  expect(config.logo.icon).toBe('leaf');
  expect(config.colors.background).toBe(lightColors.primary);
  expect(config.show.logo).toBe(false);
  expect(config.actions.wallet.enabled).toBe(false);
  expect(config.actions.main.target).toBe('provider');
});

test('widget visibility is configured on additionalProps independently of module activation', () => {
  const settings = { settings: { 'klima-taler': true } };
  expect(isKlimaTalerConfigured(settings)).toBe(true);
  expect(
    klimaTalerWidgets(settings, [
      'weather',
      { widgetName: 'klima-taler', additionalProps: { enabled: false } }
    ])
  ).toEqual(['weather']);
});

test('obsolete settings.widget appearance does not override widget configuration', () => {
  const settings = { settings: { 'klima-taler': { text: 'Old', widget: { enabled: false } } } };
  expect(klimaTalerWidgets(settings)).toEqual([{ widgetName: 'klimaTaler' }]);
});

test('dark overrides merge over shared colors and the active palette only in dark mode', () => {
  const options = {
    colors: {
      text: '#eeeeee',
      background: '#123456',
      dark: { background: '#222222', button: '#eeeeee' }
    }
  };
  const dark = resolveKlimaTalerWidget(options, darkColors, undefined, 'dark');
  expect(dark.colors).toMatchObject({
    background: '#222222',
    text: '#eeeeee',
    button: '#eeeeee',
    buttonText: darkColors.primary
  });
  expect(dark.colors).not.toHaveProperty('dark');
  const light = resolveKlimaTalerWidget(options, lightColors, undefined, 'light');
  expect(light.colors).toMatchObject({
    background: '#123456',
    text: '#eeeeee',
    button: lightColors.onPrimary
  });
});

test.each([undefined, null, false, [], 'invalid', { background: 42, text: null }])(
  'invalid dark overrides preserve common colors: %p',
  (dark) => {
    const config = resolveKlimaTalerWidget(
      { colors: { background: '#123456', dark } },
      darkColors,
      undefined,
      'dark'
    );
    expect(config.colors.background).toBe('#123456');
    expect(config.colors.text).toBe(darkColors.onPrimary);
  }
);

test('shortcut visibility preserves explicit customer configuration and hides absent defaults', () => {
  const defaults = resolveKlimaTalerWidget({}, lightColors);
  expect(defaults.actions.main.enabled).toBe(true);
  for (const name of ['wallet', 'map', 'badges', 'settings'] as const) {
    expect(defaults.actions[name].enabled).toBe(false);
  }
  const config = resolveKlimaTalerWidget(
    {
      actions: {
        wallet: true,
        map: { target: 'provider', label: 'Anbieter' },
        badges: { enabled: true },
        settings: { enabled: false, label: 'Hidden' }
      }
    },
    lightColors
  );
  expect(config.actions.wallet.enabled).toBe(true);
  expect(config.actions.map).toMatchObject({ enabled: true, target: 'provider' });
  expect(config.actions.badges).toMatchObject({ enabled: true, target: 'comingSoon' });
  expect(config.actions.settings.enabled).toBe(false);
});
