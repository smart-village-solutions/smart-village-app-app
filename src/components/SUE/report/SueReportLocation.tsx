import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useNavigation } from 'expo-router/react-navigation';
import { StackNavigationProp } from 'expo-router/js-stack';
import * as Location from 'expo-location';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Alert, Linking, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useQuery } from 'react-query';

import { ConfigurationsContext } from '../../../ConfigurationsProvider';
import { SettingsContext } from '../../../SettingsProvider';
import { SUE_STATUS, consts, device, normalize, texts } from '../../../config';
import { parseListItemsFromQuery } from '../../../helpers';
import { SueCoordinates, SueLocationRequest } from '../../../hooks/useSueReportLocation';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useReverseGeocode,
  useSystemPermission
} from '../../../hooks';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { SETTINGS_SCREENS } from '../../../screens/SettingsScreen';
import { mapToMapMarkers } from '../../../screens/SUE/SueMapScreen';
import { TValues } from '../../../screens/SUE/SueReportScreen';
import { MapMarker, ScreenName } from '../../../types';
import { Button } from '../../Button';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
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

export { SUE_STATUS } from '../../../config';

const SUE_MAP_STATUSES = [
  SUE_STATUS.IN_PROCESS,
  SUE_STATUS.INVALID,
  SUE_STATUS.OPEN,
  SUE_STATUS.WAIT_REQUESTOR,
  SUE_STATUS.WAIT_THIRDPARTY
];

/* eslint-disable complexity */
export const SueReportLocation = ({
  areaServiceData,
  beginLocationUpdate,
  configuration,
  control,
  errorMessage,
  invalidateLocation,
  isFullscreenMap,
  requiredInputs,
  resolveManualLocation,
  selectedPosition,
  setIsFullscreenMap,
  setSelectedPosition,
  setShowCoordinatesFromImageAlert,
  setUpdateRegionFromImage,
  setValue
}: {
  areaServiceData?: { postalCodes?: string[] };
  beginLocationUpdate: () => SueLocationRequest;
  configuration: {
    geoMap: {
      clusterDistance: number;
      clusterThreshold: number;
    };
  };
  control: any;
  errorMessage: string;
  invalidateLocation: () => void;
  isFullscreenMap: boolean;
  requiredInputs?: (keyof TValues)[];
  resolveManualLocation: () => Promise<boolean | undefined>;
  selectedPosition?: SueCoordinates;
  setIsFullscreenMap: (value: boolean) => void;
  setSelectedPosition: (position?: SueCoordinates) => void;
  setShowCoordinatesFromImageAlert: (value: boolean) => void;
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
  const isMyLocationButtonVisible = locationService !== false;
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
    status: SUE_MAP_STATUSES
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

  const geocode = async () => {
    if ((await resolveManualLocation()) === false) {
      Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.locationUnconfirmed);
    }
  };

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

  const locations = mapMarkers as MapMarker[];

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  const clearAddressFields = () => {
    setValue('city', '');
    setValue('houseNumber', '');
    setValue('street', '');
    setValue('postalCode', '');
  };

  const selectMapPosition = async (position: SueCoordinates, request: SueLocationRequest) => {
    if (!request.isLatestRequest()) return;
    setShowCoordinatesFromImageAlert(true);
    setUpdateRegionFromImage(false);
    setSelectedPosition(undefined);
    clearAddressFields();

    try {
      const result = await reverseGeocode({
        areaServiceData,
        errorMessage,
        isLatestRequest: request.isLatestRequest,
        position,
        setValue
      });

      if (request.isLatestRequest() && result.isWithinArea) setSelectedPosition(position);
    } catch (error) {
      if (request.isLatestRequest()) {
        clearAddressFields();
        Alert.alert(texts.sue.report.alerts.hint, error?.message);
      }
    } finally {
      request.finish();
    }
  };

  const onMapPress = ({ geometry }: { geometry: { coordinates: number[] } }) =>
    selectMapPosition(
      { latitude: geometry?.coordinates[1], longitude: geometry?.coordinates[0] },
      beginLocationUpdate()
    );

  const onMyLocationButtonPress = async ({
    isFullScreenMap = false
  }: {
    isFullScreenMap?: boolean;
  }) => {
    const resolvePosition = async () => {
      const fallbackPosition = position || lastKnownPosition;

      if (fallbackPosition?.coords) {
        return fallbackPosition;
      }

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Platform.select({
            ios: Location.Accuracy.Balanced,
            default: undefined
          })
        });

        return current || (await Location.getLastKnownPositionAsync({}));
      } catch (error) {
        return await Location.getLastKnownPositionAsync({});
      }
    };

    const applyCurrentPosition = async () => {
      if (!locationServiceEnabled) {
        locationServiceEnabledAlert({
          currentPosition: undefined,
          locationServiceEnabled: false,
          navigation
        });
        return false;
      }

      const request = beginLocationUpdate();
      try {
        const permissionResponse = await Location.getForegroundPermissionsAsync();
        if (!request.isLatestRequest()) return false;

        const hasPermission = permissionResponse.status === Location.PermissionStatus.GRANTED;
        const resolvedPosition = hasPermission ? await resolvePosition() : undefined;
        if (!request.isLatestRequest()) return false;

        if (!resolvedPosition?.coords) {
          locationServiceEnabledAlert({
            currentPosition: undefined,
            locationServiceEnabled: true,
            navigation
          });
          return false;
        }

        await selectMapPosition(resolvedPosition.coords, request);
        return request.isLatestRequest();
      } finally {
        request.finish();
      }
    };

    if (!isFullScreenMap) {
      Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.myLocation, [
        {
          text: texts.sue.report.alerts.no
        },
        {
          text: texts.sue.report.alerts.yes,
          onPress: applyCurrentPosition
        }
      ]);
    } else {
      return applyCurrentPosition();
    }
  };

  return (
    <>
      <Wrapper noPaddingBottom noPaddingTop={isFullscreenMap}>
        <MapLibre
          calloutTextEnabled
          clusterDistance={configuration.geoMap?.clusterDistance}
          clusterThreshold={configuration.geoMap?.clusterThreshold}
          currentPosition={currentPosition}
          isMultipleMarkersMap
          isMyLocationButtonVisible={isMyLocationButtonVisible}
          locations={locations}
          mapStyle={[
            styles.map,
            isFullscreenMap && styles.fullscreenMap,
            isFullscreenMap && {
              height:
                device.height -
                safeAreaBottom -
                safeAreaTop -
                bottomTabBarHeight -
                (device.platform === 'android' ? getStatusBarHeight() : 0)
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
      </Wrapper>

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
          onChange={invalidateLocation}
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
          onChange={invalidateLocation}
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
          onChange={invalidateLocation}
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
          onChange={invalidateLocation}
          ref={cityInputRef}
        />
      </Wrapper>
      <Wrapper noPaddingTop style={[isFullscreenMap && styles.wrapperHidden]}>
        <Button invert onPress={geocode} title={texts.sue.report.showAddressOnMap} />
      </Wrapper>
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  fullscreenMap: {
    marginLeft: 0,
    marginRight: 0,
    width: device.width
  },
  map: {
    height: normalize(300),
    width: device.width - 2 * normalize(16)
  },
  wrapperHidden: {
    display: 'none'
  }
});
