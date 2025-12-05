import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  isFullscreenMap,
  requiredInputs,
  selectedPosition,
  setIsFullscreenMap,
  setSelectedPosition,
  setUpdateRegionFromImage,
  setValue
}: {
  areaServiceData?: { postalCodes?: string[] };
  configuration: {
    geoMap: {
      clusterDistance: number;
      clusterThreshold: number;
    };
  };
  control: any;
  errorMessage: string;
  getValues: UseFormGetValues<TValues>;
  isFullscreenMap: boolean;
  requiredInputs: keyof TValues[];
  selectedPosition?: Location.LocationObjectCoords;
  setIsFullscreenMap: (value: boolean) => void;
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
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();

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

  const { bottom: safeAreaBottom, top: safeAreaTop } = useSafeAreaInsets();
  const bottomTabBarHeight = useBottomTabBarHeight();

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

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

  const locations = mapMarkers as MapMarker[];

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  const onMapPress = ({ geometry }: { geometry: { coordinates: number[] } }) => {
    const position = { latitude: geometry?.coordinates[1], longitude: geometry?.coordinates[0] };
    setSelectedPosition(position);
    setUpdateRegionFromImage(false);

    return reverseGeocode({
      areaServiceData,
      errorMessage,
      position,
      setValue
    })
      .then(() => {
        return { isLocationSelectable: true };
      })
      .catch((error) => {
        setSelectedPosition(undefined);
        Alert.alert(texts.sue.report.alerts.hint, error?.message);
        return { isLocationSelectable: false };
      });
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

            !!currentPosition &&
              onMapPress({
                geometry: {
                  coordinates: [currentPosition.coords.longitude, currentPosition.coords.latitude]
                }
              });
          }
        }
      ]);
    } else {
      !!currentPosition &&
        onMapPress({
          geometry: {
            coordinates: [currentPosition.coords.longitude, currentPosition.coords.latitude]
          }
        });
    }
  };

  return (
    <View style={[styles.container, isFullscreenMap && styles.noPaddingTop]}>
      <WrapperHorizontal>
        <MapLibre
          calloutTextEnabled
          clusterDistance={configuration.geoMap?.clusterDistance}
          clusterThreshold={configuration.geoMap?.clusterThreshold}
          isMultipleMarkersMap
          isMyLocationButtonVisible={!!locationService}
          locations={locations}
          mapStyle={[
            styles.map,
            isFullscreenMap && styles.fullscreenMap,
            isFullscreenMap && {
              height: device.height - safeAreaBottom - safeAreaTop - bottomTabBarHeight
            }
          ]}
          onMapPress={onMapPress}
          onMarkerPress={setSelectedPointOfInterest}
          onMyLocationButtonPress={onMyLocationButtonPress}
          onMaximizeButtonPress={() => setIsFullscreenMap((prev: boolean) => !prev)}
          selectedMarker={selectedPointOfInterest}
          selectedPosition={selectedPosition}
          setPinEnabled
          preserveZoomOnSelectedPosition
        />
      </WrapperHorizontal>

      <Wrapper style={[isFullscreenMap && styles.wrapperHidden]}>
        <RegularText small>{texts.sue.report.mapHint}</RegularText>
      </Wrapper>

      <Wrapper noPaddingTop style={[isFullscreenMap && styles.wrapperHidden]}>
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

      <Wrapper noPaddingTop style={[isFullscreenMap && styles.wrapperHidden]}>
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

      <Wrapper noPaddingTop style={[isFullscreenMap && styles.wrapperHidden]}>
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

      <Wrapper noPaddingTop style={[isFullscreenMap && styles.wrapperHidden]}>
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
    paddingTop: normalize(16),
    width: '100%'
  },
  fullscreenMap: {
    marginLeft: 0,
    width: device.width
  },
  map: {
    height: normalize(300),
    width: device.width - 2 * normalize(16)
  },
  noPaddingTop: {
    paddingTop: 0
  },
  wrapperHidden: {
    display: 'none'
  }
});
