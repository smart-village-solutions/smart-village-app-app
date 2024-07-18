import MapLibreGL from '@maplibre/maplibre-react-native';
import _upperFirst from 'lodash/upperFirst';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Supercluster from 'supercluster';

import { colors, device, Icon, normalize } from '../../config';
import { imageHeight, imageWidth, truncateText } from '../../helpers';
import { useLocationSettings } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { LoadingSpinnerMap } from '../LoadingSpinnerMap';
import { RegularText } from '../Text';

type Props = {
  calloutTextEnabled?: boolean;
  clusterDistance?: number;
  clusteringEnabled?: boolean;
  geometryTourData?: LatLng[];
  isMaximizeButtonVisible?: boolean;
  isMyLocationButtonVisible?: boolean;
  locations?: MapMarker[];
  mapCenterPosition?: { latitude: number; longitude: number };
  mapStyle?: StyleProp<ViewStyle>;
  minZoom?: number;
  onMapPress?: ({ nativeEvent }: { nativeEvent?: any }) => void;
  onMarkerPress?: (arg0?: string) => void;
  onMaximizeButtonPress?: () => void;
  onMyLocationButtonPress?: () => void;
  selectedMarker?: string;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
  updatedRegion?: Region;
};

const CIRCLE_SIZES = [normalize(60), normalize(50), normalize(40), normalize(30)];
const DEFAULT_ZOOM_LEVEL = 14;
const HITBOX_SIZE = normalize(80);
const MARKER_ICON_SIZE = normalize(40);
const MAX_ZOOM_LEVEL = 20;
const ONE_MARKER_ZOOM_LEVEL = 15;
const TIMEOUT_CLUSTER = 1000;
const TIMEOUT_SINGLE_MARKER = 4000;

const MapIcon = ({
  iconColor,
  iconName = 'location',
  iconSize = MARKER_ICON_SIZE
}: {
  iconColor?: string;
  iconName?: string;
  iconSize?: number;
}) => {
  const MarkerIcon = Icon[_upperFirst(iconName) as keyof typeof Icon];

  return <MarkerIcon color={iconColor} size={iconSize} />;
};

const renderCluster = (cluster) => {
  const { clusterColor: backgroundColor, geometry, id, onPress, properties = {} } = cluster;
  const { point_count } = properties;

  return (
    <MapLibreGL.PointAnnotation
      key={`cluster-${id}`}
      id={`cluster-${id}`}
      coordinate={geometry.coordinates}
      onSelected={onPress}
    >
      <View style={styles.hitbox}>
        {CIRCLE_SIZES.map((size, index) => (
          <View
            key={`circle-${index}`}
            style={[
              styles.clusterCircle,
              {
                backgroundColor,
                borderRadius: normalize(size / 2),
                height: normalize(size),
                opacity: 0.2 * (index + 1),
                width: normalize(size)
              }
            ]}
          >
            <RegularText lightest center smallest>
              {point_count}
            </RegularText>
          </View>
        ))}
      </View>
    </MapLibreGL.PointAnnotation>
  );
};

/* eslint-disable complexity */
// calculate the bounds of the map to fit all markers
const calculateBounds = (coordinates) => {
  const [minLng, minLat] = coordinates.reduce(
    (prev, curr) => [Math.min(prev[0], curr[0]), Math.min(prev[1], curr[1])],
    [Infinity, Infinity]
  );

  const [maxLng, maxLat] = coordinates.reduce(
    (prev, curr) => [Math.max(prev[0], curr[0]), Math.max(prev[1], curr[1])],
    [-Infinity, -Infinity]
  );

  const deltaLng = (maxLng - minLng) * 0.1;
  const deltaLat = (maxLat - minLat) * 0.1;

  return { minLng, minLat, maxLng, maxLat, deltaLng, deltaLat };
};

export const Map = ({
  calloutTextEnabled = false,
  clusterDistance = 50,
  clusteringEnabled = true,
  geometryTourData,
  isMaximizeButtonVisible = false,
  isMyLocationButtonVisible = false,
  locations = [],
  mapCenterPosition,
  mapStyle,
  minZoom,
  onMapPress,
  onMarkerPress,
  onMaximizeButtonPress,
  onMyLocationButtonPress,
  selectedMarker,
  showsUserLocation = false,
  style,
  updatedRegion,
  ...otherProps
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { locationSettings } = useLocationSettings();
  const refForMapView = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const superclusterRef = useRef(null); // Add this line
  const [clusters, setClusters] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM_LEVEL);
  const [isInitialFit, setIsInitialFit] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const showsUserLocationSetting =
    locationSettings?.locationService ?? otherProps.showsUserLocation ?? showsUserLocation;

  // center of Germany
  let initialRegion: { latitude: number; longitude: number } = {
    latitude: 51.1657,
    longitude: 10.4515
  };

  if (locations?.[0]?.position?.latitude && locations[0]?.position?.longitude) {
    initialRegion = {
      ...initialRegion,
      latitude: locations[0].position.latitude,
      longitude: locations[0].position.longitude
    };
  }

  if (mapCenterPosition) {
    initialRegion = {
      ...initialRegion,
      ...mapCenterPosition
    };
  }

  const mapLocations = () => {
    return locations.map((location, index) => ({
      type: 'Feature',
      properties: { cluster: false, id: location.id, index },
      geometry: {
        type: 'Point',
        coordinates: [location.position.longitude, location.position.latitude]
      }
    }));
  };

  useEffect(() => {
    if (clusteringEnabled) {
      const index = new Supercluster({
        radius: clusterDistance,
        maxZoom: MAX_ZOOM_LEVEL
      });

      const points = mapLocations();

      index.load(points);
      superclusterRef.current = index; // Store the Supercluster instance in the ref
      const bounds = [2, 46, 18, 56];
      setClusters(index.getClusters(bounds, zoomLevel));
    } else {
      setClusters(mapLocations());
    }

    if (locations.length > 0 && isInitialFit) {
      const coordinates = locations.map((loc) => [loc.position.longitude, loc.position.latitude]);
      if (locations.length === 1) {
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: coordinates[0],
            zoomLevel: ONE_MARKER_ZOOM_LEVEL,
            animationDuration: 0
          });
          setTimeout(() => {
            setIsLoading(false);
          }, TIMEOUT_SINGLE_MARKER);
          setIsInitialFit(false);
        }
      } else if (coordinates && coordinates.length > 0) {
        const { minLng, minLat, maxLng, maxLat, deltaLng, deltaLat } = calculateBounds(coordinates);
        if (cameraRef.current) {
          cameraRef.current.fitBounds(
            [minLng - deltaLng, minLat - deltaLat],
            [maxLng + deltaLng, maxLat + deltaLat],
            0
          );
          if (clusteringEnabled) {
            setTimeout(() => {
              setIsLoading(false);
            }, TIMEOUT_CLUSTER);
            setIsInitialFit(false);
          } else {
            setTimeout(() => {
              setIsLoading(false);
            }, TIMEOUT_SINGLE_MARKER);
            setIsInitialFit(false);
          }
        }
      }
    }
  }, [locations, clusterDistance, zoomLevel, isInitialFit, clusteringEnabled]);

  useEffect(() => {
    if (updatedRegion && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [updatedRegion.longitude, updatedRegion.latitude],
        zoomLevel: DEFAULT_ZOOM_LEVEL,
        animationDuration: 1000
      });
    }
  }, [updatedRegion]);

  const handleMapPress = (event) => {
    if (onMapPress) {
      const { geometry } = event;
      const nativeEvent = {
        coordinate: {
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0]
        }
      };
      onMapPress({ nativeEvent });
    }
  };

  const handleClusterPress = useCallback(
    (cluster) => {
      if (isAnimating) return;

      setIsAnimating(true);
      const [longitude, latitude] = cluster.geometry.coordinates;

      if (superclusterRef.current) {
        const expansionZoom = superclusterRef.current.getClusterExpansionZoom(cluster.id);

        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: [longitude, latitude],
            zoomLevel: expansionZoom,
            animationDuration: 1000
          });
        }
      }

      setTimeout(() => {
        setIsAnimating(false);
      }, TIMEOUT_CLUSTER);
    },
    [isAnimating]
  );

  return (
    <View style={[styles.container, style]}>
      <LoadingSpinnerMap loading={isLoading} />
      <MapLibreGL.MapView
        style={[styles.map, mapStyle]}
        styleJSON="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
        onPress={handleMapPress}
        ref={refForMapView}
        onRegionDidChange={(region) => {
          const newZoomLevel = Math.round(region.properties.zoomLevel);
          if (typeof newZoomLevel === 'number' && !isNaN(newZoomLevel)) {
            setZoomLevel(newZoomLevel);
          }
        }}
        showUserLocation={showsUserLocationSetting}
      >
        <MapLibreGL.Camera ref={cameraRef} minZoomLevel={minZoom} />

        {clusters.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count } = cluster.properties;

          if (clusteringEnabled && isCluster) {
            return renderCluster({
              clusterColor: colors.primary,
              geometry: { coordinates: [longitude, latitude] },
              id: index,
              onPress: () => handleClusterPress(cluster),
              properties: { point_count }
            });
          }

          const marker = locations[cluster.properties.index];
          const isActiveMarker = selectedMarker && marker.id === selectedMarker;
          const serviceName = truncateText(marker.serviceName);
          const title = truncateText(marker.title);

          return (
            <MapLibreGL.PointAnnotation
              id={`${index}-${marker.id}`}
              coordinate={[marker.position.longitude, marker.position.latitude]}
              onSelected={() => onMarkerPress?.(marker.id)}
              key={`${index}-${marker.id}`}
            >
              <View style={styles.markerContainer}>
                {!!marker.iconName &&
                marker.iconName != 'ownLocation' &&
                marker.iconName != 'location' ? (
                  <>
                    <MapIcon
                      iconColor={
                        marker.iconBackgroundColor
                          ? isActiveMarker
                            ? marker.iconColor
                            : marker.iconBackgroundColor
                          : isActiveMarker
                          ? colors.accent
                          : undefined
                      }
                    />
                    <View
                      style={[
                        styles.mapIconOnLocationMarker,
                        isActiveMarker ? styles.mapIconOnLocationMarkerActive : undefined,
                        !!marker.iconBackgroundColor && {
                          backgroundColor: isActiveMarker
                            ? marker.iconColor
                            : marker.iconBackgroundColor
                        }
                      ]}
                    >
                      <MapIcon
                        iconColor={
                          marker.iconColor
                            ? isActiveMarker
                              ? colors.surface
                              : marker.iconColor
                            : colors.surface
                        }
                        iconName={marker.iconName}
                        iconSize={MARKER_ICON_SIZE / 3.25}
                      />
                    </View>
                  </>
                ) : (
                  <MapIcon
                    iconColor={isActiveMarker ? colors.accent : undefined}
                    iconName={marker.iconName ? marker.iconName : undefined}
                  />
                )}
                {calloutTextEnabled && (
                  <View style={styles.callout}>
                    {!!serviceName && (
                      <RegularText smallest center>
                        {serviceName}
                      </RegularText>
                    )}
                    {!!title && (
                      <RegularText smallest center>
                        {title}
                      </RegularText>
                    )}
                  </View>
                )}
              </View>
            </MapLibreGL.PointAnnotation>
          );
        })}
        {!!geometryTourData?.length && (
          <MapLibreGL.ShapeSource
            id="line1"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: geometryTourData.map((point) => [point.longitude, point.latitude])
              }
            }}
          >
            <MapLibreGL.LineLayer
              id="linelayer1"
              style={{ lineColor: colors.primary, lineWidth: 2 }}
            />
          </MapLibreGL.ShapeSource>
        )}
        {showsUserLocationSetting && <MapLibreGL.UserLocation visible />}
      </MapLibreGL.MapView>
      {isMaximizeButtonVisible && (
        <TouchableOpacity style={styles.maximizeMapButton} onPress={onMaximizeButtonPress}>
          <Icon.ExpandMap size={normalize(18)} />
        </TouchableOpacity>
      )}
      {isMyLocationButtonVisible && (
        <TouchableOpacity style={styles.myLocationButton} onPress={onMyLocationButtonPress}>
          <Icon.GPS size={normalize(18)} />
        </TouchableOpacity>
      )}
      {device.platform === 'android' && (
        <View style={styles.logoContainer}>
          <RegularText smallest>© OpenStreetMap</RegularText>
        </View>
      )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  callout: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(10),
    padding: normalize(5),
    width: normalize(120)
  },
  clusterCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute'
  },
  clusterMarker: {
    alignItems: 'center',
    height: normalize(60),
    justifyContent: 'center',
    width: normalize(60)
  },
  hitbox: {
    alignItems: 'center',
    height: normalize(HITBOX_SIZE),
    justifyContent: 'center',
    width: normalize(HITBOX_SIZE)
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    height: normalize(200),
    justifyContent: 'center',
    width: '100%'
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    bottom: 0,
    height: normalize(30),
    justifyContent: 'center',
    left: normalize(13),
    position: 'absolute',
    width: normalize(100)
  },
  mapIconOnLocationMarker: {
    backgroundColor: colors.primary,
    left: MARKER_ICON_SIZE / 2.9,
    position: 'absolute',
    top: MARKER_ICON_SIZE / 4.2
  },
  mapIconOnLocationMarkerActive: {
    backgroundColor: colors.accent
  },
  maximizeMapButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(50),
    bottom: normalize(35),
    height: normalize(48),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(15),
    width: normalize(48),
    zIndex: 1
  },
  myLocationButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(50),
    height: normalize(48),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(15),
    top: normalize(15),
    width: normalize(48),
    zIndex: 1
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  map: {
    height: '100%',
    width: '100%'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
// the map should have the same aspect ratio as images in portrait and a full width on landscape.
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten by server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForMap = () => {
  return StyleSheet.create({
    map: {
      alignSelf: 'center',
      height: imageHeight(imageWidth()),
      width: device.width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
