import React, { useContext, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { resolveEffectiveTextScale, resolveResponsiveGridLayout } from '../../helpers';
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
const WIDGET_GAP = 8;
const WIDGET_MAX_COLUMNS = 4;
const WIDGET_MIN_WIDTH = 80;

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
  const availableWidth = Math.max(
    0,
    width - safeAreaInsets.left - safeAreaInsets.right - 2 * WIDGET_CONTAINER_PADDING
  );
  const effectiveTextScale = resolveEffectiveTextScale(fontScale, textScaleMultiplier);
  const layout = useMemo(
    () =>
      resolveResponsiveGridLayout({
        availableWidth,
        gap: WIDGET_GAP,
        itemCount: widgetComponents.length,
        maxColumns: WIDGET_MAX_COLUMNS,
        minItemWidth: WIDGET_MIN_WIDTH,
        textScale: effectiveTextScale
      }),
    [availableWidth, effectiveTextScale, widgetComponents.length]
  );
  const layoutContext = useMemo(
    () => ({ mode: layout.columns === 1 ? ('list' as const) : ('grid' as const) }),
    [layout.columns]
  );

  if (!widgetComponents.length) return null;

  return (
    <WidgetLayoutContext.Provider value={layoutContext}>
      <View
        style={[
          styles.container,
          {
            paddingLeft: WIDGET_CONTAINER_PADDING + safeAreaInsets.left,
            paddingRight: WIDGET_CONTAINER_PADDING + safeAreaInsets.right
          }
        ]}
      >
        {widgetComponents.map((entry) => (
          <View key={entry.key} style={{ width: layout.itemWidth }}>
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
    gap: WIDGET_GAP,
    width: '100%'
  }
});
