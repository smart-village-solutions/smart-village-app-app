import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { ChipFilter } from '../../src/components/map/ChipFilter';
import { darkColors, lightColors } from '../../src/config/colors';
import { getContrastRatio, resolveThemePalette } from '../../src/helpers/themeHelper';
import { ThemeContext } from '../../src/ThemeContext';

const mockRefetch = jest.fn().mockResolvedValue({});
const mockIconUrl = jest.fn();
const mockExternalIcon = jest.fn();

jest.mock('react-apollo', () => ({
  useQuery: () => ({
    data: {
      categories: [
        { id: '1', name: 'Kultur', iconName: 'culture' },
        { id: '2', name: 'Freizeit', iconName: 'leisure' }
      ]
    },
    loading: false
  })
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ left: 0, right: 0 })
}));
jest.mock('../../src/config', () => ({
  consts: { a11yLabel: { button: 'Button' } },
  normalize: (value: number) => value,
  IconUrl: (props: unknown) => {
    mockIconUrl(props);
    return null;
  }
}));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { CATEGORIES_FILTER: 'categories' },
  getQuery: (query: string) => query
}));
jest.mock('../../src/queries/categories', () => ({ GET_MAP_POI_CATEGORIES: 'allCategories' }));
jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children, style }: { children: React.ReactNode; style: unknown }) => {
    const { Text } = jest.requireActual('react-native');
    return <Text style={style}>{children}</Text>;
  }
}));

const ExternalIcon = (props: { color?: string }) => {
  mockExternalIcon(props);
  return null;
};

beforeEach(() => jest.clearAllMocks());

test.each([
  { name: 'light', mode: 'light', colors: lightColors },
  { name: 'dark', mode: 'dark', colors: darkColors },
  {
    name: 'custom light',
    mode: 'light',
    colors: resolveThemePalette(lightColors, { primary: '#FFFFFF', onPrimary: '#FFFFFF' })
  },
  {
    name: 'custom dark',
    mode: 'dark',
    colors: resolveThemePalette(darkColors, { primary: '#202020', onPrimary: '#202020' })
  }
] as const)('chip text and icons remain readable with $name colors', ({ mode, colors }) => {
  const screen = render(
    <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', colors }}>
      <ChipFilter
        queryVariables={{ categoryIds: ['1', '2'] }}
        refetch={mockRefetch}
        additionalFilters={[
          {
            id: 'external',
            name: 'External',
            selected: true,
            onPress: jest.fn(),
            icon: <ExternalIcon color={colors.primary} />
          }
        ]}
      />
    </ThemeContext.Provider>
  );
  const assertChip = (name: string, selected: boolean) => {
    const label = screen.getByText(name);
    const foreground = StyleSheet.flatten(label.props.style).color;
    let chip = label.parent;
    while (chip && StyleSheet.flatten(chip.props.style)?.backgroundColor === undefined) {
      chip = chip.parent;
    }
    const background = StyleSheet.flatten(chip?.props.style)?.backgroundColor;
    expect(foreground).toBe(selected ? colors.onPrimary : colors.text);
    expect(background).toBe(selected ? colors.primary : colors.surface);
    expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    expect(screen.getByRole('button', { name: `${name} Button` }).props.accessibilityState).toEqual(
      { selected }
    );
  };

  assertChip('Kultur', true);
  assertChip('External', true);
  expect(mockExternalIcon).toHaveBeenLastCalledWith({ color: colors.onPrimary });
  expect(mockIconUrl).toHaveBeenCalledWith(
    expect.objectContaining({
      iconName: 'culture',
      color: colors.onPrimary,
      fallback: null
    })
  );

  fireEvent.press(screen.getByRole('button', { name: 'Kultur Button' }));
  assertChip('Kultur', false);
  expect(mockIconUrl).toHaveBeenCalledWith(
    expect.objectContaining({
      iconName: 'culture',
      color: colors.text,
      fallback: null
    })
  );
  expect(mockRefetch).toHaveBeenLastCalledWith({ limit: undefined, categoryIds: ['2'] });
});
