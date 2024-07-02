import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useQuery } from 'react-query';

import { ConfigurationsContext } from '../../../ConfigurationsProvider';
import { SettingsContext } from '../../../SettingsProvider';
import { consts, device, normalize, texts } from '../../../config';
import { parseListItemsFromQuery } from '../../../helpers';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useReverseGeocode,
  useSystemPermission
} from '../../../hooks';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { TValues, mapToMapMarkers } from '../../../screens';
import { MapMarker, ScreenName } from '../../../types';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Wrapper, WrapperHorizontal } from '../../Wrapper';
import { Input } from '../../form';
import { Map } from '../../map';
import { getLocationMarker } from '../../settings';

const { INPUT_KEYS } = consts;

enum SueStatus {
  IN_PROCESS = 'TICKET_STATUS_IN_PROCESS',
  INVALID = 'TICKET_STATUS_INVALID',
  OPEN = 'TICKET_STATUS_OPEN',
  WAIT_REQUESTOR = 'TICKET_STATUS_WAIT_REQUESTOR',
  WAIT_THIRDPARTY = 'TICKET_STATUS_WAIT_THIRDPARTY'
}

/* eslint-disable complexity */
export const SueReportLocation = ({
  areaServiceData,
  control,
  errorMessage,
  getValues,
  requiredInputs,
  selectedPosition,
  setSelectedPosition,
  setUpdateRegionFromImage,
  setValue,
  updateRegionFromImage
}: {
  areaServiceData?: { postalCodes?: string[] };
  control: any;
  errorMessage: string;
  getValues: UseFormGetValues<TValues>;
  requiredInputs: keyof TValues[];
  selectedPosition?: Location.LocationObjectCoords;
  setSelectedPosition: (position?: Location.LocationObjectCoords) => void;
  setUpdateRegionFromImage: (value: boolean) => void;
  setValue: UseFormSetValue<TValues>;
  updateRegionFromImage: boolean;
}) => {
  const reverseGeocode = useReverseGeocode();
  const navigation = useNavigation();
  const { locationSettings } = useLocationSettings();
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { locationService } = settings;
  const systemPermission = useSystemPermission();
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {} } = appDesignSystem;
  const { statusViewColors = {}, statusTextColors = {} } = sueStatus;
  const now = moment();

  const { position } = usePosition(systemPermission?.status !== Location.PermissionStatus.GRANTED);
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED
  );
  const currentPosition = position || lastKnownPosition;

  const [updatedRegion, setUpdatedRegion] = useState(false);

  useEffect(() => {
    if (updateRegionFromImage) {
      setUpdatedRegion(true);
    }
  }, [selectedPosition, updateRegionFromImage]);

  const streetInputRef = useRef();
  const houseNumberInputRef = useRef();
  const postalCodeInputRef = useRef();
  const cityInputRef = useRef();

  const queryVariables = {
    start_date: '1900-01-01T00:00:00+01:00',
    status: Object.values(SueStatus).map((status) => status)
  };

  const { data, isLoading } = useQuery([QUERY_TYPES.SUE.REQUESTS, queryVariables], () =>
    getQuery(QUERY_TYPES.SUE.REQUESTS)(queryVariables)
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
    const { street, houseNumber, postalCode, city } = getValues();

    if (!street || !postalCode || !city) {
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&street=${street}+${houseNumber}&city=${city}&country=germany&postalcode=${postalCode}`
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

  const handleGeocode = async (position: { latitude: number; longitude: number }) => {
    try {
      await reverseGeocode({
        areaServiceData,
        errorMessage,
        position,
        setValue
      });
    } catch (error) {
      throw new Error(error.message);
    }
  };

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

  const onMapPress = async ({
    nativeEvent
  }: {
    nativeEvent: { action: string; coordinate: Location.LocationObjectCoords };
  }) => {
    if (nativeEvent.action !== 'marker-press' && nativeEvent.action !== 'callout-inside-press') {
      setSelectedPosition(nativeEvent.coordinate);
      setUpdatedRegion(false);
      setUpdateRegionFromImage(false);

      try {
        await handleGeocode(nativeEvent.coordinate);
      } catch (error) {
        setSelectedPosition(undefined);
        Alert.alert(texts.sue.report.alerts.hint, error.message);
        throw new Error(error.message);
      }
    }
  };

  const onMyLocationButtonPress = async ({ isFullScreenMap = false }) => {
    if (!isFullScreenMap) {
      Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.myLocation, [
        {
          text: texts.sue.report.alerts.no
        },
        {
          text: texts.sue.report.alerts.yes,
          onPress: async () => {
            if (currentPosition) {
              setSelectedPosition(currentPosition.coords);
              setUpdatedRegion(true);
              setUpdateRegionFromImage(false);

              try {
                await handleGeocode(currentPosition.coords);
              } catch (error) {
                setSelectedPosition(undefined);
                Alert.alert(texts.sue.report.alerts.hint, error.message);
              }
            }
          }
        }
      ]);
    } else {
      if (currentPosition) {
        setSelectedPosition(currentPosition.coords);
        setUpdatedRegion(true);
        setUpdateRegionFromImage(false);

        try {
          await handleGeocode(currentPosition.coords);
        } catch (error) {
          setSelectedPosition(undefined);
          Alert.alert(texts.sue.report.alerts.hint, error.message);
          throw new Error(error.message);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <WrapperHorizontal>
        <Map
          calloutTextEnabled
          isMaximizeButtonVisible
          isMyLocationButtonVisible={!!locationService}
          locations={locations}
          mapCenterPosition={mapCenterPosition}
          mapStyle={styles.map}
          onMyLocationButtonPress={onMyLocationButtonPress}
          onMapPress={onMapPress}
          onMaximizeButtonPress={() =>
            navigation.navigate(ScreenName.SueReportMapView, {
              calloutTextEnabled: true,
              currentPosition,
              isMyLocationButtonVisible: !!locationService,
              locations,
              mapCenterPosition: selectedPosition || mapCenterPosition,
              onMapPress,
              onMyLocationButtonPress,
              selectedPosition,
              showsUserLocation: true
            })
          }
          updatedRegion={
            !!selectedPosition && (updatedRegion || updateRegionFromImage)
              ? { ...selectedPosition, latitudeDelta: 0.01, longitudeDelta: 0.01 }
              : undefined
          }
        />
      </WrapperHorizontal>

      <Wrapper>
        <RegularText small>{texts.sue.report.mapHint}</RegularText>
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name={INPUT_KEYS.SUE.STREET}
          label={`${texts.sue.report.street} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.STREET) ? ' *' : ''
          }`}
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
          name={INPUT_KEYS.SUE.HOUSE_NUMBER}
          label={`${texts.sue.report.houseNumber} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.HOUSE_NUMBER) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.houseNumber}
          textContentType="off"
          control={control}
          onChange={geocode}
          ref={houseNumberInputRef}
          onSubmitEditing={() => postalCodeInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name={INPUT_KEYS.SUE.POSTAL_CODE}
          label={`${texts.sue.report.postalCode} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.POSTAL_CODE) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.postalCode}
          maxLength={5}
          keyboardType="numeric"
          textContentType="postalCode"
          control={control}
          onChange={geocode}
          ref={postalCodeInputRef}
          onSubmitEditing={() => cityInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name={INPUT_KEYS.SUE.CITY}
          label={`${texts.sue.report.city} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.CITY) ? ' *' : ''
          }`}
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
