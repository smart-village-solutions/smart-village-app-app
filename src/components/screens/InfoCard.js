import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';
import _filter from 'lodash/filter';

import { colors, normalize } from '../../config';
import { mail, location, phone as phoneIcon, url as urlIcon } from '../../icons';
import { openLink, locationLink, locationString } from '../../helpers';
import { RegularText } from '../Text';
import { Icon } from '../Icon';
import { InfoBox } from '../Wrapper';

const addressOnPress = (address) => {
  const mapsString = locationString(address);
  const mapsLink = locationLink(mapsString);

  openLink(mapsLink);
};

const contactView = (contact) => (
  <View>
    {!!contact.lastName && (
      <InfoBox>
        <RNEIcon name="person" type="material" color={colors.primary} iconStyle={styles.margin} />
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
);

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
/* TODO: add a logic to display info category and url that fit the screen even if long text
         (not yet a problem) */
export const InfoCard = ({ addresses, category, contact, contacts, webUrls }) => (
  <View>
    {!!category && !!category.name && (
      <InfoBox>
        <RNEIcon name="list" type="material" color={colors.primary} iconStyle={styles.margin} />
        <RegularText>{category.name}</RegularText>
      </InfoBox>
    )}

    {!!addresses &&
      _filter(addresses, (address) => address.kind === 'default').map((item, index) => {
        const { city, street, zip, addition } = item;
        let address = '';

        if (!city && !street && !zip && !addition) return null;

        // build the address in multiple steps to check every data before rendering
        if (addition) {
          address += `${addition}${'\n'}`;
        }
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

    {!!contact &&
      (!!contact.lastName || !!contact.phone || !!contact.email) &&
      contactView(contact)}

    {!!contacts &&
      contacts.map((contact, index) => {
        if (!!contact.lastName || !!contact.phone || !!contact.email) {
          return <View key={`index${index}-id${contact.id}`}>{contactView(contact)}</View>;
        } else {
          return null;
        }
      })}

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
  </View>
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
  contacts: PropTypes.array,
  webUrls: PropTypes.array
};
