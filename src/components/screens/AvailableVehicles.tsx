import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { IconUrl, colors, normalize, texts } from '../../config';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { WrapperHorizontal } from '../Wrapper';

export const vehiclePropertyKey = 'Datastreams/0/Observations/0/result';

export type VehicleStatusFeature = {
  properties: {
    [vehiclePropertyKey]: string;
  };
};

export const fetchAvailableVehicles = async (
  freeStatusUrl: string
): Promise<VehicleStatusFeature[]> => {
  let availableVehiclesData: VehicleStatusFeature[] = [];

  try {
    const response = await fetch(freeStatusUrl);

    const data = await response.json();
    const status = response.status;
    const ok = response.ok;

    const availableVehicles =
      Array.isArray(data?.features) && data.features.length
        ? data.features
        : data?.type === 'Feature'
        ? [data]
        : [];

    if (ok && status === 200 && availableVehicles.length) {
      availableVehiclesData = availableVehicles;
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }

  return availableVehiclesData;
};

export const AvailableVehicles = ({
  status,
  iconName
}: {
  status: 'frei' | 'belegt' | 'unbekannt' | null;
  iconName: string;
}) => {
  const statusCircle =
    status === 'frei' ? (
      <RegularText style={{ color: '#7cbb4d' }}> ⬤</RegularText>
    ) : status === 'belegt' ? (
      <RegularText style={{ color: '#e60041' }}> ⬤</RegularText>
    ) : null;
  return (
    <>
      <SectionHeader title={texts.pointOfInterest.availableVehicles} />

      <ListItem containerStyle={styles.container}>
        {!!iconName && <IconUrl iconName={iconName} />}
        <ListItem.Content style={styles.contentContainer}>
          <RegularText>{texts.pointOfInterest.status}: </RegularText>
          <RegularText>
            {status}
            {statusCircle}{' '}
          </RegularText>
        </ListItem.Content>
      </ListItem>

      <WrapperHorizontal>
        <Divider />
      </WrapperHorizontal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    padding: normalize(14)
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  divider: {
    backgroundColor: colors.placeholder
  }
});
