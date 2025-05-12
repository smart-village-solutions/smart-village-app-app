import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { Alert, Linking, StyleSheet, View } from 'react-native';
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
import { SETTINGS_SCREENS, TValues, mapToMapMarkers } from '../../../screens';
import { MapMarker, ScreenName } from '../../../types';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Wrapper, WrapperHorizontal } from '../../Wrapper';
import { Input } from '../../form';
import { MapLibre } from '../../map';
import { getLocationMarker } from '../../settings';

const { a11yLabel, INPUT_KEYS } = consts;

export const locationServiceEnabledAlert = ({
  currentPosition,
  locationServiceEnabled,
  navigation
}: {
  currentPosition?: Location.LocationObject;
  locationServiceEnabled?: boolean;
  navigation: StackNavigationProp<any>;
}) => {
  if (!locationServiceEnabled || !currentPosition) {
    Alert.alert(
      texts.settingsTitles.locationService,
      !locationServiceEnabled
        ? texts.settingsContents.locationService.onLocationServiceMissing
        : texts.settingsContents.locationService.onSystemPermissionMissing,
      [
        {
          text: texts.sue.report.alerts.imageSelectAlert.cancel
        },
        {
          text: texts.sue.report.alerts.settings,
          onPress: () => {
            if (!locationServiceEnabled) {
              navigation.navigate(ScreenName.Settings, {
                setting: SETTINGS_SCREENS.LOCATION,
                title: texts.settingsContents.locationService.setting
              });
            } else if (!currentPosition) {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }
};

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
  configuration,
  control,
  errorMessage,
  requiredInputs,
  selectedPosition,
  setSelectedPosition,
  setUpdateRegionFromImage,
  setValue
}: {
  areaServiceData?: { postalCodes?: string[] };
  configuration: {
    geoMap: {
      clusterDistance: number;
    };
  };
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
  const { locationSettings = {} } = useLocationSettings();
  const { locationService: locationServiceEnabled } = locationSettings;
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { locationService } = settings;
  const systemPermission = useSystemPermission();
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {} } = appDesignSystem;
  const { mapPinColors = {} } = sueStatus;
  const {
    activeBackgroundColors = {},
    activeIconColors = {},
    backgroundColors = {},
    iconColors = {}
  } = mapPinColors;
  const [address, setAddress] = useState(
    {} as { street: string; houseNumber: string; postalCode: string; city: string }
  );
  const [isLocationSelectable, setIsLocationSelectable] = useState<boolean>(false);

  const { position } = usePosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED || !locationServiceEnabled
  );
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED || !locationServiceEnabled
  );
  const currentPosition = position || lastKnownPosition;

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
        activeBackgroundColors,
        activeIconColors,
        backgroundColors,
        iconColors
      ) || [],
    [data]
  );

  const geocode = useCallback(async () => {
    const { street, houseNumber, postalCode, city } = address;

    if (!street || !postalCode || !city) {
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&street=${street}+${houseNumber}&city=${city}&postalcode=${postalCode}&country=germany&countrycodes=de`
      );

      const data = await response.json();
      const latitude = data?.[0]?.lat;
      const longitude = data?.[0]?.lon;

      if (latitude && longitude) {
        setSelectedPosition({ latitude: Number(latitude), longitude: Number(longitude) });
      }
    } catch (error) {
      console.error('Geocoding Error:', error);
    }
  }, [address]);

  useEffect(() => {
    geocode();
  }, [address]);

  const handleGeocode = async (position: Location.LocationObjectCoords) =>
    await reverseGeocode({
      areaServiceData,
      errorMessage,
      position,
      setValue
    });

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};
  const locations = mapMarkers as MapMarker[];
  let mapCenterPosition = {} as Location.LocationObjectCoords;

  if (alternativePosition) {
    mapCenterPosition = getLocationMarker(alternativePosition).position;
  } else if (defaultAlternativePosition) {
    mapCenterPosition = getLocationMarker(defaultAlternativePosition).position;
  }

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  const onMapPress = async ({
    geometry
  }: {
    geometry: { coordinates: Location.LocationObjectCoords };
  }) => {
    const coordinate = { latitude: geometry?.coordinates[1], longitude: geometry?.coordinates[0] };
    setSelectedPosition(coordinate);

    try {
      setIsLocationSelectable(true);
      await handleGeocode(coordinate);
    } catch (error) {
      setIsLocationSelectable(false);
      setSelectedPosition(undefined);
      Alert.alert(texts.sue.report.alerts.hint, error?.message);
      return { error: error?.message };
    }
  };

  const onMyLocationButtonPress = async ({
    isFullScreenMap = false
  }: {
    isFullScreenMap?: boolean;
  }) => {
    if (!isFullScreenMap) {
      Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.myLocation, [
        {
          text: texts.sue.report.alerts.no
        },
        {
          text: texts.sue.report.alerts.yes,
          onPress: async () => {
            locationServiceEnabledAlert({
              currentPosition,
              locationServiceEnabled,
              navigation
            });

            if (currentPosition) {
              setSelectedPosition(currentPosition.coords);
              setUpdateRegionFromImage(false);

              try {
                setIsLocationSelectable(true);
                await handleGeocode(currentPosition.coords);
              } catch (error) {
                setIsLocationSelectable(false);
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
        setUpdateRegionFromImage(false);

        try {
          setIsLocationSelectable(true);
          await handleGeocode(currentPosition.coords);
        } catch (error) {
          setIsLocationSelectable(false);
          setSelectedPosition(undefined);
          Alert.alert(texts.sue.report.alerts.hint, error.message);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <WrapperHorizontal>
        <MapLibre
          calloutTextEnabled
          clusterDistance={configuration.geoMap?.clusterDistance}
          isLocationSelectable={isLocationSelectable}
          isMultipleMarkersMap
          isMyLocationButtonVisible={!!locationService}
          locations={locations}
          mapStyle={styles.map}
          onMapPress={onMapPress}
          onMyLocationButtonPress={onMyLocationButtonPress}
          onMaximizeButtonPress={() =>
            navigation.navigate(ScreenName.SueReportMapView, {
              calloutTextEnabled: true,
              clusteringEnabled: true,
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
          selectedPosition={selectedPosition}
        />
      </WrapperHorizontal>

      <Wrapper>
        <RegularText small>{texts.sue.report.mapHint}</RegularText>
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          accessibilityLabel={`${texts.sue.report.STREET} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.STREET) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.STREET}
          label={`${texts.sue.report.street} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.STREET) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.street}
          textContentType="streetAddressLine1"
          control={control}
          onChange={({ nativeEvent }: { nativeEvent: { text: string } }) =>
            setAddress((prev) => ({ ...prev, [INPUT_KEYS.SUE.STREET]: nativeEvent.text }))
          }
          ref={streetInputRef}
          onSubmitEditing={() => houseNumberInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          accessibilityLabel={`${texts.sue.report.houseNumber} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.HOUSE_NUMBER) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.HOUSE_NUMBER}
          label={`${texts.sue.report.houseNumber} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.HOUSE_NUMBER) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.houseNumber}
          textContentType="off"
          control={control}
          onChange={({ nativeEvent }: { nativeEvent: { text: string } }) =>
            setAddress((prev) => ({ ...prev, [INPUT_KEYS.SUE.HOUSE_NUMBER]: nativeEvent.text }))
          }
          ref={houseNumberInputRef}
          onSubmitEditing={() => postalCodeInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          accessibilityLabel={`${texts.sue.report.postalCode} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.POSTAL_CODE) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.POSTAL_CODE}
          label={`${texts.sue.report.postalCode} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.POSTAL_CODE) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.postalCode}
          maxLength={5}
          keyboardType="numeric"
          textContentType="postalCode"
          control={control}
          onChange={({ nativeEvent }: { nativeEvent: { text: string } }) =>
            setAddress((prev) => ({ ...prev, [INPUT_KEYS.SUE.POSTAL_CODE]: nativeEvent.text }))
          }
          ref={postalCodeInputRef}
          onSubmitEditing={() => cityInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          accessibilityLabel={`${texts.sue.report.city} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.CITY) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.CITY}
          label={`${texts.sue.report.city} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.CITY) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.city}
          control={control}
          textContentType="addressCity"
          onChange={({ nativeEvent }: { nativeEvent: { text: string } }) =>
            setAddress((prev) => ({ ...prev, [INPUT_KEYS.SUE.CITY]: nativeEvent.text }))
          }
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
    height: normalize(300),
    width: device.width - 2 * normalize(14)
  }
});
