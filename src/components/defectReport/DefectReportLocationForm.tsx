import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { device, normalize, texts } from '../../config';
import { useLastKnownPosition, usePosition, useSystemPermission } from '../../hooks';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { MapLibre } from '../map';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

export const DefectReportLocationForm = ({
  setIsLocationSelect,
  selectedPosition,
  setSelectedPosition
}: {
  setIsLocationSelect: (isLocationSelect: boolean) => void;
  selectedPosition: Location.LocationObjectCoords | undefined;
  setSelectedPosition: (position: Location.LocationObjectCoords | undefined) => void;
}) => {
  const [shouldGetPosition, setShouldGetPosition] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const systemPermission = useSystemPermission();
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
    <>
      {systemPermission.status !== Location.PermissionStatus.DENIED && (
        <Wrapper>
          <Button onPress={onPressPosition} title={texts.defectReport.usePosition} />
        </Wrapper>
      )}

      <MapLibre
        locations={[]}
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
        style={{ display: showMap ? 'flex' : 'none' }}
      />
      <Collapsible collapsed={!showMap}>
        <Wrapper>
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
          >
            <RegularText primary center>
              {texts.settingsContents.locationService.abort}
            </RegularText>
          </Touchable>
        </Wrapper>
      </Collapsible>
      <Collapsible collapsed={showMap}>
        <Wrapper>
          <Button onPress={() => setShowMap(true)} title={texts.defectReport.useMap} />
        </Wrapper>
      </Collapsible>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    height: normalize(300),
    width: device.width - 2 * normalize(16)
  }
});
