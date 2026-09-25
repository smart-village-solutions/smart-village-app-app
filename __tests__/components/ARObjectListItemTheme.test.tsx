import React from 'react';
import { StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';

import { ARObjectListItem } from '../../src/components/augmentedReality/ARObjectListItem';
import { darkColors, lightColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

jest.mock('react-native-elements', () => {
  const { View } = jest.requireActual('react-native');
  const ListItem = ({
    children,
    containerStyle
  }: {
    children: React.ReactNode;
    containerStyle: object;
  }) => (
    <View style={containerStyle} testID="ar-object-row">
      {children}
    </View>
  );
  ListItem.Content = View;

  return { ListItem };
});

jest.mock('../../src/config', () => ({
  consts: { a11yLabel: { button: 'button' } },
  normalize: (value: number) => value,
  texts: { settingsTitles: { arListLayouts: {} } }
}));

jest.mock('../../src/helpers', () => ({
  DOWNLOAD_TYPE: { DOWNLOADABLE: 'downloadable', DOWNLOADED: 'downloaded' },
  progressSizeGenerator: () => '0 MB'
}));

jest.mock('../../src/components/Text', () => {
  const { Text } = jest.requireActual('react-native');

  return {
    BoldText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    RegularText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>
  };
});

jest.mock('../../src/components/augmentedReality/IconForDownloadType', () => ({
  IconForDownloadType: () => null
}));

jest.mock('../../src/components/Touchable', () => ({ Touchable: 'Touchable' }));

const row = {
  title: 'AR-Objekt',
  payload: { downloadType: 'downloadable', progressSize: 0, totalSize: 1, locationInfo: '' }
};

const renderWithTheme = (colors: typeof lightColors, isDark: boolean) => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={{ colors, isDark, mode: isDark ? 'dark' : 'light' }}>
        <ARObjectListItem item={row} />
      </ThemeContext.Provider>
    );
  });

  return StyleSheet.flatten(tree!.root.findByProps({ testID: 'ar-object-row' }).props.style);
};

describe('AR settings list theme', () => {
  it('uses the active elevated surface and divider on object rows', () => {
    expect(renderWithTheme(lightColors, false)).toMatchObject({
      backgroundColor: lightColors.surfaceElevated,
      borderBottomColor: lightColors.border
    });
    expect(renderWithTheme(darkColors, true)).toMatchObject({
      backgroundColor: darkColors.surfaceElevated,
      borderBottomColor: darkColors.border
    });
  });
});
