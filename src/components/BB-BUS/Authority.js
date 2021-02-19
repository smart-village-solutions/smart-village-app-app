import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize, texts } from '../../config';
import { trimNewLines } from '../../helpers';
import { HtmlView } from '../HtmlView';
import { InfoCard } from '../infoCard';
import { BoldText, RegularText } from '../Text';
import { Title } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';
import { getAddress, getContact } from './helpers';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Authority = ({ data, accordion, onPress, bottomDivider, openWebScreen }) => {
  const {
    id,
    name,
    addresses,
    communications,
    openingHours,
    elevator,
    wheelchairAccessible
  } = data;

  const address = getAddress(addresses);
  const contact = getContact(communications);

  return (
    <View key={id}>
      <ListItem
        title={<Title small>{name}</Title>}
        bottomDivider={bottomDivider}
        topDivider
        containerStyle={styles.sectionTitle}
        rightIcon={<Title>{accordion[id] ? '－' : '＋'}</Title>}
        onPress={onPress}
        delayPressIn={0}
        Component={Touchable}
      />
      {!!accordion[id] && (
        <WrapperWithOrientation>
          <InfoCard address={address} contact={contact} openWebScreen={openWebScreen} />
        </WrapperWithOrientation>
      )}
      {!!accordion[id] &&
        (!!openingHours || elevator !== undefined || wheelchairAccessible !== undefined) && (
          <WrapperWithOrientation>
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
          </WrapperWithOrientation>
        )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  wrapperWithoutTopPadding: {
    paddingTop: 0
  },
  sectionTitle: {
    backgroundColor: colors.transparent,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  }
});

Authority.propTypes = {
  data: PropTypes.object.isRequired,
  accordion: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  bottomDivider: PropTypes.bool.isRequired,
  openWebScreen: PropTypes.func.isRequired
};
