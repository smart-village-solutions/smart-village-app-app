import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { consts } from '../config';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { CardList } from './CardList';
import { CategoryList } from './CategoryList';
import { ImageTextList } from './ImageTextList';
import { TextList } from './TextList';

const { LIST_TYPES } = consts;

const getListComponent = (listType) =>
  ({
    [LIST_TYPES.TEXT_LIST]: TextList,
    [LIST_TYPES.IMAGE_TEXT_LIST]: ImageTextList,
    [LIST_TYPES.CARD_LIST]: CardList
  }[listType]);

const getComponent = (query, listTypesSettings) =>
  ({
    [QUERY_TYPES.NEWS_ITEMS]: getListComponent(listTypesSettings[QUERY_TYPES.NEWS_ITEMS]),
    [QUERY_TYPES.EVENT_RECORDS]: getListComponent(listTypesSettings[QUERY_TYPES.EVENT_RECORDS]),
    [QUERY_TYPES.POINTS_OF_INTEREST]: getListComponent(
      listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]
    ),
    [QUERY_TYPES.TOURS]: getListComponent(
      listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]
    ),
    [QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]: getListComponent(
      listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]
    ),
    [QUERY_TYPES.CATEGORIES]: CategoryList
  }[query]);

const isHorizontal = (query, listTypesSettings) => {
  switch (query) {
    case QUERY_TYPES.TOURS:
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS] === LIST_TYPES.CARD_LIST;
    default:
      return listTypesSettings[query] === LIST_TYPES.CARD_LIST;
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
  ListHeaderComponent,
  refreshControl
}) => {
  const { listTypesSettings } = useContext(SettingsContext);

  const Component = getComponent(query, listTypesSettings);

  return (
    <Component
      data={data}
      fetchMoreData={fetchMoreData}
      horizontal={horizontal ?? isHorizontal(query, listTypesSettings)}
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
  ListHeaderComponent: PropTypes.object,
  refreshControl: PropTypes.object
};
