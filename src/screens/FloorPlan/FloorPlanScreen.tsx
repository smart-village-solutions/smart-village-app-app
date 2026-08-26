import { NavigationProp, RouteProp } from '@react-navigation/native';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Button, EmptyMessage, HeaderLeft, LoadingSpinner } from '../../components';
import { AccessibilityContext } from '../../AccessibilityProvider';
import {
  FloorPlanConfig,
  FloorPlanInitialViewMode,
  FloorPlanPin,
  FloorPlanPinList,
  FloorPlanPinPreview,
  FloorPlanRouteParams,
  FloorPlanView,
  getValidFloorPlanPins,
  parseFloorPlanConfig
} from '../../components/floorPlan';
import { consts, Icon, normalize, texts } from '../../config';
import { useStaticContent } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SettingsContext } from '../../SettingsProvider';
import { ThemeColorPalette } from '../../types/Theme';

const DEFAULT_STATIC_JSON_NAME = 'floorPlan';
const FloorPlanButton = Button as unknown as React.ComponentType<Record<string, unknown>>;

enum FloorPlanViewMode {
  List = 'list',
  Svg = 'svg'
}

type Props = {
  navigation: NavigationProp<Record<string, object | undefined>>;
  route: RouteProp<Record<string, FloorPlanRouteParams | undefined>, string>;
};

const renderCloseBackImage = ({ tintColor }: { tintColor?: string }) => (
  <Icon.Close color={tintColor} size={normalize(22)} style={staticStyles.closeIcon} />
);

const createHeaderLeft =
  (onPress: () => void, isCloseButton = false) =>
  () =>
    (
      <HeaderLeft
        onPress={onPress}
        backImage={isCloseButton ? renderCloseBackImage : undefined}
        text={isCloseButton ? consts.a11yLabel.closeIcon : undefined}
      />
    );

const getAllFloorPlanPins = (config?: FloorPlanConfig) =>
  config
    ? config.floors.flatMap((floor) =>
        getValidFloorPlanPins(floor.pins, floor.viewBox).map((pin) => ({
          ...pin,
          floorId: floor.id,
          floorTitle: floor.title,
          listId: `${floor.id}-${pin.id}`
        }))
      )
    : [];

const getFloorPlanViewMode = (
  viewModeOverride?: FloorPlanViewMode,
  initialViewMode?: FloorPlanInitialViewMode,
  preferListView = false
) =>
  viewModeOverride ??
  (preferListView || initialViewMode === FloorPlanViewMode.List
    ? FloorPlanViewMode.List
    : FloorPlanViewMode.Svg);

const getInitialFloorPlanViewMode = (
  initialViewMode?: FloorPlanInitialViewMode,
  preferListView = false
) =>
  preferListView || initialViewMode === FloorPlanViewMode.List
    ? FloorPlanViewMode.List
    : FloorPlanViewMode.Svg;

const getSelectedFloor = (config?: FloorPlanConfig, selectedFloorId?: string) => {
  if (!config?.floors.length) return undefined;

  return config.floors.find((floor) => floor.id === selectedFloorId) || config.floors[0];
};

const parseStaticFloorPlanConfig = (json: unknown) => {
  const config = parseFloorPlanConfig(json);

  if (!config) {
    throw new Error(texts.floorPlan.configError);
  }

  return config;
};

/* eslint-disable complexity */
export const FloorPlanScreen = ({ navigation, route }: Props) => {
  const { isScreenReaderEnabled } = useContext(AccessibilityContext);
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const staticJsonName = route.params?.staticJsonName || DEFAULT_STATIC_JSON_NAME;
  const {
    data: remoteConfig,
    error,
    loading
  } = useStaticContent<FloorPlanConfig>({
    name: staticJsonName,
    parseFromJson: parseStaticFloorPlanConfig,
    refreshTimeKey: `publicJsonFile-${staticJsonName}`,
    skip: !!route.params?.floorPlanConfig,
    type: 'json'
  });
  const config = route.params?.floorPlanConfig || remoteConfig;
  const [selectedPin, setSelectedPin] = useState<FloorPlanPin>();
  const [selectedFloorId, setSelectedFloorId] = useState<string>();
  const [viewModeOverride, setViewModeOverride] = useState<FloorPlanViewMode>();
  const initialViewMode = route.params?.initialViewMode || config?.initialViewMode;
  const viewMode = getFloorPlanViewMode(viewModeOverride, initialViewMode, isScreenReaderEnabled);
  const initialResolvedViewMode = getInitialFloorPlanViewMode(
    initialViewMode,
    isScreenReaderEnabled
  );
  const initialFloorId = route.params?.initialFloorId || config?.initialFloorId;
  const activeFloor = getSelectedFloor(config, selectedFloorId || initialFloorId);
  const isInitialListView = initialResolvedViewMode === FloorPlanViewMode.List;
  const showFloatingMapButton = isInitialListView && viewMode === FloorPlanViewMode.List;
  const showFloatingListButton = !isInitialListView && viewMode === FloorPlanViewMode.Svg;

  const listPins = useMemo(() => getAllFloorPlanPins(config), [config]);

  const handlePinPress = useCallback((pin: FloorPlanPin) => {
    if (pin.floorId) {
      setSelectedFloorId(pin.floorId);
    }

    setSelectedPin(pin);
  }, []);

  const showSvgView = useCallback(() => {
    setSelectedPin(undefined);
    setViewModeOverride(FloorPlanViewMode.Svg);
    AccessibilityInfo.announceForAccessibility(texts.floorPlan.svgViewAccessibilityLabel);
  }, []);

  const showListView = useCallback(() => {
    setSelectedPin(undefined);
    setViewModeOverride(FloorPlanViewMode.List);
    AccessibilityInfo.announceForAccessibility(texts.floorPlan.listViewAccessibilityLabel);
  }, []);

  const closeAlternateView = useCallback(() => {
    setSelectedPin(undefined);
    setViewModeOverride(undefined);
    AccessibilityInfo.announceForAccessibility(
      isInitialListView
        ? texts.floorPlan.listViewAccessibilityLabel
        : texts.floorPlan.svgViewAccessibilityLabel
    );
  }, [isInitialListView]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleFloorSelect = useCallback(
    (floorId: string) => {
      setSelectedPin(undefined);
      setSelectedFloorId(floorId);

      const selectedFloor = config?.floors.find((floor) => floor.id === floorId);
      AccessibilityInfo.announceForAccessibility(
        texts.floorPlan.floorChanged(selectedFloor?.title || floorId)
      );
    },
    [config?.floors]
  );

  useLayoutEffect(() => {
    if (viewMode !== initialResolvedViewMode) {
      navigation.setOptions({
        headerLeft: createHeaderLeft(closeAlternateView, true)
      });
    } else {
      navigation.setOptions({
        headerLeft: createHeaderLeft(goBack)
      });
    }
  }, [closeAlternateView, goBack, initialResolvedViewMode, navigation, viewMode]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (error || !config || !activeFloor) {
    return <EmptyMessage title={texts.empty.content} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {viewMode === FloorPlanViewMode.Svg ? (
          <View style={styles.mapContainer}>
            <FloorPlanView
              key={activeFloor.id}
              config={activeFloor}
              floors={config.floors}
              onFloorSelect={handleFloorSelect}
              selectedPinId={selectedPin?.id}
              onPinPress={handlePinPress}
            />
          </View>
        ) : (
          <FloorPlanPinList
            isFullHeight
            navigation={navigation}
            pins={listPins}
            selectedPinId={selectedPin?.listId || selectedPin?.id}
          />
        )}
        {showFloatingMapButton && (
          <View
            style={[
              styles.floatingButtonContainer,
              navigationType === 'drawer' ? styles.drawerButtonPosition : styles.tabButtonPosition
            ]}
          >
            <FloorPlanButton
              accessibilityHint={texts.floorPlan.svgViewAccessibilityHint}
              accessibilityLabel={texts.floorPlan.svgViewAccessibilityLabel}
              icon={<Icon.Map color={colors.onPrimary} />}
              iconPosition="left"
              notFullWidth
              onPress={showSvgView}
              small={false}
              smallest={false}
              title={texts.floorPlan.svgView}
            />
          </View>
        )}
        {showFloatingListButton && (
          <View style={styles.listButtonContainer}>
            <FloorPlanButton
              accessibilityHint={texts.floorPlan.listViewAccessibilityHint}
              accessibilityLabel={texts.floorPlan.listViewAccessibilityLabel}
              icon={<Icon.List color={colors.onPrimary} />}
              iconPosition="left"
              notFullWidth
              onPress={showListView}
              small={false}
              smallest={false}
              title={texts.floorPlan.listView}
            />
          </View>
        )}
        {viewMode === FloorPlanViewMode.Svg && (
          <FloorPlanPinPreview navigation={navigation} pin={selectedPin} />
        )}
      </View>
    </GestureHandlerRootView>
  );
};
/* eslint-enable complexity */

const createStyles = (colors: ThemeColorPalette) => ({
  container: {
    backgroundColor: colors.surface,
    flex: 1
  },
  drawerButtonPosition: {
    bottom: '5%'
  },
  floatingButtonContainer: {
    alignSelf: 'center',
    position: 'absolute'
  },
  listButtonContainer: {
    left: normalize(16),
    position: 'absolute',
    top: normalize(16)
  },
  mapContainer: {
    flex: 1
  },
  root: {
    flex: 1
  },
  tabButtonPosition: {
    bottom: 0
  }
});

const staticStyles = StyleSheet.create({
  closeIcon: {
    paddingHorizontal: normalize(14)
  }
});
