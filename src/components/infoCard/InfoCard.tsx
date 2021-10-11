import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';

import { colors, consts, normalize } from '../../config';
import { Address, Contact, WebUrl } from '../../types';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

import { AddressSection } from './AddressSection';
import { ContactSection } from './ContactSection';
import { UrlSection } from './UrlSection';

type WebUrlProps = {
  contact?: Contact;
  contacts?: Contact[];
  webUrls?: WebUrl[];
};

type Props = WebUrlProps & {
  address?: Address;
  addresses?: Address[];
  category?: { name?: string };
  name?: string;
  openWebScreen: (link: string) => void;
};

const mergeWebUrls = ({ webUrls, contact, contacts }: WebUrlProps) => {
  const mergedWebUrls = webUrls ? [...webUrls] : [];

  if (contact?.www) {
    mergedWebUrls.unshift({ url: contact.www });
  }

  // merge a `contact`s `webUrls` to `webUrls`
  if (contact?.webUrls?.length) {
    mergedWebUrls.push(...contact.webUrls);
  }

  // iterate all `contacts` and merge every `contact`s `webUrls` to `webUrls`
  contacts?.forEach((contact) => {
    if (contact?.www) {
      mergedWebUrls.push({ url: contact.www });
    }
    if (contact?.webUrls?.length) {
      mergedWebUrls.push(...contact.webUrls);
    }
  });

  return mergedWebUrls;
};

/* TODO: add a logic to display info category and url that fit the screen even if long text
         (not yet a problem) */
export const InfoCard = ({
  address,
  addresses,
  category,
  contact,
  contacts,
  name,
  webUrls,
  openWebScreen
}: Props) => (
  <View>
    {!!name && (
      <InfoBox>
        <RegularText>{name}</RegularText>
      </InfoBox>
    )}

    {!!category && !!category.name && (
      <InfoBox>
        <RNEIcon name="list" type="material" color={colors.primary} iconStyle={styles.margin} />
        <RegularText accessibilityLabel={`${consts.a11yLabel.category} (${category.name})`}>
          {category.name}
        </RegularText>
      </InfoBox>
    )}

    <AddressSection address={address} addresses={addresses} openWebScreen={openWebScreen} />

    <ContactSection contact={contact} contacts={contacts} />

    <UrlSection
      openWebScreen={openWebScreen}
      webUrls={mergeWebUrls({ webUrls, contact, contacts })}
    />
  </View>
);

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
  name: PropTypes.string,
  webUrls: PropTypes.array,
  openWebScreen: PropTypes.func
};
