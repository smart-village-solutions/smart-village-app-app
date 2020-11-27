import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebviewLeafletMessage } from 'react-native-webview-leaflet';

import { colors, normalize } from '../config';
import { location } from '../icons';
import { RegularText } from './Text';
import { WebViewMap } from './WebViewMap';

type MyLocation = {
  lat: number,
  lng: number,
  name: string,
}

type Props = {
  locations: Array<MyLocation>,
}

const mapLocationsToMarkers = (locations: Array<MyLocation>) => {
  return locations.map((value) => {
    return {
      icon: location(colors.primary),
      position: {
        lat: value.lat,
        lng: value.lng
      },
      id: value.name
    };
  });
};

export const LocationOverview = ({locations}: Props) => {
  const [selectedLocation, setSelectedLocation] = useState<MyLocation>();

  const onMessageReceived = useCallback((message: WebviewLeafletMessage) => {
    if (message.event === 'onMapMarkerClicked') {
      setSelectedLocation(
        locations.find((entry) => entry.name === message.payload?.mapMarkerID)
      );
    }
  }, [setSelectedLocation]);

  return (
    <View style={styles.container}>
      <WebViewMap
        locations={mapLocationsToMarkers(locations)}
        onMessageReceived={onMessageReceived}
        style={styles.map}
      />
      <View style={styles.details}>
        <RegularText>{selectedLocation?.name}</RegularText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: '100%',
    height: normalize(200)
  },
  details: {
    width: '100%'
  }
});
