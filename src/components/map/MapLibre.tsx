import {
  Camera,
  CameraRef,
  CircleLayer,
  Images,
  LineLayer,
  MapView,
  MapViewRef,
  MarkerView,
  ShapeSource,
  ShapeSourceRef,
  SymbolLayer,
  UserLocation,
  UserLocationRenderMode,
  UserTrackingMode
} from '@maplibre/maplibre-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { featureCollection, point } from '@turf/helpers';
import { LocationObject, LocationObjectCoords } from 'expo-location';
import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { getBounds, truncateText } from '../../helpers';
import { useLocationSettings, useMapFeatureConfig } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { BoldText, RegularText } from '../Text';

const { a11yLabel, MAP } = consts;

const scaleCircleRadius = (radius: any, scale: number) => {
  if (radius == null) return undefined;
  if (typeof radius === 'number') return radius * scale;
  if (Array.isArray(radius)) return ['*', radius, scale];

  return radius;
};

const CustomCallout = ({ feature }: { feature: GeoJSON.Feature }) => {
  const { properties = {} } = feature || {};
  const serviceName = truncateText(properties?.serviceName);
  const title = truncateText(properties?.title);

  return (
    <Animated.View style={styles.calloutContainer} pointerEvents="none">
      <View style={styles.calloutContent}>
        {!!serviceName && (
          <BoldText smallest center>
            {serviceName}
          </BoldText>
        )}
        {!!title && (
          <RegularText smallest center>
            {title}
          </RegularText>
        )}
      </View>
      <View style={styles.calloutTip} />
    </Animated.View>
  );
};

// useBottomTabBarHeight throws if no bottom tab navigator is in context;
// fall back to 0 for stack-only screens.
const useSafeBottomTabBarHeight = () => {
  try {
    return useBottomTabBarHeight();
  } catch (error) {
    return 0;
  }
};

type Props = {
  calloutTextEnabled?: boolean;
  clusterDistance?: number;
  clusterThreshold?: number;
  currentPosition?: LocationObject;
  geometryTourData?: LocationObjectCoords[];
  interactivity?: {
    pitchEnabled: boolean;
    rotateEnabled: boolean;
    scrollEnabled: boolean;
    zoomEnabled: boolean;
  };
  isMultipleMarkersMap?: boolean;
  isMyLocationButtonVisible?: boolean;
  locations: MapMarker[];
  mapCenterPosition?: LocationObjectCoords;
  mapStyle?: StyleProp<ViewStyle>;
  minZoom?: number;
  onMapPress?: ({
    geometry: { coordinates }
  }: {
    geometry: {
      coordinates: number[];
    };
  }) => { isLocationSelectable: boolean };
  onMarkerPress?: (arg0?: string) => void;
  onMaximizeButtonPress?: () => void;
  onMyLocationButtonPress?: ({ isFullScreenMap }: { isFullScreenMap?: boolean }) => void;
  selectedMarker?: string;
  selectedPosition?: LocationObjectCoords;
  setPinEnabled?: boolean;
  showsUserLocation?: boolean;
  preserveZoomOnSelectedPosition?: boolean;
  style?: StyleProp<ViewStyle>;
};

/* eslint-disable complexity */
export const MapLibre = ({
  calloutTextEnabled = false,
  clusterDistance,
  clusterThreshold,
  geometryTourData,
  interactivity = {
    pitchEnabled: true,
    rotateEnabled: false,
    scrollEnabled: true,
    zoomEnabled: true
  },
  isMultipleMarkersMap = true,
  isMyLocationButtonVisible = true,
  locations,
  mapCenterPosition,
  mapStyle,
  minZoom = 5,
  onMapPress,
  onMarkerPress,
  onMaximizeButtonPress,
  onMyLocationButtonPress,
  selectedMarker = '',
  selectedPosition,
  setPinEnabled,
  preserveZoomOnSelectedPosition = false,
  style,
  ...otherProps
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { locationService = {} } = settings;
  const {
    clusterCircleColor,
    clusterRadius = 50,
    clusterMaxZoom,
    clusterMinPoints = 2,
    clusterProperties,
    clusterTextColor,
    layerStyles = {},
    loading,
    markerImages,
    zoomLevel = {}
  } = useMapFeatureConfig(locations);
  const initialZoomLevel = isMultipleMarkersMap
    ? zoomLevel.multipleMarkers
    : zoomLevel.singleMarker;

  const { locationSettings = {} } = useLocationSettings();
  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};
  const showsUserLocation =
    locationSettings?.locationService ?? otherProps.showsUserLocation ?? !!locationService;
  const [followsUserLocation, setFollowsUserLocation] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSON.Feature | null>(null);
  const [isMarkerSelected, setIsMarkerSelected] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [newPins, setNewPins] = useState<GeoJSON.Feature[]>([]);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

  const suppressAutoFitRef = useRef(false);
  const clearSelection = useCallback(
    (notifyParent = false, reason?: string) => {
      if (reason) {
        suppressAutoFitRef.current = true;
      }

      setIsMarkerSelected(false);
      setSelectedFeature(null);

      if (notifyParent) {
        onMarkerPress?.();
      }
    },
    [onMarkerPress]
  );
  const mapRef = useRef<MapViewRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const shapeSourceRef = useRef<ShapeSourceRef>(null);
  const mapPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialFitRef = useRef(false);
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const bottomTabBarHeight = useBottomTabBarHeight();

  let initialRegion: Partial<LocationObjectCoords> = {
    latitude: 51.1657,
    longitude: 10.4515
  };

  if (defaultAlternativePosition) {
    initialRegion = {
      ...initialRegion,
      latitude: defaultAlternativePosition.coords?.latitude,
      longitude: defaultAlternativePosition.coords?.longitude
    };
  }

  if (mapCenterPosition) {
    initialRegion = {
      ...initialRegion,
      ...mapCenterPosition
    };
  }

  if (
    (!isMultipleMarkersMap || (isMultipleMarkersMap && locations?.length === 1)) &&
    locations?.[0]?.position?.latitude &&
    locations?.[0]?.position?.longitude
  ) {
    initialRegion = {
      ...initialRegion,
      latitude: locations[0].position.latitude,
      longitude: locations[0].position.longitude
    };
  }

  if (
    showsUserLocation &&
    otherProps.currentPosition?.coords.latitude &&
    otherProps.currentPosition?.coords.longitude
  ) {
    initialRegion = {
      ...initialRegion,
      latitude: otherProps.currentPosition.coords.latitude,
      longitude: otherProps.currentPosition.coords.longitude
    };
  }

  useEffect(() => {
    if (suppressAutoFitRef.current || hasInitialFitRef.current) {
      return;
    }

    if (
      !mapReady ||
      loading ||
      cameraRef.current === null ||
      !isMultipleMarkersMap ||
      !locations?.length ||
      locations?.length < 2 ||
      !!selectedPosition
    ) {
      return;
    }

    const { ne, sw } = getBounds(
      locations?.filter(
        (location) => !!location?.position?.latitude && !!location?.position?.longitude
      )
    );

    if (!selectedMarker && !isMarkerSelected) {
      cameraRef.current?.fitBounds(ne, sw, 50, 1000);
      hasInitialFitRef.current = true;
    }
  }, [
    mapReady,
    loading,
    isMultipleMarkersMap,
    locations,
    selectedMarker,
    selectedPosition,
    isMarkerSelected
  ]);

  const isOwnLocation = useMemo(() => {
    if (showsUserLocation) return false;

    const { latitude, longitude } = selectedPosition || {};
    let alternativeCoords;

    if (alternativePosition) {
      alternativeCoords = {
        latitude: alternativePosition.coords?.latitude,
        longitude: alternativePosition.coords?.longitude
      };
    } else if (defaultAlternativePosition) {
      alternativeCoords = {
        latitude: defaultAlternativePosition.coords?.lat,
        longitude: defaultAlternativePosition.coords?.lng
      };
    }

    if (!latitude || !longitude || !alternativeCoords) {
      return false;
    }

    return alternativeCoords.latitude == latitude && alternativeCoords.longitude == longitude;
  }, [showsUserLocation, selectedPosition, alternativePosition, defaultAlternativePosition]);

  useEffect(() => {
    if (!selectedPosition) return;

    const { latitude, longitude } = selectedPosition;

    if (latitude == null || longitude == null) return;

    const newPin = point([longitude, latitude], {
      iconName: isOwnLocation ? MAP.OWN_LOCATION_PIN : `${MAP.DEFAULT_PIN}Active`,
      id: `new-pin-${Date.now()}`
    });
    setNewPins([newPin]);
  }, [isOwnLocation, selectedPosition]);

  useEffect(() => {
    if (!selectedFeature?.properties?.id) return;

    const isFeatureStillVisible = locations?.some(
      (location) => location?.id === selectedFeature.properties?.id
    );

    if (!isFeatureStillVisible) {
      clearSelection(false, 'feature-no-longer-visible');
    }
  }, [locations, selectedFeature, clearSelection]);

  useEffect(() => {
    if (selectedMarker) return;

    clearSelection(false, 'selected-marker-changed');
  }, [selectedMarker, clearSelection]);

  useEffect(() => {
    if (!mapReady || !selectedPosition || !cameraRef.current) {
      return;
    }

    const { latitude, longitude } = selectedPosition;

    if (latitude == null || longitude == null) {
      return;
    }

    if (preserveZoomOnSelectedPosition) {
      cameraRef.current?.setCamera({
        animationDuration: 1500,
        animationMode: 'easeTo',
        centerCoordinate: [longitude, latitude]
      });
      return;
    }

    const targetZoom = Math.max(zoomLevel?.singleMarker ?? 0, 16);
    const zoomForSelection = Math.min(targetZoom, 20);

    cameraRef.current?.setCamera({
      animationDuration: 1500,
      animationMode: 'easeTo',
      centerCoordinate: [longitude, latitude],
      zoomLevel: zoomForSelection
    });
  }, [mapReady, preserveZoomOnSelectedPosition, selectedPosition, zoomLevel?.singleMarker]);

  const handleMapPressToSetNewPin = async (event: {
    geometry: {
      coordinates: [number, number];
    };
    features?: unknown[];
  }) => {
    if (event?.features && event.features.length > 0) return;

    const { geometry } = event;
    if (!geometry) return;
    clearSelection(true, 'set-pin');

    const coordinates = geometry.coordinates as number[];
    if (!coordinates?.length) return;

    const { isLocationSelectable = false } = (await onMapPress?.({ geometry })) ?? {};

    if (!isLocationSelectable) {
      setNewPins([]);
      return;
    }

    const newPin = point(coordinates, {
      iconName: isOwnLocation ? MAP.OWN_LOCATION_PIN : `${MAP.DEFAULT_PIN}Active`,
      id: `new-pin-${Date.now()}`
    });
    setNewPins([newPin]);
  };

  const handleMapPress = (event: any) => {
    const tappedFeatures = event?.features ?? [];

    const tappedSelectedFeature = tappedFeatures.some(
      (feature: GeoJSON.Feature) =>
        feature?.properties?.id &&
        feature.properties.id === selectedMarkerId &&
        !feature?.properties?.cluster
    );

    if (tappedSelectedFeature) {
      clearSelection(false, 'map-press-selected-feature');
      return;
    }

    // Fallback: if user tapped very close to the currently selected marker, treat as toggle off
    if (selectedLocation?.position && event?.geometry?.coordinates?.length === 2) {
      const [tapLng, tapLat] = event.geometry.coordinates as [number, number];
      const { latitude: selLat, longitude: selLng } = selectedLocation.position;
      const dLat = Math.abs(selLat - tapLat);
      const dLng = Math.abs(selLng - tapLng);
      if (dLat < 0.0008 && dLng < 0.0008) {
        clearSelection(false, 'map-press-proximity');
        return;
      }
    }

    if (tappedFeatures.length > 0) {
      return;
    }

    if (mapPressTimeoutRef.current) clearTimeout(mapPressTimeoutRef.current);

    mapPressTimeoutRef.current = setTimeout(() => {
      if (setPinEnabled && event?.geometry) {
        handleMapPressToSetNewPin(
          event as {
            geometry: { coordinates: [number, number] };
            features?: unknown[];
          }
        );
      } else if (event?.geometry) {
        clearSelection(true, 'map-press-empty');
        onMapPress?.(event as { geometry: { coordinates: number[] } });
      } else if (!setPinEnabled) {
        clearSelection(true, 'map-press-empty');
        onMapPress?.({ geometry: { coordinates: [] } });
      }
      mapPressTimeoutRef.current = null;
    }, 50);
  };

  const selectedMarkerId = useMemo(
    () => selectedMarker || (selectedFeature?.properties?.id as string | undefined),
    [selectedMarker, selectedFeature]
  );

  const clusteredLocations = useMemo(() => {
    if (!selectedMarkerId) return locations;

    return locations?.filter((location) => location?.id !== selectedMarkerId);
  }, [locations, selectedMarkerId]);

  const selectedLocation = useMemo(
    () => locations?.find((location) => location?.id === selectedMarkerId),
    [locations, selectedMarkerId]
  );

  const selectedLocationFeature = useMemo(() => {
    const latitude = selectedLocation?.position?.latitude;
    const longitude = selectedLocation?.position?.longitude;

    if (latitude == null || longitude == null) return null;

    return point([longitude, latitude], {
      ...selectedLocation,
      iconName: selectedLocation?.activeIconName ?? selectedLocation?.iconName,
      activeIconName: selectedLocation?.activeIconName ?? selectedLocation?.iconName,
      id: selectedLocation?.id
    });
  }, [selectedLocation]);

  const handleSourcePress = async (event: any) => {
    if (mapPressTimeoutRef.current) {
      clearTimeout(mapPressTimeoutRef.current);
      mapPressTimeoutRef.current = null;
    }

    const features = ((event?.features as any[]) ?? []).filter(Boolean);

    // Check if the click was on the selected POI source
    const selectedPoiFeature = features.find((item) => item?.sourceID === 'selected-poi');
    if (selectedPoiFeature) {
      // Clicking on already selected marker - deselect it
      clearSelection(false, 'selected-poi-pressed');
      return;
    }

    const feature = features.find((item) => item?.sourceID !== 'selected-poi') ?? features[0];

    if (!feature) {
      clearSelection(true, 'shape-source-press-empty');
      if (event?.geometry) {
        // Cast event geometry to match onMapPress expected type
        onMapPress?.({ geometry: event.geometry } as { geometry: { coordinates: number[] } });
      }
      return;
    }

    if (feature.properties?.cluster) {
      clearSelection(false, 'cluster-pressed');
      const currentZoomLevel = await mapRef.current?.getZoom();
      const zoomForCluster = await shapeSourceRef.current?.getClusterExpansionZoom(feature);
      const safeCurrentZoom = currentZoomLevel ?? initialZoomLevel ?? 0;
      const baseZoom = zoomForCluster ?? safeCurrentZoom;
      const newZoomLevel = Math.min(Math.max(baseZoom, safeCurrentZoom + 1), 20);

      onMarkerPress?.();
      cameraRef.current?.setCamera({
        animationDuration: 1500,
        animationMode: 'easeTo',
        centerCoordinate: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
        zoomLevel: newZoomLevel
      });
      suppressAutoFitRef.current = false;
      return;
    }

    if (feature.properties?.id === selectedMarkerId) {
      clearSelection(false, 'selected-marker-pressed');
      return;
    }

    suppressAutoFitRef.current = false;

    cameraRef.current?.setCamera({
      animationDuration: 1500,
      animationMode: 'easeTo',
      centerCoordinate: (feature.geometry as GeoJSON.Point).coordinates as [number, number]
    });
    onMarkerPress?.(feature.properties?.id);
    setIsMarkerSelected(true);
    !!calloutTextEnabled && setSelectedFeature(feature);
  };

  if (loading) {
    return <LoadingSpinner loading />;
  }

  const clusterBaseRadius = layerStyles?.clusteredCircle?.circleRadius ?? 24;
  const clusterRingInnerRadius = scaleCircleRadius(clusterBaseRadius, 1.4);
  const clusterRingMidRadius = scaleCircleRadius(clusterBaseRadius, 1.8);
  const clusterRingOuterRadius = scaleCircleRadius(clusterBaseRadius, 2.2);

  const shape = featureCollection(
    (clusteredLocations ?? [])
      .filter((location) => !!location?.position?.latitude && !!location?.position?.longitude)
      .map((location) =>
        point([location.position.longitude, location.position.latitude], {
          ...location
        })
      )
  );

  return (
    <View style={[styles.container, style]}>
      <MapView
        attributionEnabled={false}
        compassEnabled={false}
        mapStyle="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
        ref={mapRef}
        style={[styles.map, mapStyle]}
        onDidFinishLoadingMap={() => setMapReady(true)}
        onPress={handleMapPress as unknown as (feature: GeoJSON.Feature) => void}
        {...interactivity}
      >
        <Camera
          defaultSettings={{
            centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
            zoomLevel: initialZoomLevel
          }}
          followUserLocation={followsUserLocation}
          followUserMode={UserTrackingMode.Follow}
          minZoomLevel={minZoom}
          ref={cameraRef}
        />

        <UserLocation
          androidRenderMode="compass"
          renderMode={UserLocationRenderMode.Native}
          showsUserHeadingIndicator
          visible={showsUserLocation}
        />

        <Images images={markerImages} />

        {!!shape && !_isEmpty(layerStyles) && (
          <>
            <ShapeSource
              id="pois"
              ref={shapeSourceRef}
              shape={shape}
              onPress={handleSourcePress}
              cluster
              clusterRadius={clusterDistance || clusterRadius}
              clusterMaxZoomLevel={clusterMaxZoom}
              clusterMinPoints={clusterThreshold || clusterMinPoints}
              clusterProperties={clusterProperties}
            >
              <CircleLayer
                id="cluster-shadow"
                filter={['has', 'point_count']}
                style={{
                  ...layerStyles.clusteredCircleShadow,
                  circlePitchAlignment: 'map' as const
                }}
              />

              <SymbolLayer
                id="single-icon"
                filter={['all', ['!', ['has', 'point_count']]]}
                style={{
                  ...layerStyles.singleIcon,
                  iconImage: [
                    'case',
                    ['==', ['get', 'id'], selectedMarker],
                    ['coalesce', ['get', 'activeIconName'], ['get', 'iconName']],
                    ['get', 'iconName']
                  ],
                  iconSize: [
                    'case',
                    ['==', ['get', 'id'], selectedMarker],
                    layerStyles.singleIcon.iconSize * 1.2,
                    layerStyles.singleIcon.iconSize
                  ],
                  iconAnchor: [
                    'case',
                    ['==', ['get', 'iconName'], MAP.OWN_LOCATION_PIN],
                    'center',
                    layerStyles.singleIcon.iconAnchor
                  ],
                  iconAllowOverlap: true,
                  iconIgnorePlacement: true
                }}
              />

              {!!clusterCircleColor && (
                <CircleLayer
                  id="cluster-ring-outer"
                  filter={['has', 'point_count']}
                  style={{
                    circleColor: clusterCircleColor,
                    circleRadius: clusterRingOuterRadius,
                    circleOpacity: 0.2,
                    circlePitchAlignment: 'map' as const
                  }}
                />
              )}

              {!!clusterCircleColor && (
                <CircleLayer
                  id="cluster-ring-mid"
                  filter={['has', 'point_count']}
                  style={{
                    circleColor: clusterCircleColor,
                    circleRadius: clusterRingMidRadius,
                    circleOpacity: 0.3,
                    circlePitchAlignment: 'map' as const
                  }}
                />
              )}

              {!!clusterCircleColor && (
                <CircleLayer
                  id="cluster-ring-inner"
                  filter={['has', 'point_count']}
                  style={{
                    circleColor: clusterCircleColor,
                    circleRadius: clusterRingInnerRadius,
                    circleOpacity: 0.5,
                    circlePitchAlignment: 'map' as const
                  }}
                />
              )}

              {!!clusterCircleColor && (
                <CircleLayer
                  id="cluster"
                  filter={['has', 'point_count']}
                  style={{
                    ...layerStyles.clusteredCircle,
                    circleColor: clusterCircleColor,
                    circlePitchAlignment: 'map' as const
                  }}
                />
              )}

              {!!clusterTextColor && (
                <SymbolLayer
                  id="cluster-count"
                  style={{
                    ...layerStyles.clusterCount,
                    textColor: clusterTextColor,
                    textFont: ['Noto Sans Bold', 'Open Sans Bold'],
                    textField: ['format', ['concat', ['get', 'point_count']]],
                    textPitchAlignment: 'map' as const,
                    textAllowOverlap: true,
                    textIgnorePlacement: true
                  }}
                />
              )}
            </ShapeSource>

            {!!geometryTourData?.length && (
              <ShapeSource
                id="polyline"
                shape={{
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: geometryTourData.map((point) => [point.longitude, point.latitude])
                  }
                }}
              >
                <LineLayer
                  id="polyline-layer"
                  style={{
                    lineColor: colors.primary,
                    lineWidth: 4,
                    lineOpacity: 0.8
                  }}
                />
              </ShapeSource>
            )}

            <ShapeSource id="new-pins" shape={featureCollection(newPins)}>
              <SymbolLayer
                id="pin-single-icon"
                style={{
                  ...layerStyles.singleIcon,
                  iconImage: ['get', 'iconName'],
                  iconSize: layerStyles.singleIcon.iconSize,
                  iconAnchor: [
                    'case',
                    ['==', ['get', 'iconName'], MAP.OWN_LOCATION_PIN],
                    'center',
                    layerStyles.singleIcon.iconAnchor
                  ],
                  iconAllowOverlap: true,
                  iconIgnorePlacement: true
                }}
              />
            </ShapeSource>

            {!!selectedLocationFeature && (
              <ShapeSource
                id="selected-poi"
                shape={featureCollection([selectedLocationFeature])}
                onPress={handleSourcePress}
                cluster={false}
              >
                <SymbolLayer
                  id="selected-single-icon"
                  style={{
                    ...layerStyles.singleIcon,
                    iconImage: ['coalesce', ['get', 'activeIconName'], ['get', 'iconName']],
                    iconSize: layerStyles.singleIcon.iconSize * 1.2,
                    iconAnchor: [
                      'case',
                      ['==', ['get', 'iconName'], MAP.OWN_LOCATION_PIN],
                      'center',
                      layerStyles.singleIcon.iconAnchor
                    ],
                    iconAllowOverlap: true,
                    iconIgnorePlacement: true
                  }}
                />
              </ShapeSource>
            )}

            {!!selectedFeature && !!selectedLocationFeature && (
              <MarkerView
                anchor={
                  layerStyles.singleIcon.iconAnchor == 'bottom'
                    ? { x: 0.5, y: 1 }
                    : { x: 0.5, y: 0.5 }
                }
                coordinate={selectedLocationFeature?.geometry?.coordinates}
                pointerEvents="box-none"
              >
                <Pressable
                  onPress={() => {
                    clearSelection(true, 'marker-view-press');
                  }}
                >
                  <View style={styles.selectedTapTarget} />
                </Pressable>
              </MarkerView>
            )}

            {!!selectedFeature && (
              <MarkerView
                anchor={
                  layerStyles.singleIcon.iconAnchor == 'bottom'
                    ? { x: 0.5, y: selectedFeature ? 1.85 : 0.5 }
                    : { x: 0.5, y: selectedFeature ? 1.45 : 0.5 }
                }
                coordinate={
                  (selectedFeature?.geometry as GeoJSON.Point)?.coordinates as [number, number]
                }
                pointerEvents="none"
              >
                <CustomCallout feature={selectedFeature} />
              </MarkerView>
            )}
          </>
        )}
      </MapView>

      {isMyLocationButtonVisible && showsUserLocation && (
        <TouchableOpacity
          accessibilityLabel={`${texts.components.map} ${a11yLabel.button}`}
          onPress={() => {
            setFollowsUserLocation(true);
            onMyLocationButtonPress?.({});
            setTimeout(() => setFollowsUserLocation(false), 5000);
          }}
          style={[
            styles.buttonsContainer,
            styles.myLocationButtonContainer,
            isFullscreenMap && { right: 0 },
            otherProps?.showMapFilter && { top: normalize(64) }
          ]}
        >
          <View style={styles.buttons}>
            <Icon.GPS size={normalize(18)} />
          </View>
        </TouchableOpacity>
      )}

      {!!onMaximizeButtonPress && (
        <TouchableOpacity
          accessibilityLabel={`Karte vergrößern ${a11yLabel.button}`}
          onPress={() => {
            setIsFullscreenMap((prev) => !prev);
            onMaximizeButtonPress();
          }}
          style={[
            styles.buttonsContainer,
            styles.maximizeButtonContainer,
            isFullscreenMap && {
              bottom: normalize(15) + (safeAreaBottom ? 0 : bottomTabBarHeight),
              right: 0
            }
          ]}
        >
          <View style={styles.buttons}>
            {isFullscreenMap ? (
              <Icon.CondenseMap size={normalize(18)} />
            ) : (
              <Icon.ExpandMap size={normalize(18)} />
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  buttons: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center'
  },
  selectedTapTarget: {
    height: normalize(44),
    width: normalize(44)
  },
  buttonsContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    height: normalize(48),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(15),
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    width: normalize(48),
    zIndex: 10
  },
  calloutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(150),
    width: 'auto',
    zIndex: 9999999,
    ...Platform.select({
      android: {
        position: 'absolute'
      }
    })
  },
  calloutContent: {
    backgroundColor: colors.surface,
    borderColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    elevation: 5,
    padding: 10,
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  calloutTip: {
    alignSelf: 'center',
    backgroundColor: colors.transparent,
    borderBottomColor: colors.transparent,
    borderBottomWidth: 0,
    borderLeftColor: colors.transparent,
    borderLeftWidth: 10,
    borderRightColor: colors.transparent,
    borderRightWidth: 10,
    borderTopColor: colors.surface,
    borderTopWidth: 10,
    elevation: 0,
    height: 0,
    marginTop: -1,
    width: 0,
    zIndex: 1000
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
  },
  map: {
    flex: 1
  },
  maximizeButtonContainer: {
    bottom: normalize(15)
  },
  myLocationButtonContainer: {
    top: normalize(15)
  }
});
