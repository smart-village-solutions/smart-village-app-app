import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Icon as RNEIcon } from 'react-native-elements';

import { colors, consts, normalize } from '../../config';
import { mergeWebUrls } from '../../helpers';
import { Address, Contact, OpeningHour, SVA_Date, WebUrl } from '../../types';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

import { AddressSection } from './AddressSection';
import { ContactSection } from './ContactSection';
import { DateSection } from './DateSection';
import { OpenStatus } from './OpenStatus';
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
  dates?: SVA_Date[];
  name?: string;
  openingHours?: OpeningHour[];
  openWebScreen?: (link: string) => void;
  showOpeningTimes: boolean;
};

/* TODO: add a logic to display info category and url that fit the screen even if long text
         (not yet a problem) */
export const InfoCard = ({
  address,
  addresses,
  category,
  contact,
  contacts,
  dates,
  name,
  openingHours,
  openWebScreen,
  showOpeningTimes,
  webUrls
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

    <Divider style={styles.divider} />

    {showOpeningTimes && <OpenStatus openingHours={openingHours} />}

    <AddressSection address={address} addresses={addresses} openWebScreen={openWebScreen} />

    <ContactSection contact={contact} contacts={contacts} />

    <UrlSection webUrls={mergeWebUrls({ webUrls, contact, contacts })} />

    <DateSection dates={dates} />
  </View>
);

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  },
  margin: {
    marginRight: normalize(12)
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
