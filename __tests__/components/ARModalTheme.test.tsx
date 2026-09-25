import React from 'react';
import { StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';

import { ARModal } from '../../src/components/augmentedReality/ARModal';
import { darkColors, lightColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

jest.mock('../../src/components/Modal', () => {
  const { View } = jest.requireActual('react-native');

  return {
    Modal: ({ children, overlayStyle }: { children: React.ReactNode; overlayStyle: object }) => (
      <View style={overlayStyle} testID="ar-modal-surface">
        {children}
      </View>
    )
  };
});

jest.mock('../../src/components/augmentedReality/ARObjectList', () => ({
  ARObjectList: () => null
}));

jest.mock('../../src/config', () => ({
  normalize: (value: number) => value,
  texts: { settingsTitles: { arListLayouts: { hide: 'Ausblenden' } } }
}));

jest.mock('../../src/helpers', () => ({
  DOWNLOAD_TYPE: { DOWNLOADED: 'downloaded', DOWNLOADING: 'downloading' },
  progressSizeGenerator: () => '0 MB'
}));

jest.mock('../../src/components/augmentedReality/IconForDownloadType', () => ({
  IconForDownloadType: () => null
}));

const renderWithTheme = (colors: typeof lightColors, isDark: boolean) => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={{ colors, isDark, mode: isDark ? 'dark' : 'light' }}>
        <ARModal
          data={[]}
          isListView
          isLoading={false}
          isModalVisible
          setIsModalVisible={jest.fn()}
        />
      </ThemeContext.Provider>
    );
  });

  return StyleSheet.flatten(tree!.root.findByProps({ testID: 'ar-modal-surface' }).props.style);
};

describe('AR modal theme', () => {
  it('uses the active surface color for list overlays', () => {
    expect(renderWithTheme(lightColors, false).backgroundColor).toBe(lightColors.surface);
    expect(renderWithTheme(darkColors, true).backgroundColor).toBe(darkColors.surface);
  });
});
