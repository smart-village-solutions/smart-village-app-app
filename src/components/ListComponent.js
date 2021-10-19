import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { consts } from '../config';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

import { CategoryList } from './CategoryList';
import { EventList } from './EventList';
import { HorizontalList } from './HorizontalList';
import { TextList } from './TextList';

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

const getComponent = (query, horizontal, sectionByDate) => {
  switch (query) {
    case QUERY_TYPES.CATEGORIES:
      return CategoryList;
    case QUERY_TYPES.POINTS_OF_INTEREST:
    case QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS:
    case QUERY_TYPES.TOURS:
      return horizontal ? HorizontalList : TextList;
    case QUERY_TYPES.EVENT_RECORDS:
      return sectionByDate ? EventList : TextList;
    default:
      return TextList;
  }
};

// the ListComponent will default to being horizontal for CardLists,
// which can be overwritten by passing in the horizontal prop
export const ListComponent = ({
  navigation,
  data,
  noSubtitle,
  query,
  fetchMoreData,
  horizontal,
  sectionByDate,
  ListHeaderComponent,
  refreshControl
}) => {
  const { listTypesSettings } = useContext(SettingsContext);

  const Component = getComponent(
    query,
    horizontal ?? isHorizontal(query, listTypesSettings),
    sectionByDate
  );

  return (
    <Component
      data={data}
      fetchMoreData={fetchMoreData}
      ListHeaderComponent={ListHeaderComponent}
      navigation={navigation}
      noSubtitle={noSubtitle}
      query={query}
      refreshControl={refreshControl}
    />
  );
};

ListComponent.propTypes = {
  navigation: PropTypes.object,
  data: PropTypes.array,
  noSubtitle: PropTypes.bool,
  query: PropTypes.string.isRequired,
  fetchMoreData: PropTypes.func,
  horizontal: PropTypes.bool,
  sectionByDate: PropTypes.bool,
  ListHeaderComponent: PropTypes.object,
  refreshControl: PropTypes.object
};
