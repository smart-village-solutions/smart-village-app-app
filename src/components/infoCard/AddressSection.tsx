import _filter from 'lodash/filter';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, normalize } from '../../config';

import { formatAddress, locationLink, locationString, openLink } from '../../helpers';
import { location } from '../../icons';
import { Address } from '../../types';
import { Icon } from '../Icon';
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

        return (
          <InfoBox key={index}>
            <Icon xml={location(colors.primary)} style={styles.margin} />
            <TouchableOpacity onPress={() => addressOnPress(address)}>
              <RegularText
                primary
                accessibilityLabel={`(Adresse) ${address} (Taste) (Wechselt zur Karten-App)`}
              >
                {address}
              </RegularText>
            </TouchableOpacity>
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
