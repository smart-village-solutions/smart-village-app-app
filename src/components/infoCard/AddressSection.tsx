import { LocationObject, LocationObjectCoords } from 'expo-location';
import _filter from 'lodash/filter';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';

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
import { WrapperRow, WrapperVertical } from '../Wrapper';

type Props = {
  address?: Address;
  addresses?: Address[];
  openWebScreen?: (link: string, specificTitle?: string) => void;
};

const addressOnPress = (address?: string, geoLocation?: LocationObjectCoords) => {
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
  const bbNaviBaseUrl = useContext(SettingsContext).globalSettings?.settings?.['bbnavi'];
  const isAddress = address || addresses?.length;
  const { position } = usePosition(!isAddress);
  const { position: lastKnownPosition } = useLastKnownPosition(!isAddress);

  const a11yText = consts.a11yLabel;

  if (!isAddress) {
    return null;
  }

  const filteredAddresses = _filter(addresses ?? [], (address) => address.kind === 'default');

  // we do not check for address.kind here as we passed in a specific address, that we want to show
  if (address) filteredAddresses.unshift(address);

  return (
    <>
      {filteredAddresses.map((item, index) => {
        const filteredAddress = formatAddress(item);

        if (!filteredAddress?.length) return null;

        const isPressable = item.city?.length || item.street?.length || item.zip?.length;

        const innerComponent = (
          <WrapperVertical>
            <WrapperRow centerVertical style={styles.wrap}>
              <Icon.Flag style={styles.margin} />
              <RegularText
                accessibilityLabel={`${a11yText.address} (${filteredAddress}) ${a11yText.button} ${a11yText.mapHint}`}
                primary
              >
                {filteredAddress}
              </RegularText>
            </WrapperRow>
          </WrapperVertical>
        );

        return (
          <View key={index}>
            {isPressable ? (
              <TouchableOpacity onPress={() => addressOnPress(filteredAddress, item.geoLocation)}>
                {innerComponent}
              </TouchableOpacity>
            ) : (
              innerComponent
            )}

            <Divider style={styles.divider} />

            {!!openWebScreen &&
              bbNaviBaseUrl?.length &&
              item.geoLocation?.latitude &&
              item.geoLocation?.longitude && (
                <>
                  <WrapperVertical>
                    <WrapperRow centerVertical style={styles.wrap}>
                      <Icon.RoutePlanner color={colors.primary} style={styles.margin} />
                      <TouchableOpacity
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

const styles = StyleSheet.create({
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
