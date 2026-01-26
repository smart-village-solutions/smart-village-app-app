import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  BoldText,
  Image,
  MapLibre,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperWrap
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, consts, normalize, texts } from '../config';
import { momentFormat } from '../helpers';
import { useConstructionSites, useMatomoTrackScreenView } from '../hooks';

const { MATOMO_TRACKING, MAP } = consts;

/**
 * Formats start and end timestamps into a compact string while showing time spans when provided.
 */
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
/**
 * Detailed construction site view with optional imagery, description blocks and a single map pin,
 * backed by the `useConstructionSites` hook with pull-to-refresh support.
 */
export const ConstructionSiteDetailScreen = ({ route }) => {
  const id = route.params?.id;
  const queryVariables = { ids: id };
  const { constructionSites, loading, refresh, refreshing } = useConstructionSites(queryVariables);

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
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
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
        <SectionHeader title={extendedTitle} />
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
          <MapLibre
            locations={[
              {
                iconName: MAP.DEFAULT_PIN,
                position: {
                  latitude: location.lat,
                  longitude: location.lon
                }
              }
            ]}
            mapStyle={styles.mapStyle}
          />
        )}
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
  },
  mapStyle: {
    height: normalize(300),
    width: '100%'
  }
});

ConstructionSiteDetailScreen.propTypes = {
  route: PropTypes.object.isRequired
};
