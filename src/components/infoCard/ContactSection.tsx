import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';

import { colors, Icon, normalize } from '../../config';
import { openLink } from '../../helpers';
import { Contact } from '../../types';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

const ContactView = ({ contact }: { contact?: Contact }) => {
  if (!contact) {
    return null;
  }

  return (
    <>
      {(!!contact.lastName || !!contact.firstName) && (
        <InfoBox>
          <RNEIcon name="person" type="material" color={colors.primary} iconStyle={styles.margin} />
          {!!contact.firstName && <RegularText>{contact.firstName} </RegularText>}
          {!!contact.lastName && <RegularText>{contact.lastName}</RegularText>}
        </InfoBox>
      )}

      {!!contact.phone && (
        <InfoBox>
          <Icon.Phone style={styles.margin} />
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
          <Icon.Mail style={styles.margin} />
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
    </>
  );
};

export const ContactSection = ({
  contact,
  contacts
}: {
  contact?: Contact;
  contacts?: Contact[];
}) => {
  const mergedContacts = [contact, ...(contacts ?? [])];

  return (
    <>
      {mergedContacts.map((contact, index) => (
        <ContactView contact={contact} key={index} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  margin: {
    marginRight: normalize(10)
  }
});
