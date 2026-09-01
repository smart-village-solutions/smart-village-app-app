import { LocationObject, LocationObjectCoords } from 'expo-location';
import _filter from 'lodash/filter';
import React, { useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { Icon, normalize, texts } from '../../config';
import {
  formatAddress,
  formatAddressSingleLine,
  hasConcretePostalAddress,
  isValidGeoLocation,
  locationLink,
  locationString,
  openLink
} from '../../helpers';
import { useLastKnownPosition, usePosition } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { Address } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  address?: Address;
  addresses?: Address[];
  openWebScreen?: (link: string, specificTitle?: string) => void;
  title?: string;
};

const addressOnPress = (
  address?: string,
  geoLocation?: LocationObjectCoords,
  fallbackTitle?: string
) => {
  const mapsString = locationString(address || fallbackTitle);
  const mapsLink = locationLink(mapsString, geoLocation);

  openLink(mapsLink);
};

const getBBNaviUrl = (baseUrl: string, address: Address, currentPosition?: LocationObject) => {
  const readableAddress = formatAddressSingleLine(address);

  const currentParam =
    currentPosition?.coords.latitude && currentPosition?.coords.longitude
      ? encodeURIComponent(
          `${texts.pointOfInterest.yourPosition}::${currentPosition.coords.latitude},${currentPosition.coords.longitude}`
        )
      : '-';

  const destinationParam = encodeURIComponent(
    `${readableAddress}::${address.geoLocation?.latitude},${address.geoLocation?.longitude}`
  );

  return `${baseUrl}${currentParam}/${destinationParam}/`;
};

export const AddressSection = ({ address, addresses, openWebScreen, title }: Props) => {
  const { colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  // @ts-expect-error global settings are not properly typed
  const bbNaviBaseUrl = useContext(SettingsContext).globalSettings?.settings?.['bbnavi'];
  const isAddress = address || addresses?.length;
  const { position } = usePosition(!isAddress);
  const { position: lastKnownPosition } = useLastKnownPosition(!isAddress);

  if (!isAddress) {
    return null;
  }

  const filteredAddresses = _filter(addresses ?? [], (address) => address.kind === 'default');

  // we do not check for address.kind here as we passed in a specific address, that we want to show
  if (address) filteredAddresses.unshift(address);

  return (
    <>
      {filteredAddresses.map((item, index) => {
        const formattedAddress = formatAddress(item);
        const hasPostalAddress = hasConcretePostalAddress(item);
        const hasGeoCoordinates = isValidGeoLocation(item.geoLocation);
        const addressText = hasPostalAddress
          ? formattedAddress || ''
          : hasGeoCoordinates
          ? texts.pointOfInterest.navigationWithoutAddress
          : '';

        if (!addressText.length) return null;

        const accessibilityLabel = hasPostalAddress
          ? `${a11yText.address} (${addressText}) ${a11yText.button} ${a11yText.mapHint}`
          : `${addressText} ${a11yText.button} ${a11yText.mapHint}`;

        const innerComponent = (
          <WrapperVertical>
            <WrapperRow centerVertical style={styles.wrap}>
              {hasPostalAddress ? (
                <Icon.Flag style={styles.margin} />
              ) : (
                <Icon.RoutePlanner color={colors.primary} style={styles.margin} />
              )}
              <RegularText primary>{addressText}</RegularText>
            </WrapperRow>
          </WrapperVertical>
        );

        return (
          <View key={index}>
            <TouchableOpacity
              accessible
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              focusable
              onPress={() =>
                addressOnPress(
                  hasPostalAddress ? formattedAddress : undefined,
                  item.geoLocation,
                  title
                )
              }
            >
              {innerComponent}
            </TouchableOpacity>

            <Divider style={styles.divider} />

            {!!openWebScreen && bbNaviBaseUrl?.length && hasGeoCoordinates && (
              <>
                <WrapperVertical>
                  <WrapperRow centerVertical style={styles.wrap}>
                    <Icon.RoutePlanner color={colors.primary} style={styles.margin} />
                    <TouchableOpacity
                      accessibilityLabel={texts.pointOfInterest.routePlanner}
                      accessibilityRole="button"
                      onPress={() =>
                        openWebScreen(
                          getBBNaviUrl(bbNaviBaseUrl, item, position ?? lastKnownPosition),
                          texts.screenTitles.routePlanner
                        )
                      }
                    >
                      <RegularText primary>{texts.pointOfInterest.routePlanner}</RegularText>
                    </TouchableOpacity>
                  </WrapperRow>
                </WrapperVertical>
                <Divider style={styles.divider} />
              </>
            )}
          </View>
        );
      })}
    </>
  );
};

const createStyles = (colors) => ({
  divider: {
    backgroundColor: colors.placeholder
  },

  margin: {
    marginRight: normalize(10),
    marginTop: normalize(-1)
  },

  wrap: {
    width: '90%'
  }
});
