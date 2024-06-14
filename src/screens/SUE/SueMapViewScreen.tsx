import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { Map } from '../../components';
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
    currentPosition,
    geometryTourData,
    isMaximizeButtonVisible,
    isMyLocationButtonVisible,
    locations,
    mapCenterPosition,
    onMapPress,
    onMarkerPress,
    onMyLocationButtonPress,
    selectedPosition,
    showsUserLocation
  } = route?.params ?? {};

  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

  const [position, setPosition] = useState(selectedPosition);
  const [locationsWithPin, setLocationsWithPin] = useState(locations);
  const [updatedRegion, setUpdatedRegion] = useState();

  useEffect(() => {
    setLocationsWithPin((prevData) =>
      prevData.map((item) =>
        item?.iconName === 'location' ? { iconName: 'location', position } : item
      )
    );
  }, [position]);

  return (
    <>
      <Map
        {...{
          calloutTextEnabled,
          geometryTourData,
          isMaximizeButtonVisible,
          isMyLocationButtonVisible,
          locations: [...locationsWithPin, { position }],
          mapCenterPosition,
          mapStyle: styles.map,
          onMarkerPress: onMarkerPress,
          showsUserLocation
        }}
        onMyLocationButtonPress={async () => {
          setPosition(currentPosition.coords);
          setUpdatedRegion(true);

          try {
            await onMyLocationButtonPress(true);
          } catch (error) {
            setPosition(undefined);
          }
        }}
        onMapPress={async ({ nativeEvent }) => {
          if (
            nativeEvent.action !== 'marker-press' &&
            nativeEvent.action !== 'callout-inside-press'
          ) {
            setPosition(nativeEvent.coordinate);
            setUpdatedRegion(false);

            try {
              await onMapPress({ nativeEvent });
            } catch (error) {
              setPosition(undefined);
            }
          }
        }}
        updatedRegion={
          !!position && updatedRegion
            ? { ...position, latitudeDelta: 0.01, longitudeDelta: 0.01 }
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

const stylesWithProps = ({ navigationType }) => {
  return StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '8%' : '4%'
    }
  });
};
