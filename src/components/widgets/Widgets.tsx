import React, { ReactNode, useCallback, useContext, useMemo, useState } from 'react';
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
import { WidgetLayoutContext, WidgetLayoutMode } from './WidgetLayoutContext';

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

const WidgetItem = ({
  children,
  measurementKey,
  mode,
  onLabelWidth
}: {
  children: ReactNode;
  measurementKey: string;
  mode: WidgetLayoutMode;
  onLabelWidth: (key: string, width: number) => void;
}) => {
  const reportLabelWidth = useCallback(
    (value: number) => onLabelWidth(measurementKey, value),
    [measurementKey, onLabelWidth]
  );
  const value = useMemo(() => ({ mode, onLabelWidth: reportLabelWidth }), [mode, reportLabelWidth]);
  return <WidgetLayoutContext.Provider value={value}>{children}</WidgetLayoutContext.Provider>;
};

export const Widgets = ({ widgetConfigs, widgetStyle }: Props) => {
  const { fontScale, width } = useWindowDimensions();
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
  // Native label measurements already include system and app text scaling.
  const measuredMinItemWidth = Math.max(
    0,
    ...widgetComponents.map((entry) => (labelWidths[entry.key] ?? 0) + 2 * columnPadding)
  );
  const minItemWidth = Math.max(
    normalize(WIDGET_MIN_WIDTH),
    measuredMinItemWidth / effectiveTextScale
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
    () => ({
      mode: layout.columns === 1 ? ('list' as const) : ('grid' as const)
    }),
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
          <WidgetItem
            key={entry.key}
            measurementKey={entry.key}
            mode={layoutContext.mode}
            onLabelWidth={onLabelWidth}
          >
            <View style={[layout.columns > 1 && styles.gridItem, itemStyle]}>
              {entry.component}
            </View>
          </WidgetItem>
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
