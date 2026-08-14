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

const getTransportationLineLabel = (line) => {
  const typeLabel = line?.type?.name || line?.type?.key || 'Linie';

  return line?.name ? `${typeLabel}: ${line.name}` : typeLabel;
};

const getTransportationStopLines = (transportationStop) =>
  (transportationStop?.lines ?? []).map(getTransportationLineLabel).filter(Boolean);

const renderTransportationStops = (transportationStops) => (
  <View>
    <BoldText>{texts.bus.authority.transportation}</BoldText>
    {transportationStops.map((transportationStop, index) => {
      const lineLabels = getTransportationStopLines(transportationStop);

      return (
        <View key={`${transportationStop?.name || 'stop'}-${index}`} style={styles.infoBlock}>
          {!!transportationStop?.name && <BoldText small>{transportationStop.name}</BoldText>}
          {lineLabels.map((lineLabel, lineIndex) => (
            <RegularText key={`${transportationStop?.name || 'stop'}-${index}-${lineIndex}`}>
              {lineLabel}
            </RegularText>
          ))}
        </View>
      );
    })}
  </View>
);

const renderAccessibilityInfo = ({ elevator, wheelchairAccessible, hasTransportationStops }) => {
  if (elevator === undefined && wheelchairAccessible === undefined) {
    return null;
  }

  return (
    <View style={hasTransportationStops ? styles.infoBlock : undefined}>
      <BoldText>{texts.bus.authority.accessibility}</BoldText>
      {elevator !== undefined && (
        <RegularText>{`${texts.bus.authority.elevator}: ${elevator ? 'ja' : 'nein'}`}</RegularText>
      )}
      {wheelchairAccessible !== undefined && (
        <RegularText>
          {`${texts.bus.authority.wheelchairAccessible}: ${wheelchairAccessible ? 'ja' : 'nein'}`}
        </RegularText>
      )}
    </View>
  );
};

const renderPaymentMethods = ({ hasPreviousDetails, paymentMethods }) => {
  if (!paymentMethods?.length) {
    return null;
  }

  return (
    <View style={hasPreviousDetails ? styles.infoBlock : undefined}>
      <BoldText>{texts.bus.authority.paymentMethods}</BoldText>
      <RegularText>{`${texts.bus.authority.paymentMethod}:`}</RegularText>
      {paymentMethods
        .filter((paymentMethod) => !paymentMethod?.notPublic && !!paymentMethod?.name)
        .map((paymentMethod) => (
          <RegularText key={paymentMethod.id || paymentMethod.key || paymentMethod.name}>
            {paymentMethod.name}
          </RegularText>
        ))}
    </View>
  );
};

const renderAdditionalDetails = ({
  openingHours,
  openWebScreen,
  transportationStops,
  elevator,
  wheelchairAccessible,
  paymentMethods
}) => {
  const hasTransportationStops = !!transportationStops.length;
  const hasAccessibilityDetails = elevator !== undefined || wheelchairAccessible !== undefined;
  const hasPaymentMethods = !!paymentMethods.length;

  if (!openingHours && !hasTransportationStops && !hasAccessibilityDetails && !hasPaymentMethods) {
    return null;
  }

  return (
    <Wrapper style={styles.wrapperWithoutTopPadding}>
      {!!openingHours && (
        <View>
          <BoldText>{texts.bus.authority.openingTime}</BoldText>
          <HtmlView html={trimNewLines(openingHours)} openWebScreen={openWebScreen} />
        </View>
      )}
      {hasTransportationStops && renderTransportationStops(transportationStops)}
      {renderAccessibilityInfo({
        elevator,
        wheelchairAccessible,
        hasTransportationStops
      })}
      {renderPaymentMethods({
        hasPreviousDetails: hasTransportationStops || hasAccessibilityDetails,
        paymentMethods
      })}
    </Wrapper>
  );
};

export const Authority = ({ data, bottomDivider, openWebScreen }) => {
  const { name, addresses, communications, openingHours, paymentMethods, transportationStops } =
    data;

  const address = getAddress(addresses);
  const contact = getContact(communications);

  const elevator = address?.elevator;
  const wheelchairAccessible = address?.wheelchairAccessible;
  const authorityTransportationStops = transportationStops ?? address?.transportationStops ?? [];
  const publicPaymentMethods = (paymentMethods ?? []).filter(
    (paymentMethod) => !paymentMethod?.notPublic && !!paymentMethod?.name
  );

  return (
    <Block title={name} bottomDivider={bottomDivider}>
      <Wrapper style={styles.wrapperWithoutTopPadding}>
        <InfoCard address={address} contact={contact} openWebScreen={openWebScreen} />
      </Wrapper>

      {renderAdditionalDetails({
        openingHours,
        openWebScreen,
        transportationStops: authorityTransportationStops,
        elevator,
        wheelchairAccessible,
        paymentMethods: publicPaymentMethods
      })}
    </Block>
  );
};

const styles = StyleSheet.create({
  infoBlock: {
    marginTop: 12
  },
  wrapperWithoutTopPadding: {
    paddingTop: 0
  }
});

Authority.propTypes = {
  data: PropTypes.object.isRequired,
  bottomDivider: PropTypes.bool.isRequired,
  openWebScreen: PropTypes.func.isRequired
};
