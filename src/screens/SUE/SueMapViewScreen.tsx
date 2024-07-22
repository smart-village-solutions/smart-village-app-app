import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Map } from '../../components';
import { colors, normalize } from '../../config';

export const SueMapViewScreen = ({ route }: { route: any }) => {
  const {
    calloutTextEnabled,
    currentPosition,
    geometryTourData,
    isMaximizeButtonVisible,
    isMyLocationButtonVisible,
    locations,
    mapCenterPosition,
    onMapPress,
    onMarkerPress,
    onMyLocationButtonPress,
    selectedPosition: position,
    showsUserLocation
  } = route?.params ?? {};

  const [selectedPosition, setSelectedPosition] = useState<
    Location.LocationObjectCoords | undefined
  >(position);
  const [selectedMarker, setSelectedMarker] = useState<string | undefined>();
  const [locationsWithPin, setLocationsWithPin] = useState(locations);
  const [updatedRegion, setUpdatedRegion] = useState<boolean>();

  const iconName = 'location';

  useEffect(() => {
    setLocationsWithPin((prevData) =>
      prevData.map((item) =>
        item?.iconName === iconName ? { iconName, position: selectedPosition } : item
      )
    );
  }, [selectedPosition]);

  return (
    <>
      <Map
        {...{
          calloutTextEnabled,
          geometryTourData,
          isMaximizeButtonVisible,
          isMyLocationButtonVisible,
          locations: selectedPosition
            ? [...locationsWithPin, { iconName, position: selectedPosition }]
            : locationsWithPin,
          mapCenterPosition,
          mapStyle: styles.map,
          onMarkerPress,
          selectedMarker,
          showsUserLocation
        }}
        onMyLocationButtonPress={async () => {
          setSelectedPosition(currentPosition.coords);
          setUpdatedRegion(true);

          try {
            await onMyLocationButtonPress({ isFullScreenMap: true });
          } catch (error) {
            setSelectedPosition(undefined);
          }
        }}
        onMarkerPress={(id) => setSelectedMarker(id)}
        onMapPress={async ({ nativeEvent }) => {
          if (
            nativeEvent.action !== 'marker-press' &&
            nativeEvent.action !== 'callout-inside-press'
          ) {
            setSelectedPosition(nativeEvent.coordinate);
            setUpdatedRegion(false);

            try {
              await onMapPress({ nativeEvent });
            } catch (error) {
              setSelectedPosition(undefined);
            }
          }
        }}
        updatedRegion={
          !!selectedPosition && updatedRegion
            ? { ...selectedPosition, latitudeDelta: 0.01, longitudeDelta: 0.01 }
            : undefined
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  augmentedRealityInfoContainer: {
    width: '90%'
  },
  map: {
    height: '100%',
    width: '100%'
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
