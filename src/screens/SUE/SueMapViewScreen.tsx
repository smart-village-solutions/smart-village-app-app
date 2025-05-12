import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import { MapLibre } from '../../components';
import { colors, normalize } from '../../config';

export const SueMapViewScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const {
    calloutTextEnabled,
    clusteringEnabled,
    geometryTourData,
    isMyLocationButtonVisible,
    locations,
    mapCenterPosition,
    onMapPress,
    onMarkerPress,
    onMyLocationButtonPress,
    selectedPosition,
    showsUserLocation
  } = route?.params ?? {};

  return (
    <>
      <MapLibre
        {...{
          calloutTextEnabled,
          clusteringEnabled,
          geometryTourData,
          isMyLocationButtonVisible,
          locations,
          mapCenterPosition,
          mapStyle: styles.map,
          onMapPress,
          onMarkerPress,
          onMyLocationButtonPress,
          selectedPosition,
          setPinEnabled: true,
          showsUserLocation
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  augmentedRealityInfoContainer: {
    width: '90%'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  marginTop: {
    marginTop: normalize(14)
  },
  listItemContainer: {
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    left: '4%',
    position: 'absolute',
    right: '4%',
    width: '92%',
    // shadow:
    elevation: 2,
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      height: 5,
      width: 0
    },
    shadowOpacity: 0.5,
    shadowRadius: 3
  }
});
