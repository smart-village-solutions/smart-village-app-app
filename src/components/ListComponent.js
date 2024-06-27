import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { consts } from '../config';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

import { CategoryList } from './CategoryList';
import { EventList } from './EventList';
import { HorizontalList } from './HorizontalList';
import { VerticalList } from './VerticalList';

const { LIST_TYPES } = consts;

const isHorizontal = (query, listTypesSettings) => {
  switch (query) {
    case QUERY_TYPES.TOURS:
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS] === LIST_TYPES.CARD_LIST;
    default:
      return listTypesSettings[query] === LIST_TYPES.CARD_LIST;
  }
};

// eslint-disable-next-line complexity
const getComponent = (query, horizontal, sectionByDate) => {
  switch (query) {
    case QUERY_TYPES.CATEGORIES:
      return CategoryList;
    case QUERY_TYPES.STATIC_CONTENT_LIST:
    case QUERY_TYPES.POINTS_OF_INTEREST:
    case QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS:
    case QUERY_TYPES.TOURS:
      return horizontal ? HorizontalList : VerticalList;
    case QUERY_TYPES.EVENT_RECORDS:
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL:
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY:
      return sectionByDate ? EventList : VerticalList;
    default:
      return VerticalList;
  }
};

// the ListComponent will default to being horizontal for CardLists,
// which can be overwritten by passing in the horizontal prop
export const ListComponent = ({
  data,
  fetchMoreData,
  horizontal,
  isIndexStartingAt1,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
  navigation,
  noSubtitle,
  noOvertitle,
  listType,
  openWebScreen,
  query,
  queryVariables,
  refetch,
  refreshControl,
  sectionByDate,
  showBackToTop,
  stickyHeaderIndices
}) => {
  const { globalSettings, listTypesSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { categoryTitles } = sections;

  const Component = getComponent(
    query,
    horizontal ?? isHorizontal(query, listTypesSettings),
    sectionByDate
  );

  return (
    <Component
      categoryTitles={categoryTitles}
      data={data}
      refetch={refetch}
      fetchMoreData={fetchMoreData}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      navigation={navigation}
      noSubtitle={noSubtitle}
      noOvertitle={noOvertitle}
      listType={listType}
      openWebScreen={openWebScreen}
      query={query}
      queryVariables={queryVariables}
      isIndexStartingAt1={isIndexStartingAt1}
      refreshControl={refreshControl}
      showBackToTop={showBackToTop}
      stickyHeaderIndices={stickyHeaderIndices}
    />
  );
};

ListComponent.propTypes = {
  data: PropTypes.array,
  fetchMoreData: PropTypes.func,
  horizontal: PropTypes.bool,
  isIndexStartingAt1: PropTypes.bool,
  ListEmptyComponent: PropTypes.object,
  ListFooterComponent: PropTypes.object,
  ListHeaderComponent: PropTypes.object,
  navigation: PropTypes.object,
  noSubtitle: PropTypes.bool,
  noOvertitle: PropTypes.bool,
  listType: PropTypes.string,
  openWebScreen: PropTypes.func,
  query: PropTypes.string.isRequired,
  queryVariables: PropTypes.object,
  refetch: PropTypes.func,
  refreshControl: PropTypes.object,
  sectionByDate: PropTypes.bool,
  showBackToTop: PropTypes.bool,
  stickyHeaderIndices: PropTypes.array
};
