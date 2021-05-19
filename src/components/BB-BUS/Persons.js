import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { pull } from 'lodash';

import { InfoBox, RegularText, Wrapper } from '..';
import { WrapperWithOrientation } from '../Wrapper';
import { getAddress, getContact } from './helpers';
import { InfoCard } from '../infoCard';
import { Block } from './Block';

export const Persons = ({ data, openWebScreen }) => {
  const { persons } = data;

  return (
    <Block title={name}>
      {persons.map((person) => {
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
    </Block>
  );
};

const styles = StyleSheet.create({
  wrapperWithoutBottomPadding: {
    paddingBottom: 0
  }
});

Persons.propTypes = {
  data: PropTypes.object.isRequired,
  openWebScreen: PropTypes.func.isRequired
};
