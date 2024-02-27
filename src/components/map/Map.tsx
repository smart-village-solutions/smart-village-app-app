/* eslint-disable complexity */
import _upperFirst from 'lodash/upperFirst';
import React, { useContext, useRef } from 'react';
import { PixelRatio, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView, { LatLng, MAP_TYPES, Marker, Polyline, Region, UrlTile } from 'react-native-maps';

import { colors, device, Icon, IconUrl, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { RegularText } from '../Text';

type Props = {
  geometryTourData?: LatLng[];
  isMaximizeButtonVisible?: boolean;
  isMultipleMarkersMap?: boolean;
  locations?: MapMarker[];
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
const MARKER_ICON_SIZE = isSmallerPixelRatio ? normalize(50) : normalize(40);
const isBiggerPhoneWithSmallerPixelRatio = device.width === 414 && isSmallerPixelRatio;
const isSmallerPhoneWithLargerPixelRatio = device.width < 400 && !isSmallerPixelRatio;

export const MapIcon = ({
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

export const Map = ({
  geometryTourData,
  isMaximizeButtonVisible = false,
  isMultipleMarkersMap = false,
  locations,
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

  const showsUserLocation = otherProps.showsUserLocation ?? !!locationService;
  const zoom = isMultipleMarkersMap
    ? zoomLevelForMaps.multipleMarkers
    : zoomLevelForMaps.singleMarker;

  const refForMapView = useRef<MapView>(null);
  // LATITUDE_DELTA handles the zoom, see: https://github.com/react-native-maps/react-native-maps/issues/2129#issuecomment-457056572
  const LATITUDE_DELTA = zoom || 0.0922;
  // example for longitude delta: https://github.com/react-native-maps/react-native-maps/blob/0.30.x/example/examples/DisplayLatLng.js#L18
  const LONGITUDE_DELTA = LATITUDE_DELTA * (device.width / (device.height / 2));

  let initialRegion: Region = {
    latitude: 0,
    longitude: 0,
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
        initialRegion={initialRegion}
        mapType={device.platform === 'android' ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
        onPress={onMapPress}
        ref={refForMapView}
        rotateEnabled={false}
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
          urlTemplate="https://tile-server.sva-services.customer.planetary-quantum.net/tile/{z}/{x}/{y}.png"
          shouldReplaceMapContent={device.platform === 'ios'}
        />
        {!!geometryTourData?.length && (
          <Polyline
            coordinates={geometryTourData}
            strokeWidth={2}
            strokeColor={colors.primary}
            zIndex={1}
          />
        )}
        {locations?.map((marker, index) => {
          const isActiveMarker = selectedMarker && marker.id === selectedMarker;

          return (
            <Marker
              centerOffset={
                marker.iconAnchor || {
                  x: 0,
                  y: -(MARKER_ICON_SIZE / (isActiveMarker && PixelRatio.get() > 2 ? 1.75 : 2))
                }
              }
              coordinate={marker.position}
              identifier={marker.id}
              key={`${index}-${marker.id}`}
              onPress={() => onMarkerPress?.(marker.id)}
              zIndex={isActiveMarker ? 1010 : 1}
            >
              {!!marker.iconName && marker.iconName != 'ownLocation' ? (
                <>
                  <MapIcon
                    iconColor={isActiveMarker ? colors.primary : colors.lighterPrimary}
                    iconName={isActiveMarker ? 'locationActive' : 'location'}
                    iconSize={isActiveMarker ? MARKER_ICON_SIZE * normalize(1.4) : MARKER_ICON_SIZE}
                  />
                  <View
                    style={[
                      styles.mapIconOnLocationMarker,
                      isActiveMarker ? styles.mapIconOnLocationMarkerActive : undefined
                    ]}
                  >
                    <IconUrl
                      color={isActiveMarker ? colors.lighterPrimary : colors.primary}
                      iconName={marker.iconName}
                      size={
                        MARKER_ICON_SIZE / (isSmallerPixelRatio ? normalize(2.95) : normalize(2.5))
                      }
                    />
                  </View>
                </>
              ) : (
                <MapIcon
                  iconColor={
                    marker.iconName == 'ownLocation'
                      ? colors.primary
                      : isActiveMarker
                      ? colors.primary
                      : colors.lighterPrimary
                  }
                  iconName={marker.iconName ? marker.iconName : undefined}
                />
              )}
            </Marker>
          );
        })}
      </MapView>
      {isMaximizeButtonVisible && (
        <TouchableOpacity style={styles.maximizeMapButton} onPress={onMaximizeButtonPress}>
          <Icon.ExpandMap size={normalize(18)} />
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

const styles = StyleSheet.create({
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
    width: normalize(100),
    zIndex: 1
  },
  mapIconOnLocationMarker: {
    backgroundColor: colors.lighterPrimary,
    left: MARKER_ICON_SIZE / (isBiggerPhoneWithSmallerPixelRatio ? 3 : 3.25),
    position: 'absolute',
    top: MARKER_ICON_SIZE / (isBiggerPhoneWithSmallerPixelRatio ? 4 : 4.2)
  },
  mapIconOnLocationMarkerActive: {
    backgroundColor: colors.primary,
    left:
      (MARKER_ICON_SIZE * 1.4) /
      (isBiggerPhoneWithSmallerPixelRatio
        ? 3.2
        : isSmallerPhoneWithLargerPixelRatio
        ? 2.85
        : isSmallerPixelRatio
        ? 3.9
        : 2.45),
    top:
      (MARKER_ICON_SIZE * 1.4) /
      (isBiggerPhoneWithSmallerPixelRatio || isSmallerPhoneWithLargerPixelRatio
        ? 7
        : isSmallerPixelRatio
        ? 9.75
        : 5.75)
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
