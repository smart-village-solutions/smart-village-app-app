import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { device, normalize, texts } from '../../config';
import { geoLocationToLocationObject } from '../../helpers';
import { useLocationSettings, useSystemPermission } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { MapLibre } from '../map';
import { SettingsToggle } from '../SettingsToggle';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperHorizontal, WrapperVertical } from '../Wrapper';

export const LocationSettings = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings || {};
  const { locationService: globalSettingsLocationService = {} } = settings;
  const { showAlternativeLocationButton = true } = globalSettingsLocationService;
  const { locationSettings, setAndSyncLocationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();

  const {
    locationService = systemPermission?.status !== Location.PermissionStatus.DENIED,
    alternativePosition,
    defaultAlternativePosition
  } = locationSettings || {};

  const [showMap, setShowMap] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState();

  const updateSelectedPosition = useCallback(() => {
    if (alternativePosition) {
      setSelectedPosition({
        latitude: alternativePosition.coords.latitude,
        longitude: alternativePosition.coords.longitude
      });
    } else if (defaultAlternativePosition) {
      setSelectedPosition({
        latitude: defaultAlternativePosition.coords.lat,
        longitude: defaultAlternativePosition.coords.lng
      });
    }
  }, [alternativePosition, defaultAlternativePosition]);

  useEffect(() => updateSelectedPosition(), [updateSelectedPosition]);

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

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
          texts.settingsContents.locationService.onSystemPermissionMissing,
          [
            {
              text: texts.settingsContents.locationService.cancel
            },
            {
              text: texts.settingsContents.locationService.settings,
              onPress: () => Linking.openSettings()
            }
          ]
        );
      });
    },
    onDeactivate: () => setAndSyncLocationSettings({ locationService: false })
  };

  return (
    <ScrollView>
      <WrapperHorizontal>
        <SettingsToggle item={locationServiceSwitchData} />
      </WrapperHorizontal>
      {!!showAlternativeLocationButton && (
        <WrapperHorizontal>
          <WrapperVertical>
            <RegularText>
              {texts.settingsContents.locationService.alternativePositionHint}
            </RegularText>
          </WrapperVertical>

          {!!showMap && (
            <MapLibre
              locations={[]}
              mapCenterPosition={selectedPosition}
              mapStyle={styles.map}
              onMapPress={({ geometry }) => {
                const coordinate = {
                  latitude: geometry?.coordinates[1],
                  longitude: geometry?.coordinates[0]
                };

                setSelectedPosition(coordinate);

                return { isLocationSelectable: true };
              }}
              selectedPosition={selectedPosition}
              setPinEnabled
              setOwnLocation
            />
          )}
          <Collapsible style={styles.collapsible} collapsed={!showMap}>
            <WrapperVertical>
              <Button
                title={texts.settingsContents.locationService.save}
                onPress={() => {
                  selectedPosition &&
                    setAndSyncLocationSettings({
                      alternativePosition: geoLocationToLocationObject(selectedPosition)
                    });
                  setShowMap(false);
                }}
              />

              <Touchable
                onPress={() => {
                  updateSelectedPosition();
                  setShowMap(false);
                }}
                style={styles.containerStyle}
              >
                <RegularText primary center>
                  {texts.settingsContents.locationService.abort}
                </RegularText>
              </Touchable>
            </WrapperVertical>
          </Collapsible>
          <Collapsible collapsed={showMap}>
            <WrapperVertical>
              <Button
                title={texts.settingsContents.locationService.chooseAlternateLocationButton}
                onPress={() => setShowMap(true)}
              />
            </WrapperVertical>
          </Collapsible>
        </WrapperHorizontal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  collapsible: {
    flex: 1
  },
  containerStyle: {
    marginBottom: normalize(21)
  },
  map: {
    height: normalize(300),
    width: device.width - 2 * normalize(16)
  }
});
