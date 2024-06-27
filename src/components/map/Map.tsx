/* eslint-disable complexity */
import _upperFirst from 'lodash/upperFirst';
import React, { useContext, useRef } from 'react';
import { PixelRatio, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView from 'react-native-map-clustering';
import { LatLng, MAP_TYPES, Marker, Polyline, Region, UrlTile } from 'react-native-maps';

import { colors, device, Icon, IconUrl, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { useLocationSettings } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { RegularText } from '../Text';

type Props = {
  clusteringEnabled?: boolean;
  geometryTourData?: LatLng[];
  isMaximizeButtonVisible?: boolean;
  isMultipleMarkersMap?: boolean;
  locations?: MapMarker[];
  logoContainerStyle?: StyleProp<ViewStyle>;
  mapCenterPosition?: { latitude: number; longitude: number };
  mapStyle?: StyleProp<ViewStyle>;
  onMapPress?: ({ nativeEvent }: { nativeEvent?: any }) => void;
  onMarkerPress?: (arg0?: string) => void;
  onMaximizeButtonPress?: () => void;
  selectedMarker?: string;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
};

const isSmallerPixelRatio = PixelRatio.get() <= 2;
const isTablet = device.isTablet;
const MARKER_ICON_SIZE = isSmallerPixelRatio ? normalize(50) : normalize(40);
const CIRCLE_SIZES = [60, 50, 40, 30];

export const MapIcon = ({
  iconColor = colors.lighterPrimary,
  iconName = 'location',
  iconSize = MARKER_ICON_SIZE,
  iconStrokeColor = colors.darkerPrimary,
  iconStrokeWidth = 1.5
}: {
  iconColor?: string;
  iconName?: string;
  iconSize?: number;
  iconStrokeColor?: string;
  iconStrokeWidth?: number;
}) => {
  const MarkerIcon = Icon[_upperFirst(iconName) as keyof typeof Icon];

  return (
    <MarkerIcon
      color={iconColor}
      size={iconSize}
      strokeColor={iconStrokeColor}
      strokeWidth={iconStrokeWidth}
    />
  );
};

type TCluster = {
  clusterColor: string;
  geometry: { coordinates: [number, number] };
  id: string;
  onPress: () => void;
  properties: { point_count: number };
};

const renderCluster = (cluster: TCluster) => {
  const { clusterColor: backgroundColor, geometry, id, onPress, properties = {} } = cluster;
  const { point_count: points } = properties;

  return (
    <Marker
      key={`cluster-${id}`}
      coordinate={{
        longitude: geometry.coordinates[0],
        latitude: geometry.coordinates[1]
      }}
      style={styles.clusterMarker}
      // onPress={onPress} // HINT: https://github.com/venits/react-native-map-clustering/issues/251
    >
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
          <RegularText center smallest>
            {points}
          </RegularText>
        </View>
      ))}
    </Marker>
  );
};

export const Map = ({
  clusteringEnabled = false,
  geometryTourData,
  isMaximizeButtonVisible = false,
  isMultipleMarkersMap = false,
  locations,
  logoContainerStyle,
  mapCenterPosition,
  mapStyle,
  onMapPress,
  onMarkerPress,
  onMaximizeButtonPress,
  selectedMarker,
  style,
  ...otherProps
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { zoomLevelForMaps = {}, locationService = {} } = settings;
  const { locationSettings } = useLocationSettings();

  const showsUserLocation =
    locationSettings?.locationService ?? otherProps.showsUserLocation ?? !!locationService;
  const zoom = isMultipleMarkersMap
    ? zoomLevelForMaps.multipleMarkers
    : zoomLevelForMaps.singleMarker;

  const refForMapView = useRef<MapView>(null);
  // LATITUDE_DELTA handles the zoom, see: https://github.com/react-native-maps/react-native-maps/issues/2129#issuecomment-457056572
  const LATITUDE_DELTA = zoom || 0.0922;
  // example for longitude delta: https://github.com/react-native-maps/react-native-maps/blob/0.30.x/example/examples/DisplayLatLng.js#L18
  const LONGITUDE_DELTA = LATITUDE_DELTA * (device.width / (device.height / 2));

  // center of Germany
  let initialRegion: Region = {
    latitude: 51.1657,
    longitude: 10.4515,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
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

  return (
    <View style={[styles.container, style]}>
      <MapView
        clusterColor={colors.surface}
        clusteringEnabled={clusteringEnabled}
        renderCluster={renderCluster}
        initialRegion={initialRegion}
        mapType={device.platform === 'android' ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
        onPress={onMapPress}
        ref={refForMapView}
        rotateEnabled={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        style={[stylesForMap().map, mapStyle]}
        userLocationPriority="balanced"
        mapPadding={{
          top: 0,
          right: 0,
          bottom: -normalize(30),
          left: 0
        }}
        legalLabelInsets={{
          top: 0,
          right: 0,
          bottom: normalize(10),
          left: 0
        }}
      >
        <UrlTile
          urlTemplate="https://tileserver-gl.smart-village.app/styles/osm-liberty/{z}/{x}/{y}.png"
          shouldReplaceMapContent={device.platform === 'ios'}
        />
        {!!geometryTourData?.length && (
          <Polyline
            coordinates={geometryTourData}
            strokeColor={colors.primary}
            strokeWidth={2}
            zIndex={1}
          />
        )}
        {/* eslint-disable complexity */}
        {locations?.map((marker, index) => {
          const isActiveMarker = selectedMarker && marker.id === selectedMarker;

          return (
            <Marker
              centerOffset={
                marker.iconAnchor || {
                  x: 0,
                  y: -(MARKER_ICON_SIZE / (isActiveMarker ? 1.75 : 3.6))
                }
              }
              coordinate={marker.position}
              identifier={marker.id}
              key={`${index}-${marker.id}`}
              onPress={() => onMarkerPress?.(marker.id)}
              zIndex={isActiveMarker ? 1010 : 1}
              cluster={marker.iconName != 'ownLocation'}
            >
              {!!marker.iconName && marker.iconName != 'ownLocation' ? (
                <>
                  <MapIcon
                    iconColor={isActiveMarker ? colors.secondary : colors.lighterPrimary}
                    iconName={isActiveMarker ? 'locationActive' : 'location'}
                    iconSize={MARKER_ICON_SIZE * (isActiveMarker ? 1.4 : 1.1)}
                  />
                  <View
                    style={[
                      styles.mapIconOnLocationMarkerContainer,
                      isActiveMarker ? styles.mapIconOnLocationMarkerContainerActive : undefined
                    ]}
                  >
                    <View
                      style={[
                        styles.mapIconOnLocationMarker,
                        isActiveMarker ? styles.mapIconOnLocationMarkerActive : undefined
                      ]}
                    >
                      <IconUrl
                        color={colors.primary}
                        iconName={marker.iconName}
                        size={
                          (MARKER_ICON_SIZE /
                            (!isTablet && isSmallerPixelRatio
                              ? normalize(1.95)
                              : normalize(2.35))) *
                          (isActiveMarker ? normalize(1.1) : normalize(0.9))
                        }
                      />
                    </View>
                  </View>
                </>
              ) : (
                <MapIcon
                  iconColor={
                    marker.iconName == 'ownLocation'
                      ? colors.lighterPrimary
                      : isActiveMarker
                      ? colors.secondary
                      : colors.lighterPrimary
                  }
                  iconName={isActiveMarker ? 'locationActive' : marker.iconName}
                  iconSize={MARKER_ICON_SIZE * (isActiveMarker ? 1.4 : 1.1)}
                />
              )}
            </Marker>
          );
        })}
      </MapView>
      {/* eslint-enable complexity */}
      {isMaximizeButtonVisible && (
        <TouchableOpacity style={styles.maximizeMapButton} onPress={onMaximizeButtonPress}>
          <Icon.ExpandMap size={normalize(18)} />
        </TouchableOpacity>
      )}
      {device.platform === 'android' && (
        <View style={[styles.logoContainer, logoContainerStyle]}>
          <RegularText smallest>© OpenStreetMap</RegularText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    bottom: 0,
    height: normalize(30),
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    width: normalize(110),
    zIndex: 1
  },
  mapIconOnLocationMarker: {
    alignSelf: 'center',
    bottom: normalize(5),
    backgroundColor: colors.lighterPrimary
  },
  mapIconOnLocationMarkerActive: {
    backgroundColor: colors.secondary,
    bottom: 0
  },
  mapIconOnLocationMarkerContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: isSmallerPixelRatio ? normalize(13) : normalize(11),
    backgroundColor: colors.transparent
  },
  mapIconOnLocationMarkerContainerActive: {
    top: isSmallerPixelRatio ? normalize(11) : normalize(10)
  },
  maximizeMapButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    bottom: normalize(15),
    height: normalize(48),
    justifyContent: 'center',
    opacity: 0.6,
    position: 'absolute',
    right: normalize(15),
    width: normalize(48),
    zIndex: 1
  }
});

// the map should have the same aspect ratio as images in portrait and a full width on landscape.
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten by server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForMap = () => {
  return StyleSheet.create({
    // eslint-disable-next-line react-native/no-unused-styles
    map: {
      alignSelf: 'center',
      height: imageHeight(imageWidth(), { HEIGHT: 272, WIDTH: 362 }),
      width: device.width - 2 * normalize(16)
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
