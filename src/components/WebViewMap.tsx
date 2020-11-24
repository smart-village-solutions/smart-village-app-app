/* eslint-disable react-native/no-color-literals */
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapMarker, WebViewLeaflet, WebviewLeafletMessage } from 'react-native-webview-leaflet';
import { colors } from '../config';
import { location as locationMarker } from '../icons';
import { Button } from './Button';
import { RegularText } from './Text';
import { Title } from './Title';

const locations = [
  {
    position: { lat: 53.61241201890862, lng: 9.900906974592688 },
    name: 'Julian\'s home'
  }
];

type Props = {
  locations: MapMarker[],
  mapCenterPosition?: {
    lat: number,
    lng: number
  },
  onMessageReceived?: (message: WebviewLeafletMessage) => void,
  zoom?: number,
}

export const WebViewMap = ({ onMessageReceived, mapCenterPosition, zoom }: Props) => {
  const [isCardVisible, setIsCardVisible] = useState(false);

  const messageHandler = useCallback((message) => {
    // if(message.event === 'onMapMarkerClicked') {
    //   setIsCardVisible(true);
    //   console.log(message);
    // }
    onMessageReceived?.(message);
  },[setIsCardVisible]);

  const mapCenterPos = mapCenterPosition ?? locations?.[0].position;

  return <View style={styles.container}>
    <WebViewLeaflet
      backgroundColor={'gray'}
      onMessageReceived={messageHandler}
      mapLayers={[
        {
          attribution:
                      '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          baseLayerIsChecked: true,
          baseLayerName: 'OpenStreetMap.Mapnik',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      ]}
      mapMarkers={[
        ...locations.map((location) => {
          return {
            id: location.name.replace(' ', '-'),
            position: location.position,
            icon: locationMarker(colors.primary)  // find proper map marker that has the tip at the actual position :(
          };
        })
      ]}
      mapCenterPosition={mapCenterPos}
      zoom={zoom ?? 14}
    />
    {isCardVisible ? <View style={styles.card}>
      <Title>Hello</Title>
      <RegularText>This is the card for a pin</RegularText>
      <Button title="Details anzeigen" onPress={() => setIsCardVisible(false)}/>
    </View> : null}
  </View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    bottom: 40,
    height: '75%',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    position: 'absolute',
    right: 40
  },
  container: {
    flex: 1
  }
});
