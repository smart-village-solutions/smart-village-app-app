import MapLibreGL, {
  Camera,
  LineLayer,
  MapView,
  PointAnnotation,
  ShapeSource,
  UserLocation
} from '@maplibre/maplibre-react-native';
import _upperFirst from 'lodash/upperFirst';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Supercluster from 'supercluster';

import { colors, device, Icon, normalize } from '../../config';
import {
  calculateBoundsToFitAllMarkers,
  imageHeight,
  imageWidth,
  truncateText
} from '../../helpers';
import { useLocationSettings } from '../../hooks';
import { MapMarker } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { RegularText } from '../Text';

type Props = {
  calloutTextEnabled?: boolean;
  clusterDistance?: number;
  clusteringEnabled?: boolean;
  geometryTourData?: MapMarker[];
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
  updatedRegion?: { latitude: number; longitude: number };
};

type TCluster = {
  cluster?: boolean;
  clusterColor: string;
  geometry: { coordinates: [number, number] };
  id: string | number;
  onPress: () => void;
  properties: { point_count?: string };
};

const CIRCLE_SIZES = [normalize(60), normalize(50), normalize(40), normalize(30)];
const ONE_MARKER_ZOOM_LEVEL = 15;
const DEFAULT_ZOOM_LEVEL = ONE_MARKER_ZOOM_LEVEL;
const HIT_BOX_SIZE = normalize(50);
const MARKER_ICON_SIZE = normalize(40);
const MAX_ZOOM_LEVEL = 20;

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

const renderCluster = (cluster: TCluster) => {
  const { clusterColor: backgroundColor, geometry, id, onPress, properties = {} } = cluster;
  const { point_count } = properties;

  return (
    <PointAnnotation
      coordinate={geometry.coordinates}
      id={`cluster-${id}`}
      key={`cluster-${id}`}
      onSelected={onPress}
      style={styles.hitBox}
    >
      <>
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
      </>
    </PointAnnotation>
  );
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
  const { locationSettings } = useLocationSettings();
  const cameraRef = useRef<typeof MapLibreGL.Camera>(null);
  const superClusterRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM_LEVEL);
  const [isInitialFit, setIsInitialFit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const showsUserLocationSetting =
    locationSettings?.locationService ?? otherProps.showsUserLocation ?? showsUserLocation;

  const mapLocations = useMemo(
    () =>
      locations.map((location, index) => ({
        ...location,
        type: 'Feature',
        properties: { cluster: false, id: location.id, index },
        geometry: {
          type: 'Point',
          coordinates: [location.position.longitude, location.position.latitude]
        }
      })),
    [locations]
  );

  useEffect(() => {
    setTimeout(() => {
      if (clusteringEnabled && mapLocations.length > 1) {
        const index = new Supercluster({
          radius: clusterDistance,
          maxZoom: MAX_ZOOM_LEVEL
        });

        /**
         * the values represent the maximum possible latitude and longitude values for the earth's
         * coordinate system, defining a rectangular area that covers the entire world.
         * The values are based on the following assumptions:
         * Westernmost longitude: 2° E (covering parts of France and the Netherlands)
         * Easternmost longitude: 18° E (covering parts of Poland and the Czech Republic)
         * Northernmost latitude: 56° N (covering parts of Denmark)
         * Southernmost latitude: 46° N (covering parts of Switzerland and Austria)
         */
        const bounds = [2, 46, 18, 56];
        const points = mapLocations;

        index.load(points);
        superClusterRef.current = index; // Store the Supercluster instance in the ref

        setMarkers(index.getClusters(bounds, zoomLevel));
      } else {
        setMarkers(mapLocations);
      }
    }, 500);
  }, [clusteringEnabled, mapLocations, clusterDistance, zoomLevel]);

  useEffect(() => {
    if (markers.length > 0 && isInitialFit) {
      const coordinates = locations.map((location) => [
        location.position.longitude,
        location.position.latitude
      ]);

      if (coordinates.length === 1) {
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            animationDuration: 1000,
            centerCoordinate: coordinates[0],
            zoomLevel: ONE_MARKER_ZOOM_LEVEL
          });
        }
      } else {
        const { minLng, minLat, maxLng, maxLat, deltaLng, deltaLat } =
          calculateBoundsToFitAllMarkers(coordinates);

        if (cameraRef.current) {
          cameraRef.current.fitBounds(
            [minLng - deltaLng, minLat - deltaLat],
            [maxLng + deltaLng, maxLat + deltaLat],
            0
          );
        }
      }

      setIsInitialFit(false);
    }
  }, [markers, isInitialFit]);

  useEffect(() => {
    if (updatedRegion && cameraRef.current) {
      cameraRef.current.setCamera({
        animationDuration: 1000,
        centerCoordinate: [updatedRegion.longitude, updatedRegion.latitude],
        zoomLevel: DEFAULT_ZOOM_LEVEL
      });
    }
  }, [updatedRegion]);

  const handleMapPress = useCallback(
    (coordinate) => {
      if (onMapPress) {
        const nativeEvent = {
          coordinate: {
            latitude: coordinate.geometry.coordinates[1],
            longitude: coordinate.geometry.coordinates[0]
          }
        };

        onMapPress({ nativeEvent });
      }
    },
    [onMapPress]
  );

  const handleClusterPress = useCallback((cluster: TCluster) => {
    const expansionZoom = superClusterRef?.current?.getClusterExpansionZoom(cluster.id);

    if (cameraRef.current && expansionZoom) {
      cameraRef.current.setCamera({
        animationDuration: 1000,
        centerCoordinate: cluster.geometry.coordinates,
        zoomLevel: expansionZoom
      });
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      <LoadingSpinner containerStyle={styles.loadingContainer} loading={isLoading} />
      <MapView
        attributionEnabled={false}
        onDidFinishLoadingMap={() => setIsLoading(false)}
        onPress={handleMapPress}
        onRegionDidChange={(region) => {
          const newZoomLevel = Math.round(region.properties.zoomLevel);

          if (typeof newZoomLevel === 'number' && newZoomLevel !== zoomLevel) {
            onMarkerPress?.(undefined);
            setZoomLevel(newZoomLevel);
          }
        }}
        rotateEnabled={false}
        style={[stylesForMap().map, mapStyle]}
        styleJSON="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
      >
        <Camera ref={cameraRef} minZoomLevel={minZoom} />

        {markers.map((marker, index) => {
          const [longitude, latitude] = marker.geometry.coordinates;
          const { id, properties = {} } = marker;
          const { cluster: isCluster } = properties;

          if (clusteringEnabled && isCluster) {
            return renderCluster({
              clusterColor: colors.primary,
              geometry: { coordinates: [longitude, latitude] },
              id,
              onPress: () => handleClusterPress(marker),
              properties: marker.properties
            });
          }

          const isActiveMarker = selectedMarker && id === selectedMarker;
          const serviceName = truncateText(marker?.serviceName);
          const title = truncateText(marker?.title);

          return (
            <PointAnnotation
              anchor={{ x: 0.5, y: 1 }}
              coordinate={[marker.position.longitude, marker.position.latitude]}
              id={`${index}-${marker.id}`}
              key={`${index}-${marker.id}`}
              onSelected={() => onMarkerPress?.(marker.id)}
            >
              <>
                {calloutTextEnabled && isActiveMarker && (
                  <View style={styles.callout}>
                    <View style={styles.calloutTriangle} />
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
                </View>
              </>
            </PointAnnotation>
          );
        })}

        {!!geometryTourData?.length && (
          <ShapeSource
            id="line1"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: geometryTourData.map((point) => [point.longitude, point.latitude])
              }
            }}
          >
            <LineLayer id="linelayer1" style={{ lineColor: colors.primary, lineWidth: 2 }} />
          </ShapeSource>
        )}

        {showsUserLocationSetting && <UserLocation visible />}
      </MapView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  callout: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: normalize(10),
    bottom: normalize(55),
    padding: normalize(5),
    position: 'absolute',
    width: normalize(120)
  },
  calloutTriangle: {
    backgroundColor: colors.surface,
    borderRadius: normalize(5),
    bottom: normalize(-10),
    height: normalize(30),
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: normalize(30)
  },
  clusterCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute'
  },
  hitBox: {
    borderRadius: normalize(HIT_BOX_SIZE / 2),
    height: normalize(HIT_BOX_SIZE),
    width: normalize(HIT_BOX_SIZE)
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    zIndex: 1
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
    bottom: normalize(15),
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
    justifyContent: 'center',
    zIndex: 1
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
