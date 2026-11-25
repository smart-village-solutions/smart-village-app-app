import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { WidgetContainer } from '../../src/components/widgets/WidgetContainer';
import { WidgetContent } from '../../src/components/widgets/WidgetContent';
import { Widgets } from '../../src/components/widgets/Widgets';
import { WrapperRow } from '../../src/components/Wrapper';
import { resolveAppDesignSystem } from '../../src/helpers/appDesignSystemHelper';

jest.mock('expo-router/react-navigation', () => ({
  useNavigation: () => ({ navigate: jest.fn() })
}));
jest.mock('react-apollo', () => ({
  useQuery: () => ({
    data: {
      weatherMap: { current: { temp: 19.2, weather: [{ icon: '02d' }] } },
      eventRecords: [],
      newsItems: [],
      lunches: [],
      ongoing: [],
      genericItems: []
    },
    refetch: jest.fn()
  })
}));
jest.mock('react-query', () => ({
  useQuery: () => ({ data: { eventRecords: [] }, refetch: jest.fn() })
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 })
}));
jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest.requireActual('react').createContext({ textScaleMultiplier: 1 })
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({ globalSettings: {} })
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual('react').createContext({})
}));
jest.mock('../../src/config', () => ({
  consts: {
    a11yLabel: { button: '(Taste)' },
    POLL_INTERVALS: {},
    REFRESH_INTERVALS: {},
    ROOT_ROUTE_NAMES: {}
  },
  Icon: {
    Calendar: () => null,
    ConstructionSite: () => null,
    Lunch: () => null,
    NamedIcon: () => null,
    Surveys: () => null,
    Url: () => null,
    Voucher: () => null
  },
  normalize: (value: number) => value,
  texts: { widgets: {}, screenTitles: { voucher: {} } }
}));
jest.mock('../../src/helpers', () => ({
  graphqlFetchPolicy: () => 'cache-first',
  normalizeStyleValues: jest.requireActual('../../src/helpers/normalizeStyleValues')
    .normalizeStyleValues,
  resolveEffectiveTextScale: jest.requireActual('../../src/helpers/responsiveGridLayout')
    .resolveEffectiveTextScale,
  resolveWidgetLayout: jest.requireActual('../../src/helpers/widgetLayout').resolveWidgetLayout
}));
jest.mock('../../src/hooks', () => ({
  useConstructionSites: () => ({ constructionSites: [], refresh: jest.fn() }),
  useGenericItemEvents: () => ({ data: [], refetch: jest.fn() }),
  useHomeRefresh: jest.fn(),
  useRefreshTime: () => 1,
  useVolunteerData: () => ({ data: [], refetch: jest.fn() })
}));
jest.mock('../../src/hooks/waterTemperature', () => ({
  useWaterTemperature: () => ({ temperature: '21', refresh: jest.fn() })
}));
jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(),
  QUERY_TYPES: { VOLUNTEER: { CALENDAR_ALL: 'calendar' } }
}));
jest.mock('../../src/queries/survey', () => ({ SURVEYS: 'surveys' }));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));
jest.mock('../../src/components/Image', () => ({ Image: () => null }));
jest.mock('../../src/components/Text', () => ({
  BoldText: () => null,
  RegularText: () => null
}));

const widgetNames = [
  'constructionSite',
  'constructionSiteNews',
  'custom',
  'event',
  'lunch',
  'survey',
  'voucher',
  'water',
  'weather',
  'web'
];

describe.each(['single', 'multiple'] as const)('%s home widgets', (layout) => {
  it.each(widgetNames)(
    '%s uses the common default padding without a nested vertical inset',
    (name) => {
      const widgetConfigs = (layout === 'single' ? [name] : [name, 'custom']).map((widgetName) => ({
        widgetName,
        text: widgetName
      }));
      const tree = render(<Widgets widgetConfigs={widgetConfigs} />);
      const buttons = tree.UNSAFE_getAllByType(TouchableOpacity);

      expect(tree.UNSAFE_getAllByType(WidgetContainer)).toHaveLength(widgetConfigs.length);
      buttons.forEach((button) => {
        expect(StyleSheet.flatten(button.props.style)).toMatchObject({
          padding: 16,
          paddingHorizontal: layout === 'single' ? 12 : 4,
          minHeight: 48
        });
      });
      tree
        .UNSAFE_getAllByType(WidgetContainer)
        .flatMap((container) => container.findAllByType(WidgetContent))
        .forEach((content) => {
          content.findAllByType(View).forEach((view) => {
            const style = StyleSheet.flatten(view.props.style) || {};
            expect(style.padding).toBeUndefined();
            expect(style.paddingVertical).toBeUndefined();
            expect(style.paddingTop).toBeUndefined();
            expect(style.paddingBottom).toBeUndefined();
          });
          const visualRow = content.findAllByType(WrapperRow)[0];
          expect(StyleSheet.flatten(visualRow.props.style).height).toBeUndefined();
          expect(StyleSheet.flatten(visualRow.props.style).minHeight).toBe(48);
        });
    }
  );

  it.each(widgetNames)('%s applies the municipality padding once', (name) => {
    const widgetConfigs = (layout === 'single' ? [name] : [name, 'custom']).map((widgetName) => ({
      widgetName,
      text: widgetName
    }));
    const tree = render(
      <Widgets
        widgetConfigs={widgetConfigs}
        widgetStyle={{ widgetStyle: { paddingVertical: 8 } }}
      />
    );

    tree.UNSAFE_getAllByType(TouchableOpacity).forEach((button) => {
      expect(StyleSheet.flatten(button.props.style)).toMatchObject({ paddingVertical: 8 });
    });
  });
});

it('keeps themed municipality padding when the measured width changes the layout', () => {
  const config = resolveAppDesignSystem(
    {
      widgets: {
        widgetStyle: { paddingVertical: 8 },
        dark: { widgetStyle: { paddingVertical: 0 } }
      }
    },
    'dark'
  );
  const tree = render(
    <Widgets
      widgetConfigs={[
        { widgetName: 'weather', text: 'Weather' },
        { widgetName: 'custom', text: 'Custom' }
      ]}
      widgetStyle={config.widgets}
    />
  );
  const container = tree
    .UNSAFE_getAllByType(View)
    .find((view) => typeof view.props.onLayout === 'function');

  fireEvent(container!, 'layout', { nativeEvent: { layout: { width: 100 } } });
  tree.UNSAFE_getAllByType(TouchableOpacity).forEach((button) => {
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({
      paddingVertical: 0,
      paddingHorizontal: 12,
      minHeight: 48
    });
  });
});
