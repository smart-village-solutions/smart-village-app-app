import { LocationObject } from 'expo-location';
import _filter from 'lodash/filter';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../config';
import {
  formatAddress,
  formatAddressSingleLine,
  locationLink,
  locationString,
  openLink
} from '../../helpers';
import { useLastKnownPosition, usePosition } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { Address } from '../../types';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

type Props = {
  address?: Address;
  addresses?: Address[];
  openWebScreen: (link: string) => void;
};

const addressOnPress = (
  address?: string,
  geoLocation?: {
    latitude: number;
    longitude: number;
  }
) => {
  const mapsString = locationString(address);
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

export const AddressSection = ({ address, addresses, openWebScreen }: Props) => {
  // @ts-expect-error global settings are not properly typed
  const bbNaviBaseUrl = useContext(SettingsContext).globalSettings.settings?.['bbnavi'];
  const { position } = usePosition();
  const { position: lastKnownPosition } = useLastKnownPosition();

  const a11yText = consts.a11yLabel;

  if (!address && !addresses?.length) {
    return null;
  }

  const filteredAddresses = _filter(addresses ?? [], (address) => address.kind === 'default');

  // we do not check for address.kind here as we passed in a specific address, that we want to show
  if (address) filteredAddresses.unshift(address);

  return (
    <>
      {filteredAddresses.map((item, index) => {
        const address = formatAddress(item);

        if (!address?.length) return null;

        const isPressable = item.city?.length || item.street?.length || item.zip?.length;

        const innerComponent = (
          <RegularText
            primary
            accessibilityLabel={`${a11yText.address} (${address})
            ${a11yText.button}
            ${a11yText.mapHint}`}
          >
            {address}
          </RegularText>
        );

        return (
          <View key={index}>
            <InfoBox>
              <Icon.Location style={styles.margin} />
              {isPressable ? (
                <TouchableOpacity onPress={() => addressOnPress(address, item.geoLocation)}>
                  {innerComponent}
                </TouchableOpacity>
              ) : (
                innerComponent
              )}
            </InfoBox>
            {!!openWebScreen &&
              bbNaviBaseUrl?.length &&
              item.geoLocation?.latitude &&
              item.geoLocation?.longitude && (
                <InfoBox>
                  <Icon.RoutePlanner color={colors.primary} style={styles.margin} />
                  <TouchableOpacity
                    onPress={() =>
                      openWebScreen(
                        getBBNaviUrl(bbNaviBaseUrl, item, position ?? lastKnownPosition)
                      )
                    }
                  >
                    <RegularText primary>{texts.pointOfInterest.routePlanner}</RegularText>
                  </TouchableOpacity>
                </InfoBox>
              )}
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  margin: {
    marginRight: normalize(12)
  }
});
