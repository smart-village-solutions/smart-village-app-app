import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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

jest.mock('../../src/config', () => ({
  normalize: (value: number) => value
}));

jest.mock('../../src/helpers', () => ({
  resolveEffectiveTextScale: jest.requireActual('../../src/helpers/responsiveGridLayout')
    .resolveEffectiveTextScale,
  resolveWidgetLayout: jest.requireActual('../../src/helpers/widgetLayout').resolveWidgetLayout
}));

jest.mock('../../src/components/widgets/ConstructionSiteNewsWidget', () => ({
  ConstructionSiteNewsWidget: () => null
}));
jest.mock('../../src/components/widgets/ConstructionSiteWidget', () => ({
  ConstructionSiteWidget: () => null
}));
jest.mock('../../src/components/widgets/CustomWidget', () => ({
  CustomWidget: () => null
}));
jest.mock('../../src/components/widgets/EventWidget', () => ({
  EventWidget: () => null
}));
jest.mock('../../src/components/widgets/LunchWidget', () => ({
  LunchWidget: () => null
}));
jest.mock('../../src/components/widgets/SurveyWidget', () => ({
  SurveyWidget: () => null
}));
jest.mock('../../src/components/widgets/VoucherWidget', () => ({
  VoucherWidget: () => null
}));
jest.mock('../../src/components/widgets/WaterTemperatureWidget', () => ({
  WaterTemperatureWidget: () => null
}));
jest.mock('../../src/components/widgets/WeatherWidget', () => ({
  WeatherWidget: () => null
}));
jest.mock('../../src/components/widgets/WebWidget', () => ({
  WebWidget: () => null
}));

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { Widgets } from '../../src/components/widgets/Widgets';

const getItemViewsByWidth = (views: ReturnType<typeof render>, width: string) =>
  views
    .UNSAFE_getAllByType(View)
    .filter((view) => StyleSheet.flatten(view.props.style)?.width === width);

describe('Widgets responsive layout', () => {
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
