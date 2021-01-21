import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { filter } from 'lodash';

import { colors, normalize, texts } from '../../config';
import { trimNewLines } from '../../helpers';
import { HtmlView } from '../HtmlView';
import { OperatingCompanyInfo } from '../screens/OperatingCompanyInfo';
import { BoldText, RegularText } from '../Text';
import { Title } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Authority = ({
  data,
  accordion,
  onPress,
  bottomDivider,
  openWebScreen,
  orientation,
  dimensions
}) => {
  const {
    id,
    name,
    addresses,
    communications,
    openingHours,
    elevator,
    wheelchairAccessible
  } = data;

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
          <OperatingCompanyInfo
            address={(() => {
              if (!addresses || !addresses.length) return null;

              let address = addresses[0];

              if (address.address) address = address.address;

              const { street, houseNumber, zipcode, city } = address;

              return {
                street: (!!street || !!houseNumber) && `${address.street} ${address.houseNumber}`,
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
      )}
      {!!accordion[id] &&
        (!!openingHours || elevator !== undefined || wheelchairAccessible !== undefined) && (
          <WrapperWithOrientation>
            <Wrapper style={styles.wrapperWithoutTopPadding}>
              {!!openingHours && (
                <View>
                  <BoldText>{texts.bbBus.authority.openingTime}:</BoldText>
                  <HtmlView
                    html={trimNewLines(openingHours)}
                    openWebScreen={openWebScreen}
                    orientation={orientation}
                    dimensions={dimensions}
                  />
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
  openWebScreen: PropTypes.func.isRequired,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};
