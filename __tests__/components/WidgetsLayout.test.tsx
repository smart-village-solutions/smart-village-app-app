import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { SettingsContext } from '../../src/SettingsProvider';
import { Widgets } from '../../src/components/widgets/Widgets';
import { WidgetLayoutContext } from '../../src/components/widgets/WidgetLayoutContext';

function MockMeasuredWidget({ name }: { name: string }) {
  const { onLabelWidth } = React.useContext(WidgetLayoutContext);
  return (
    <Text
      testID={`${name}-label`}
      onTextLayout={() => onLabelWidth?.(name === 'survey' ? 112 : 64)}
    >
      {name}
    </Text>
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

const getItemViewsByWidth = (views: ReturnType<typeof render>, width: string) =>
  views
    .UNSAFE_getAllByType(View)
    .filter((view) => StyleSheet.flatten(view.props.style)?.width === width);

describe('Widgets responsive layout', () => {
  it('reduces columns when a measured title needs more room and adapts to container resizing', () => {
    const tree = render(configuredWidgets(true, 3));
    expect(getItemViewsByWidth(tree, `${100 / 3}%`)).toHaveLength(3);

    fireEvent(tree.getByTestId('survey-label', { includeHiddenElements: true }), 'textLayout');
    expect(getItemViewsByWidth(tree, '50%')).toHaveLength(2);

    const container = tree.UNSAFE_getAllByType(View).find((view) => view.props.onLayout);
    fireEvent(container!, 'layout', { nativeEvent: { layout: { width: 240 } } });
    expect(getItemViewsByWidth(tree, '100%')).toHaveLength(4);

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
    expect(getItemViewsByWidth(tree, '25%')).toHaveLength(4);
    tree.rerender(configuredWidgets(true));
    measureAll(tree);
    expect(getItemViewsByWidth(tree, '50%')).toHaveLength(4);
    tree.rerender(configuredWidgets('true'));
    expect(getItemViewsByWidth(tree, '25%')).toHaveLength(4);
  });

  it.each([3, 4, 5, 7])(
    'preserves master layout immediately when disabled for %s widgets',
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
    expect(getItemViewsByWidth(tree, '25%')).toHaveLength(4);
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
        <Widgets widgetConfigs={['custom', 'custom', 'custom', 'custom']} />
      </AccessibilityContext.Provider>
    );

    expect(getItemViewsByWidth(tree, '50%')).toHaveLength(4);
  });

  it('recalculates columns from the measured container width', () => {
    const tree = render(
      <AccessibilityContext.Provider value={{ textScaleMultiplier: 1 } as never}>
        <Widgets widgetConfigs={['custom', 'custom', 'custom', 'custom', 'custom']} />
      </AccessibilityContext.Provider>
    );
    const container = tree
      .UNSAFE_getAllByType(View)
      .find((view) => typeof view.props.onLayout === 'function');

    fireEvent(container!, 'layout', { nativeEvent: { layout: { width: 320 } } });

    expect(getItemViewsByWidth(tree, '25%')).toHaveLength(5);
  });
});
