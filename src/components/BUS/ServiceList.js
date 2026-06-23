import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, consts, normalize, texts } from '../../config';
import { mapBusServicesToListItems } from '../../helpers/busListHelper';
import { BUS_MIN_SEARCH_LENGTH, BUS_SEARCH_DEBOUNCE_MS, useBusServiceSearch } from '../../hooks';
import { EmptyMessage } from '../EmptyMessage';
import { IndexFilterWrapper } from '../IndexFilterElement';
import { RegularText } from '../Text';
import { VerticalList } from '../VerticalList';
import { WrapperHorizontal, WrapperVertical } from '../Wrapper';

import { AreaAutocomplete } from './AreaAutocomplete';
import { IndexFilter } from './IndexFilter';

const FILTER_IDS = {
  TOP10: 1,
  LIFE_SITUATIONS: 2,
  SEARCH: 3,
  ATOZ: 4
};
const { LIST_TYPES } = consts;
const areaIdPropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);
const alphabet = Array.from({ length: 26 }, (_, index) => String.fromCodePoint(index + 65));
const umlauts = ['Ä', 'Ö', 'Ü'];
const initialAZFilterData = [...alphabet, ...umlauts].map((value, index) => ({
  id: index + 1,
  value,
  selected: false
}));
const AZ_IMPORT_STATUS = {
  COMPLETE: 'complete',
  ERROR: 'error',
  IDLE: 'idle',
  LOADING: 'loading'
};
const createAZImportState = () => ({
  key: null,
  status: AZ_IMPORT_STATUS.IDLE
});
const areListItemsEqual = (leftItems = [], rightItems = []) =>
  leftItems.length === rightItems.length &&
  leftItems.every(
    (item, index) => item?.id === rightItems[index]?.id && item?.title === rightItems[index]?.title
  );
const getActiveAZImportState = ({
  activeFilterId,
  activeImportKey,
  importState,
  selectedAZCharacter
}) =>
  activeFilterId === FILTER_IDS.ATOZ && !!selectedAZCharacter && importState.key === activeImportKey
    ? importState
    : createAZImportState();

const getVisibleListItems = ({
  areaId,
  filteredListState,
  isListLoading,
  lifeSituations,
  searchResults,
  selectedAZCharacter,
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

  if (selectedFilterId === FILTER_IDS.SEARCH) {
    return searchResults;
  }

  if (selectedFilterId === FILTER_IDS.ATOZ && !selectedAZCharacter) {
    return [];
  }

  return filteredListState.areaId === areaId && filteredListState.filterId === selectedFilterId
    ? filteredListState.items
    : [];
};
const getHasSearchError = ({
  activeFilterId,
  isSearchDebouncing,
  isSearchError,
  trimmedDebouncedSearchData
}) =>
  activeFilterId === FILTER_IDS.SEARCH &&
  trimmedDebouncedSearchData.length >= BUS_MIN_SEARCH_LENGTH &&
  !isSearchDebouncing &&
  isSearchError;
const getHasAZError = ({
  activeFilterId,
  activeAZImportState,
  isServicesError,
  results,
  selectedAZCharacter
}) =>
  activeFilterId === FILTER_IDS.ATOZ &&
  !!selectedAZCharacter &&
  (activeAZImportState.status === AZ_IMPORT_STATUS.ERROR || (!!isServicesError && !results.length));
const getListLoading = ({
  activeFilterId,
  hasAZError,
  isAZImportLoading,
  isListLoading,
  isLoadingSearchResults,
  searchResults
}) => {
  if (activeFilterId === FILTER_IDS.SEARCH) {
    return isLoadingSearchResults && !searchResults.length;
  }

  if (activeFilterId === FILTER_IDS.ATOZ) {
    return !hasAZError && (isListLoading || isAZImportLoading);
  }

  return isListLoading;
};
const getFetchMoreData = ({
  fetchNextSearchPage,
  hasNextSearchPage,
  isFetchingNextSearchPage,
  isSearchDebouncing,
  selectedFilterId
}) => {
  if (selectedFilterId !== FILTER_IDS.SEARCH) {
    return undefined;
  }

  return async () => {
    if (!hasNextSearchPage || isFetchingNextSearchPage || isSearchDebouncing) {
      return { data: [] };
    }

    const nextPageResult = await fetchNextSearchPage();
    const lastPage = nextPageResult?.data?.pages?.slice(-1)[0];

    return { data: lastPage?.items ?? [] };
  };
};

const LifeSituationsHeader = ({
  areaId,
  areaName,
  blurAreaSignal = 0,
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
          blurSignal={blurAreaSignal}
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
  blurAreaSignal: PropTypes.number,
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

/* eslint-disable complexity */
export const ServiceList = ({
  areaId,
  areaName,
  fetchNextServicesPage,
  hasNextServicesPage,
  initialAreaId,
  initialAreaName,
  isFetchingNextServicesPage = false,
  isListLoading,
  isServicesLoading = false,
  lifeSituationsEmptyStateMessage,
  lifeSituations = [],
  navigation,
  refreshControl,
  results = [],
  isServicesError = false,
  selectedFilter,
  setArea,
  top10
}) => {
  const activeFilter = selectedFilter || { id: FILTER_IDS.SEARCH };
  const [areaBlurSignal, setAreaBlurSignal] = useState(0);
  const [searchData, setSearchData] = useState('');
  const [searchBlurSignal, setSearchBlurSignal] = useState(0);
  const [debouncedSearchData, setDebouncedSearchData] = useState('');
  const [AZFilterData, setAZFilterData] = useState(initialAZFilterData);
  const [AZImportState, setAZImportState] = useState(createAZImportState);
  // Triggers the async A-Z import effect in a controlled way and guards against stale runs.
  const [AZImportRequest, setAZImportRequest] = useState(null);
  const [filteredListState, setFilteredListState] = useState({
    areaId,
    filterId: activeFilter.id,
    items: []
  });
  const {
    data: searchResults = [],
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isError: isSearchError,
    isFetchingNextPage: isFetchingNextSearchPage,
    isLoading: isLoadingSearchResults
  } = useBusServiceSearch(areaId, debouncedSearchData);
  const setFilteredListItems = useCallback(
    (items) =>
      setFilteredListState((currentState) => {
        if (
          currentState.areaId === areaId &&
          currentState.filterId === activeFilter.id &&
          areListItemsEqual(currentState.items, items)
        ) {
          return currentState;
        }

        return {
          ...currentState,
          areaId,
          filterId: activeFilter.id,
          items
        };
      }),
    [activeFilter.id, areaId]
  );
  const selectedAZCharacter = AZFilterData.find((item) => item.selected)?.value;
  const activeAZImportKey = `${areaId ?? ''}:${selectedAZCharacter ?? ''}`;
  const activeAZImportState = getActiveAZImportState({
    activeFilterId: activeFilter.id,
    activeImportKey: activeAZImportKey,
    importState: AZImportState,
    selectedAZCharacter
  });
  const isSearchDebouncing = searchData !== debouncedSearchData;
  const trimmedDebouncedSearchData = debouncedSearchData.trim();
  const searchListItems = trimmedDebouncedSearchData.length
    ? mapBusServicesToListItems(areaId, searchResults)
    : [];
  const isAZImportLoading = activeAZImportState.status === AZ_IMPORT_STATUS.LOADING;
  const hasSearchError = getHasSearchError({
    activeFilterId: activeFilter.id,
    isSearchDebouncing,
    isSearchError,
    trimmedDebouncedSearchData
  });
  const hasAZError = getHasAZError({
    activeAZImportState,
    activeFilterId: activeFilter.id,
    isServicesError,
    results,
    selectedAZCharacter
  });
  const listLoading = getListLoading({
    activeFilterId: activeFilter.id,
    hasAZError,
    isAZImportLoading,
    isListLoading,
    isLoadingSearchResults,
    searchResults
  });
  const listItems = getVisibleListItems({
    areaId,
    filteredListState,
    isListLoading: listLoading,
    lifeSituations,
    searchResults: searchListItems,
    selectedAZCharacter,
    selectedFilterId: activeFilter.id,
    top10
  });
  const fetchMoreData = getFetchMoreData({
    fetchNextSearchPage,
    hasNextSearchPage,
    isFetchingNextSearchPage,
    isSearchDebouncing,
    selectedFilterId: activeFilter.id
  });
  const handleSetAZFilterData = useCallback((nextData) => {
    setAreaBlurSignal((currentValue) => currentValue + 1);
    setAZFilterData(nextData);
  }, []);

  useEffect(() => {
    if (typeof navigation?.addListener !== 'function') {
      return undefined;
    }

    return navigation.addListener('focus', () => {
      if (activeFilter.id === FILTER_IDS.SEARCH) {
        setSearchBlurSignal((currentValue) => currentValue + 1);
      }
    });
  }, [activeFilter.id, navigation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchData(searchData);
    }, BUS_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchData]);

  useEffect(() => {
    setSearchData('');
    setDebouncedSearchData('');
  }, [areaId]);

  useEffect(() => {
    setAZImportState(createAZImportState());
    setAZImportRequest(null);
    setFilteredListState((currentState) => ({
      ...currentState,
      areaId,
      items: []
    }));
  }, [areaId]);

  useEffect(() => {
    if (!fetchNextServicesPage) {
      return;
    }

    if (activeFilter.id !== FILTER_IDS.ATOZ || !selectedAZCharacter) {
      return;
    }

    if (isServicesLoading) {
      return;
    }

    if (isFetchingNextServicesPage) {
      return;
    }

    const hasCompletedAreaImport = activeAZImportState.status === AZ_IMPORT_STATUS.COMPLETE;

    if (!hasNextServicesPage) {
      if (!hasCompletedAreaImport) {
        setAZImportState({
          key: activeAZImportKey,
          status: AZ_IMPORT_STATUS.COMPLETE
        });
      }
      return;
    }

    if (hasCompletedAreaImport || activeAZImportState.status !== AZ_IMPORT_STATUS.IDLE) {
      return;
    }

    setAZImportState({
      key: activeAZImportKey,
      status: AZ_IMPORT_STATUS.LOADING
    });
    setAZImportRequest((currentRequest) => ({
      key: activeAZImportKey,
      sequence: (currentRequest?.sequence ?? 0) + 1
    }));
  }, [
    activeAZImportKey,
    activeAZImportState.status,
    activeFilter.id,
    fetchNextServicesPage,
    hasNextServicesPage,
    isFetchingNextServicesPage,
    isServicesLoading,
    selectedAZCharacter
  ]);

  useEffect(() => {
    if (!AZImportRequest || !fetchNextServicesPage || AZImportRequest.key !== activeAZImportKey) {
      return;
    }

    let isCancelled = false;

    const loadAllServicePagesForAZ = async () => {
      try {
        let shouldContinue = true;
        let previousLoadedItemsCount = -1;

        while (shouldContinue) {
          const nextPageResult = await fetchNextServicesPage();

          if (isCancelled) {
            break;
          }

          const pages = nextPageResult?.data?.pages ?? [];
          const lastPage = pages[pages.length - 1];
          const loadedItemsCount = pages.reduce(
            (count, page) => count + (page?.items?.length ?? 0),
            0
          );

          const hasLoadedMoreItems = loadedItemsCount > previousLoadedItemsCount;
          previousLoadedItemsCount = loadedItemsCount;

          shouldContinue =
            hasLoadedMoreItems && loadedItemsCount < (lastPage?.totalItemCount ?? loadedItemsCount);
        }

        if (!isCancelled) {
          setAZImportState({
            key: AZImportRequest.key,
            status: AZ_IMPORT_STATUS.COMPLETE
          });
        }
      } catch (error) {
        console.warn('BUS A-Z full import failed', error);

        if (!isCancelled) {
          setAZImportState({
            key: AZImportRequest.key,
            status: AZ_IMPORT_STATUS.ERROR
          });
        }
      }
    };

    loadAllServicePagesForAZ();

    return () => {
      isCancelled = true;
    };
  }, [AZImportRequest, activeAZImportKey, fetchNextServicesPage]);

  const listHeaderComponent =
    activeFilter.id === FILTER_IDS.LIFE_SITUATIONS ? (
      <LifeSituationsHeader
        areaId={areaId}
        areaName={areaName}
        blurAreaSignal={areaBlurSignal}
        initialAreaId={initialAreaId}
        initialAreaName={initialAreaName}
        listItemsCount={listItems.length}
        setArea={setArea}
      />
    ) : (
      <IndexFilter
        AZFilterData={AZFilterData}
        selectedFilter={activeFilter}
        blurAreaSignal={areaBlurSignal}
        blurSearchSignal={searchBlurSignal}
        results={results}
        areaId={areaId}
        areaName={areaName}
        initialAreaId={initialAreaId}
        initialAreaName={initialAreaName}
        searchData={searchData}
        setArea={setArea}
        loading={listLoading}
        listItems={listItems}
        setAZFilterData={handleSetAZFilterData}
        setSearchData={setSearchData}
        setListItems={setFilteredListItems}
      />
    );
  const hasLifeSituationsEmptyState =
    activeFilter.id === FILTER_IDS.LIFE_SITUATIONS &&
    !!areaId &&
    !isListLoading &&
    !!lifeSituationsEmptyStateMessage;
  let listEmptyComponent = null;

  if (hasSearchError || hasAZError) {
    listEmptyComponent = (
      <EmptyMessage
        title={hasSearchError ? texts.bus.emptyStates.search : texts.bus.emptyStates.services}
        showIcon={false}
      />
    );
  } else if (hasLifeSituationsEmptyState) {
    listEmptyComponent = <LifeSituationsEmptyState message={lifeSituationsEmptyStateMessage} />;
  }

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
      fetchMoreData={fetchMoreData}
      isLoading={listLoading}
      showBackToTop
      refreshControl={refreshControl}
    />
  );
};
/* eslint-enable complexity */

ServiceList.propTypes = {
  areaId: areaIdPropType,
  areaName: PropTypes.string,
  fetchNextServicesPage: PropTypes.func,
  hasNextServicesPage: PropTypes.bool,
  initialAreaId: areaIdPropType,
  initialAreaName: PropTypes.string,
  isFetchingNextServicesPage: PropTypes.bool,
  isListLoading: PropTypes.bool.isRequired,
  isServicesLoading: PropTypes.bool,
  isServicesError: PropTypes.bool,
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
