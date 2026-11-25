import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  LayoutChangeEvent,
  PixelRatio,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { normalize } from '../../config';
import { resolveEffectiveTextScale, resolveWidgetLayout } from '../../helpers';
import { ScreenName, WidgetProps } from '../../types';
import { SettingsContext } from '../../SettingsProvider';
import {
  applyWidgetOrder,
  identifyWidgets,
  moveWidget,
  widgetDropTarget,
  widgetRows,
  WidgetBounds
} from '../../helpers/widgetOrder';
import { configurationObject } from '../../klimaTaler/widgetConfiguration';
import { useWidgetOrder } from '../../hooks/useWidgetOrder';
import { useTheme } from '../../hooks/useTheme';
import { texts } from '../../config/texts';
import { Text } from '../Text';
import { klimaTalerWidgets, normalizeWidgetName, WidgetConfig } from '../../klimaTaler/settings';

import { ConstructionSiteNewsWidget } from './ConstructionSiteNewsWidget';
import { ConstructionSiteWidget } from './ConstructionSiteWidget';
import { CustomWidget } from './CustomWidget';
import { EventWidget } from './EventWidget';
import { KlimaTalerWidget } from './KlimaTalerWidget';
import { LunchWidget } from './LunchWidget';
import { SurveyWidget } from './SurveyWidget';
import { VoucherWidget } from './VoucherWidget';
import { WaterTemperatureWidget } from './WaterTemperatureWidget';
import { WeatherWidget } from './WeatherWidget';
import { WebWidget } from './WebWidget';
import { WidgetLayoutContext } from './WidgetLayoutContext';
import { ReorderableWidget } from './ReorderableWidget';

const WIDGET_CONTAINER_PADDING = 16;
const WIDGET_COLUMN_PADDING = 4;
const WIDGET_MIN_WIDTH = 64;
const WIDGET_ROW_GAP = 8;

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
  klimaTaler: KlimaTalerWidget,
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
  const { globalSettings } = useContext(SettingsContext);
  const editable = configurationObject(globalSettings?.settings).personalizedWidgets === true;
  const { order, loaded, save } = useWidgetOrder(editable);
  const [draft, setDraft] = useState<string[]>();
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<string>();
  const gridRef = useRef<View>(null);
  const widgetBounds = useRef(new Map<string, WidgetBounds>());
  const draftRef = useRef(draft);
  const dragSession = useRef<
    | {
        id: string;
        order: string[];
        lastX?: number;
        lastY?: number;
        measuring?: boolean;
        ending?: boolean;
      }
    | undefined
  >(undefined);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const editing = editable && draft !== undefined;
  if (!editable && draft !== undefined) setDraft(undefined);

  const onMove = useCallback((id: string, offset: number) => {
    setDraft(
      (current) => current && moveWidget(current, id, current[current.indexOf(id) + offset])
    );
  }, []);
  const onDrag = useCallback((id: string) => {
    dragSession.current = { id, order: draftRef.current || [] };
    setDragging(id);
  }, []);
  const onDragEnd = useCallback((id: string, success: boolean, x: number, y: number) => {
    const session = dragSession.current;
    if (session?.id !== id) return;
    if (!success) {
      setDraft((current) => current && session.order);
      dragSession.current = undefined;
      setDragging(undefined);
      return;
    }
    session.ending = true;
    gridRef.current?.measureInWindow((left, top) => {
      if (dragSession.current !== session) return;
      const target = widgetDropTarget([...widgetBounds.current.values()], x - left, y - top);
      setDraft((current) => current && moveWidget(current, id, target));
      dragSession.current = undefined;
      setDragging(undefined);
    });
  }, []);
  const onHover = useCallback((id: string, x: number, y: number) => {
    const session = dragSession.current;
    if (session?.id !== id || session.measuring || session.ending) return;
    // Layout animation alone must not repeatedly swap the same two neighbours.
    if (
      session.lastX !== undefined &&
      session.lastY !== undefined &&
      Math.hypot(x - session.lastX, y - session.lastY) < 8
    )
      return;
    session.measuring = true;
    gridRef.current?.measureInWindow((left, top) => {
      session.measuring = false;
      if (dragSession.current !== session || session.ending) return;
      const target = widgetDropTarget([...widgetBounds.current.values()], x - left, y - top);
      if (!target || target === id) return;
      session.lastX = x;
      session.lastY = y;
      setDraft((current) => current && moveWidget(current, id, target));
    });
  }, []);
  const onWidgetLayout = useCallback((bounds: WidgetBounds) => {
    widgetBounds.current.set(bounds.id, bounds);
  }, []);
  const finishEditing = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await save(draft);
      setDraft(undefined);
    } catch {
      Alert.alert(texts.widgets.editTitle, texts.widgets.saveError);
    } finally {
      setSaving(false);
    }
  };
  const { colors } = useTheme();
  const [containerMeasurement, setContainerMeasurement] = useState({
    measuredWidth: width,
    windowWidth: width
  });
  const visibleWidgetConfigs = klimaTalerWidgets(globalSettings, widgetConfigs).filter(
    (widgetConfig) => {
      if (typeof widgetConfig === 'string') return widgetConfig !== 'search';

      return (
        widgetConfig.widgetName !== 'search' &&
        widgetConfig.additionalProps?.routeName !== ScreenName.Search
      );
    }
  );
  const orderedConfigs = applyWidgetOrder(
    identifyWidgets(visibleWidgetConfigs),
    editing ? draft : order
  );
  const widgetComponents = orderedConfigs.flatMap(({ config: widgetConfig, id }) => {
    const widgetName = normalizeWidgetName(
      typeof widgetConfig === 'string' ? widgetConfig : widgetConfig.widgetName
    );
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
            widgetStyle={{
              ...widgetStyle,
              ...(typeof widgetConfig !== 'string' && widgetConfig.widgetStyle)
            }}
          />
        ),
        key: id,
        id,
        label: widgetText || widgetLabel(widgetName),
        fullWidth: widgetName === 'klimaTaler'
      }
    ];
  });
  const compactWidgets = widgetComponents.filter((entry) => !entry.fullWidth);
  const compactWidgetCount = compactWidgets.length;
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
  const layout = resolveWidgetLayout({
    availableWidth,
    itemCount: compactWidgetCount,
    minItemWidth,
    textScale: effectiveTextScale
  });
  const itemStyle = { paddingHorizontal: columnPadding };
  const rows = widgetRows(widgetComponents, layout.columns);
  const layoutMode = layout.columns === 1 ? ('list' as const) : ('grid' as const);
  const layoutContext = useMemo(() => ({ mode: layoutMode }), [layoutMode]);
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
        <View
          ref={gridRef}
          collapsable={false}
          testID="widgetGrid"
          style={[styles.grid, { rowGap }]}
        >
          {rows.flatMap((row) =>
            row.map((entry) => (
              <ReorderableWidget
                key={entry.key}
                id={entry.id}
                label={entry.label}
                editing={editing}
                disabled={saving}
                lifted={dragging === entry.id}
                onLayout={onWidgetLayout}
                onDrag={onDrag}
                onHover={onHover}
                onDragEnd={onDragEnd}
                onMove={onMove}
                testID={entry.fullWidth ? 'klimaTalerCardContainer' : 'compactWidgetContainer'}
                style={[
                  entry.fullWidth ? styles.fullWidthItem : [styles.gridItem, itemStyle],
                  // Reserve one physical pixel for Yoga rounding; flexGrow fills the remainder.
                  {
                    width:
                      Math.floor((availableWidth * PixelRatio.get() - 1) / row.length) /
                      PixelRatio.get()
                  }
                ]}
              >
                {entry.component}
              </ReorderableWidget>
            ))
          )}
        </View>
        {editable && !editing && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={texts.widgets.editTitle}
            accessibilityState={{ disabled: !loaded }}
            disabled={!loaded}
            onPress={() => setDraft(widgetComponents.map(({ id }) => id))}
            style={styles.edit}
          >
            <Text italic={false} style={{ color: colors.primary }}>
              {texts.widgets.edit}
            </Text>
          </Pressable>
        )}
        {editing && (
          <View style={styles.editor}>
            <Text italic={false} style={[styles.hint, { color: colors.text }]}>
              {texts.widgets.editHint}
            </Text>
            <View style={styles.controls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={texts.widgets.cancel}
                disabled={saving}
                onPress={() => setDraft(undefined)}
                style={styles.edit}
              >
                <Text italic={false} style={{ color: colors.primary }}>
                  {texts.widgets.cancel}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={texts.widgets.done}
                accessibilityState={{ busy: saving, disabled: saving }}
                disabled={saving}
                onPress={finishEditing}
                style={styles.edit}
              >
                <Text italic={false} style={{ color: colors.primary }}>
                  {texts.widgets.done}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </WidgetLayoutContext.Provider>
  );
};

const styles = StyleSheet.create({
  fullWidthItem: {
    flexGrow: 1,
    width: '100%',
    marginTop: 16
  },
  container: {
    alignItems: 'stretch',
    width: '100%'
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', alignItems: 'stretch' },
  gridItem: { flexGrow: 1, minWidth: 0 },
  edit: { minHeight: 48, minWidth: 80, alignItems: 'center', justifyContent: 'center' },
  editor: { gap: 8 },
  hint: { fontSize: 14, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-evenly' }
});

const widgetLabel = (name: string) =>
  ({
    constructionSite: texts.widgets.constructionSites,
    constructionSiteNews: texts.widgets.constructionSites,
    custom: texts.widgets.custom,
    event: texts.widgets.events,
    klimaTaler: texts.klimaTaler.title,
    lunch: texts.widgets.lunch,
    survey: texts.widgets.surveys,
    voucher: texts.widgets.vouchers,
    water: texts.widgets.water,
    weather: texts.widgets.weather
  }[name] || name);
