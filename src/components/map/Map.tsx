import React, { useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { normalize } from 'react-native-elements';
import MapView, { MAP_TYPES, Marker, UrlTile } from 'react-native-maps';
import { SvgXml } from 'react-native-svg';

import { colors, device } from '../../config';
import { MapMarker } from '../../types';

type Props = {
  locations?: MapMarker[];
  mapCenterPosition?: {
    lat: number;
    lng: number;
  };
  style?: StyleProp<ViewStyle>;
  onMarkerPress: (arg0?: string) => void;
};

const MARKER_ICON_SIZE = normalize(40);
const LATITUDE_DELTA = 0.0922;
// example for longitude delta: https://github.com/react-native-maps/react-native-maps/blob/master/example/examples/DisplayLatLng.js#L18
const LONGITUDE_DELTA = LATITUDE_DELTA * (device.width / (device.height / 2));

export const Map = ({ locations, mapCenterPosition, style, onMarkerPress }: Props) => {
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
    <View style={[style, styles.container]}>
      <MapView
        ref={refForMapView}
        style={styles.map}
        mapType={device.platform === 'android' ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        userLocationPriority="balanced"
        rotateEnabled={false}
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.lightestText,
    flex: 1,
    justifyContent: 'center'
  },
  map: {
    height: device.height / 2,
    width: device.width
  }
});
