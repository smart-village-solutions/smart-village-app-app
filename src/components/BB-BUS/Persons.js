import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { filter, pull } from 'lodash';

import { colors, normalize, texts } from '../../config';
import { InfoBox, OperatingCompanyInfo, RegularText, Title, Touchable, Wrapper } from '..';
import { WrapperWithOrientation } from '../Wrapper';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Persons = ({ data, accordion, onPress, openWebScreen }) => {
  const { id, persons } = data;

  return (
    <View>
      <ListItem
        title={<Title small>{texts.bbBus.employees}</Title>}
        bottomDivider
        topDivider
        containerStyle={styles.sectionTitle}
        rightIcon={<Title>{accordion[id] ? '－' : '＋'}</Title>}
        onPress={onPress}
        delayPressIn={0}
        Component={Touchable}
      />
      {!!accordion[id] &&
        persons.map((person) => {
          if (person.object) person.person = person.object;

          const {
            id,
            title,
            firstName,
            lastName,
            position,
            department,
            room,
            addresses,
            communication // NOTE: the main server returns singular here instead of plural
          } = person.person;

          // set plural from singular
          let communications = communication;

          // if the result came from Directus, there is no singular and we need the plural directly
          if (!communications) communications = person.person.communications;

          const name = pull([title, firstName, lastName], undefined).join(' ');

          return (
            <WrapperWithOrientation key={id}>
              {(!!name || !!position || !!department || !!room) && (
                <Wrapper style={styles.wrapperWithoutBottomPadding}>
                  {!!name && (
                    <InfoBox>
                      <RegularText>{name}</RegularText>
                    </InfoBox>
                  )}
                  {!!position && (
                    <InfoBox>
                      <RegularText>Position: {position}</RegularText>
                    </InfoBox>
                  )}
                  {!!department && (
                    <InfoBox>
                      <RegularText>Abteilung: {department}</RegularText>
                    </InfoBox>
                  )}
                  {!!room && (
                    <InfoBox>
                      <RegularText>Raum: {room}</RegularText>
                    </InfoBox>
                  )}
                </Wrapper>
              )}
              <OperatingCompanyInfo
                address={(() => {
                  if (!addresses || !addresses.length) return null;

                  let address = addresses[0];

                  if (address.address) address = address.address;

                  const { street, houseNumber, zipcode, city } = address;

                  return {
                    street:
                      (!!street || !!houseNumber) && `${address.street} ${address.houseNumber}`,
                    zip: !!zipcode && zipcode,
                    city: !!city && city
                  };
                })()}
                contact={(() => {
                  if (!communications || !communications.length) return null;

                  let phone = filter(communications, (communication) => {
                    // fix for multi nested result form Directus API
                    if (communication.communication) communication = communication.communication;

                    return communication.type.key === 'TELEFON';
                  })[0];
                  // fix for multi nested result form Directus API
                  if (phone && phone.communication) phone = phone.communication;

                  let fax = filter(communications, (communication) => {
                    // fix for multi nested result form Directus API
                    if (communication.communication) communication = communication.communication;

                    return communication.type.key === 'FAX';
                  })[0];
                  // fix for multi nested result form Directus API
                  if (fax && fax.communication) fax = fax.communication;

                  let email = filter(communications, (communication) => {
                    // fix for multi nested result form Directus API
                    if (communication.communication) communication = communication.communication;

                    return communication.type.key === 'EMAIL';
                  })[0];
                  // fix for multi nested result form Directus API
                  if (email && email.communication) email = email.communication;

                  let www = filter(communications, (communication) => {
                    // fix for multi nested result form Directus API
                    if (communication.communication) communication = communication.communication;

                    return communication.type.key === 'WWW';
                  })[0];
                  // fix for multi nested result form Directus API
                  if (www && www.communication) www = www.communication;

                  return {
                    phone: !!phone && phone.value,
                    fax: !!fax && fax.value,
                    email: !!email && email.value,
                    www: !!www && www.value
                  };
                })()}
                openWebScreen={openWebScreen}
              />
            </WrapperWithOrientation>
          );
        })}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  wrapperWithoutBottomPadding: {
    paddingBottom: 0
  },
  sectionTitle: {
    backgroundColor: colors.transparent,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  }
});

Persons.propTypes = {
  data: PropTypes.object.isRequired,
  accordion: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  openWebScreen: PropTypes.func.isRequired
};
