import {
  Camera,
  CircleLayer,
  Images,
  LineLayer,
  MapView,
  MarkerView,
  ShapeSource,
  ShapeSourceRef,
  SymbolLayer,
  UserLocation,
  UserLocationRenderMode,
  UserTrackingMode
} from '@maplibre/maplibre-react-native';
import { featureCollection, point } from '@turf/helpers';
import { LocationObject, LocationObjectCoords } from 'expo-location';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LatLng, Region } from 'react-native-maps';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { getBounds, truncateText } from '../../helpers';
import { useLocationSettings, useMapFeatureConfig } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { BoldText, RegularText } from '../Text';

const { a11yLabel, MAP } = consts;

const CustomCallout = ({ feature }: { feature: GeoJSON.Feature }) => {
  const { properties = {} } = feature;

  const serviceName = truncateText(properties?.serviceName);
  const title = truncateText(properties?.title);

  return (
    <View style={styles.calloutContainer}>
      <View style={styles.callout}>
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
      <View style={styles.calloutTriangel} />
    </View>
  );
};

type Props = {
  calloutTextEnabled?: boolean;
  clusterDistance?: number;
  currentPosition?: LocationObject;
  geometryTourData?: LatLng[];
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
  }) => Promise<{ isLocationSelectable?: boolean }>;
  onMarkerPress?: (arg0?: string) => void;
  onMaximizeButtonPress?: () => void;
  onMyLocationButtonPress?: ({ isFullScreenMap }: { isFullScreenMap?: boolean }) => void;
  selectedMarker?: string;
  selectedPosition?: LocationObjectCoords;
  setPinEnabled?: boolean;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
  updatedRegion?: Region;
};

/* eslint-disable complexity */
export const MapLibre = ({
  calloutTextEnabled = false,
  clusterDistance,
  geometryTourData,
  isMultipleMarkersMap = true,
  isMyLocationButtonVisible = true,
  locations,
  mapCenterPosition,
  mapStyle,
  minZoom,
  onMapPress,
  onMarkerPress,
  onMaximizeButtonPress,
  onMyLocationButtonPress,
  selectedMarker = '',
  selectedPosition,
  setPinEnabled,
  style,
  ...otherProps
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { locationService = {} } = settings;
  const {
    clusterCircleColor,
    clusterMaxZoom,
    clusterProperties,
    layerStyles = {},
    loading,
    markerImages,
    zoomLevel = {}
  } = useMapFeatureConfig(locations);
  const initialZoomLevel = isMultipleMarkersMap
    ? zoomLevel.multipleMarkers
    : zoomLevel.singleMarker;

  const { locationSettings = {} } = useLocationSettings();
  const showsUserLocation =
    locationSettings?.locationService ?? otherProps.showsUserLocation ?? !!locationService;
  const [followsUserLocation, setFollowsUserLocation] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [newPins, setNewPins] = useState<GeoJSON.Feature[]>([]);
  const mapRef = useRef(null);
  const cameraRef = useRef(null);
  const shapeSourceRef = useRef<ShapeSourceRef>(null);

  let initialRegion: LocationObjectCoords = {
    latitude: 51.1657,
    longitude: 10.4515
  };

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
    if (
      !mapReady ||
      loading ||
      cameraRef.current === null ||
      !isMultipleMarkersMap ||
      locations.length < 2
    ) {
      return;
    }

    const { ne, sw } = getBounds(locations);

    !selectedMarker && cameraRef.current?.fitBounds(ne, sw, 50, 1000);
  }, [mapReady, loading, isMultipleMarkersMap, locations, selectedMarker]);

  useEffect(() => {
    if (!setPinEnabled) return;

    if (!selectedPosition) {
      setNewPins([]);
      return;
    }

    const { latitude, longitude } = selectedPosition;
    const newPin = point([longitude, latitude], {
      iconName: MAP.DEFAULT_PIN, // TODO: find a proper default icon for setting a pin
      id: `new-pin-${Date.now()}`
    });
    setNewPins([newPin]);

    cameraRef.current?.flyTo([longitude, latitude], 1500);
  }, [selectedPosition]);

  const handleMapPressToSetNewPin = async (event: {
    geometry: {
      coordinates: [number, number];
    };
  }) => {
    const { geometry } = event;
    if (!geometry) return;

    const coordinates = geometry.coordinates as number[];
    if (!coordinates?.length) return;

    const { isLocationSelectable = false } = (await onMapPress?.({ geometry })) ?? {};

    if (!isLocationSelectable) {
      setNewPins([]);
      return;
    }

    const newPin = point(coordinates, {
      iconName: MAP.DEFAULT_PIN, // TODO: find a proper default icon for setting a pin
      id: `new-pin-${Date.now()}`
    });
    setNewPins([newPin]);
  };

  const handleMapPress = (event: any) => {
    if (setPinEnabled) {
      handleMapPressToSetNewPin(event);
    } else {
      onMapPress?.(event);
    }
  };

  const [centerCoordinate] = useState([initialRegion.longitude, initialRegion.latitude]);

  const handleSourcePress = async (event: any) => {
    const feature = event.features[0];
    if (!feature) {
      onMapPress?.(event);
      return;
    }

    if (feature.properties?.cluster) {
      const currentZoomLevel = await mapRef.current?.getZoom();
      const zoomForCluster = await shapeSourceRef.current?.getClusterExpansionZoom(feature);
      const newZoomLevel = Math.min((zoomForCluster ?? currentZoomLevel) + 1, 20);

      cameraRef.current?.setCamera({
        animationDuration: 1500,
        animationMode: 'flyTo',
        centerCoordinate: feature.geometry.coordinates,
        zoomLevel: newZoomLevel
      });
    } else {
      cameraRef.current?.flyTo(feature.geometry.coordinates, 1500);
      onMarkerPress?.(feature.properties?.id);
      !!calloutTextEnabled && setSelectedFeature(feature);
    }
  };

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        attributionEnabled={false}
        compassEnabled={false}
        mapStyle="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
        ref={mapRef}
        style={[styles.map, mapStyle]}
        onDidFinishLoadingMap={() => setMapReady(true)}
        onPress={handleMapPress}
        {...otherProps.interactivity}
      >
        <Camera
          centerCoordinate={centerCoordinate}
          followUserLocation={followsUserLocation}
          followUserMode={UserTrackingMode.FollowWithHeading}
          minZoomLevel={minZoom}
          ref={cameraRef}
          zoomLevel={initialZoomLevel}
        />

        <UserLocation
          androidRenderMode="compass"
          renderMode={UserLocationRenderMode.Native}
          showsUserHeadingIndicator
          visible={showsUserLocation}
        />

        <Images images={markerImages} />

        <ShapeSource
          id="pois"
          ref={shapeSourceRef}
          shape={featureCollection(
            locations?.map((location) =>
              point([location.position.longitude, location.position.latitude], { ...location })
            )
          )}
          onPress={handleSourcePress}
          cluster
          clusterRadius={50}
          clusterMaxZoomLevel={clusterMaxZoom}
          clusterProperties={clusterProperties}
        >
          <CircleLayer
            id="cluster-shadow"
            filter={['has', 'point_count']}
            style={{ ...layerStyles.clusteredCircleShadow, circlePitchAlignment: 'map' }}
          />

          <SymbolLayer
            id="single-icon"
            filter={['!', ['has', 'point_count']]}
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
                layerStyles.singleIcon.iconSize * 1.25,
                layerStyles.singleIcon.iconSize
              ]
            }}
          />

          <CircleLayer
            id="cluster"
            filter={['has', 'point_count']}
            style={{
              ...layerStyles.clusteredCircle,
              circlePitchAlignment: 'map',
              circleColor: clusterCircleColor
            }}
          />

          <SymbolLayer
            id="cluster-count"
            style={{
              ...layerStyles.clusterCount,
              textField: ['format', ['concat', ['get', 'point_count']]],
              textPitchAlignment: 'map'
            }}
          />
        </ShapeSource>

        {!!geometryTourData?.length && (
          <ShapeSource
            id="polyline"
            shape={{
              type: 'Feature',
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
              iconSize: layerStyles.singleIcon.iconSize
            }}
          />
        </ShapeSource>

        {!!selectedFeature && (
          <MarkerView
            coordinate={selectedFeature.geometry.coordinates}
            anchor={{ x: 0.5, y: 1.45 }}
          >
            <CustomCallout feature={selectedFeature} />
          </MarkerView>
        )}
      </MapView>

      {isMyLocationButtonVisible && showsUserLocation && (
        <View style={[styles.buttonsContainer, styles.myLocationButtonContainer]}>
          <TouchableOpacity
            accessibilityLabel={`${texts.components.map} ${a11yLabel.button}`}
            onPress={() => {
              setFollowsUserLocation(true);
              onMyLocationButtonPress?.({});
              setTimeout(() => setFollowsUserLocation(false), 5000);
            }}
            style={styles.buttons}
          >
            <Icon.GPS size={normalize(18)} />
          </TouchableOpacity>
        </View>
      )}

      {!!onMaximizeButtonPress && (
        <View style={[styles.buttonsContainer, styles.maximizeButtonContainer]}>
          <TouchableOpacity
            accessibilityLabel={`Karte vergrößern ${a11yLabel.button}`}
            style={styles.buttons}
            onPress={onMaximizeButtonPress}
          >
            <Icon.ExpandMap size={normalize(18)} />
          </TouchableOpacity>
        </View>
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
  buttonsContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    height: normalize(48),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(15),
    width: normalize(48),
    zIndex: 10
  },
  callout: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 5,
    padding: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  calloutContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  calloutTriangel: {
    alignSelf: 'center',
    borderLeftColor: colors.transparent,
    borderLeftWidth: 10,
    borderRightColor: colors.transparent,
    borderRightWidth: 10,
    borderTopColor: colors.surface,
    borderTopWidth: 10,
    height: 0,
    marginTop: -1,
    width: 0
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
