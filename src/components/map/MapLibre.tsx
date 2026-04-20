import {
  Camera,
  type CameraRef,
  type Expression,
  GeoJSONSource,
  type GeoJSONSourceRef,
  Images,
  Layer,
  Map,
  type MapRef,
  NativeUserLocation,
  type PressEvent,
  type PressEventWithFeatures,
  ViewAnnotation
} from '@maplibre/maplibre-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { featureCollection, point } from '@turf/helpers';
import { LocationObject, LocationObjectCoords } from 'expo-location';
import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
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

const scaleCircleRadius = (radius: number | Expression | undefined, scale: number) => {
  if (radius == null) return undefined;
  if (typeof radius === 'number') return radius * scale;
  if (Array.isArray(radius)) return ['*', radius, scale] as Expression;

  return radius;
};

// Converts camelCase property name to kebab-case, e.g. "circleColor" → "circle-color".
const camelToKebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Symbol paint properties in camelCase — all other symbol props belong in layout.
const SYMBOL_PAINT_KEYS = new Set([
  'iconOpacity',
  'iconColor',
  'iconHaloColor',
  'iconHaloWidth',
  'iconHaloBlur',
  'iconTranslate',
  'iconTranslateAnchor',
  'textOpacity',
  'textColor',
  'textHaloColor',
  'textHaloWidth',
  'textHaloBlur',
  'textTranslate',
  'textTranslateAnchor'
]);

// Circle layout properties in camelCase — everything else is paint.
const CIRCLE_LAYOUT_KEYS = new Set(['visibility', 'circleSortKey']);

// Line layout properties in camelCase — everything else is paint.
const LINE_LAYOUT_KEYS = new Set([
  'visibility',
  'lineCap',
  'lineJoin',
  'lineMiterLimit',
  'lineRoundLimit',
  'lineSortKey'
]);

/**
 * Converts a legacy camelCase MapLibre v10 layer style object into v11-compliant
 * `paint` and `layout` objects with kebab-case keys, ready for use on <Layer>.
 */
const splitLayerStyle = (
  type: 'circle' | 'symbol' | 'line',
  style: Record<string, unknown>
): { paint: Record<string, unknown>; layout: Record<string, unknown> } => {
  const paint: Record<string, unknown> = {};
  const layout: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(style)) {
    const kebab = camelToKebab(key);
    const isLayout =
      type === 'symbol'
        ? !SYMBOL_PAINT_KEYS.has(key)
        : type === 'circle'
        ? CIRCLE_LAYOUT_KEYS.has(key)
        : LINE_LAYOUT_KEYS.has(key);

    if (isLayout) {
      layout[kebab] = value;
    } else {
      paint[kebab] = value;
    }
  }

  return { paint, layout };
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
  } catch {
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
    dragPan: boolean;
    touchPitch: boolean;
    touchRotate: boolean;
    touchZoom: boolean;
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
  showMapFilter?: boolean;
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
    dragPan: true,
    touchPitch: true,
    touchRotate: false,
    touchZoom: true
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
  currentPosition,
  showMapFilter,
  showsUserLocation: showsUserLocationProp,
  setPinEnabled,
  preserveZoomOnSelectedPosition = false,
  style
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const locationService = (settings as { locationService?: unknown }).locationService;
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
    locationSettings?.locationService ?? showsUserLocationProp ?? !!locationService;
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
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const shapeSourceRef = useRef<GeoJSONSourceRef>(null);
  const mapPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialFitRef = useRef(false);
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const bottomTabBarHeight = useSafeBottomTabBarHeight();

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

  if (showsUserLocation && currentPosition?.coords.latitude && currentPosition?.coords.longitude) {
    initialRegion = {
      ...initialRegion,
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude
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
      cameraRef.current?.fitBounds([sw[0], sw[1], ne[0], ne[1]], {
        duration: 1000,
        padding: { top: 50, right: 50, bottom: 50, left: 50 }
      });
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
        latitude: defaultAlternativePosition.coords?.latitude,
        longitude: defaultAlternativePosition.coords?.longitude
      };
    }

    if (!latitude || !longitude || !alternativeCoords) {
      return false;
    }

    return alternativeCoords.latitude == latitude && alternativeCoords.longitude == longitude;
  }, [showsUserLocation, selectedPosition, alternativePosition, defaultAlternativePosition]);

  const selectedPositionPin = useMemo(() => {
    if (!selectedPosition) return null;

    const { latitude, longitude } = selectedPosition;

    if (latitude == null || longitude == null) return null;

    return point([longitude, latitude], {
      iconName: isOwnLocation ? MAP.OWN_LOCATION_PIN : `${MAP.DEFAULT_PIN}Active`,
      id: 'selected-position-pin'
    });
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
      cameraRef.current?.setStop({
        duration: 1500,
        easing: 'ease',
        center: [longitude, latitude]
      });
      return;
    }

    const targetZoom = Math.max(zoomLevel?.singleMarker ?? 0, 16);
    const zoomForSelection = Math.min(targetZoom, 20);

    cameraRef.current?.setStop({
      duration: 1500,
      easing: 'ease',
      center: [longitude, latitude],
      zoom: zoomForSelection
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

  const handleMapPress = (
    event: NativeSyntheticEvent<PressEvent> | NativeSyntheticEvent<PressEventWithFeatures>
  ) => {
    const nativeEvent = event.nativeEvent;
    const tappedFeatures = 'features' in nativeEvent ? nativeEvent.features : [];

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
    if (selectedLocation?.position && nativeEvent?.lngLat?.length === 2) {
      const [tapLng, tapLat] = nativeEvent.lngLat as [number, number];
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
      const mapPressPayload = { geometry: { coordinates: nativeEvent?.lngLat ?? [] } };

      if (setPinEnabled && nativeEvent?.lngLat) {
        handleMapPressToSetNewPin(
          mapPressPayload as {
            geometry: { coordinates: [number, number] };
            features?: unknown[];
          }
        );
      } else if (nativeEvent?.lngLat) {
        clearSelection(true, 'map-press-empty');
        onMapPress?.(mapPressPayload as { geometry: { coordinates: number[] } });
      } else if (!setPinEnabled) {
        clearSelection(true, 'map-press-empty');
        onMapPress?.({ geometry: { coordinates: [] } });
      }
      mapPressTimeoutRef.current = null;
    }, 50);
  };

  const selectedMarkerId =
    selectedMarker || (selectedFeature?.properties?.id as string | undefined);

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

  const handleSourcePress = async (event: NativeSyntheticEvent<PressEventWithFeatures>) => {
    if (mapPressTimeoutRef.current) {
      clearTimeout(mapPressTimeoutRef.current);
      mapPressTimeoutRef.current = null;
    }

    event.stopPropagation();

    const nativeEvent = event.nativeEvent;
    const features = (nativeEvent.features ?? []).filter(Boolean);
    const feature = features[0];

    if (!feature) {
      clearSelection(true, 'shape-source-press-empty');
      if (nativeEvent?.lngLat) {
        // Cast event geometry to match onMapPress expected type
        onMapPress?.({
          geometry: { coordinates: nativeEvent.lngLat }
        } as { geometry: { coordinates: number[] } });
      }
      return;
    }

    if (feature.properties?.cluster) {
      clearSelection(false, 'cluster-pressed');
      const currentZoomLevel = await mapRef.current?.getZoom();
      const zoomForCluster = await shapeSourceRef.current?.getClusterExpansionZoom(
        feature.properties.cluster_id
      );
      const safeCurrentZoom = currentZoomLevel ?? initialZoomLevel ?? 0;
      const baseZoom = zoomForCluster ?? safeCurrentZoom;
      const newZoomLevel = Math.min(Math.max(baseZoom, safeCurrentZoom + 1), 20);

      onMarkerPress?.();
      cameraRef.current?.setStop({
        duration: 1500,
        easing: 'ease',
        center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
        zoom: newZoomLevel
      });
      suppressAutoFitRef.current = false;
      return;
    }

    if (feature.properties?.id === selectedMarkerId) {
      clearSelection(false, 'selected-marker-pressed');
      return;
    }

    suppressAutoFitRef.current = false;

    cameraRef.current?.setStop({
      duration: 1500,
      easing: 'ease',
      center: (feature.geometry as GeoJSON.Point).coordinates as [number, number]
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

  const displayedPins = selectedPositionPin ? [selectedPositionPin] : newPins;

  // --- Layer styles: migrated to v11 style-spec paint/layout props (kebab-case) ---
  // splitLayerStyle converts legacy camelCase style objects from the remote API config
  // into the new paint/layout separation required by Layer in maplibre-react-native v11.
  // Guard against layerStyles.singleIcon being absent (e.g. settings not yet loaded);
  // the resulting undefined/NaN values are safe because the !_isEmpty(layerStyles) render
  // guard below prevents these layers from being mounted when layerStyles is empty.
  const singleIcon = layerStyles.singleIcon ?? {};
  const { paint: clusterShadowPaint } = splitLayerStyle('circle', {
    ...layerStyles.clusteredCircleShadow,
    circlePitchAlignment: 'map'
  });
  const { paint: singleIconPaint, layout: singleIconLayout } = splitLayerStyle('symbol', {
    ...singleIcon,
    iconImage: [
      'case',
      ['==', ['get', 'id'], selectedMarker],
      ['coalesce', ['get', 'activeIconName'], ['get', 'iconName']],
      ['get', 'iconName']
    ],
    iconSize: [
      'case',
      ['==', ['get', 'id'], selectedMarker],
      (singleIcon.iconSize ?? 1) * 1.2,
      singleIcon.iconSize
    ],
    iconAnchor: [
      'case',
      ['==', ['get', 'iconName'], MAP.OWN_LOCATION_PIN],
      'center',
      singleIcon.iconAnchor
    ],
    iconAllowOverlap: true,
    iconIgnorePlacement: true
  });
  const { paint: clusterPaint } = splitLayerStyle('circle', {
    ...layerStyles.clusteredCircle,
    circleColor: clusterCircleColor,
    circlePitchAlignment: 'map'
  });
  const { paint: clusterCountPaint, layout: clusterCountLayout } = splitLayerStyle('symbol', {
    ...layerStyles.clusterCount,
    textColor: clusterTextColor,
    textFont: ['Noto Sans Bold', 'Open Sans Bold'],
    textField: ['format', ['concat', ['get', 'point_count']]],
    textPitchAlignment: 'map',
    textAllowOverlap: true,
    textIgnorePlacement: true
  });
  const polylinePaint = { 'line-color': colors.primary, 'line-width': 4, 'line-opacity': 0.8 };
  const { paint: pinSingleIconPaint, layout: pinSingleIconLayout } = splitLayerStyle('symbol', {
    ...singleIcon,
    iconImage: ['get', 'iconName'],
    iconSize: singleIcon.iconSize,
    iconAnchor: [
      'case',
      ['==', ['get', 'iconName'], MAP.OWN_LOCATION_PIN],
      'center',
      singleIcon.iconAnchor
    ],
    iconAllowOverlap: true,
    iconIgnorePlacement: true
  });
  const { paint: selectedSingleIconPaint, layout: selectedSingleIconLayout } = splitLayerStyle(
    'symbol',
    {
      ...singleIcon,
      iconImage: ['coalesce', ['get', 'activeIconName'], ['get', 'iconName']],
      iconSize: (singleIcon.iconSize ?? 1) * 1.2,
      iconAnchor: [
        'case',
        ['==', ['get', 'iconName'], MAP.OWN_LOCATION_PIN],
        'center',
        singleIcon.iconAnchor
      ],
      iconAllowOverlap: true,
      iconIgnorePlacement: true
    }
  );
  // Depends on runtime values (safeAreaBottom, bottomTabBarHeight) so cannot go into StyleSheet.
  const maximizeFullscreenStyle = isFullscreenMap
    ? { bottom: normalize(15) + (safeAreaBottom ? 0 : bottomTabBarHeight), right: 0 as const }
    : undefined;

  return (
    <View style={[styles.container, style]}>
      <Map
        attribution={false}
        compass={false}
        logo={false}
        mapStyle="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
        ref={mapRef}
        style={[styles.map, mapStyle]}
        onDidFinishLoadingMap={() => setMapReady(true)}
        onPress={handleMapPress}
        {...interactivity}
      >
        <Camera
          initialViewState={{
            center: [initialRegion.longitude ?? 10.4515, initialRegion.latitude ?? 51.1657],
            zoom: initialZoomLevel ?? 0
          }}
          trackUserLocation={followsUserLocation ? 'default' : undefined}
          minZoom={minZoom}
          ref={cameraRef}
        />

        {showsUserLocation && <NativeUserLocation mode="heading" />}

        <Images images={markerImages} />

        {!!shape && !_isEmpty(layerStyles) && (
          <>
            <GeoJSONSource
              id="pois"
              ref={shapeSourceRef}
              data={shape}
              onPress={handleSourcePress}
              cluster
              clusterRadius={clusterDistance || clusterRadius}
              clusterMaxZoom={clusterMaxZoom}
              clusterMinPoints={clusterThreshold || clusterMinPoints}
              clusterProperties={clusterProperties}
            >
              <Layer
                id="cluster-shadow"
                type="circle"
                filter={['has', 'point_count']}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                paint={clusterShadowPaint as any}
              />

              <Layer
                id="single-icon"
                type="symbol"
                filter={['all', ['!', ['has', 'point_count']]]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                paint={singleIconPaint as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                layout={singleIconLayout as any}
              />

              {!!clusterCircleColor && (
                <Layer
                  id="cluster-ring-outer"
                  type="circle"
                  filter={['has', 'point_count']}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  paint={{
                    'circle-color': clusterCircleColor as any,
                    'circle-radius': clusterRingOuterRadius as any,
                    'circle-opacity': 0.2,
                    'circle-pitch-alignment': 'map'
                  }}
                />
              )}

              {!!clusterCircleColor && (
                <Layer
                  id="cluster-ring-mid"
                  type="circle"
                  filter={['has', 'point_count']}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  paint={{
                    'circle-color': clusterCircleColor as any,
                    'circle-radius': clusterRingMidRadius as any,
                    'circle-opacity': 0.3,
                    'circle-pitch-alignment': 'map'
                  }}
                />
              )}

              {!!clusterCircleColor && (
                <Layer
                  id="cluster-ring-inner"
                  type="circle"
                  filter={['has', 'point_count']}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  paint={{
                    'circle-color': clusterCircleColor as any,
                    'circle-radius': clusterRingInnerRadius as any,
                    'circle-opacity': 0.5,
                    'circle-pitch-alignment': 'map'
                  }}
                />
              )}

              {!!clusterCircleColor && (
                <Layer
                  id="cluster"
                  type="circle"
                  filter={['has', 'point_count']}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  paint={clusterPaint as any}
                />
              )}

              {!!clusterTextColor && (
                <Layer
                  id="cluster-count"
                  type="symbol"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  paint={clusterCountPaint as any}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  layout={clusterCountLayout as any}
                />
              )}
            </GeoJSONSource>

            {!!geometryTourData?.length && (
              <GeoJSONSource
                id="polyline"
                data={{
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: geometryTourData.map((point) => [point.longitude, point.latitude])
                  }
                }}
              >
                <Layer id="polyline-layer" type="line" paint={polylinePaint} />
              </GeoJSONSource>
            )}

            <GeoJSONSource id="new-pins" data={featureCollection(displayedPins)}>
              <Layer
                id="pin-single-icon"
                type="symbol"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                paint={pinSingleIconPaint as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                layout={pinSingleIconLayout as any}
              />
            </GeoJSONSource>

            {!!selectedLocationFeature && (
              <GeoJSONSource
                id="selected-poi"
                data={featureCollection([selectedLocationFeature])}
                onPress={handleSourcePress}
                cluster={false}
              >
                <Layer
                  id="selected-single-icon"
                  type="symbol"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  paint={selectedSingleIconPaint as any}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  layout={selectedSingleIconLayout as any}
                />
              </GeoJSONSource>
            )}

            {!!selectedFeature && !!selectedLocationFeature && (
              <ViewAnnotation
                anchor={singleIcon.iconAnchor == 'bottom' ? 'bottom' : 'center'}
                lngLat={selectedLocationFeature?.geometry?.coordinates as [number, number]}
              >
                <Pressable
                  onPress={() => {
                    clearSelection(true, 'marker-view-press');
                  }}
                >
                  <View style={styles.selectedTapTarget} />
                </Pressable>
              </ViewAnnotation>
            )}

            {!!selectedFeature && (
              <ViewAnnotation
                anchor={singleIcon.iconAnchor == 'bottom' ? 'bottom' : 'center'}
                lngLat={
                  (selectedFeature?.geometry as GeoJSON.Point)?.coordinates as [number, number]
                }
                offset={singleIcon.iconAnchor == 'bottom' ? [0, -38] : [0, -26]}
              >
                <CustomCallout feature={selectedFeature} />
              </ViewAnnotation>
            )}
          </>
        )}
      </Map>

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
            isFullscreenMap && styles.fullscreenMap,
            showMapFilter && styles.myLocationButtonWithFilter
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
          style={[styles.buttonsContainer, styles.maximizeButtonContainer, maximizeFullscreenStyle]}
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
    marginBottom: normalize(10),
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
  },
  fullscreenMap: {
    right: 0
  },
  myLocationButtonWithFilter: {
    top: normalize(64)
  }
});
