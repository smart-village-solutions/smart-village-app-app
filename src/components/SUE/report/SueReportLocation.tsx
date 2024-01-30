import * as Location from 'expo-location';
import React, { useCallback, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';

import { device, normalize, texts } from '../../../config';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../../hooks';
import { MapMarker } from '../../../types';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';
import { Map } from '../../map';
import { getLocationMarker } from '../../settings';

export const SueReportLocation = ({
  control,
  selectedPosition,
  setSelectedPosition,
  setValue
}: {
  control: any;
  selectedPosition: Location.LocationObjectCoords | undefined;
  setSelectedPosition: (position: Location.LocationObjectCoords | undefined) => void;
  setValue: UseFormSetValue<{
    city: string;
    description: string;
    email: string;
    firstName: string;
    houseNumber: string;
    images: string;
    lastName: string;
    phone: string;
    street: string;
    termsOfService: boolean;
    title: string;
    zipCode: string;
  }>;
}) => {
  const { locationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();
  const { position } = usePosition(systemPermission?.status !== Location.PermissionStatus.GRANTED);
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED
  );
  const [updatedRegion, setUpdatedRegion] = useState(false);

  // create useCallback method for reverseGeocode
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

  let locations = [] as MapMarker[];
  let mapCenterPosition = {} as { latitude: number; longitude: number };

  if (selectedPosition) {
    locations = [{ ...baseLocationMarker, position: selectedPosition }];
  }

  if (alternativePosition) {
    mapCenterPosition = getLocationMarker(alternativePosition).position;
  } else if (defaultAlternativePosition) {
    mapCenterPosition = getLocationMarker(defaultAlternativePosition).position;
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
          setUpdatedRegion(true);
          setSelectedPosition(nativeEvent.coordinate);
          reverseGeocode(nativeEvent.coordinate);
        }}
        updatedRegion={selectedPosition && updatedRegion ? { ...selectedPosition } : undefined}
      />

      <Wrapper>
        <RegularText small>{texts.sue.report.mapHint}</RegularText>
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="street"
          label={texts.sue.report.street}
          placeholder={texts.sue.report.street}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="houseNumber"
          label={texts.sue.report.houseNumber}
          placeholder={texts.sue.report.houseNumber}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="zipCode"
          label={texts.sue.report.zipCode}
          placeholder={texts.sue.report.zipCode}
          maxLength={5}
          keyboardType="numeric"
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="city"
          label={texts.sue.report.city}
          placeholder={texts.sue.report.city}
          control={control}
        />
      </Wrapper>
    </View>
  );
};

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
