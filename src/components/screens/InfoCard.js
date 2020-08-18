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
    {(!!contact.lastName || !!contact.firstName) && (
      <InfoBox>
        <RNEIcon name="person" type="material" color={colors.primary} iconStyle={styles.margin} />
        {!!contact.firstName && <RegularText>{contact.firstName} </RegularText>}
        {!!contact.lastName && <RegularText>{contact.lastName}</RegularText>}
      </InfoBox>
    )}

    {!!contact.phone && (
      <InfoBox>
        <Icon icon={phoneIcon(colors.primary)} style={styles.margin} />
        <TouchableOpacity onPress={() => openLink(`tel:${contact.phone}`)}>
          <RegularText primary>{contact.phone}</RegularText>
        </TouchableOpacity>
      </InfoBox>
    )}

    {!!contact.email && (
      <InfoBox>
        <Icon icon={mail(colors.primary)} style={styles.margin} />
        <TouchableOpacity onPress={() => openLink(`mailto:${contact.email}`)}>
          <RegularText primary>{contact.email}</RegularText>
        </TouchableOpacity>
      </InfoBox>
    )}

    {!!contact.fax && (
      <InfoBox>
        <RNEIcon name="print" type="material" color={colors.primary} iconStyle={styles.margin} />
        <RegularText primary>{contact.fax}</RegularText>
      </InfoBox>
    )}
  </View>
);

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
/* TODO: add a logic to display info category and url that fit the screen even if long text
         (not yet a problem) */
export const InfoCard = ({ addresses, category, contact, contacts, webUrls, openWebScreen }) => (
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
              <RegularText primary>{address}</RegularText>
            </TouchableOpacity>
          </InfoBox>
        );
      })}

    {!!contact &&
      (!!contact.firstName ||
        !!contact.lastName ||
        !!contact.phone ||
        !!contact.email ||
        !!contact.fax) &&
      contactView(contact)}

    {!!contacts &&
      contacts.map((contact, index) => {
        if (
          !!contact.firstName ||
          !!contact.lastName ||
          !!contact.phone ||
          !!contact.email ||
          !!contact.fax
        ) {
          return <View key={`index${index}-id${contact.id}`}>{contactView(contact)}</View>;
        } else {
          return null;
        }
      })}

    {!!webUrls &&
      webUrls.map((item, index) => {
        const { url, description } = item;

        if (!url) {
          return null;
        }

        return (
          <InfoBox key={index}>
            <Icon icon={urlIcon(colors.primary)} style={styles.margin} />
            <TouchableOpacity onPress={() => openLink(url, openWebScreen)}>
              {!description && <RegularText primary>{url}</RegularText>}
              {!!description && <RegularText primary>{description}</RegularText>}
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
  webUrls: PropTypes.array,
  openWebScreen: PropTypes.func
};
