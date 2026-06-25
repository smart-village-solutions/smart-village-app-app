import { NavigationProp, RouteProp } from '@react-navigation/native';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Button, EmptyMessage, HeaderLeft, LoadingSpinner } from '../../components';
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
import { colors, Icon, normalize, texts } from '../../config';
import { useStaticContent } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';

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
  initialViewMode?: FloorPlanInitialViewMode
) =>
  viewModeOverride ??
  (initialViewMode === FloorPlanViewMode.List ? FloorPlanViewMode.List : FloorPlanViewMode.Svg);

const getInitialFloorPlanViewMode = (initialViewMode?: FloorPlanInitialViewMode) =>
  initialViewMode === FloorPlanViewMode.List ? FloorPlanViewMode.List : FloorPlanViewMode.Svg;

const getSelectedFloor = (config?: FloorPlanConfig, selectedFloorId?: string) => {
  if (!config?.floors.length) return undefined;

  return config.floors.find((floor) => floor.id === selectedFloorId) || config.floors[0];
};

const parseStaticFloorPlanConfig = (json: unknown) => parseFloorPlanConfig(json) as FloorPlanConfig;

/* eslint-disable complexity */
export const FloorPlanScreen = ({ navigation, route }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
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
  const viewMode = getFloorPlanViewMode(viewModeOverride, initialViewMode);
  const initialResolvedViewMode = getInitialFloorPlanViewMode(initialViewMode);
  const initialFloorId = route.params?.initialFloorId || config?.initialFloorId;
  const activeFloor = getSelectedFloor(config, selectedFloorId || initialFloorId);
  const isInitialListView = initialResolvedViewMode === FloorPlanViewMode.List;
  const showFloatingMapButton = isInitialListView && viewMode === FloorPlanViewMode.List;

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
  }, []);

  const closeSvgView = useCallback(() => {
    setSelectedPin(undefined);
    setViewModeOverride(undefined);
  }, []);

  const handleFloorSelect = useCallback((floorId: string) => {
    setSelectedPin(undefined);
    setSelectedFloorId(floorId);
  }, []);

  useLayoutEffect(() => {
    if (isInitialListView && viewMode === FloorPlanViewMode.Svg) {
      navigation.setOptions({
        headerLeft: () => (
          <HeaderLeft
            onPress={closeSvgView}
            backImage={({ tintColor }) => (
              <Icon.Close
                color={tintColor}
                size={normalize(22)}
                style={{ paddingHorizontal: normalize(14) }}
              />
            )}
          />
        )
      });
    } else if (viewMode === FloorPlanViewMode.List) {
      navigation.setOptions({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      });
    } else {
      navigation.setOptions({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      });
    }
  }, [closeSvgView, isInitialListView, navigation, viewMode]);

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
              icon={<Icon.Map color={colors.surface} />}
              iconPosition="left"
              notFullWidth
              onPress={showSvgView}
              small={false}
              smallest={false}
              title={texts.floorPlan.svgView}
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

const styles = StyleSheet.create({
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
