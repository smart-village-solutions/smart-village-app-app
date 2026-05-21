import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { IconUrl, colors, normalize, texts } from '../../config';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { WrapperHorizontal } from '../Wrapper';
import { LoadingSpinner } from '../LoadingSpinner';

export const vehiclePropertyKey = 'Datastreams/0/Observations/0/result';

export type VehicleStatusFeature = {
  properties: {
    // The raw API value may be a status string ('frei', 'belegt', 'unbekannt') or a
    // numeric/percentage occupancy figure (e.g. Parkhaus), so we keep it broad here
    // and let the UI decide how to format/interpret it.
    [vehiclePropertyKey]: string | number | undefined;
  };
  isSpecialForParkHaus?: boolean;
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
  iconName,
  isSpecialForParkHaus,
  loading,
  status
}: {
  iconName: string;
  isSpecialForParkHaus?: boolean;
  loading: boolean;
  // Widened to match VehicleStatusFeature – string for named statuses, number for occupancy
  status: string | number | undefined;
}) => {
  if (loading) {
    return <LoadingSpinner loading={loading} />;
  }

  const statusCircle =
    status === 'frei' ? (
      <RegularText style={{ color: '#7cbb4d' }}> ⬤</RegularText>
    ) : status === 'belegt' ? (
      <RegularText style={{ color: '#e60041' }}> ⬤</RegularText>
    ) : null;

  if (isSpecialForParkHaus) {
    return (
      <>
        <SectionHeader title={texts.pointOfInterest.status} />

        <ListItem containerStyle={styles.container}>
          <ListItem.Content style={styles.contentContainer}>
            <RegularText>{status}</RegularText>
          </ListItem.Content>
        </ListItem>

        <WrapperHorizontal>
          <Divider />
        </WrapperHorizontal>
      </>
    );
  }
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
