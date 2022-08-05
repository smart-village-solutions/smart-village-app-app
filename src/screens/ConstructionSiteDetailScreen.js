import PropTypes from 'prop-types';
import moment from 'moment';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { colors, consts, normalize, texts } from '../config';
import {
  BoldText,
  Image,
  Map,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Wrapper,
  WrapperWithOrientation,
  WrapperWrap
} from '../components';
import { locationIconAnchor, location as locationIcon } from '../icons';
import { useConstructionSites, useMatomoTrackScreenView } from '../hooks';
import { momentFormat } from '../helpers';
import { LoadingSpinner } from '../components/LoadingSpinner';

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

// eslint-disable-next-line complexity
export const ConstructionSiteDetailScreen = ({ route }) => {
  const id = route.params?.id;
  const { constructionSites, loading, refresh, refreshing } = useConstructionSites(id);

  useMatomoTrackScreenView(
    `${MATOMO_TRACKING.SCREEN_VIEW.CONSTRUCTION_SITE_DETAIL} / ${
      id ?? texts.screenTitles.constructionSite
    }`
  );

  if (!id || !constructionSites.length) return null;

  const {
    category,
    cause,
    description,
    direction,
    endDate,
    image,
    location,
    locationDescription,
    restrictions,
    startDate,
    title
  } = constructionSites[0];

  const extendedTitle = (category ? `${category} - ` : '') + title;
  const formattedDates = formatDates(startDate, endDate);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <WrapperWithOrientation>
          {!!image?.url && (
            <Image
              source={{
                captionText: image.captionText,
                imageRights: image.copyright,
                uri: image.url
              }}
              containerStyle={styles.imageContainer}
            />
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
                {restrictions.map((restriction, index) => (
                  <RegularText key={`restriction-${index}`}>- {restriction}</RegularText>
                ))}
              </View>
            )}
          </Wrapper>
          {!!location && (
            <Map
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
