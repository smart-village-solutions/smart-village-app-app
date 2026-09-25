import * as Location from 'expo-location';
import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { device, normalize, texts } from '../../config';
import { useLocationSettings } from '../../hooks';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { MapLibre } from '../map';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperHorizontal, WrapperVertical } from '../Wrapper';

const CURRENT_POSITION_TIMEOUT = 15000;
const LAST_KNOWN_POSITION_TIMEOUT = 3000;

export const DefectReportLocationForm = ({
  setIsLocationSelect,
  selectedPosition,
  setSelectedPosition,
  showMap,
  setShowMap,
  withoutLocation = false
}: {
  setIsLocationSelect: (isLocationSelect: boolean) => void;
  selectedPosition: Location.LocationObjectCoords | undefined;
  setSelectedPosition: (position: Location.LocationObjectCoords | undefined) => void;
  showMap: boolean;
  setShowMap: (showMap: boolean) => void;
  withoutLocation?: boolean;
}) => {
  const { locationSettings, setAndSyncLocationSettings } = useLocationSettings();

  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};

  const [loadingPosition, setLoadingPosition] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const onPressPosition = useCallback(async () => {
    setLoadingPosition(true);
    setLocationError(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      await setAndSyncLocationSettings({
        locationService: status === Location.PermissionStatus.GRANTED
      });

      if (status !== Location.PermissionStatus.GRANTED) {
        setLocationError(true);
        return;
      }

      let position: Location.LocationObject | null | undefined;
      try {
        position = await withTimeout(
          Location.getCurrentPositionAsync({
            accuracy: Platform.select({
              ios: Location.Accuracy.Balanced,
              default: undefined
            })
          }),
          CURRENT_POSITION_TIMEOUT
        );
      } catch (error) {
        console.warn(error);
      }

      position =
        position ??
        (await withTimeout(
          Location.getLastKnownPositionAsync({ maxAge: 60000 }),
          LAST_KNOWN_POSITION_TIMEOUT
        ));

      if (!position) {
        setLocationError(true);
        return;
      }

      setSelectedPosition(position.coords);
      setIsLocationSelect(false);
    } catch (error) {
      console.warn(error);
      setLocationError(true);
    } finally {
      setLoadingPosition(false);
    }
  }, [setAndSyncLocationSettings, setIsLocationSelect, setSelectedPosition]);

  if (loadingPosition) {
    return <LoadingSpinner loading />;
  }

  return (
    <WrapperHorizontal>
      {locationError && (
        <RegularText error center>
          {texts.defectReport.locationUnavailable}
        </RegularText>
      )}
      {!showMap && (
        <WrapperVertical noPaddingBottom>
          <Button onPress={onPressPosition} title={texts.defectReport.usePosition} />
        </WrapperVertical>
      )}

      {!!showMap && (
        <MapLibre
          locations={[]}
          mapCenterPosition={selectedPosition}
          mapStyle={styles.map}
          onMapPress={({ geometry }: { geometry: { coordinates: number[] } }) => {
            const coordinate = {
              latitude: geometry?.coordinates[1],
              longitude: geometry?.coordinates[0]
            };

            setSelectedPosition(coordinate);
          }}
          selectedPosition={selectedPosition}
          setPinEnabled
        />
      )}
      <Collapsible style={styles.collapsible} collapsed={!showMap}>
        <WrapperVertical>
          <Button
            title={texts.settingsContents.locationService.next}
            onPress={() => {
              if (!selectedPosition) {
                if (alternativePosition) {
                  setSelectedPosition(alternativePosition.coords);
                } else if (defaultAlternativePosition) {
                  setSelectedPosition(defaultAlternativePosition.coords);
                }
              }

              setIsLocationSelect(false);
              setShowMap(false);
            }}
          />

          <Touchable
            accessibilityLabel={texts.accessibilityLabels.actions.cancel}
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
        </WrapperVertical>
      </Collapsible>
      <Collapsible collapsed={showMap}>
        <WrapperVertical noPaddingBottom noPaddingTop>
          <Button title={texts.defectReport.useMap} onPress={() => setShowMap(true)} />
        </WrapperVertical>
      </Collapsible>
      {withoutLocation && !showMap && (
        <WrapperVertical noPaddingBottom noPaddingTop>
          <Button
            title={texts.defectReport.continueWithoutLocation}
            onPress={() => {
              setSelectedPosition(undefined);
              setIsLocationSelect(false);
            }}
          />
        </WrapperVertical>
      )}
    </WrapperHorizontal>
  );
};

const withTimeout = async <T,>(
  promise: Promise<T>,
  milliseconds: number
): Promise<T | undefined> => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<undefined>((resolve) => {
        timer = setTimeout(resolve, milliseconds);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
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
