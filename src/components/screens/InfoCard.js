import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';
import _filter from 'lodash/filter';

import { colors, normalize } from '../../config';
import { mail, location, phone as phoneIcon, url as urlIcon } from '../../icons';
import { openLink, locationLink, locationString, formatAddress } from '../../helpers';
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
        <Icon xml={phoneIcon(colors.primary)} style={styles.margin} />
        <TouchableOpacity onPress={() => openLink(`tel:${contact.phone}`)}>
          <RegularText
            primary
            accessibilityLabel={`(Telefonnummer) ${contact.phone} (Taste) (Wechselt zur Telefon-App)`}
          >
            {contact.phone}
          </RegularText>
        </TouchableOpacity>
      </InfoBox>
    )}

    {!!contact.email && (
      <InfoBox>
        <Icon xml={mail(colors.primary)} style={styles.margin} />
        <TouchableOpacity onPress={() => openLink(`mailto:${contact.email}`)}>
          <RegularText
            primary
            accessibilityLabel={`(E-Mail) ${contact.email} (Taste) (Wechselt zur E-Mail-App)`}
          >
            {contact.email}
          </RegularText>
        </TouchableOpacity>
      </InfoBox>
    )}

    {!!contact.fax && (
      <InfoBox>
        <RNEIcon name="print" type="material" color={colors.primary} iconStyle={styles.margin} />
        <RegularText primary accessibilityLabel={`(Fax) ${contact.fax}`}>
          {contact.fax}
        </RegularText>
      </InfoBox>
    )}
  </View>
);

const mergeWebUrls = ({ webUrls, contact, contacts }) => {
  const mergedWebUrls = webUrls ? [...webUrls] : [];

  // merge a `contact`s `webUrls` to `webUrls`
  if (contact?.webUrls?.length) {
    mergedWebUrls.push(...contact.webUrls);
  }

  // iterate all `contacts` and merge every `contact`s `webUrls` to `webUrls`
  contacts?.forEach((contact) => {
    if (contact?.webUrls?.length) {
      mergedWebUrls.push(...contact.webUrls);
    }
  });

  return mergedWebUrls;
};

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
/* TODO: add a logic to display info category and url that fit the screen even if long text
         (not yet a problem) */
export const InfoCard = ({ addresses, category, contact, contacts, webUrls, openWebScreen }) => (
  <View>
    {!!category && !!category.name && (
      <InfoBox>
        <RNEIcon name="list" type="material" color={colors.primary} iconStyle={styles.margin} />
        <RegularText accessibilityLabel={`(Kategorie) ${category.name}`}>
          {category.name}
        </RegularText>
      </InfoBox>
    )}

    {!!addresses &&
      _filter(addresses, (address) => address.kind === 'default').map((item, index) => {
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

    {mergeWebUrls({ webUrls, contact, contacts }).map((item, index) => {
      const { url, description } = item;

      if (!url) {
        return null;
      }

      return (
        <InfoBox key={index}>
          <Icon xml={urlIcon(colors.primary)} style={styles.margin} />
          <TouchableOpacity
            accessibilityLabel={`(Webseite) ${
              description || url
            } (Taste) (Öffnet Webseite in der aktuellen App)`}
            onPress={() => openLink(url, openWebScreen)}
          >
            {!description || !!description?.startsWith('url') ? (
              <RegularText primary>{url}</RegularText>
            ) : (
              <RegularText primary>{description}</RegularText>
            )}
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
