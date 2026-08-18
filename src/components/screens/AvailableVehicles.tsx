import React from 'react';
import 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { IconUrl, consts, normalize, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { WrapperHorizontal } from '../Wrapper';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const { HTML_REGEX } = consts;

export const vehiclePropertyKey = 'Datastreams/0/Observations/0/result';

// Status strings that are guaranteed to map to a named map-marker icon asset.
// Any other status value (e.g. numeric occupancy, 'unbekannt') must NOT be used
// as an icon name because no matching asset exists.
export const KNOWN_ICON_STATUS_NAMES = new Set(['frei', 'belegt']);

export type VehicleStatusFeature = {
  properties: {
    // The raw API value may be a status string ('frei', 'belegt', 'unbekannt') or a
    // numeric/percentage occupancy figure (e.g. Parkhaus), so we keep it broad here
    // and let the UI decide how to format/interpret it.
    [vehiclePropertyKey]: string | number | undefined;
  };
  iconName?: string;
  activeIconName?: string;
  // Legacy key kept for backwards compatibility with older freeStatusUrl payloads.
  iconNameActive?: string;
  isSpecialForParkHaus?: boolean;
};

export const fetchAvailableVehicles = async (
  freeStatusUrl: string,
  signal?: AbortSignal
): Promise<VehicleStatusFeature[]> => {
  let availableVehiclesData: VehicleStatusFeature[] = [];

  try {
    const response = await fetch(freeStatusUrl, { signal });

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
    // Re-throw AbortError so callers can detect request cancellation and skip state updates.
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.error('There was a problem with the fetch operation:', error);
  }

  return availableVehiclesData;
};

/* eslint-disable complexity */
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
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  if (loading) {
    return <LoadingSpinner loading={loading} />;
  }

  if (status == null || (typeof status === 'string' && !status.length)) {
    return null;
  }
  const statusCircle =
    status === 'frei' ? (
      <RegularText style={{ color: colors.primary }}> ⬤</RegularText>
    ) : status === 'belegt' ? (
      <RegularText style={{ color: colors.error }}> ⬤</RegularText>
    ) : null;

  if (isSpecialForParkHaus) {
    return (
      <>
        <SectionHeader title={texts.pointOfInterest.status} />

        <ListItem containerStyle={styles.container}>
          <ListItem.Content style={styles.contentContainer}>
            {typeof status === 'string' && HTML_REGEX.test(status) ? (
              <HtmlView html={status} />
            ) : (
              <RegularText>{status ?? texts.pointOfInterest.noAvailableVehicles}</RegularText>
            )}
          </ListItem.Content>
        </ListItem>

        <WrapperHorizontal>
          <Divider style={styles.divider} />
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
        <Divider style={styles.divider} />
      </WrapperHorizontal>
    </>
  );
};
/* eslint-enable complexity */

const createStyles = (colors) => ({
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
