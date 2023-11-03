import * as Location from 'expo-location';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { device, normalize, texts } from '../../../config';
import { useLocationSettings, useSystemPermission } from '../../../hooks';
import { MapMarker } from '../../../types';
import { LoadingSpinner } from '../../LoadingSpinner';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';
import { Map } from '../../map';
import { getLocationMarker } from '../../settings';
import { RegularText } from '../../Text';

export const SueReportLocation = ({
  control,
  selectedPosition,
  setSelectedPosition
}: {
  control: any;
  selectedPosition: Location.LocationObjectCoords | undefined;
  setSelectedPosition: (position: Location.LocationObjectCoords | undefined) => void;
}) => {
  const { locationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};
  const baseLocationMarker = {
    iconName: 'location'
  };

  let locations = [] as MapMarker[];

  if (selectedPosition) {
    locations = [{ ...baseLocationMarker, position: selectedPosition }];
  } else if (alternativePosition) {
    locations = [getLocationMarker({ ...baseLocationMarker, ...alternativePosition })];
  } else if (defaultAlternativePosition) {
    locations = [getLocationMarker({ ...baseLocationMarker, ...defaultAlternativePosition })];
  }

  return (
    <View style={styles.container}>
      <Map
        locations={locations}
        mapCenterPosition={{ latitude: 51.1657, longitude: 10.4515 }} // center of Germany
        mapStyle={styles.map}
        onMapPress={({ nativeEvent }) => {
          setSelectedPosition({
            ...nativeEvent.coordinate
          });
        }}
      />

      <Wrapper>
        <RegularText small>{texts.sue.report.mapHint}</RegularText>
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="street"
          label={`${texts.sue.report.street} *`}
          placeholder={texts.sue.report.street}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="homeNumber"
          label={`${texts.sue.report.homeNumber} *`}
          placeholder={texts.sue.report.homeNumber}
          keyboardType="numeric"
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="zipCode"
          label={`${texts.sue.report.zipCode} *`}
          placeholder={texts.sue.report.zipCode}
          keyboardType="numeric"
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="city"
          label={`${texts.sue.report.city} *`}
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
