import PropTypes from 'prop-types';
import moment from 'moment';
import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, consts, normalize } from '../config';
import {
  BoldText,
  Image,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  WebViewMap,
  Wrapper,
  WrapperWithOrientation,
  WrapperWrap
} from '../components';
import { locationIconAnchor, location as locationIcon } from '../icons';
import { useMatomoTrackScreenView } from '../hooks';
import { ConstructionSiteContext } from '../ConstructionSiteProvider';
import { momentFormat } from '../helpers';

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

export const ConstructionSiteDetailScreen = ({ route }) => {
  const { constructionSites } = useContext(ConstructionSiteContext);

  const index = route.params?.index;

  if (typeof index !== 'number') return null;

  const {
    category,
    cause,
    description,
    direction,
    endDate,
    imageUri,
    location,
    locationDescription,
    restrictions,
    startDate,
    title
  } = constructionSites[index];

  useMatomoTrackScreenView(`${MATOMO_TRACKING.SCREEN_VIEW.CONSTRUCTION_SITE_DETAIL} / ${title}`);

  const extendedTitle = (category ? `${category} - ` : '') + title;
  const formattedDates = formatDates(startDate, endDate);

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="handled">
        <WrapperWithOrientation>
          {!!imageUri && (
            <Image source={{ uri: imageUri }} containerStyle={styles.imageContainer} />
          )}
          <TitleContainer>
            <Title>{extendedTitle}</Title>
          </TitleContainer>
          <Wrapper>
            <WrapperWrap>
              <BoldText>{endDate ? 'Gesamtzeitraum: ' : 'Datum: '}</BoldText>
              <RegularText>{formattedDates}</RegularText>
            </WrapperWrap>
            {!!locationDescription && (
              <WrapperWrap>
                <BoldText>Standort: </BoldText>
                <RegularText>{locationDescription}</RegularText>
              </WrapperWrap>
            )}
            {!!direction && (
              <WrapperWrap>
                <BoldText>Richtung: </BoldText>
                <RegularText>{direction}</RegularText>
              </WrapperWrap>
            )}
            {!!cause && (
              <WrapperWrap>
                <BoldText>Ursache: </BoldText>
                <RegularText>{cause}</RegularText>
              </WrapperWrap>
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
                  <RegularText key={`restriction-${index}`}>- {restriction}</RegularText>
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
              zoom={14}
            />
          )}
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  verticalPadding: {
    paddingTop: normalize(14)
  },
  imageContainer: {
    alignSelf: 'center'
  }
});

ConstructionSiteDetailScreen.propTypes = {
  route: PropTypes.object.isRequired
};
