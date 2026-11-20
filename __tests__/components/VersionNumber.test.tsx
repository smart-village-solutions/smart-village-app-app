import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

import appJson from '../../app.json';
import { SettingsContext } from '../../src/SettingsProvider';
import { VersionNumber } from '../../src/components/VersionNumber';
import { device } from '../../src/config';
import { hasSueApiConfiguration } from '../../src/helpers';

jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({ globalSettings: {} })
}));
jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest.requireActual('react').createContext({})
}));
jest.mock('../../src/config', () => ({
  consts: {
    a11yLabel: { versionInfos: 'Versionshinweise', appVersion: 'Version', button: 'Button' }
  },
  device: { platform: 'ios' },
  texts: { accessibilityLabels: { actions: { showVersionInfo: 'Versionsinformationen anzeigen' } } }
}));
jest.mock('../../src/helpers', () => ({ hasSueApiConfiguration: jest.fn() }));
jest.mock('../../src/hooks/useThemeStyles', () => ({ useThemeStyles: () => ({}) }));
jest.mock('../../src/components/Text', () => ({
  RegularText: jest.requireActual('react-native').Text
}));
jest.mock('../../src/components/Wrapper', () => ({
  WrapperVertical: jest.requireActual('react-native').View
}));

const originalVersion = appJson.expo.extra.klimaTalerVersion;
const openVersionInfo = (settings: Record<string, unknown>) => {
  const screen = render(
    <SettingsContext.Provider value={{ globalSettings: { settings } } as never}>
      <VersionNumber />
    </SettingsContext.Provider>
  );
  fireEvent.press(screen.getByRole('button', { name: 'Versionsinformationen anzeigen' }));
};

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.mocked(hasSueApiConfiguration).mockReturnValue(false);
  device.platform = 'ios';
});

afterEach(() => {
  appJson.expo.extra.klimaTalerVersion = originalVersion;
  jest.restoreAllMocks();
});

test.each([false, undefined])(
  'preserves existing module versions with KT disabled: %p',
  (value) => {
    jest.mocked(hasSueApiConfiguration).mockReturnValue(true);
    openVersionInfo({ search: true, sue: {}, 'klima-taler': value });
    expect(Alert.alert).toHaveBeenCalledWith(
      'Versionshinweise',
      [
        `Smart Village App: ${appJson.expo.version}`,
        `Build: ${appJson.expo.ios.buildNumber}`,
        `OTA: ${appJson.expo.extra.otaVersion}`,
        `Suche: ${appJson.expo.extra.searchVersion}`,
        `SUE: ${appJson.expo.extra.sueVersion}`
      ].join('\n')
    );
  }
);

test.each([true, {}])('includes the configured KT module version when enabled: %p', (value) => {
  const configuredVersion = '0.2.0-test';
  appJson.expo.extra.klimaTalerVersion = configuredVersion;
  openVersionInfo({ 'klima-taler': value });
  expect(Alert.alert).toHaveBeenCalledWith(
    'Versionshinweise',
    expect.stringContaining(`Klima-Taler: ${configuredVersion}`)
  );
});

test('omits the KT entry for older app configurations without a module version', () => {
  appJson.expo.extra.klimaTalerVersion = undefined as never;
  openVersionInfo({ 'klima-taler': true });
  expect(Alert.alert).toHaveBeenCalledWith(
    'Versionshinweise',
    expect.not.stringMatching(/Klima-Taler|undefined/)
  );
});

test('keeps the Android build code alongside the KT module version', () => {
  device.platform = 'android';
  openVersionInfo({ 'klima-taler': true });
  expect(Alert.alert).toHaveBeenCalledWith(
    'Versionshinweise',
    expect.stringContaining(`Build: ${appJson.expo.android.versionCode}`)
  );
  expect(Alert.alert).toHaveBeenCalledWith(
    'Versionshinweise',
    expect.stringContaining(`Klima-Taler: ${originalVersion}`)
  );
});
