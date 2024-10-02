import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import Collapsible from 'react-native-collapsible';

import { texts } from '../../config';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../hooks';
import { MapMarker } from '../../types';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { Map } from '../map/Map';
import { baseLocationMarker, getLocationMarker } from '../settings';
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

  const { locationSettings } = useLocationSettings();
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

  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};

  let locations = [] as MapMarker[];

  if (selectedPosition) {
    locations = [{ ...baseLocationMarker, position: selectedPosition }];
  } else if (alternativePosition) {
    locations = [getLocationMarker(alternativePosition)];
  } else if (defaultAlternativePosition) {
    locations = [getLocationMarker(defaultAlternativePosition)];
  }

  return (
    <>
      {systemPermission.status !== Location.PermissionStatus.DENIED && (
        <Wrapper>
          <Button onPress={onPressPosition} title={texts.defectReport.usePosition} />
        </Wrapper>
      )}
      <Collapsible collapsed={!showMap}>
        <Map
          locations={locations}
          onMapPress={({ nativeEvent }) => {
            setSelectedPosition({
              ...nativeEvent.coordinate
            });
          }}
        />
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
