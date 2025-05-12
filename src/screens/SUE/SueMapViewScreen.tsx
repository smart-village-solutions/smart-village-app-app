import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { MapLibre, locationServiceEnabledAlert } from '../../components';
import { colors, normalize, texts } from '../../config';
import { useLocationSettings } from '../../hooks';

export const SueMapViewScreen = ({
  navigation,
  route
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) => {
  const { locationSettings = {} } = useLocationSettings();
  const { locationService: locationServiceEnabled } = locationSettings;

  const {
    calloutTextEnabled,
    clusteringEnabled,
    currentPosition,
    geometryTourData,
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
          onMarkerPress,
          selectedPosition,
          setPinEnabled: true,
          showsUserLocation
        }}
        onMyLocationButtonPress={async () => {
          Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.myLocation, [
            {
              text: texts.sue.report.alerts.no
            },
            {
              text: texts.sue.report.alerts.yes,
              onPress: async () => {
                locationServiceEnabledAlert({
                  currentPosition,
                  locationServiceEnabled,
                  navigation
                });

                setSelectedPosition(currentPosition.coords);

                try {
                  await onMyLocationButtonPress({ isFullScreenMap: true });
                } catch (error) {
                  setSelectedPosition(undefined);
                  return { error: error?.message, isLocationSelectable: false };
                }

                return { isLocationSelectable: true };
              }
            }
          ]);
        }}
        onMapPress={async ({
          geometry
        }: {
          geometry: { coordinates: Location.LocationObjectCoords };
        }) => {
          const coordinate = {
            latitude: geometry?.coordinates[1],
            longitude: geometry?.coordinates[0]
          };
          setSelectedPosition(coordinate);

          const { error, isLocationSelectable = false } = (await onMapPress?.({ geometry })) ?? {};

          if (error) {
            setSelectedPosition(undefined);
            return { error: error?.message, isLocationSelectable: false };
          }

          return { isLocationSelectable };
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
