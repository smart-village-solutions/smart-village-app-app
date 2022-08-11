import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { colors, texts } from '../../config';
import { useLocationSettings } from '../../hooks';
import { Map } from '../map';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { RegularText } from '../Text';
import { SettingsToggle } from '../SettingsToggle';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';
import { ownLocationIconAnchor, ownLocation } from '../../icons';
import { latLngToLocationObject } from '../../helpers';

const baseLocationMarker = {
  icon: ownLocation(colors.accent),
  iconAnchor: ownLocationIconAnchor
};

const useSystemPermission = () => {
  const [systemPermission, setSystemPermission] = useState();

  useEffect(() => {
    (async () => setSystemPermission(await Location.getForegroundPermissionsAsync()))();
  }, []);

  return systemPermission;
};

const getLocationMarker = (locationObject) => ({
  ...baseLocationMarker,
  position: {
    lat: locationObject.coords.latitude,
    lng: locationObject.coords.longitude
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
          const newSettings = { locationService: true };
          setAndSyncLocationSettings(newSettings);
          return;
        }

        // if we can ask for the system permission, do so and update the settings or revert depending on the outcome
        if (response.status === Location.PermissionStatus.UNDETERMINED || response.canAskAgain) {
          Location.requestForegroundPermissionsAsync()
            .then((response) => {
              if (response.status !== Location.PermissionStatus.GRANTED) {
                revert();
              } else {
                const newSettings = { locationService: true };
                setAndSyncLocationSettings(newSettings);
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
    <View>
      <SettingsToggle item={locationServiceSwitchData} />
      <WrapperWithOrientation>
        <Wrapper>
          <RegularText>
            {texts.settingsContents.locationService.alternativePositionHint}
          </RegularText>
        </Wrapper>
        <Collapsible collapsed={!showMap}>
          <Map
            locations={locations}
            mapCenterPosition={{ lat: 51.1657, lng: 10.4515 }} // center of Germany
            onMapPress={({ nativeEvent }) => {
              setSelectedPosition({
                lat: nativeEvent.coordinate.latitude,
                lng: nativeEvent.coordinate.longitude
              });
            }}
            zoom={4}
          />
          <Wrapper>
            <Button
              title={texts.settingsContents.locationService.save}
              onPress={() => {
                selectedPosition &&
                  setAndSyncLocationSettings({
                    alternativePosition: latLngToLocationObject(selectedPosition)
                  });
                setSelectedPosition(undefined);
                setShowMap(false);
              }}
            />
            <Button
              invert
              title={texts.settingsContents.locationService.abort}
              onPress={() => {
                setSelectedPosition(undefined);
                setShowMap(false);
              }}
            />
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
      </WrapperWithOrientation>
    </View>
  );
};
