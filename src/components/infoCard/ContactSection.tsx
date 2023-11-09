import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Divider, Icon as RNEIcon } from 'react-native-elements';

import { colors, consts, Icon, normalize } from '../../config';
import { openLink } from '../../helpers';
import { Contact } from '../../types';
import { RegularText } from '../Text';
import { InfoBox, WrapperRow, WrapperVertical } from '../Wrapper';

const ContactView = ({ contact }: { contact?: Contact }) => {
  const a11yText = consts.a11yLabel;

  if (!contact) {
    return null;
  }

  return (
    <>
      {(!!contact.lastName || !!contact.firstName) && (
        <>
          <WrapperVertical>
            <WrapperRow>
              <RNEIcon
                name="person"
                type="material"
                color={colors.primary}
                iconStyle={styles.margin}
              />
              {!!contact.firstName && <RegularText>{contact.firstName} </RegularText>}
              {!!contact.lastName && <RegularText>{contact.lastName}</RegularText>}
            </WrapperRow>
          </WrapperVertical>
          <Divider style={styles.divider} />
        </>
      )}

      {!!contact.phone && (
        <>
          <WrapperVertical>
            <WrapperRow>
              <Icon.Phone style={styles.margin} />
              <TouchableOpacity onPress={() => openLink(`tel:${contact.phone}`)}>
                <RegularText
                  primary
                  accessibilityLabel={`${consts.a11yLabel.phoneNumber} (${contact.phone})
            ${consts.a11yLabel.button} ${consts.a11yLabel.phoneAppHint}`}
                >
                  {contact.phone}
                </RegularText>
              </TouchableOpacity>
            </WrapperRow>
          </WrapperVertical>
          <Divider style={styles.divider} />
        </>
      )}

      {!!contact.email && (
        <>
          <WrapperVertical>
            <WrapperRow>
              <Icon.Mail style={styles.margin} />
              <TouchableOpacity onPress={() => openLink(`mailto:${contact.email}`)}>
                <RegularText
                  primary
                  accessibilityLabel={`
                ${a11yText.mail} (${contact.email}) ${a11yText.button} ${a11yText.mailHint}
              `}
                >
                  {contact.email}
                </RegularText>
              </TouchableOpacity>
            </WrapperRow>
          </WrapperVertical>
          <Divider style={styles.divider} />
        </>
      )}

      {!!contact.fax && (
        <>
          <WrapperVertical>
            <WrapperRow>
              <RNEIcon
                name="print"
                type="material"
                color={colors.primary}
                iconStyle={styles.margin}
              />
              <RegularText primary accessibilityLabel={`(${a11yText.fax} ${contact.fax}`}>
                {contact.fax}
              </RegularText>
            </WrapperRow>
          </WrapperVertical>
          <Divider style={styles.divider} />
        </>
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
  divider: {
    backgroundColor: colors.placeholder
  },
  margin: {
    marginRight: normalize(12)
  }
});
