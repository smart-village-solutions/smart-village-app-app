import { pull } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { InfoBox, RegularText, Title, Touchable, Wrapper } from '..';
import { colors, normalize, texts } from '../../config';
import { InfoCard } from '../infoCard';
import { WrapperWithOrientation } from '../Wrapper';

import { getAddress, getContact } from './helpers';

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

          const address = getAddress(addresses);
          const contact = getContact(communications);

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
              <InfoCard address={address} contact={contact} openWebScreen={openWebScreen} />
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
