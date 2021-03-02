import React, { useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { MapMarker, WebViewLeaflet, WebviewLeafletMessage } from 'react-native-webview-leaflet';

import { colors } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';

type Props = {
  locations?: MapMarker[];
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
  zoom = 10
}: Props) => {
  const messageHandler = useCallback(
    (message) => {
      onMessageReceived?.(message);
    },
    [onMessageReceived]
  );

  return (
    <View style={style || stylesForMap().defaultStyle}>
      <WebViewLeaflet
        backgroundColor={colors.lightestText}
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

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that eslint warning */
// the map should have the same aspect ratio as images.
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten bei server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForMap = () => {
  const width = imageWidth();

  return StyleSheet.create({
    defaultStyle: {
      alignSelf: 'center',
      height: imageHeight(width),
      width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
