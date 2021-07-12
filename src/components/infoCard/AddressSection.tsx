import _filter from 'lodash/filter';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, normalize } from '../../config';
import { formatAddress, locationLink, locationString, openLink } from '../../helpers';
import { Address } from '../../types';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

type Props = {
  address?: Address;
  addresses?: Address[];
};

const addressOnPress = (address?: string) => {
  const mapsString = locationString(address);
  const mapsLink = locationLink(mapsString);

  openLink(mapsLink);
};

export const AddressSection = ({ address, addresses }: Props) => {
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
            accessibilityLabel={`(Adresse) ${address} (Taste) (Wechselt zur Karten-App)`}
          >
            {address}
          </RegularText>
        );

        return (
          <InfoBox key={index}>
            <Icon.Location style={styles.margin} />
            {isPressable ? (
              <TouchableOpacity onPress={() => addressOnPress(address)}>
                {innerComponent}
              </TouchableOpacity>
            ) : (
              innerComponent
            )}
          </InfoBox>
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
