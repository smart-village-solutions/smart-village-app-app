import React from 'react';
import { StyleSheet } from 'react-native';

import { MapLibre } from '../../components';

export const SueMapScreen = ({ route }: { route: any }) => {
  const {
    calloutTextEnabled,
    geometryTourData,
    isMyLocationButtonVisible,
    locations,
    mapCenterPosition,
    onMapPress,
    onMarkerPress,
    onMyLocationButtonPress,
    selectedMarker,
    selectedPosition,
    setPinEnabled,
    showsUserLocation
  } = route?.params ?? {};

  return (
    <MapLibre
      {...{
        calloutTextEnabled,
        geometryTourData,
        interactivity: {
          pitchEnabled: true,
          rotateEnabled: false,
          scrollEnabled: true,
          zoomEnabled: true
        },
        isMyLocationButtonVisible,
        locations,
        mapCenterPosition,
        mapStyle: styles.map,
        onMapPress,
        onMarkerPress,
        onMyLocationButtonPress,
        selectedMarker,
        selectedPosition,
        setPinEnabled,
        showsUserLocation
      }}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%'
  }
});
