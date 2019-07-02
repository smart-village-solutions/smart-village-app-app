import React from 'react';
import styled from 'styled-components';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';
import PropTypes from 'prop-types';

import { colors, normalize } from '../../config';
import { mail, location, phone as phoneIcon, url as urlIcon } from '../../icons';
import { openLink, locationLink, locationString } from '../../helpers';
import { RegularText } from '../Text';
import { Icon } from '../Icon';
import { Wrapper } from '../Wrapper';

const InfoBox = styled.View`
  flex: 1;
  flex-direction: row;
  margin-bottom: ${normalize(5)}px;
`;

const addressOnPress = (address) => {
  const mapsString = locationString(address);
  const mapsLink = locationLink(mapsString);

  openLink(mapsLink);
};

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
/* TODO: add a logic to display info category and url that fit the screen even if long text
         (not yet a problem) */
export const InfoCard = ({ addresses, category, contact, webUrls }) => (
  <Wrapper>
    {!!category && !!category.name && (
      <InfoBox>
        <RNEIcon
          name="list"
          type="material"
          color={colors.primary}
          iconStyle={{ marginRight: normalize(10) }}
        />
        <RegularText>{category.name}</RegularText>
      </InfoBox>
    )}

    {!!addresses &&
      addresses.map((item, index) => {
        const { city, street, zip } = item;
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
            <Icon icon={location(colors.primary)} style={styles.margin} />
            <TouchableOpacity onPress={() => addressOnPress(address)}>
              <RegularText link>{address}</RegularText>
            </TouchableOpacity>
          </InfoBox>
        );
      })}

    {!!contact && (!!contact.lastName || !!contact.phone || !!contact.email) && (
      <View>
        {!!contact.lastName && (
          <InfoBox>
            <RNEIcon
              name="person"
              type="material"
              color={colors.primary}
              iconStyle={{ marginRight: normalize(10) }}
            />
            <RegularText>{contact.lastName}</RegularText>
          </InfoBox>
        )}
        {!!contact.phone && (
          <InfoBox>
            <Icon icon={phoneIcon(colors.primary)} style={styles.margin} />
            <TouchableOpacity onPress={() => openLink(`tel:${contact.phone}`)}>
              <RegularText link>{contact.phone}</RegularText>
            </TouchableOpacity>
          </InfoBox>
        )}
        {!!contact.email && (
          <InfoBox>
            <Icon icon={mail(colors.primary)} style={styles.margin} />
            <TouchableOpacity onPress={() => openLink(`mailto:${contact.email}`)}>
              <RegularText link>{contact.email}</RegularText>
            </TouchableOpacity>
          </InfoBox>
        )}
      </View>
    )}

    {!!webUrls &&
      webUrls.map((item, index) => {
        const { url } = item;

        if (!url) return null;

        return (
          <InfoBox key={index}>
            <Icon icon={urlIcon(colors.primary)} style={styles.margin} />
            <TouchableOpacity onPress={() => openLink(url)}>
              <RegularText link>{url}</RegularText>
            </TouchableOpacity>
          </InfoBox>
        );
      })}
  </Wrapper>
);
/* eslint-enable complexity */

const styles = StyleSheet.create({
  margin: {
    marginRight: normalize(10)
  }
});

InfoCard.propTypes = {
  addresses: PropTypes.array,
  category: PropTypes.object,

  contact: PropTypes.object,
  webUrls: PropTypes.array
};
