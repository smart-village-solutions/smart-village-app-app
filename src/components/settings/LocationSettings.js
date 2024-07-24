import * as Location from 'expo-location';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
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

  const {
    locationService = systemPermission.status !== Location.PermissionStatus.DENIED,
    alternativePosition,
    defaultAlternativePosition
  } = locationSettings || {};

  const locationServiceSwitchData = useMemo(
    () => ({
      title: texts.settingsTitles.locationService,
      bottomDivider: true,
      topDivider: true,
      value: locationService,
      onActivate: (revert) => {
        Location.getForegroundPermissionsAsync().then((response) => {
          if (response.status === Location.PermissionStatus.GRANTED) {
            setAndSyncLocationSettings({ locationService: true });
            return;
          }

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

          revert();
          Alert.alert(
            texts.settingsTitles.locationService,
            texts.settingsContents.locationService.onSystemPermissionMissing
          );
        });
      },
      onDeactivate: () => setAndSyncLocationSettings({ locationService: false })
    }),
    [locationService, setAndSyncLocationSettings]
  );

  let locations = [];

  if (selectedPosition) {
    locations = [{ ...baseLocationMarker, position: selectedPosition }];
  } else if (alternativePosition) {
    locations = [getLocationMarker(alternativePosition)];
  } else if (defaultAlternativePosition) {
    locations = [getLocationMarker(defaultAlternativePosition)];
  }

  const handleMapPress = ({ nativeEvent }) => {
    setSelectedPosition({
      ...nativeEvent.coordinate
    });
  };

  const handleSave = () => {
    if (selectedPosition) {
      setAndSyncLocationSettings({
        alternativePosition: geoLocationToLocationObject(selectedPosition)
      });
    }
    setSelectedPosition(undefined);
    setShowMap(false);
  };

  const handleAbort = () => {
    setSelectedPosition(undefined);
    setShowMap(false);
  };

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

  return (
    <ScrollView>
      <SettingsToggle item={locationServiceSwitchData} />
      <Wrapper>
        <RegularText>{texts.settingsContents.locationService.alternativePositionHint}</RegularText>
      </Wrapper>
      <Collapsible collapsed={!showMap}>
        <Map clusteringEnabled={false} locations={locations} onMapPress={handleMapPress} />

        <Wrapper>
          <Button title={texts.settingsContents.locationService.save} onPress={handleSave} />
          <Touchable onPress={handleAbort} style={styles.containerStyle}>
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
  }
});
