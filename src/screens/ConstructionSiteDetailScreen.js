import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize } from '../config';
import {
  BoldText,
  Icon,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  WebViewMap,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { arrowLeft, locationIconAnchor, location as locationIcon } from '../icons';
import { useMatomoTrackScreenView } from '../hooks';
import { ConstructionSiteContext } from '../ConstructionSiteProvider';
import { momentFormat } from '../helpers';
import moment from 'moment';

const { MATOMO_TRACKING } = consts;

const formatDates = (startDate, endDate) => {
  const formattedStartDate = momentFormat(startDate, 'DD.MM.YYYY');
  const startTime = moment(startDate, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');

  const formattedEndDate = endDate ? momentFormat(endDate, 'DD.MM.YYYY') : undefined;
  const endTime = endDate ? moment(endDate, 'YYYY-MM-DD HH:mm:ss').format('HH:mm') : undefined;

  if ((endTime !== undefined && endTime !== '00:00') || startTime !== '00:00') {
    return formattedEndDate && endTime
      ? `${formattedStartDate} ${startTime} - ${formattedEndDate} ${endTime}`
      : `${formattedStartDate} ${startTime}`;
  }

  return formattedEndDate ? `${formattedStartDate} - ${formattedEndDate}` : formattedStartDate;
};

export const ConstructionSiteDetailScreen = ({ navigation }) => {
  const { constructionSites } = useContext(ConstructionSiteContext);

  const index = navigation.getParam('index');

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.CONSTRUCTION_SITE_DETAIL);

  if (typeof index !== 'number') return null;

  const {
    category,
    cause,
    description,
    direction,
    endDate,
    location,
    locationDescription,
    restrictions,
    startDate,
    title
  } = constructionSites[index];

  const extendedTitle = (category ? `${category} - ` : '') + title;
  const formattedDates = formatDates(startDate, endDate);

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="handled">
        <WrapperWithOrientation>
          <TitleContainer>
            <Title>{extendedTitle}</Title>
          </TitleContainer>
          <Wrapper>
            <View style={styles.informationContainer}>
              <BoldText>{endDate ? 'Gesamtzeitraum: ' : 'Datum: '}</BoldText>
              <RegularText>{formattedDates}</RegularText>
            </View>
            {!!locationDescription && (
              <View style={styles.informationContainer}>
                <BoldText>Standort: </BoldText>
                <RegularText>{locationDescription}</RegularText>
              </View>
            )}
            {!!direction && (
              <View style={styles.informationContainer}>
                <BoldText>Richtung: </BoldText>
                <RegularText>{direction}</RegularText>
              </View>
            )}
            {!!cause && (
              <View style={styles.informationContainer}>
                <BoldText>Ursache: </BoldText>
                <RegularText>{cause}</RegularText>
              </View>
            )}
            {!!description && (
              <View style={styles.verticalPadding}>
                <BoldText>Weitere Informationen: </BoldText>
                <RegularText>{description}</RegularText>
              </View>
            )}
            {!!restrictions?.length && (
              <View style={styles.verticalPadding}>
                <BoldText>Aktuelle Einschränkungen: </BoldText>
                {restrictions.map((restriction) => (
                  <RegularText key={'restriction-' + index}>- {restriction}</RegularText>
                ))}
              </View>
            )}
          </Wrapper>
          {!!location && (
            <WebViewMap
              locations={[
                {
                  icon: locationIcon(colors.primary),
                  iconAnchor: locationIconAnchor,
                  position: { lat: location.lat, lng: location.lon }
                }
              ]}
            />
          )}
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConstructionSiteDetailScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

const styles = StyleSheet.create({
  informationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  icon: {
    paddingHorizontal: normalize(14)
  },
  verticalPadding: {
    paddingTop: normalize(14)
  }
});

ConstructionSiteDetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
