/* eslint-disable react-native/no-color-literals */
import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { MapMarker, WebViewLeaflet, WebviewLeafletMessage } from 'react-native-webview-leaflet';

type Props = {
  locations: MapMarker[];
  mapCenterPosition?: {
    lat: number;
    lng: number;
  };
  onMessageReceived?: (message: WebviewLeafletMessage) => void;
  style?: StyleProp<ViewStyle>;
  zoom?: number;
};

export const WebViewMap = ({
  locations,
  mapCenterPosition,
  onMessageReceived,
  style,
  zoom
}: Props) => {
  const messageHandler = useCallback(
    (message) => {
      onMessageReceived?.(message);
    },
    [onMessageReceived]
  );

  return (
    <View style={[styles.map, style]}>
      <WebViewLeaflet
        backgroundColor={'gray'}
        onMessageReceived={messageHandler}
        mapLayers={[
          {
            attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            baseLayerIsChecked: true,
            baseLayerName: 'OpenStreetMap.Mapnik',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        ]}
        mapMarkers={locations}
        mapCenterPosition={mapCenterPosition ?? locations?.[0]?.position}
        zoom={zoom}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    aspectRatio: 16 / 9,
    width: '100%'
  }
});
