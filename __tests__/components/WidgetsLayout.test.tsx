import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert, Modal, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const mockUseWindowDimensions = jest.fn(() => ({
  fontScale: 1,
  height: 800,
  scale: 3,
  width: 360
}));

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: mockUseWindowDimensions
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 })
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = jest.requireActual<typeof import('react')>('react');

  return {
    AccessibilityContext: ReactLocal.createContext({ textScaleMultiplier: 1 })
  };
});

jest.mock('../../src/SettingsProvider', () => {
  const ReactLocal = jest.requireActual<typeof import('react')>('react');

  return { SettingsContext: ReactLocal.createContext({ globalSettings: {} }) };
});

jest.mock('../../src/config', () => ({
  normalize: (value: number) => value
}));

jest.mock('../../src/helpers', () => ({
  resolveEffectiveTextScale: jest.requireActual('../../src/helpers/responsiveGridLayout')
    .resolveEffectiveTextScale,
  resolveWidgetLayout: jest.requireActual('../../src/helpers/widgetLayout').resolveWidgetLayout
}));

jest.mock('../../src/components/widgets/ConstructionSiteNewsWidget', () => ({
  ConstructionSiteNewsWidget: () => <MockMeasuredWidget name="constructionsitenews" />
}));
jest.mock('../../src/components/widgets/ConstructionSiteWidget', () => ({
  ConstructionSiteWidget: () => <MockMeasuredWidget name="constructionsite" />
}));
jest.mock('../../src/components/widgets/CustomWidget', () => ({
  CustomWidget: () => <MockMeasuredWidget name="custom" />
}));
jest.mock('../../src/components/widgets/EventWidget', () => ({
  EventWidget: () => <MockMeasuredWidget name="event" />
}));
jest.mock('../../src/components/widgets/KlimaTalerWidget', () => ({
  KlimaTalerWidget: () => null
}));
jest.mock('../../src/components/widgets/LunchWidget', () => ({
  LunchWidget: () => <MockMeasuredWidget name="lunch" />
}));
jest.mock('../../src/components/widgets/SurveyWidget', () => ({
  SurveyWidget: () => <MockMeasuredWidget name="survey" />
}));
jest.mock('../../src/components/widgets/VoucherWidget', () => ({
  VoucherWidget: () => <MockMeasuredWidget name="voucher" />
}));
jest.mock('../../src/components/widgets/WaterTemperatureWidget', () => ({
  WaterTemperatureWidget: () => <MockMeasuredWidget name="watertemperature" />
}));
jest.mock('../../src/components/widgets/WeatherWidget', () => ({
  WeatherWidget: () => <MockMeasuredWidget name="weather" />
}));
jest.mock('../../src/components/widgets/WebWidget', () => ({
  WebWidget: () => <MockMeasuredWidget name="web" />
}));

const mockSave = jest.fn().mockResolvedValue(undefined);
jest.mock('../../src/hooks/useWidgetOrder', () => ({
  useWidgetOrder: () => ({ order: [], loaded: true, save: mockSave })
}));
function MockMeasuredWidget({ name }: { name: string }) {
  const { onLabelWidth } = React.useContext(WidgetLayoutContext);
  const label = (
    <Text
      testID={`${name}-label`}
      onTextLayout={() => onLabelWidth?.(name === 'survey' ? 112 : 64)}
    >
      {name}
    </Text>
  );

  return name === 'custom' ? (
    <WidgetContainer accessibilityLabel="Custom" onPress={jest.fn()}>
      {label}
    </WidgetContainer>
  ) : (
    label
  );
}

const configuredWidgets = (enabled: unknown, count = 4) => (
  <SettingsContext.Provider
    value={
      {
        globalSettings: {
          settings: {
            accessibility: {
              enabledFeatures: { balanceWidgetRows: enabled }
            }
          }
        }
      } as never
    }
  >
    <Widgets
      widgetConfigs={Array.from({ length: count }, (_, index) =>
        index === 0 ? 'survey' : 'custom'
      )}
    />
  </SettingsContext.Provider>
);

const measureAll = (tree: ReturnType<typeof render>) => {
  tree.UNSAFE_getAllByType(Text).forEach((text) => fireEvent(text, 'textLayout'));
};

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { SettingsContext } from '../../src/SettingsProvider';
import { Widgets } from '../../src/components/widgets/Widgets';
import { ReorderableWidget } from '../../src/components/widgets/ReorderableWidget';
import { WidgetContainer } from '../../src/components/widgets/WidgetContainer';
import { WidgetLayoutContext } from '../../src/components/widgets/WidgetLayoutContext';

const getItemViewsByWidth = (tree: ReturnType<typeof render>, width: string) =>
  tree
    .getAllByTestId('compactWidgetContainer', { includeHiddenElements: true })
    .filter((view) => StyleSheet.flatten(view.props.style)?.width === width);

const widgetItems = (tree: ReturnType<typeof render>) =>
  tree.UNSAFE_getAllByType(ReorderableWidget);
const widths = (tree: ReturnType<typeof render>) =>
  widgetItems(tree).map((item) => StyleSheet.flatten(item.props.style).width as number);

const managedWidgets = (widgetConfigs: string[]) => (
  <SettingsContext.Provider
    value={{ globalSettings: { settings: { personalizedWidgets: true } } } as never}
  >
    <Widgets widgetConfigs={widgetConfigs} />
  </SettingsContext.Provider>
);

const spacingCases = [
  ['first', ['klimaTaler', 'custom', 'custom', 'custom', 'custom']],
  ['middle', ['custom', 'custom', 'klimaTaler', 'custom', 'custom']],
  ['last', ['custom', 'custom', 'custom', 'custom', 'klimaTaler']],
  ['card only', ['klimaTaler']],
  ['compact only', Array(8).fill('custom')]
] as [string, string[]][];

describe.each([false, true])('consistent widget spacing with personalization=%s', (editable) => {
  describe.each([
    [320, 1],
    [844, 1],
    [320, 1.4],
    [320, 2.2]
  ])('at width %s and text scale %s', (width, fontScale) => {
    test.each(spacingCases)('%s', (_position, widgetConfigs) => {
      mockUseWindowDimensions.mockReturnValue({ width, height: 900, scale: 3, fontScale });
      const tree = render(
        <SettingsContext.Provider
          value={
            {
              globalSettings: {
                settings: {
                  personalizedWidgets: editable,
                  'klima-taler': widgetConfigs.includes('klimaTaler')
                }
              }
            } as never
          }
        >
          <Widgets widgetConfigs={widgetConfigs} />
        </SettingsContext.Provider>
      );
      const isManaged = editable || widgetConfigs.includes('klimaTaler');
      const assertSpacing = () => {
        const grid = StyleSheet.flatten(tree.getByTestId('widgetGrid').props.style);
        expect(grid.rowGap).toBe(isManaged ? 24 : 8);
        expect(grid.paddingTop).toBe(isManaged ? 16 : undefined);
        expect(grid.paddingBottom).toBe(isManaged ? (editable ? 0 : 16) : undefined);
        tree.UNSAFE_queryAllByType(WidgetContainer).forEach((container) => {
          const button = container.findByType(TouchableOpacity);
          expect(StyleSheet.flatten(button.props.style).paddingVertical).toBe(
            isManaged ? 0 : undefined
          );
        });
      };
      assertSpacing();
      if (editable) {
        const edit = tree.getByRole('button', { name: 'Widgets anordnen' });
        expect(StyleSheet.flatten(edit.props.style)).toMatchObject({
          paddingVertical: 14,
          minHeight: 48
        });
        fireEvent.press(edit);
        assertSpacing();
        fireEvent.press(tree.getByRole('button', { name: 'Abbrechen' }));
        assertSpacing();
      }
    });
  });
});

beforeEach(() => {
  mockUseWindowDimensions.mockReturnValue({ width: 360, height: 800, scale: 3, fontScale: 1 });
});

describe('Widgets responsive layout', () => {
  it('reduces columns when a measured title needs more room and adapts to container resizing', () => {
    const tree = render(configuredWidgets(true, 3));
    expect(getItemViewsByWidth(tree, `${100 / 3}%`)).toHaveLength(3);

    fireEvent(tree.getByTestId('survey-label', { includeHiddenElements: true }), 'textLayout');
    expect(getItemViewsByWidth(tree, '50%')).toHaveLength(2);

    const container = tree.UNSAFE_getAllByType(View).find((view) => view.props.onLayout);
    fireEvent(container!, 'layout', { nativeEvent: { layout: { width: 240 } } });
    expect(getItemViewsByWidth(tree, '100%')).toHaveLength(3);

    fireEvent(container!, 'layout', { nativeEvent: { layout: { width: 420 } } });
    expect(getItemViewsByWidth(tree, `${100 / 3}%`)).toHaveLength(3);
  });

  it.each([
    [3, 3, 0],
    [4, 0, 4],
    [5, 3, 2],
    [7, 3, 4]
  ])(
    'reveals %s widgets only after measurement, with balanced row widths',
    (count, thirds, halves) => {
      const tree = render(configuredWidgets(true, count));
      const container = () => tree.UNSAFE_getAllByType(View).find((view) => view.props.onLayout)!;
      expect(container().props.accessibilityElementsHidden).toBe(true);
      expect(StyleSheet.flatten(container().props.style).height).toBe(0);
      fireEvent(container(), 'layout', { nativeEvent: { layout: { width: 420 } } });
      fireEvent(tree.getByTestId('survey-label', { includeHiddenElements: true }), 'textLayout');
      expect(container().props.pointerEvents).toBe('none');
      measureAll(tree);
      expect(container().props.accessibilityElementsHidden).toBe(false);
      expect(StyleSheet.flatten(container().props.style).height).toBeUndefined();
      expect(getItemViewsByWidth(tree, `${100 / 3}%`)).toHaveLength(thirds);
      expect(getItemViewsByWidth(tree, '50%')).toHaveLength(halves);
    }
  );

  it('updates balancing at runtime and ignores non-boolean values', () => {
    const tree = render(configuredWidgets(false));
    const container = tree.UNSAFE_getAllByType(View).find((view) => view.props.onLayout)!;
    fireEvent(container, 'layout', { nativeEvent: { layout: { width: 420 } } });
    measureAll(tree);
    expect(getItemViewsByWidth(tree, `${100 / 3}%`)).toHaveLength(4);
    tree.rerender(configuredWidgets(true));
    measureAll(tree);
    expect(getItemViewsByWidth(tree, '50%')).toHaveLength(4);
    tree.rerender(configuredWidgets('true'));
    expect(getItemViewsByWidth(tree, `${100 / 3}%`)).toHaveLength(4);
  });

  it.each([3, 4, 5, 7])(
    'shows the unbalanced layout immediately when disabled for %s widgets',
    (count) => {
      const tree = render(configuredWidgets(false, count));
      const container = tree.UNSAFE_getAllByType(View).find((view) => view.props.onLayout)!;
      expect(container.props.accessibilityElementsHidden).toBe(false);
      expect(getItemViewsByWidth(tree, `${100 / Math.min(count, 5)}%`)).toHaveLength(count);
    }
  );

  it('waits for container measurement even when all labels arrive first', () => {
    const tree = render(configuredWidgets(true));
    const container = () => tree.UNSAFE_getAllByType(View).find((view) => view.props.onLayout)!;
    measureAll(tree);
    expect(container().props.accessibilityElementsHidden).toBe(true);
    fireEvent(container(), 'layout', { nativeEvent: { layout: { width: 420 } } });
    expect(container().props.accessibilityElementsHidden).toBe(false);
    expect(getItemViewsByWidth(tree, '50%')).toHaveLength(4);
  });

  it('ignores the removed widgetLayout field', () => {
    const tree = render(
      <SettingsContext.Provider
        value={
          {
            globalSettings: {
              settings: {
                accessibility: {
                  widgetLayout: { balanceLastRow: true }
                }
              }
            }
          } as never
        }
      >
        <Widgets widgetConfigs={['survey', 'custom', 'custom', 'custom']} />
      </SettingsContext.Provider>
    );
    const container = tree.UNSAFE_getAllByType(View).find((view) => view.props.onLayout)!;
    fireEvent(container, 'layout', { nativeEvent: { layout: { width: 420 } } });
    measureAll(tree);
    expect(getItemViewsByWidth(tree, `${100 / 3}%`)).toHaveLength(4);
  });

  it('requires fresh measurements after text scale changes', () => {
    const content = (scale: number) => (
      <AccessibilityContext.Provider value={{ textScaleMultiplier: scale } as never}>
        {configuredWidgets(true)}
      </AccessibilityContext.Provider>
    );
    const tree = render(content(1));
    const container = () => tree.UNSAFE_getAllByType(View).find((view) => view.props.onLayout)!;
    fireEvent(container(), 'layout', { nativeEvent: { layout: { width: 420 } } });
    measureAll(tree);
    expect(container().props.accessibilityElementsHidden).toBe(false);
    tree.rerender(content(1.3));
    expect(container().props.accessibilityElementsHidden).toBe(true);
    measureAll(tree);
    expect(container().props.accessibilityElementsHidden).toBe(false);
  });

  it('renders four enlarged widgets as a two-by-two grid', () => {
    const tree = render(
      <AccessibilityContext.Provider value={{ textScaleMultiplier: 1.3 } as never}>
        {managedWidgets(['custom', 'custom', 'custom', 'custom'])}
      </AccessibilityContext.Provider>
    );

    expect(widths(tree)).toHaveLength(4);
    widths(tree).forEach((width) => expect(width).toBe(163.5));
  });

  it('recalculates columns from the measured container width', () => {
    const tree = render(
      <AccessibilityContext.Provider value={{ textScaleMultiplier: 1 } as never}>
        {managedWidgets(['custom', 'custom', 'custom', 'custom', 'custom'])}
      </AccessibilityContext.Provider>
    );
    const container = tree
      .UNSAFE_getAllByType(View)
      .find((view) => typeof view.props.onLayout === 'function');

    fireEvent(container!, 'layout', { nativeEvent: { layout: { width: 320 } } });

    expect(widths(tree).slice(0, 4)).toEqual(Array(4).fill(widths(tree)[0]));
    expect(widths(tree)[0]).toBe(71.5);
    expect(widths(tree)[4]).toBe(287.5);
    tree.getAllByTestId('compactWidgetContainer').forEach((item) => {
      expect(StyleSheet.flatten(item.props.style)).toMatchObject({ flexGrow: 1, minWidth: 0 });
    });
  });
});

// Keep this at the real widget registry boundary: no separate widgets entry is required.

test('globalSettings.settings automatically adds and removes the Klima-Taler widget', () => {
  const tree = render(
    <SettingsContext.Provider
      value={{ globalSettings: { settings: { 'klima-taler': true } } } as never}
    >
      <Widgets widgetConfigs={[]} />
    </SettingsContext.Provider>
  );
  expect(tree.UNSAFE_getAllByType(View).length).toBeGreaterThan(0);
  tree.rerender(
    <SettingsContext.Provider value={{ globalSettings: { 'klima-taler': true } } as never}>
      <Widgets widgetConfigs={['klimaTaler']} />
    </SettingsContext.Provider>
  );
  expect(tree.toJSON()).toBeNull();
});

test('Klima-Taler preserves explicit placement and splits compact rows', () => {
  const screen = render(
    <SettingsContext.Provider
      value={{ globalSettings: { settings: { 'klima-taler': true } } } as never}
    >
      <Widgets widgetConfigs={['custom', 'klimaTaler', 'custom', 'custom', 'custom']} />
    </SettingsContext.Provider>
  );
  expect(widgetItems(screen).map((item) => item.props.testID)).toEqual([
    'compactWidgetContainer',
    'klimaTalerCardContainer',
    'compactWidgetContainer',
    'compactWidgetContainer',
    'compactWidgetContainer'
  ]);
  expect(screen.getAllByTestId('compactWidgetContainer')).toHaveLength(4);
  expect(screen.getAllByTestId('klimaTalerCardContainer')).toHaveLength(1);
  expect(StyleSheet.flatten(screen.getByTestId('klimaTalerCardContainer').props.style).width).toBe(
    327.5
  );
});

test.each([320, 360, 393, 411.4285714286, 430, 844])(
  'fills complete and incomplete rows at width %s',
  (width) => {
    mockUseWindowDimensions.mockReturnValue({ width, height: 900, scale: 3, fontScale: 1 });
    const tree = render(managedWidgets(Array(8).fill('custom')));
    const items = tree.getAllByTestId('compactWidgetContainer');
    expect(items).toHaveLength(8);
    expect(StyleSheet.flatten(tree.getByTestId('widgetGrid').props.style)).toMatchObject({
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap'
    });
    items.forEach((item) => expect(StyleSheet.flatten(item.props.style).flexGrow).toBe(1));
  }
);

test('ordering is off by default and follows the remote flag', () => {
  const tree = render(
    <SettingsContext.Provider value={{ globalSettings: {} } as never}>
      <Widgets widgetConfigs={['weather', 'event']} />
    </SettingsContext.Provider>
  );
  expect(tree.queryByRole('button', { name: 'Widgets anordnen' })).toBeNull();
  tree.rerender(
    <SettingsContext.Provider
      value={{ globalSettings: { settings: { personalizedWidgets: true } } } as never}
    >
      <Widgets widgetConfigs={['weather', 'event']} />
    </SettingsContext.Provider>
  );
  expect(tree.getByRole('button', { name: 'Widgets anordnen' })).toBeTruthy();
});

const editingWidgets = (enabled = true) => (
  <SettingsContext.Provider
    value={
      {
        globalSettings: { settings: { personalizedWidgets: enabled, 'klima-taler': true } }
      } as never
    }
  >
    <Widgets widgetConfigs={['weather', 'klima-taler', 'event']} />
  </SettingsContext.Provider>
);

test('edits the real widgets in place, saves on Done and never opens a modal', async () => {
  mockSave.mockClear();
  const tree = render(editingWidgets());
  fireEvent.press(tree.getByRole('button', { name: 'Widgets anordnen' }));
  expect(tree.UNSAFE_queryAllByType(Modal)).toHaveLength(0);
  expect(tree.getByTestId('klimaTalerCardContainer')).toBeTruthy();
  fireEvent(tree.getByRole('adjustable', { name: 'Klima-Taler' }), 'accessibilityAction', {
    nativeEvent: { actionName: 'decrement' }
  });
  expect(widgetItems(tree)[0].props.testID).toBe('klimaTalerCardContainer');
  expect(mockSave).not.toHaveBeenCalled();
  fireEvent.press(tree.getByRole('button', { name: 'Fertig' }));
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith([
      'widget:klimaTaler:0',
      'widget:weather:0',
      'widget:event:0'
    ])
  );
  expect(tree.queryByRole('button', { name: 'Fertig' })).toBeNull();
});

test('cancel discards the draft and remote disabling exits editing', () => {
  mockSave.mockClear();
  const tree = render(editingWidgets());
  fireEvent.press(tree.getByRole('button', { name: 'Widgets anordnen' }));
  fireEvent(tree.getByRole('adjustable', { name: 'Klima-Taler' }), 'accessibilityAction', {
    nativeEvent: { actionName: 'decrement' }
  });
  fireEvent.press(tree.getByRole('button', { name: 'Abbrechen' }));
  expect(widgetItems(tree)[0].props.id).toBe('widget:weather:0');
  expect(mockSave).not.toHaveBeenCalled();
  fireEvent.press(tree.getByRole('button', { name: 'Widgets anordnen' }));
  tree.rerender(editingWidgets(false));
  expect(tree.queryByRole('button', { name: 'Fertig' })).toBeNull();
  tree.rerender(editingWidgets());
  expect(tree.getByRole('button', { name: 'Widgets anordnen' })).toBeTruthy();
});

test('a failed save keeps the inline editor open for retry', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  mockSave.mockRejectedValueOnce(new Error('storage'));
  const tree = render(editingWidgets());
  fireEvent.press(tree.getByRole('button', { name: 'Widgets anordnen' }));
  fireEvent.press(tree.getByRole('button', { name: 'Fertig' }));
  await waitFor(() => expect(alert).toHaveBeenCalled());
  expect(tree.getByRole('button', { name: 'Fertig' })).toBeTruthy();
  alert.mockRestore();
});

test('fractional Android widths leave rounding room before flexGrow fills the row', () => {
  const ratio = jest.spyOn(PixelRatio, 'get').mockReturnValue(2.975);
  mockUseWindowDimensions.mockReturnValue({
    width: 477.71427396498575,
    height: 900,
    scale: 2.975,
    fontScale: 1
  });
  const tree = render(managedWidgets(['custom', 'weather', 'voucher']));
  const total = widths(tree).reduce((sum, width) => sum + width, 0);
  expect(total).toBeLessThan(445.7142639160156);
  expect(445.7142639160156 - total).toBeLessThan(3 / 2.975);
  ratio.mockRestore();
});

test('hover previews ordering before release without remounting widgets; cancelled drag restores it', () => {
  const measureGrid = jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((callback) => callback(0, 0, 360, 800));
  const tree = render(editingWidgets());
  fireEvent.press(tree.getByRole('button', { name: 'Widgets anordnen' }));
  const card = widgetItems(tree)[1];
  const cardIdentity = tree.getByTestId('klimaTalerCardContainer');
  act(() => {
    widgetItems(tree).forEach((item, index) =>
      item.props.onLayout({ id: item.props.id, x: 0, y: index * 100, width: 300, height: 100 })
    );
    card.props.onDrag(card.props.id);
  });
  act(() => card.props.onHover(card.props.id, 50, 50));
  expect(widgetItems(tree)[0].props.id).toBe('widget:klimaTaler:0');
  expect(tree.getByTestId('klimaTalerCardContainer')).toBe(cardIdentity);
  act(() => card.props.onDragEnd(card.props.id, false, 50, 50));
  expect(widgetItems(tree)[0].props.id).toBe('widget:weather:0');
  measureGrid.mockRestore();
});
