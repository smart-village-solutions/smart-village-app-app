import { pull } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { texts } from '../../config';
import { InfoCard } from '../infoCard';
import { RegularText } from '../Text';
import { InfoBox, Wrapper } from '../Wrapper';

import { Block } from './Block';
import { getAddress, getContact } from './helpers';

export const Persons = ({ data, openWebScreen }) => {
  const { persons } = data;

  return (
    <Block title={texts.bbBus.employees}>
      {persons.map((person) => {
        const {
          id,
          title,
          firstName,
          lastName,
          position,
          department,
          room,
          addresses,
          communication // NOTE: the api returns singular here instead of plural
        } = person;

        const address = getAddress(addresses);
        const contact = getContact(communication);

        const name = pull([title, firstName, lastName], undefined).join(' ');

        return (
          <View key={id}>
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
            <Wrapper>
              <InfoCard address={address} contact={contact} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
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
