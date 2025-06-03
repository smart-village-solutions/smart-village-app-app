import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { device, normalize, texts } from '../../config';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../hooks';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { MapLibre } from '../map';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperHorizontal, WrapperVertical } from '../Wrapper';

export const DefectReportLocationForm = ({
  setIsLocationSelect,
  selectedPosition,
  setSelectedPosition
}: {
  setIsLocationSelect: (isLocationSelect: boolean) => void;
  selectedPosition: Location.LocationObjectCoords | undefined;
  setSelectedPosition: (position: Location.LocationObjectCoords | undefined) => void;
}) => {
  const { locationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();

  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};

  const [shouldGetPosition, setShouldGetPosition] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { loading: loadingPosition, position } = usePosition(!shouldGetPosition);
  const { loading: loadingLastKnownPosition, position: lastKnownPosition } =
    useLastKnownPosition(shouldGetPosition);

  const onPressPosition = useCallback(async () => {
    setShouldGetPosition(true);
  }, []);

  useEffect(() => {
    if (
      shouldGetPosition &&
      !loadingPosition &&
      !loadingLastKnownPosition &&
      (position || lastKnownPosition)
    ) {
      setIsLocationSelect(false);
      setSelectedPosition((position || lastKnownPosition)?.coords);
    }
  }, [lastKnownPosition, loadingPosition, loadingLastKnownPosition, position, shouldGetPosition]);

  if (!systemPermission || loadingPosition || loadingLastKnownPosition || shouldGetPosition) {
    return <LoadingSpinner loading />;
  }

  return (
    <WrapperHorizontal>
      {systemPermission.status !== Location.PermissionStatus.DENIED && (
        <WrapperVertical>
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

            return { isLocationSelectable: true };
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
        <WrapperVertical>
          <Button title={texts.defectReport.useMap} onPress={() => setShowMap(true)} />
        </WrapperVertical>
      </Collapsible>
    </WrapperHorizontal>
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
