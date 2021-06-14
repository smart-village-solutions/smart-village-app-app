import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';

import { colors, device, normalize, texts } from '../../config';
import { openLink, locationLink, locationString } from '../../helpers';
import { location } from '../../icons';
import { Icon } from '../Icon';
import { RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { InfoBox, Wrapper } from '../Wrapper';

const addressOnPress = (address) => {
  const mapsString = locationString(address);
  const mapsLink = locationLink(mapsString);

  openLink(mapsLink);
};

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const TourCard = ({ addresses, lengthKm }) => (
  <View>
    <TitleContainer>
      <Title accessibilityLabel={`${texts.tour.tour} (Überschrift)`}>{texts.tour.tour}</Title>
    </TitleContainer>
    {device.platform === 'ios' && <TitleShadow />}
    <Wrapper>
      {!!lengthKm && (
        <InfoBox>
          <RNEIcon name="map" type="material" color={colors.primary} iconStyle={styles.margin} />
          <RegularText>{lengthKm} km</RegularText>
        </InfoBox>
      )}

      {!!addresses &&
        _filter(addresses, (address) => address.kind === 'start' || address.kind === 'end').map(
          (item, index) => {
            const { city, street, zip, kind } = item;
            let address = '';

            if (!city && !street && !zip) return null;

            // build the address in multiple steps to check every data before rendering
            if (street) {
              address += `${street},${'\n'}`;
            }
            if (zip) {
              address += `${zip} `;
            }
            if (city) {
              address += city;
            }

            return (
              <InfoBox key={index}>
                <Icon xml={location(colors.primary)} style={styles.margin} />
                <View>
                  <RegularText>{kind === 'start' ? texts.tour.start : texts.tour.end}</RegularText>
                  <TouchableOpacity onPress={() => addressOnPress(address)}>
                    <RegularText primary>{address}</RegularText>
                  </TouchableOpacity>
                </View>
              </InfoBox>
            );
          }
        )}
    </Wrapper>
  </View>
);
/* eslint-enable complexity */

const styles = StyleSheet.create({
  margin: {
    marginRight: normalize(10)
  }
});

TourCard.propTypes = {
  addresses: PropTypes.array,
  lengthKm: PropTypes.number
};
