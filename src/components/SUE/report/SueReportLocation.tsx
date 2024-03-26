import * as Location from 'expo-location';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useQuery } from 'react-query';

import { SettingsContext } from '../../../SettingsProvider';
import { device, normalize, texts } from '../../../config';
import { parseListItemsFromQuery } from '../../../helpers';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../../hooks';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { TValues, mapToMapMarkers } from '../../../screens';
import { MapMarker } from '../../../types';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';
import { Map } from '../../map';
import { getLocationMarker } from '../../settings';

enum SueStatus {
  CLOSED = 'TICKET_STATUS_CLOSED',
  IN_PROCESS = 'TICKET_STATUS_IN_PROCESS',
  INVALID = 'TICKET_STATUS_INVALID',
  OPEN = 'TICKET_STATUS_OPEN',
  UNPROCESSED = 'TICKET_STATUS_UNPROCESSED',
  WAIT_REQUESTOR = 'TICKET_STATUS_WAIT_REQUESTOR',
  WAIT_THIRDPARTY = 'TICKET_STATUS_WAIT_THIRDPARTY'
}

/* eslint-disable complexity */
export const SueReportLocation = ({
  control,
  getValues,
  requiredInputs,
  selectedPosition,
  setSelectedPosition,
  setValue
}: {
  control: any;
  getValues: UseFormGetValues<TValues>;
  requiredInputs: string[];
  selectedPosition: Location.LocationObjectCoords | undefined;
  setSelectedPosition: (position: Location.LocationObjectCoords | undefined) => void;
  setValue: UseFormSetValue<TValues>;
}) => {
  const { locationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem } = globalSettings;
  const { sueStatus = {} } = appDesignSystem;
  const { statusViewColors = {}, statusTextColors = {} } = sueStatus;

  const { position } = usePosition(systemPermission?.status !== Location.PermissionStatus.GRANTED);
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED
  );
  const [updatedRegion, setUpdatedRegion] = useState(false);

  const streetInputRef = useRef();
  const houseNumberInputRef = useRef();
  const zipCodeInputRef = useRef();
  const cityInputRef = useRef();

  const queryVariables = {
    start_date: '1900-01-01T00:00:00+01:00',
    status: `${SueStatus.UNPROCESSED},${SueStatus.OPEN},${SueStatus.IN_PROCESS},${SueStatus.WAIT_REQUESTOR},${SueStatus.WAIT_THIRDPARTY}`
  };

  const { data, isLoading } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS, queryVariables],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS)(queryVariables),
    {
      cacheTime: 1000 * 60 * 60 * 24 // 24 hours
    }
  );

  const mapMarkers = useMemo(
    () =>
      mapToMapMarkers(
        parseListItemsFromQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, data, undefined, {
          appDesignSystem
        }),
        statusViewColors,
        statusTextColors
      ) || [],
    [data]
  );

  const geocode = useCallback(async () => {
    const { street, houseNumber, zipCode, city } = getValues();

    if (!street || !zipCode || !city) {
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&street=${street}+${houseNumber}&city=${city}&country=germany&postalcode=${zipCode}`
      );

      const data = await response.json();
      const latitude = data?.[0]?.lat;
      const longitude = data?.[0]?.lon;

      if (latitude && longitude) {
        setUpdatedRegion(true);
        setSelectedPosition({ latitude: Number(latitude), longitude: Number(longitude) });
      }
    } catch (error) {
      console.error('Geocoding Error:', error);
    }
  }, []);

  const reverseGeocode = useCallback(async (position: Location.LocationObjectCoords) => {
    const { latitude, longitude } = position;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );

      const data = await response.json();
      const street = data?.address?.road || '';
      const houseNumber = data?.address?.house_number || '';
      const zipCode = data?.address?.postcode || '';
      const city = data?.address?.city || '';

      setValue('street', street);
      setValue('houseNumber', houseNumber);
      setValue('zipCode', zipCode);
      setValue('city', city);
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
    }
  }, []);

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};
  const baseLocationMarker = {
    iconName: 'location'
  };

  let locations = mapMarkers as MapMarker[];
  let mapCenterPosition = {} as { latitude: number; longitude: number };

  if (selectedPosition) {
    locations = [...mapMarkers, { ...baseLocationMarker, position: selectedPosition }];
  }

  if (alternativePosition) {
    mapCenterPosition = getLocationMarker(alternativePosition).position;
  } else if (defaultAlternativePosition) {
    mapCenterPosition = getLocationMarker(defaultAlternativePosition).position;
  }

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <View style={styles.container}>
      <Map
        locations={locations}
        mapCenterPosition={mapCenterPosition}
        mapStyle={styles.map}
        isMyLocationButtonVisible
        onMyLocationButtonPress={() =>
          Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.myLocation, [
            {
              text: texts.sue.report.alerts.no
            },
            {
              text: texts.sue.report.alerts.yes,
              onPress: () => {
                const location = position || lastKnownPosition;

                if (location) {
                  setUpdatedRegion(true);
                  setSelectedPosition(location.coords);
                  reverseGeocode(location.coords);
                }
              }
            }
          ])
        }
        onMapPress={({ nativeEvent }) => {
          setUpdatedRegion(false);
          setSelectedPosition(nativeEvent.coordinate);
          reverseGeocode(nativeEvent.coordinate);
        }}
        updatedRegion={
          !!selectedPosition && updatedRegion
            ? { ...selectedPosition, latitudeDelta: 0.01, longitudeDelta: 0.01 }
            : undefined
        }
      />

      <Wrapper>
        <RegularText small>{texts.sue.report.mapHint}</RegularText>
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="street"
          label={`${texts.sue.report.street} ${requiredInputs?.includes('street') ? '*' : ''}`}
          placeholder={texts.sue.report.street}
          textContentType="streetAddressLine1"
          control={control}
          onChange={geocode}
          ref={streetInputRef}
          onSubmitEditing={() => houseNumberInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="houseNumber"
          label={`${texts.sue.report.houseNumber} ${
            requiredInputs?.includes('houseNumber') ? '*' : ''
          }`}
          placeholder={texts.sue.report.houseNumber}
          textContentType="off"
          control={control}
          onChange={geocode}
          ref={houseNumberInputRef}
          onSubmitEditing={() => zipCodeInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="zipCode"
          label={`${texts.sue.report.zipCode} ${requiredInputs?.includes('zipCode') ? '*' : ''}`}
          placeholder={texts.sue.report.zipCode}
          maxLength={5}
          keyboardType="numeric"
          textContentType="postalCode"
          control={control}
          onChange={geocode}
          ref={zipCodeInputRef}
          onSubmitEditing={() => cityInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="city"
          label={`${texts.sue.report.city} ${requiredInputs?.includes('city') ? '*' : ''}`}
          placeholder={texts.sue.report.city}
          control={control}
          textContentType="addressCity"
          onChange={geocode}
          ref={cityInputRef}
        />
      </Wrapper>
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  container: {
    paddingTop: normalize(14),
    width: '100%'
  },
  map: {
    width: device.width - 2 * normalize(14)
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
