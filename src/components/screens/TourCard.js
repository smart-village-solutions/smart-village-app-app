import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';

import { colors, Icon, normalize, texts } from '../../config';
import { locationLink, locationString, openLink } from '../../helpers';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { InfoBox, Wrapper } from '../Wrapper';

const addressOnPress = (address) => {
  const mapsString = locationString(address);
  const mapsLink = locationLink(mapsString);

  openLink(mapsLink);
};

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const TourCard = ({ lengthKm, tourAddresses }) => (
  <View>
    <SectionHeader title={texts.tour.tour} />
    <Wrapper>
      {!!lengthKm && (
        <InfoBox>
          <RNEIcon name="map" type="material" color={colors.primary} iconStyle={styles.margin} />
          <RegularText>{lengthKm} km</RegularText>
        </InfoBox>
      )}

      {tourAddresses?.map((item, index) => {
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
            <Icon.Location style={styles.margin} />
            <View>
              <RegularText>{kind === 'start' ? texts.tour.start : texts.tour.end}</RegularText>
              <TouchableOpacity onPress={() => addressOnPress(address)}>
                <RegularText primary>{address}</RegularText>
              </TouchableOpacity>
            </View>
          </InfoBox>
        );
      })}
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
  lengthKm: PropTypes.number,
  tourAddresses: PropTypes.array
};
