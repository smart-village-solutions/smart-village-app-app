import React, { useCallback, useContext, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { normalize } from '../../config';
import { resolveEffectiveTextScale, resolveWidgetLayout } from '../../helpers';
import { ScreenName, WidgetProps } from '../../types';

import { ConstructionSiteNewsWidget } from './ConstructionSiteNewsWidget';
import { ConstructionSiteWidget } from './ConstructionSiteWidget';
import { CustomWidget } from './CustomWidget';
import { EventWidget } from './EventWidget';
import { LunchWidget } from './LunchWidget';
import { SurveyWidget } from './SurveyWidget';
import { VoucherWidget } from './VoucherWidget';
import { WaterTemperatureWidget } from './WaterTemperatureWidget';
import { WeatherWidget } from './WeatherWidget';
import { WebWidget } from './WebWidget';
import { WidgetLayoutContext } from './WidgetLayoutContext';

const WIDGET_CONTAINER_PADDING = 16;
const WIDGET_COLUMN_PADDING = 4;
const WIDGET_MIN_WIDTH = 64;
const WIDGET_ROW_GAP = 8;

type WidgetConfig =
  | ({
      widgetName: string;
    } & WidgetProps)
  | string;

type Props = {
  widgetConfigs?: WidgetConfig[];
  widgetStyle?: object;
};

const EXISTING_WIDGETS: {
  [key: string]: React.FC<WidgetProps> | undefined;
} = {
  constructionSite: ConstructionSiteWidget,
  constructionSiteNews: ConstructionSiteNewsWidget,
  custom: CustomWidget,
  event: EventWidget,
  lunch: LunchWidget,
  survey: SurveyWidget,
  voucher: VoucherWidget,
  water: WaterTemperatureWidget,
  weather: WeatherWidget,
  web: WebWidget
};

export const Widgets = ({ widgetConfigs, widgetStyle }: Props) => {
  const { fontScale, width } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const { textScaleMultiplier = 1 } = useContext(AccessibilityContext);
  const [containerMeasurement, setContainerMeasurement] = useState({
    measuredWidth: width,
    windowWidth: width
  });
  const visibleWidgetConfigs = (widgetConfigs ?? []).filter((widgetConfig) => {
    if (typeof widgetConfig === 'string') return widgetConfig !== 'search';

    return (
      widgetConfig.widgetName !== 'search' &&
      widgetConfig.additionalProps?.routeName !== ScreenName.Search
    );
  });
  const widgetComponents = visibleWidgetConfigs.flatMap((widgetConfig, index) => {
    const widgetName = typeof widgetConfig === 'string' ? widgetConfig : widgetConfig.widgetName;
    const widgetText = typeof widgetConfig === 'string' ? undefined : widgetConfig.text;
    const additionalProps =
      typeof widgetConfig === 'string' ? undefined : widgetConfig.additionalProps;

    const Component = EXISTING_WIDGETS[widgetName];

    if (!Component) return [];

    return [
      {
        component: (
          <Component
            additionalProps={additionalProps}
            text={widgetText}
            widgetStyle={widgetStyle}
          />
        ),
        key: `${widgetName}-${widgetText ?? 'widget'}-${index}`
      }
    ];
  });
  const horizontalPadding = normalize(WIDGET_CONTAINER_PADDING);
  const columnPadding = normalize(WIDGET_COLUMN_PADDING);
  const rowGap = normalize(WIDGET_ROW_GAP);
  const minItemWidth = normalize(WIDGET_MIN_WIDTH);
  const measuredContainerWidth =
    containerMeasurement.windowWidth === width ? containerMeasurement.measuredWidth : width;
  const availableWidth = Math.max(
    0,
    measuredContainerWidth - safeAreaInsets.left - safeAreaInsets.right - 2 * horizontalPadding
  );
  const effectiveTextScale = resolveEffectiveTextScale(fontScale, textScaleMultiplier);
  const layout = useMemo(
    () =>
      resolveWidgetLayout({
        availableWidth,
        itemCount: widgetComponents.length,
        minItemWidth,
        textScale: effectiveTextScale
      }),
    [availableWidth, effectiveTextScale, minItemWidth, widgetComponents.length]
  );
  const itemStyle = useMemo(
    () => ({
      paddingHorizontal: columnPadding,
      width: `${100 / layout.columns}%` as `${number}%`
    }),
    [columnPadding, layout.columns]
  );
  const layoutContext = useMemo(
    () => ({ mode: layout.columns === 1 ? ('list' as const) : ('grid' as const) }),
    [layout.columns]
  );
  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const nextWidth = nativeEvent.layout.width;
      if (!Number.isFinite(nextWidth) || nextWidth <= 0) return;

      setContainerMeasurement((current) =>
        current.measuredWidth === nextWidth && current.windowWidth === width
          ? current
          : { measuredWidth: nextWidth, windowWidth: width }
      );
    },
    [width]
  );

  if (!widgetComponents.length) return null;

  return (
    <WidgetLayoutContext.Provider value={layoutContext}>
      <View
        onLayout={onLayout}
        style={[
          styles.container,
          {
            paddingLeft: horizontalPadding + safeAreaInsets.left,
            paddingRight: horizontalPadding + safeAreaInsets.right,
            rowGap
          }
        ]}
      >
        {widgetComponents.map((entry) => (
          <View key={entry.key} style={[layout.columns > 1 && styles.gridItem, itemStyle]}>
            {entry.component}
          </View>
        ))}
      </View>
    </WidgetLayoutContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%'
  },
  gridItem: {
    boxSizing: 'border-box'
  }
});
