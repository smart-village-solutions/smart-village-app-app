import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { normalize, texts } from '../../config';
import { geoLocationToLocationObject } from '../../helpers';
import { useLocationSettings, useSystemPermission } from '../../hooks';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { Map } from '../map';
import { SettingsToggle } from '../SettingsToggle';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

export const baseLocationMarker = {
  iconName: 'ownLocation'
};

export const getLocationMarker = (locationObject) => ({
  iconName: locationObject?.iconName || baseLocationMarker.iconName,
  position: {
    ...locationObject.coords,
    latitude: locationObject?.coords?.latitude || locationObject?.coords?.lat,
    longitude: locationObject?.coords?.longitude || locationObject?.coords?.lng
  }
});

export const LocationSettings = () => {
  const { locationSettings, setAndSyncLocationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();

  const [showMap, setShowMap] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState();

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

  const {
    locationService = systemPermission.status !== Location.PermissionStatus.DENIED,
    alternativePosition,
    defaultAlternativePosition
  } = locationSettings || {};

  const locationServiceSwitchData = {
    title: texts.settingsTitles.locationService,
    bottomDivider: true,
    topDivider: true,
    value: locationService,
    onActivate: (revert) => {
      Location.getForegroundPermissionsAsync().then((response) => {
        // if the system permission is granted, we can simply enable the sorting
        if (response.status === Location.PermissionStatus.GRANTED) {
          setAndSyncLocationSettings({ locationService: true });
          return;
        }

        // if we can ask for the system permission, do so and update the settings or revert depending on the outcome
        if (response.status === Location.PermissionStatus.UNDETERMINED || response.canAskAgain) {
          Location.requestForegroundPermissionsAsync()
            .then((response) => {
              if (response.status !== Location.PermissionStatus.GRANTED) {
                revert();
              } else {
                setAndSyncLocationSettings({ locationService: true });
                return;
              }
            })
            .catch(() => revert());
          return;
        }

        // if we neither have the permission, nor can we ask for it, then show an alert that the permission is missing
        revert();
        Alert.alert(
          texts.settingsTitles.locationService,
          texts.settingsContents.locationService.onSystemPermissionMissing
        );
      });
    },
    onDeactivate: () => setAndSyncLocationSettings({ locationService: false })
  };

  let locations = [];

  if (selectedPosition) {
    locations = [{ ...baseLocationMarker, position: selectedPosition }];
  } else if (alternativePosition) {
    locations = [getLocationMarker(alternativePosition)];
  } else if (defaultAlternativePosition) {
    locations = [getLocationMarker(defaultAlternativePosition)];
  }

  return (
    <ScrollView>
      <SettingsToggle item={locationServiceSwitchData} />
      <Wrapper>
        <RegularText>{texts.settingsContents.locationService.alternativePositionHint}</RegularText>
      </Wrapper>
      <Collapsible collapsed={!showMap}>
        <View style={styles.mapContainer}>
          <Map
            locations={locations}
            onMapPress={({ nativeEvent }) => {
              setSelectedPosition({
                ...nativeEvent.coordinate
              });
            }}
          />
        </View>
        <Wrapper>
          <Button
            title={texts.settingsContents.locationService.save}
            onPress={() => {
              selectedPosition &&
                setAndSyncLocationSettings({
                  alternativePosition: geoLocationToLocationObject(selectedPosition)
                });
              setSelectedPosition(undefined);
              setShowMap(false);
            }}
          />

          <Touchable
            onPress={() => {
              setSelectedPosition(undefined);
              setShowMap(false);
            }}
            style={styles.containerStyle}
          >
            <RegularText primary center>
              {texts.settingsContents.locationService.abort}
            </RegularText>
          </Touchable>
        </Wrapper>
      </Collapsible>
      <Collapsible collapsed={showMap}>
        <Wrapper>
          <Button
            title={texts.settingsContents.locationService.chooseAlternateLocationButton}
            onPress={() => setShowMap(true)}
          />
        </Wrapper>
      </Collapsible>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    marginBottom: normalize(21)
  },
  mapContainer: {
    width: '100%',
    height: normalize(250)
  }
});
