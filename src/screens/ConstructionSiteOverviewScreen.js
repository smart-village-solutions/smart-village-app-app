import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';

import {
  RegularText,
  SafeAreaViewFlex,
  TextListItem,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, consts, texts } from '../config';
import { momentFormat } from '../helpers';
import { useConstructionSites, useMatomoTrackScreenView } from '../hooks';

const { MATOMO_TRACKING } = consts;

const keyExtractor = (item, index) => index + item.title + item.startDate;

export const ConstructionSiteOverviewScreen = ({ navigation }) => {
  const { constructionSites, loading, refresh, refreshing } = useConstructionSites(); // TODO: add refetch

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.CONSTRUCTION_SITES);

  const renderItem = useCallback(
    ({ item }) => {
      const { category, endDate, startDate, title } = item;

      const formattedStartDate = momentFormat(startDate);

      const formattedEndDate = endDate ? momentFormat(endDate) : undefined;
      const formattedDates =
        !formattedEndDate || formattedEndDate === formattedStartDate
          ? formattedStartDate
          : `${formattedStartDate} - ${formattedEndDate}`;

      const propItem = {
        title: title,
        subtitle: formattedDates + (category ? ` | ${category}` : ''),
        params: { id: item.id },
        routeName: 'ConstructionSiteDetail'
      };

      return <TextListItem item={propItem} navigation={navigation} />;
    },
    [navigation]
  );

  if (loading && !refreshing) {
    return <LoadingSpinner loading />;
  }

  if (!constructionSites.length) {
    return (
      <SafeAreaViewFlex>
        <WrapperWithOrientation>
          <Wrapper>
            <RegularText>{texts.constructionSites.noInformationGiven}</RegularText>
          </Wrapper>
        </WrapperWithOrientation>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <FlatList
        data={constructionSites}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      />
    </SafeAreaViewFlex>
  );
};

ConstructionSiteOverviewScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
