import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { Map, locationServiceEnabledAlert } from '../../components';
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
          clusteringEnabled,
          geometryTourData,
          isMaximizeButtonVisible,
          isMyLocationButtonVisible,
          locations: selectedPosition
            ? [...locationsWithPin, { iconName, position: selectedPosition }]
            : locationsWithPin,
          mapCenterPosition,
          mapStyle: styles.map,
          onMarkerPress: onMarkerPress,
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
                setUpdatedRegion(true);

                try {
                  await onMyLocationButtonPress({ isFullScreenMap: true });
                } catch (error) {
                  setSelectedPosition(undefined);
                }
              }
            }
          ]);
        }}
        onMapPress={async ({ nativeEvent }) => {
          if (
            nativeEvent.action !== 'marker-press' &&
            nativeEvent.action !== 'callout-inside-press'
          ) {
            setSelectedPosition(nativeEvent.coordinate);
            setUpdatedRegion(false);

            const mapPress = await onMapPress({ nativeEvent });

            if (mapPress?.error) {
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
