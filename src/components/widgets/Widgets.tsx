import React, { useCallback, useContext, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { SettingsContext } from '../../SettingsProvider';
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
  const { globalSettings } = useContext(SettingsContext);
  const balanceWidgetRows =
    globalSettings?.settings?.accessibility?.enabledFeatures?.balanceWidgetRows === true;
  const safeAreaInsets = useSafeAreaInsets();
  const { textScaleMultiplier = 1 } = useContext(AccessibilityContext);
  const [labelWidths, setLabelWidths] = useState<Record<string, number>>({});
  const onLabelWidth = useCallback((key: string, measuredWidth: number) => {
    setLabelWidths((current) =>
      current[key] === measuredWidth ? current : { ...current, [key]: measuredWidth }
    );
  }, []);
  const [containerMeasurement, setContainerMeasurement] = useState({
    measuredWidth: width,
    hasMeasured: false,
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
  const effectiveTextScale = resolveEffectiveTextScale(fontScale, textScaleMultiplier);
  const measurementKey = `${effectiveTextScale}:${JSON.stringify(widgetStyle ?? {})}`;
  const getMeasurementKey = (key: string) => `${key}:${measurementKey}`;
  const isMeasuring =
    balanceWidgetRows &&
    (containerMeasurement.windowWidth !== width ||
      !containerMeasurement.hasMeasured ||
      widgetComponents.some((entry) => labelWidths[getMeasurementKey(entry.key)] === undefined));
  // Native label measurements already include system and app text scaling.
  const measuredMinItemWidth = Math.max(
    0,
    ...widgetComponents.map(
      (entry) => (labelWidths[getMeasurementKey(entry.key)] ?? 0) + 2 * columnPadding
    )
  );
  const minItemWidth = Math.max(
    normalize(WIDGET_MIN_WIDTH),
    balanceWidgetRows ? measuredMinItemWidth / effectiveTextScale : 0
  );
  const measuredContainerWidth =
    containerMeasurement.windowWidth === width ? containerMeasurement.measuredWidth : width;
  const availableWidth = Math.max(
    0,
    measuredContainerWidth - safeAreaInsets.left - safeAreaInsets.right - 2 * horizontalPadding
  );
  const layout = useMemo(
    () =>
      resolveWidgetLayout({
        availableWidth,
        balanceWidgetRows,
        itemCount: widgetComponents.length,
        minItemWidth,
        textScale: effectiveTextScale
      }),
    [availableWidth, balanceWidgetRows, effectiveTextScale, minItemWidth, widgetComponents.length]
  );
  const itemColumns = layout.rowSizes?.flatMap((size) => Array<number>(size).fill(size));
  const layoutContext = useMemo(
    () => ({
      mode:
        layout.columns === 1 &&
        (!balanceWidgetRows || measuredMinItemWidth + normalize(108) <= availableWidth)
          ? ('list' as const)
          : ('grid' as const)
    }),
    [availableWidth, balanceWidgetRows, layout.columns, measuredMinItemWidth]
  );
  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const nextWidth = nativeEvent.layout.width;
      if (!Number.isFinite(nextWidth) || nextWidth <= 0) return;

      setContainerMeasurement((current) =>
        current.hasMeasured && current.measuredWidth === nextWidth && current.windowWidth === width
          ? current
          : { measuredWidth: nextWidth, windowWidth: width, hasMeasured: true }
      );
    },
    [width]
  );

  if (!widgetComponents.length) return null;

  return (
    <WidgetLayoutContext.Provider value={layoutContext}>
      <View
        onLayout={onLayout}
        accessibilityElementsHidden={isMeasuring}
        importantForAccessibility={isMeasuring ? 'no-hide-descendants' : 'auto'}
        pointerEvents={isMeasuring ? 'none' : 'auto'}
        style={[
          styles.container,
          {
            paddingLeft: horizontalPadding + safeAreaInsets.left,
            paddingRight: horizontalPadding + safeAreaInsets.right,
            rowGap
          },
          isMeasuring && styles.measuring
        ]}
      >
        {widgetComponents.map((entry, index) => (
          <WidgetLayoutContext.Provider
            key={entry.key}
            value={{
              ...layoutContext,
              measurementKey,
              onLabelWidth: balanceWidgetRows
                ? (value) => onLabelWidth(getMeasurementKey(entry.key), value)
                : undefined
            }}
          >
            <View
              style={[
                layout.columns > 1 && styles.gridItem,
                {
                  paddingHorizontal: columnPadding,
                  width: `${100 / (itemColumns?.[index] ?? layout.columns)}%`
                }
              ]}
            >
              {entry.component}
            </View>
          </WidgetLayoutContext.Provider>
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
  // Keep native text measurement active without showing a provisional grid.
  measuring: {
    height: 0,
    opacity: 0,
    overflow: 'hidden'
  },
  gridItem: {
    boxSizing: 'border-box'
  }
});
