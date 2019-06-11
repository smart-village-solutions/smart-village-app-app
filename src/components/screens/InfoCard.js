import React from 'react';
import styled from 'styled-components';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';

import { colors, normalize } from '../../config';
import { mail, location, phone as phoneIcon, url as urlIcon } from '../../icons';
import { openLink } from '../../helpers';
import { RegularText } from '../Text';
import { Icon } from '../Icon';
import { Wrapper } from '../Wrapper';

const InfoBox = styled.View`
  flex: 1;
  flex-direction: row;
  margin-bottom: ${normalize(5)}px;
`;

export const InfoCard = ({ addresses, contact, webUrls }) => (
  <Wrapper>
    {!!addresses &&
      addresses.map((item, index) => {
        const { city, street, zip } = item;
        let address = '';

        if (!city && !street && !zip) return null;

        // build the address in multiple steps to check every data before rendering
        if (street) {
          address += `${street}, `;
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
            <RegularText>{address}</RegularText>
          </InfoBox>
        );
      })}

    {!!contact && (!!contact.phone || !!contact.email) && (
      <View>
        {!!contact.phone && (
          <InfoBox>
            <Icon icon={phoneIcon(colors.primary)} style={styles.margin} />
            <RegularText>{contact.phone}</RegularText>
          </InfoBox>
        )}
        {!!contact.email && (
          <InfoBox>
            <Icon icon={mail(colors.primary)} style={styles.margin} />
            <TouchableOpacity onPress={() => openLink(`mailto:${contact.email}`)}>
              <RegularText>{contact.email}</RegularText>
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
              <RegularText>{url}</RegularText>
            </TouchableOpacity>
          </InfoBox>
        );
      })}
  </Wrapper>
);

const styles = StyleSheet.create({
  margin: {
    marginRight: normalize(10)
  }
});

InfoCard.propTypes = {
  addresses: PropTypes.array,
  contact: PropTypes.object,
  webUrls: PropTypes.array
};
