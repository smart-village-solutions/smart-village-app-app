import _filter from 'lodash/filter';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize } from '../../config';
import {
  formatAddress,
  formatAddressSingleLine,
  locationLink,
  locationString,
  openLink
} from '../../helpers';
import { SettingsContext } from '../../SettingsProvider';
import { Address } from '../../types';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

type Props = {
  address?: Address;
  addresses?: Address[];
  openWebScreen: (link: string) => void;
};

const addressOnPress = (address?: string) => {
  const mapsString = locationString(address);
  const mapsLink = locationLink(mapsString);

  openLink(mapsLink);
};

const getBBNaviUrl = (baseUrl: string, address: Address) => {
  // TODO: add location service, remove default, add proper type
  const currentPosition: any = undefined;

  const readableAddress = formatAddressSingleLine(address);

  const currentParam =
    currentPosition?.latitude && currentPosition?.longitude
      ? encodeURIComponent(`${currentPosition.latitude},${currentPosition.longitude}`)
      : '-';

  const destinationParam = encodeURIComponent(
    `${readableAddress}::${address.geoLocation?.latitude},${address.geoLocation?.longitude}`
  );

  return `${baseUrl}${currentParam}/${destinationParam}/`;
};

export const AddressSection = ({ address, addresses, openWebScreen }: Props) => {
  // @ts-expect-error global settings are not properly typed
  const bbNaviBaseUrl = useContext(SettingsContext).globalSettings.settings?.['bbnavi'];

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
                <TouchableOpacity onPress={() => addressOnPress(address)}>
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
                  <Icon.Location color={colors.transparent} style={styles.margin} />
                  <TouchableOpacity
                    onPress={() => openWebScreen(getBBNaviUrl(bbNaviBaseUrl, item))}
                  >
                    <RegularText primary>»Zur bbnavi-Routenplanung«</RegularText>
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
    marginRight: normalize(10)
  }
});
