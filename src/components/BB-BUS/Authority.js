import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { texts } from '../../config';
import { trimNewLines } from '../../helpers';
import { HtmlView } from '../HtmlView';
import { InfoCard } from '../infoCard';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

import { Block } from './Block';
import { getAddress, getContact } from './helpers';

export const Authority = ({ data, bottomDivider, openWebScreen }) => {
  const { name, addresses, communications, openingHours } = data;

  const address = getAddress(addresses);
  const contact = getContact(communications);

  const elevator = address?.elevator;
  const wheelchairAccessible = address?.wheelchairAccessible;

  return (
    <Block title={name} bottomDivider={bottomDivider}>
      <Wrapper>
        <InfoCard address={address} contact={contact} openWebScreen={openWebScreen} />
      </Wrapper>

      {(!!openingHours || elevator !== undefined || wheelchairAccessible !== undefined) && (
        <Wrapper style={styles.wrapperWithoutTopPadding}>
          {!!openingHours && (
            <View>
              <BoldText>{texts.bbBus.authority.openingTime}:</BoldText>
              <HtmlView html={trimNewLines(openingHours)} openWebScreen={openWebScreen} />
            </View>
          )}
          {elevator !== undefined && (
            <View>
              <BoldText>{texts.bbBus.authority.elevator}:</BoldText>
              <RegularText>{elevator ? 'ja' : 'nein'}</RegularText>
            </View>
          )}
          {elevator !== undefined && wheelchairAccessible !== undefined && (
            <View>
              <RegularText />
            </View>
          )}
          {wheelchairAccessible !== undefined && (
            <View>
              <BoldText>{texts.bbBus.authority.wheelchairAccessible}:</BoldText>
              <RegularText>{wheelchairAccessible ? 'ja' : 'nein'}</RegularText>
            </View>
          )}
        </Wrapper>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  wrapperWithoutTopPadding: {
    paddingTop: 0
  }
});

Authority.propTypes = {
  data: PropTypes.object.isRequired,
  bottomDivider: PropTypes.bool.isRequired,
  openWebScreen: PropTypes.func.isRequired
};
