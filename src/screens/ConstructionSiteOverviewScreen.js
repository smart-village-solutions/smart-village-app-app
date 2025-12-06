import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { Filter, RegularText, SafeAreaViewFlex, TextListItem, Wrapper } from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, consts, normalize, texts } from '../config';
import { ConfigurationsContext } from '../ConfigurationsProvider';
import { filterTypesHelper, momentFormat, updateResourceFiltersStateHelper } from '../helpers';
import { useConstructionSites, useMatomoTrackScreenView } from '../hooks';
import { PermanentFilterContext } from '../PermanentFilterProvider';
import { GenericType } from '../types';

const { MATOMO_TRACKING } = consts;

/**
 * Builds a stable list key using the index, title and start date to avoid collisions.
 */
const keyExtractor = (item, index) => index + item.title + item.startDate;

/**
 * Lists construction sites with filter overlays, persists the selected filter state and routes to
 * the detail view when a list item is tapped.
 */
export const ConstructionSiteOverviewScreen = ({ navigation }) => {
  const initialQueryVariables = {};
  const { constructionSites, loading, refresh, refreshing } = useConstructionSites(queryVariables);
  const { resourceFiltersState = {}, resourceFiltersDispatch } = useContext(PermanentFilterContext);
  const { resourceFilters } = useContext(ConfigurationsContext);
  const [queryVariables, setQueryVariables] = useState({
    ...initialQueryVariables,
    ...resourceFiltersState[GenericType.ConstructionSite]
  });
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
        title,
        subtitle: formattedDates + (category ? ` | ${category}` : ''),
        params: { id: item.id },
        routeName: 'ConstructionSiteDetail'
      };

      return <TextListItem item={propItem} navigation={navigation} />;
    },
    [navigation]
  );

  const filterTypes = useMemo(() => {
    return filterTypesHelper({
      data: constructionSites,
      query: GenericType.ConstructionSite,
      queryVariables,
      resourceFilters
    });
  }, [constructionSites]);

  useEffect(() => {
    updateResourceFiltersStateHelper({
      query: GenericType.ConstructionSite,
      queryVariables,
      resourceFiltersDispatch,
      resourceFiltersState
    });
  }, [constructionSites]);

  if (loading && !refreshing) {
    return <LoadingSpinner loading />;
  }

  if (!constructionSites.length) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <RegularText>{texts.constructionSites.noInformationGiven}</RegularText>
        </Wrapper>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <Filter
        filterTypes={filterTypes}
        initialQueryVariables={initialQueryVariables}
        isOverlay
        queryVariables={queryVariables}
        setQueryVariables={setQueryVariables}
      />

      <FlatList
        data={constructionSites}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
        style={styles.container}
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16)
  }
});

ConstructionSiteOverviewScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
