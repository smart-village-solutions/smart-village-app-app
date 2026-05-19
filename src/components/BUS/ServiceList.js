import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, consts, normalize } from '../../config';
import { VerticalList } from '../VerticalList';
import { IndexFilterWrapper } from '../IndexFilterElement';
import { RegularText } from '../Text';
import { WrapperHorizontal, WrapperVertical } from '../Wrapper';

import { AreaAutocomplete } from './AreaAutocomplete';
import { IndexFilter } from './IndexFilter';

const FILTER_IDS = {
  TOP10: 1,
  LIFE_SITUATIONS: 2
};
const { LIST_TYPES } = consts;
const areaIdPropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

const getVisibleListItems = ({
  areaId,
  filteredListState,
  isListLoading,
  lifeSituations,
  selectedFilterId,
  top10
}) => {
  if (!areaId || isListLoading) {
    return [];
  }

  if (selectedFilterId === FILTER_IDS.TOP10) {
    return top10;
  }

  if (selectedFilterId === FILTER_IDS.LIFE_SITUATIONS) {
    return lifeSituations;
  }

  return filteredListState.areaId === areaId && filteredListState.filterId === selectedFilterId
    ? filteredListState.items
    : [];
};

const LifeSituationsHeader = ({
  areaId,
  areaName,
  initialAreaId,
  initialAreaName,
  listItemsCount,
  setArea
}) => {
  return (
    <View>
      <WrapperVertical>
        <AreaAutocomplete
          areaId={areaId}
          areaName={areaName}
          initialAreaId={initialAreaId}
          initialAreaName={initialAreaName}
          onSelectArea={setArea}
        />
      </WrapperVertical>
      <IndexFilterWrapper>
        <WrapperHorizontal>
          <RegularText style={styles.results}>{`${listItemsCount} TREFFER`}</RegularText>
        </WrapperHorizontal>
      </IndexFilterWrapper>
    </View>
  );
};

LifeSituationsHeader.propTypes = {
  areaId: areaIdPropType,
  areaName: PropTypes.string,
  initialAreaId: areaIdPropType,
  initialAreaName: PropTypes.string,
  listItemsCount: PropTypes.number.isRequired,
  setArea: PropTypes.func.isRequired
};

const LifeSituationsEmptyState = ({ message }) => {
  return (
    <View style={styles.emptyState}>
      <RegularText placeholder small center>
        {message}
      </RegularText>
    </View>
  );
};

LifeSituationsEmptyState.propTypes = {
  message: PropTypes.string.isRequired
};

export const ServiceList = ({
  areaId,
  areaName,
  initialAreaId,
  initialAreaName,
  isListLoading,
  lifeSituationsEmptyStateMessage,
  lifeSituations = [],
  navigation,
  refreshControl,
  results = [],
  selectedFilter,
  setArea,
  top10
}) => {
  const activeFilter = selectedFilter || { id: 3 };
  const [filteredListState, setFilteredListState] = useState({
    areaId,
    filterId: activeFilter.id,
    items: []
  });
  const setFilteredListItems = useCallback(
    (items) =>
      setFilteredListState({
        areaId,
        filterId: activeFilter.id,
        items
      }),
    [activeFilter.id, areaId]
  );
  const listItems = getVisibleListItems({
    areaId,
    filteredListState,
    isListLoading,
    lifeSituations,
    selectedFilterId: activeFilter.id,
    top10
  });

  const listHeaderComponent =
    activeFilter.id === FILTER_IDS.LIFE_SITUATIONS ? (
      <LifeSituationsHeader
        areaId={areaId}
        areaName={areaName}
        initialAreaId={initialAreaId}
        initialAreaName={initialAreaName}
        listItemsCount={listItems.length}
        setArea={setArea}
      />
    ) : (
      <IndexFilter
        selectedFilter={activeFilter}
        results={results}
        listItems={listItems}
        setListItems={setFilteredListItems}
        areaId={areaId}
        areaName={areaName}
        initialAreaId={initialAreaId}
        initialAreaName={initialAreaName}
        setArea={setArea}
        loading={isListLoading}
      />
    );

  const listEmptyComponent =
    activeFilter.id === FILTER_IDS.LIFE_SITUATIONS &&
    !!areaId &&
    !isListLoading &&
    !!lifeSituationsEmptyStateMessage ? (
      <LifeSituationsEmptyState message={lifeSituationsEmptyStateMessage} />
    ) : null;

  return (
    <VerticalList
      navigation={navigation}
      data={listItems}
      listType={
        activeFilter.id === FILTER_IDS.LIFE_SITUATIONS ? LIST_TYPES.IMAGE_TEXT_LIST : undefined
      }
      noSubtitle={activeFilter.id !== FILTER_IDS.LIFE_SITUATIONS}
      ListEmptyComponent={listEmptyComponent}
      ListHeaderComponent={listHeaderComponent}
      isLoading={isListLoading}
      showBackToTop
      refreshControl={refreshControl}
    />
  );
};

ServiceList.propTypes = {
  areaId: areaIdPropType,
  areaName: PropTypes.string,
  initialAreaId: areaIdPropType,
  initialAreaName: PropTypes.string,
  isListLoading: PropTypes.bool.isRequired,
  lifeSituationsEmptyStateMessage: PropTypes.string,
  lifeSituations: PropTypes.array,
  navigation: PropTypes.object.isRequired,
  refreshControl: PropTypes.object,
  results: PropTypes.array,
  selectedFilter: PropTypes.object.isRequired,
  setArea: PropTypes.func.isRequired,
  top10: PropTypes.array.isRequired
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: normalize(16)
  },
  results: {
    color: colors.text,
    fontSize: normalize(10),
    letterSpacing: normalize(1.5),
    lineHeight: normalize(30)
  }
});
