import React, { useContext, useRef } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView, { LatLng, MAP_TYPES, Marker, Polyline, Region, UrlTile } from 'react-native-maps';
import { SvgXml } from 'react-native-svg';

import { colors, device, Icon, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';

type Props = {
  geometryTourData?: LatLng[];
  isMaximizeButtonVisible?: boolean;
  locations?: MapMarker[];
  mapCenterPosition?: { latitude: number; longitude: number };
  mapStyle?: StyleProp<ViewStyle>;
  onMapPress?: () => void;
  onMarkerPress?: (arg0?: string) => void;
  onMaximizeButtonPress?: () => void;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
  zoom?: number;
};

const MARKER_ICON_SIZE = normalize(40);

export const Map = ({
  geometryTourData,
  isMaximizeButtonVisible,
  locations,
  mapCenterPosition,
  mapStyle,
  onMapPress,
  onMarkerPress,
  onMaximizeButtonPress,
  style,
  zoom = 0,
  ...otherProps
}: Props) => {
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

  if (mapCenterPosition) {
    initialRegion = {
      ...initialRegion,
      ...mapCenterPosition
    };
  }

  if (locations?.[0]?.position?.latitude && locations[0]?.position?.longitude) {
    initialRegion = {
      ...initialRegion,
      latitude: locations[0].position.latitude,
      longitude: locations[0].position.longitude
    };
  }

  const { globalSettings } = useContext(SettingsContext);
  const showsUserLocation =
    otherProps.showsUserLocation ?? !!globalSettings?.settings?.locationService;

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
        {locations?.map((marker, index) => (
          <Marker
            identifier={marker.id}
            key={`${index}-${marker.id}`}
            coordinate={marker.position}
            onPress={() => {
              if (onMarkerPress) {
                onMarkerPress(marker.id);
              }
            }}
          >
            <SvgXml xml={marker.icon} width={MARKER_ICON_SIZE} height={MARKER_ICON_SIZE} />
          </Marker>
        ))}
      </MapView>
      {isMaximizeButtonVisible && (
        <TouchableOpacity style={styles.maximizeMapButton} onPress={onMaximizeButtonPress}>
          <Icon.ExpandMap size={normalize(18)} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.lightestText,
    flex: 1,
    justifyContent: 'center'
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
      height: imageHeight(imageWidth()),
      width: device.width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
