import React, { useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { normalize } from 'react-native-elements';
import MapView, { MAP_TYPES, Marker, UrlTile } from 'react-native-maps';
import { SvgXml } from 'react-native-svg';

import { colors, device } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { MapMarker } from '../../types';

type Props = {
  locations?: MapMarker[];
  mapCenterPosition?: { lat: number; lng: number };
  mapStyle?: StyleProp<ViewStyle>;
  onMapPress?: () => void;
  onMarkerPress: (arg0?: string) => void;
  style?: StyleProp<ViewStyle>;
  zoom?: number;
};

const MARKER_ICON_SIZE = normalize(40);
const LATITUDE_DELTA = 0.0922;
// example for longitude delta: https://github.com/react-native-maps/react-native-maps/blob/master/example/examples/DisplayLatLng.js#L18
const LONGITUDE_DELTA = LATITUDE_DELTA * (device.width / (device.height / 2));

export const Map = ({
  locations,
  mapCenterPosition,
  style,
  mapStyle,
  onMarkerPress,
  onMapPress,
  zoom
}: Props) => {
  const refForMapView = useRef<MapView>(null);
  const [showsUserLocation, setShowsUserLocation] = useState(true);
  const initialRegion = mapCenterPosition
    ? {
        latitude: mapCenterPosition.lat,
        longitude: mapCenterPosition.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    : locations?.[0]
    ? {
        latitude: locations[0].position.lat,
        longitude: locations[0].position.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    : undefined;

  return (
    <View style={[stylesForMap().container, style]}>
      <MapView
        initialRegion={initialRegion}
        mapType={device.platform === 'android' ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
        maxZoomLevel={zoom}
        onPress={onMapPress}
        ref={refForMapView}
        rotateEnabled={false}
        showsUserLocation={showsUserLocation}
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
          urlTemplate="https://a.tile.opentopomap.org/{z}/{x}/{y}.png"
          shouldReplaceMapContent={device.platform === 'ios'}
        />
        {locations?.map((marker, index) => (
          <Marker
            identifier={marker.id}
            key={`${index}-${marker.id}`}
            coordinate={{ latitude: marker.position?.lat, longitude: marker.position?.lng }}
            onPress={() => onMarkerPress(marker.id)}
          >
            <SvgXml xml={marker.icon} width={MARKER_ICON_SIZE} height={MARKER_ICON_SIZE} />
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that eslint warning */
// the map should have the same aspect ratio as images.
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten bei server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForMap = () => {
  const width = imageWidth();

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: colors.lightestText,
      flex: 1,
      justifyContent: 'center'
    },
    map: {
      alignSelf: 'center',
      height: imageHeight(width),
      width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
