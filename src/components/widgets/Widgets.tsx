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
import { WidgetLayoutContext, type WidgetLayoutMode } from './WidgetLayoutContext';
import { ReorderableWidget } from './ReorderableWidget';

const WIDGET_CONTAINER_PADDING = 16;
const WIDGET_COLUMN_PADDING = 4;
const WIDGET_MIN_WIDTH = 64;
const WIDGET_ROW_GAP = 8;
const MANAGED_WIDGET_ROW_GAP = 24;

// The grid owns outer spacing for every widget type and ordering. Footer controls
// provide their own padding, like the service tile editor.
const widgetGridInsets = (editable: boolean) => ({
  paddingTop: normalize(16),
  paddingBottom: editable ? 0 : normalize(16)
});

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

const getWidgetComponents = (
  orderedConfigs: ReturnType<typeof identifyWidgets>,
  widgetStyle: Props['widgetStyle']
) => {
  return orderedConfigs.flatMap(({ config: widgetConfig, id }) => {
    const widgetName = normalizeWidgetName(
      typeof widgetConfig === 'string' ? widgetConfig : widgetConfig.widgetName
    );
    const widgetText = typeof widgetConfig === 'string' ? undefined : widgetConfig.text;
    const additionalProps =
      typeof widgetConfig === 'string' ? undefined : widgetConfig.additionalProps;

    const Component = EXISTING_WIDGETS[widgetName];

    if (!Component) return [];

    const mergedWidgetStyle = {
      ...widgetStyle,
      ...(typeof widgetConfig !== 'string' && widgetConfig.widgetStyle)
    };

    return [
      {
        component: (
          <Component
            additionalProps={additionalProps}
            text={widgetText}
            widgetStyle={mergedWidgetStyle}
          />
        ),
        key: id,
        id,
        label: widgetText || widgetLabel(widgetName),
        fullWidth: widgetName === 'klimaTaler',
        styleKey: JSON.stringify(mergedWidgetStyle)
      }
    ];
  });
};

const WidgetItem = ({
  children,
  mode,
  measurementKey,
  onLabelWidth,
  managedGrid
}: {
  children: React.ReactNode;
  mode: WidgetLayoutMode;
  measurementKey: string;
  onLabelWidth: (key: string, width: number) => void;
  managedGrid: boolean;
}) => {
  const reportLabelWidth = useCallback(
    (width: number) => onLabelWidth(measurementKey, width),
    [measurementKey, onLabelWidth]
  );
  const value = useMemo(
    () => ({
      mode,
      measurementKey,
      onLabelWidth: reportLabelWidth,
      contentPaddingVertical: managedGrid ? 0 : undefined
    }),
    [managedGrid, mode, measurementKey, reportLabelWidth]
  );

  return <WidgetLayoutContext.Provider value={value}>{children}</WidgetLayoutContext.Provider>;
};

const getWidgetGrid = (
  widgetComponents: ReturnType<typeof getWidgetComponents>,
  {
    availableWidth,
    balanceWidgetRows,
    columnPadding,
    editable,
    effectiveTextScale,
    hasMeasured,
    labelWidths
  }: {
    availableWidth: number;
    balanceWidgetRows: boolean;
    columnPadding: number;
    editable: boolean;
    effectiveTextScale: number;
    hasMeasured: boolean;
    labelWidths: Record<string, number>;
  }
) => {
  const compactWidgets = widgetComponents.filter((entry) => !entry.fullWidth);
  const managedGrid = editable || compactWidgets.length !== widgetComponents.length;
  const getMeasurementKey = (entry: (typeof widgetComponents)[number]) =>
    `${entry.id}:${entry.styleKey}:${effectiveTextScale}`;
  const isMeasuring =
    balanceWidgetRows &&
    compactWidgets.length > 0 &&
    (!hasMeasured ||
      compactWidgets.some((entry) => labelWidths[getMeasurementKey(entry)] === undefined));
  const measuredMinItemWidth = Math.max(
    0,
    ...compactWidgets.map(
      (entry) => (labelWidths[getMeasurementKey(entry)] ?? 0) + 2 * columnPadding
    )
  );
  const layout = resolveWidgetLayout({
    availableWidth,
    itemCount: compactWidgets.length,
    minItemWidth: Math.max(normalize(WIDGET_MIN_WIDTH), measuredMinItemWidth / effectiveTextScale),
    textScale: effectiveTextScale
  });

  return {
    columns: layout.columns,
    getMeasurementKey,
    isMeasuring,
    managedGrid,
    rows: widgetRows(widgetComponents, layout.columns, balanceWidgetRows)
  };
};

const useWidgetEditing = (editable: boolean, save: (nextOrder: string[]) => Promise<void>) => {
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
  return {
    draft,
    setDraft,
    saving,
    dragging,
    gridRef,
    editing,
    onDrag,
    onDragEnd,
    onHover,
    onMove,
    onWidgetLayout,
    finishEditing
  };
};

const WidgetEditingControls = ({
  editable,
  editing,
  loaded,
  saving,
  onStart,
  onCancel,
  onFinish
}: {
  editable: boolean;
  editing: boolean;
  loaded: boolean;
  saving: boolean;
  onStart: () => void;
  onCancel: () => void;
  onFinish: () => Promise<void>;
}) => {
  const { colors } = useTheme();
  if (!editable) return null;

  if (!editing) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={texts.widgets.editTitle}
        accessibilityState={{ disabled: !loaded }}
        disabled={!loaded}
        onPress={onStart}
        style={styles.edit}
      >
        <Text italic={false} style={{ color: colors.primary }}>
          {texts.widgets.edit}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.editor}>
      <Text italic={false} style={[styles.hint, { color: colors.text }]}>
        {texts.widgets.editHint}
      </Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={texts.widgets.cancel}
          disabled={saving}
          onPress={onCancel}
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
          onPress={onFinish}
          style={styles.edit}
        >
          <Text italic={false} style={{ color: colors.primary }}>
            {texts.widgets.done}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export const Widgets = ({ widgetConfigs, widgetStyle }: Props) => {
  const { fontScale, width } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const { textScaleMultiplier = 1 } = useContext(AccessibilityContext);
  const { globalSettings } = useContext(SettingsContext);
  const editable = configurationObject(globalSettings?.settings).personalizedWidgets === true;
  const balanceWidgetRows =
    globalSettings?.settings?.accessibility?.enabledFeatures?.balanceWidgetRows === true;
  const [labelWidths, setLabelWidths] = useState<Record<string, number>>({});
  const onLabelWidth = useCallback((key: string, measuredWidth: number) => {
    setLabelWidths((current) =>
      current[key] === measuredWidth ? current : { ...current, [key]: measuredWidth }
    );
  }, []);
  const { order, loaded, save } = useWidgetOrder(editable);
  const {
    draft,
    setDraft,
    saving,
    dragging,
    gridRef,
    editing,
    onDrag,
    onDragEnd,
    onHover,
    onMove,
    onWidgetLayout,
    finishEditing
  } = useWidgetEditing(editable, save);
  const [containerMeasurement, setContainerMeasurement] = useState({
    measuredWidth: width,
    hasMeasured: false,
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
  const widgetComponents = getWidgetComponents(orderedConfigs, widgetStyle);
  const horizontalPadding = normalize(WIDGET_CONTAINER_PADDING);
  const columnPadding = normalize(WIDGET_COLUMN_PADDING);
  const measuredContainerWidth =
    containerMeasurement.windowWidth === width ? containerMeasurement.measuredWidth : width;
  const availableWidth = Math.max(
    0,
    measuredContainerWidth - safeAreaInsets.left - safeAreaInsets.right - 2 * horizontalPadding
  );
  const effectiveTextScale = resolveEffectiveTextScale(fontScale, textScaleMultiplier);
  const { columns, getMeasurementKey, isMeasuring, managedGrid, rows } = getWidgetGrid(
    widgetComponents,
    {
      availableWidth,
      balanceWidgetRows,
      columnPadding,
      editable,
      effectiveTextScale,
      hasMeasured: containerMeasurement.hasMeasured && containerMeasurement.windowWidth === width,
      labelWidths
    }
  );
  const rowGap = normalize(managedGrid ? MANAGED_WIDGET_ROW_GAP : WIDGET_ROW_GAP);
  const itemStyle = { paddingHorizontal: columnPadding };
  const layoutMode: WidgetLayoutMode = columns === 1 ? 'list' : 'grid';
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
    <View
      onLayout={onLayout}
      accessibilityElementsHidden={isMeasuring}
      importantForAccessibility={isMeasuring ? 'no-hide-descendants' : 'auto'}
      pointerEvents={isMeasuring ? 'none' : 'auto'}
      style={[
        styles.container,
        {
          paddingLeft: horizontalPadding + safeAreaInsets.left,
          paddingRight: horizontalPadding + safeAreaInsets.right
        },
        isMeasuring && styles.measuring
      ]}
    >
      <View
        ref={gridRef}
        collapsable={false}
        testID="widgetGrid"
        style={[
          styles.grid,
          { rowGap },
          managedGrid && [styles.managedGrid, widgetGridInsets(editable)]
        ]}
      >
        {rows.flatMap((row) =>
          row.map((entry) => (
            <WidgetItem
              key={entry.key}
              mode={layoutMode}
              measurementKey={getMeasurementKey(entry)}
              onLabelWidth={onLabelWidth}
              managedGrid={managedGrid}
            >
              {managedGrid ? (
                <ReorderableWidget
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
                    // Reserve one physical pixel; flexGrow fills the remainder.
                    {
                      width:
                        Math.max(
                          0,
                          Math.floor((availableWidth * PixelRatio.get() - 1) / row.length)
                        ) / PixelRatio.get()
                    }
                  ]}
                >
                  {entry.component}
                </ReorderableWidget>
              ) : (
                <View
                  testID="compactWidgetContainer"
                  style={{
                    paddingHorizontal: columnPadding,
                    width: `${100 / (balanceWidgetRows ? row.length : columns)}%`
                  }}
                >
                  {entry.component}
                </View>
              )}
            </WidgetItem>
          ))
        )}
      </View>
      <WidgetEditingControls
        editable={editable}
        editing={editing}
        loaded={loaded}
        saving={saving}
        onStart={() => setDraft(widgetComponents.map(({ id }) => id))}
        onCancel={() => setDraft(undefined)}
        onFinish={finishEditing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullWidthItem: {
    flexGrow: 1,
    width: '100%'
  },
  container: {
    alignItems: 'stretch',
    width: '100%'
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch' },
  managedGrid: { width: '100%' },
  measuring: { height: 0, opacity: 0, overflow: 'hidden' },
  gridItem: { flexGrow: 1, minWidth: 0 },
  edit: {
    minHeight: 48,
    minWidth: 80,
    paddingVertical: normalize(14),
    alignItems: 'center',
    justifyContent: 'center'
  },
  editor: { gap: 8, paddingTop: normalize(14) },
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
