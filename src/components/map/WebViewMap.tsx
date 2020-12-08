import React, { useCallback } from 'react';
import { Dimensions, StyleProp, View, ViewStyle } from 'react-native';
import { MapMarker, WebViewLeaflet, WebviewLeafletMessage } from 'react-native-webview-leaflet';

import { colors } from '../../config';

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
  zoom
}: Props) => {
  const messageHandler = useCallback(
    (message) => {
      onMessageReceived?.(message);
    },
    [onMessageReceived]
  );

  return (
    <View style={style}>
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

// this will only be set at the start of the app, so this will be the width of portrait mode
// needs to be done due to react native 0.63 bug for android
// https://github.com/facebook/react-native/issues/29451
const width = Dimensions.get('window').width;

WebViewMap.defaultProps = {
  style: {
    alignSelf: 'center',
    height: (9 / 16) * width,
    width
  }
};
