import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';

import { colors, consts, normalize } from '../../config';
import { openLink } from '../../helpers';
import { mail, phone as phoneIcon } from '../../icons';
import { Contact } from '../../types';
import { Icon } from '../Icon';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

const ContactView = ({ contact }: { contact?: Contact }) => {
  const a11yText = consts.a11yLabel;

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
          <Icon xml={phoneIcon(colors.primary)} style={styles.margin} />
          <TouchableOpacity onPress={() => openLink(`tel:${contact.phone}`)}>
            <RegularText
              primary
              accessibilityLabel={`${consts.a11yLabel.phoneNumber} (${contact.phone})
            (${consts.a11yLabel.button})
            (${consts.a11yLabel.phoneAppHint})`}
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
              accessibilityLabel={
                (a11yText.mail, `${contact.email}`, a11yText.button, a11yText.mailHint)
              }
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
