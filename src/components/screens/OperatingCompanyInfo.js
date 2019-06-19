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
  flex-wrap: wrap;
  margin-bottom: ${normalize(5)}px;
`;

const addressOnPress = (address) => {
  const mapsString = locationString(address);
  const mapsLink = locationLink(mapsString);

  openLink(mapsLink);
};
/* eslint-disable complexity */
/* TODO: refactoring? */
export const OperatingCompanyInfo = ({ address, contact, name, webUrls }) => {
  const { city, street, zip } = address;

  let companyAddress = '';

  if (!city && !street && !zip) {
    // build the address in multiple steps to check every data before rendering
    if (street) {
      companyAddress += `${street}, `;
    }
    if (zip) {
      companyAddress += `${zip} ${'\n'} `;
    }
    if (city) {
      companyAddress += city;
    }
  }

  return (
    <Wrapper>
      {!!name && (
        <InfoBox>
          <RegularText>{name}</RegularText>
        </InfoBox>
      )}

      {!!companyAddress && (
        <InfoBox>
          <Icon icon={location(colors.primary)} style={styles.margin} />
          <TouchableOpacity onPress={() => addressOnPress(companyAddress)}>
            <RegularText link>{companyAddress}</RegularText>
          </TouchableOpacity>
        </InfoBox>
      )}

      {!!contact &&
        (!!contact.firstName ||
          !!contact.lastName ||
          !!contact.phone ||
          !!contact.email ||
          !!contact.fax) && (
        <View>
          {!!contact.lastName && (
            <InfoBox>
              <RNEIcon
                name="person"
                type="material"
                color={colors.primary}
                iconStyle={{ marginRight: normalize(10) }}
              />
              <RegularText>{contact.firstName}</RegularText>
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
          {!!contact.fax && (
            <InfoBox>
              <Icon icon={mail(colors.primary)} style={styles.margin} />
              <TouchableOpacity onPress={() => openLink(`mailto:${contact.fax}`)}>
                <RegularText link>{contact.fax}</RegularText>
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
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  margin: {
    marginRight: normalize(10)
  }
});

OperatingCompanyInfo.propTypes = {
  address: PropTypes.object,
  name: PropTypes.string,

  contact: PropTypes.object,
  webUrls: PropTypes.array
};
