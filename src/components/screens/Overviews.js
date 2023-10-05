import PropTypes from 'prop-types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { Divider } from 'react-native-elements';

import {
  Button,
  CategoryList,
  DropdownHeader,
  EmptyMessage,
  HeaderLeft,
  HtmlView,
  IndexFilterWrapperAndList,
  IndexMapSwitch,
  ListComponent,
  LoadingContainer,
  LocationOverview,
  OptionToggle,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors, Icon, normalize, texts } from '../../config';
import {
  graphqlFetchPolicy,
  isOpen,
  openLink,
  parseListItemsFromQuery,
  sortPOIsByDistanceFromPosition
} from '../../helpers';
import { useOpenWebScreen, usePermanentFilter, usePosition, useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getFetchMoreQuery, getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';

const FILTER_TYPES = {
  LIST: 'list',
  MAP: 'map'
};

export const SWITCH_BETWEEN_LIST_AND_MAP = {
  TOP_FILTER: 'top-filter',
  BOTTOM_FLOATING_BUTTON: 'bottom-floating-button'
};

const isMapSelected = (query, topFilter) =>
  query === QUERY_TYPES.POINTS_OF_INTEREST &&
  topFilter.find((entry) => entry.selected).id === FILTER_TYPES.MAP;

const keyForSelectedValueByQuery = (query) => {
  const QUERIES = {
    [QUERY_TYPES.NEWS_ITEMS]: 'dataProvider'
  };

  return QUERIES[query];
};

const getAdditionalQueryVariables = (query, selectedValue, excludeDataProviderIds) => {
  const keyForSelectedValue = keyForSelectedValueByQuery(query);
  const additionalQueryVariables = {};

  if (selectedValue) {
    additionalQueryVariables[keyForSelectedValue] = selectedValue;
  }

  if (excludeDataProviderIds?.length) {
    additionalQueryVariables.excludeDataProviderIds = excludeDataProviderIds;
  }

  return additionalQueryVariables;
};

const hasFilterSelection = (query, queryVariables) => {
  return !!Object.prototype.hasOwnProperty.call(queryVariables, [
    keyForSelectedValueByQuery(query)
  ]);
};

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Overviews = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {}, sections = {}, settings = {} } = globalSettings;
  const { news: showNewsFilter = false } = filter;
  const {
    showFilterByOpeningTimes = true,
    switchBetweenListAndMap = SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER
  } = settings;
  const {
    categoryListIntroText = texts.categoryList.intro,
    categoryListFooter,
    categoryTitles,
    poiListIntro
  } = sections;
  const query = route.params?.query ?? '';
  const { initialFilter = FILTER_TYPES.LIST } = route.params?.queryVariables ?? {};
  const INITIAL_FILTER = [
    {
      id: FILTER_TYPES.LIST,
      title: texts.locationOverview.list,
      selected: initialFilter == FILTER_TYPES.LIST
    },
    {
      id: FILTER_TYPES.MAP,
      title: texts.locationOverview.map,
      selected: initialFilter == FILTER_TYPES.MAP
    }
  ];
  const [filterType, setFilterType] = useState(INITIAL_FILTER);
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables || {});
  const [refreshing, setRefreshing] = useState(false);
  const showMap = isMapSelected(query, filterType);
  const sortByDistance = query === QUERY_TYPES.POINTS_OF_INTEREST;
  const [filterByOpeningTimes, setFilterByOpeningTimes] = useState(false);
  const { state: excludeDataProviderIds } = usePermanentFilter();
  const { loading: loadingPosition, position } = usePosition(!sortByDistance);
  const title = route.params?.title ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const categories = route.params?.categories;
  const showFilter =
    (route.params?.showFilter ?? true) &&
    {
      [QUERY_TYPES.NEWS_ITEMS]: showNewsFilter
    }[query];
  const openWebScreen = useOpenWebScreen(title, categoryListFooter?.url);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const htmlContentName =
    query === QUERY_TYPES.POINTS_OF_INTEREST && poiListIntro?.[queryVariables.category];
  const { data: htmlContent } = useStaticContent({
    name: htmlContentName,
    type: 'html',
    refreshTimeKey: `${query}-${queryVariables.category}`,
    skip: !htmlContentName
  });

  const { data, loading, fetchMore, refetch } = useQuery(getQuery(query, { showNewsFilter }), {
    fetchPolicy,
    variables: {
      ...queryVariables,
      // if we want to sort by distance, we need to fetch all the entries at once. this is not a
      // big issue if we want to sort by distance, because getting the location usually takes longer
      // than fetching all entries.
      // if we filter by opening times, we need to also remove the limit as otherwise we might not
      // have any open POIs in the next batch that would result in the list not getting any new
      // items and not reliably triggering another `fetchMore`
      limit:
        sortByDistance || filterByOpeningTimes ? undefined : route.params?.queryVariables?.limit
    }
  });

  const updateListDataByDropdown = useCallback(
    (selectedValue) => {
      if (selectedValue) {
        setQueryVariables((prevQueryVariables) => {
          // remove a refetch key if present, which was necessary for the "- Alle -" selection
          delete prevQueryVariables.refetch;

          return {
            ...prevQueryVariables,
            ...getAdditionalQueryVariables(query, selectedValue, excludeDataProviderIds)
          };
        });
      } else {
        if (hasFilterSelection(query, queryVariables)) {
          setQueryVariables((prevQueryVariables) => {
            // remove the filter key for the specific query if present, when selecting "- Alle -"
            delete prevQueryVariables[keyForSelectedValueByQuery(query)];

            return { ...prevQueryVariables, refetch: true };
          });
        }
      }
    },
    [query, queryVariables, excludeDataProviderIds]
  );

  const listItems = useMemo(() => {
    let parsedListItems = parseListItemsFromQuery(query, data, titleDetail, {
      bookmarkable,
      withDate: false,
      queryVariables
    });

    if (filterByOpeningTimes) {
      parsedListItems = parsedListItems?.filter(
        (entry) => isOpen(entry.params?.details?.openingHours)?.open
      );
    }

    if (sortByDistance && position && parsedListItems?.length) {
      parsedListItems = sortPOIsByDistanceFromPosition(parsedListItems, position.coords);
    }

    return parsedListItems;
  }, [
    query,
    queryVariables,
    data,
    titleDetail,
    bookmarkable,
    filterByOpeningTimes,
    sortByDistance,
    position
  ]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    if (isConnected) {
      refetch();
    }
    setRefreshing(false);
  }, [isConnected, setRefreshing, refetch]);

  useEffect(() => {
    // we want to ensure when changing from one index screen to another of the same resource, that
    // the query variables are taken freshly. otherwise the mounted screen can have query variables
    // from the previous screen, what does not work. this can result in an unchanged screen because
    // the query is not returning anything.
    setQueryVariables({
      ...(route.params?.queryVariables ?? {}),
      ...getAdditionalQueryVariables(query, undefined, excludeDataProviderIds)
    });
  }, [route.params?.queryVariables, query, excludeDataProviderIds]);

  useLayoutEffect(() => {
    if (
      query === QUERY_TYPES.POINTS_OF_INTEREST &&
      showMap &&
      initialFilter === FILTER_TYPES.LIST
    ) {
      navigation.setOptions({
        headerLeft: () => (
          <HeaderLeft
            onPress={() => setFilterType(INITIAL_FILTER)}
            backImage={({ tintColor }) => (
              <Icon.Close color={tintColor} style={{ paddingHorizontal: normalize(14) }} />
            )}
          />
        )
      });
    } else {
      navigation.setOptions({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      });
    }
  }, [query, showMap]);

  const fetchMoreData = () =>
    fetchMore({
      query: getFetchMoreQuery(query),
      variables: {
        ...queryVariables,
        offset: queryVariables.limit
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult?.[query]?.length) return prevResult;

        return {
          ...prevResult,
          [query]: [...prevResult[query], ...fetchMoreResult[query]]
        };
      }
    });

  if (!query) return null;

  const initialNewsItemsFetch =
    query === QUERY_TYPES.NEWS_ITEMS &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'dataProvider') &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'refetch');

  if ((loading && (!data || initialNewsItemsFetch)) || loadingPosition) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      {query === QUERY_TYPES.POINTS_OF_INTEREST &&
        (switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER ||
          showFilterByOpeningTimes) && (
          <View>
            {switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER && (
              <IndexFilterWrapperAndList filter={filterType} setFilter={setFilterType} />
            )}
            {showFilterByOpeningTimes && (
              <OptionToggle
                label={texts.pointOfInterest.filterByOpeningTime}
                onToggle={() => setFilterByOpeningTimes((value) => !value)}
                value={filterByOpeningTimes}
              />
            )}
            <Divider />
          </View>
        )}
      {query === QUERY_TYPES.POINTS_OF_INTEREST && showMap ? (
        <LocationOverview
          filterByOpeningTimes={filterByOpeningTimes}
          navigation={navigation}
          route={route}
          position={position}
          queryVariables={queryVariables}
        />
      ) : (
        <>
          <ListComponent
            ListHeaderComponent={
              <>
                {!!showFilter && (
                  <>
                    <DropdownHeader
                      {...{
                        data,
                        query,
                        queryVariables,
                        updateListData: updateListDataByDropdown
                      }}
                    />
                  </>
                )}
                {!!categories?.length && (
                  <CategoryList
                    navigation={navigation}
                    categoryTitles={categoryTitles}
                    data={categories}
                    horizontal={false}
                    hasSectionHeader={false}
                  />
                )}
                {query === QUERY_TYPES.CATEGORIES && !!categoryListIntroText && (
                  <Wrapper>
                    <RegularText>{categoryListIntroText}</RegularText>
                  </Wrapper>
                )}
                {!!htmlContent && (
                  <Wrapper>
                    <HtmlView html={htmlContent} />
                  </Wrapper>
                )}
              </>
            }
            ListEmptyComponent={
              loading ? (
                <LoadingContainer>
                  <ActivityIndicator color={colors.accent} />
                </LoadingContainer>
              ) : (
                <EmptyMessage
                  title={categories?.length ? texts.empty.categoryList : texts.empty.list}
                  showIcon={!categories?.length}
                />
              )
            }
            ListFooterComponent={
              <>
                {query === QUERY_TYPES.CATEGORIES && !!categoryListFooter && (
                  <>
                    {!!categoryListFooter.footerText && (
                      <Wrapper>
                        <RegularText small>{categoryListFooter.footerText}</RegularText>
                      </Wrapper>
                    )}
                    {!!categoryListFooter.url && !!categoryListFooter.buttonTitle && (
                      <Wrapper>
                        <Button
                          onPress={() => openLink(categoryListFooter.url, openWebScreen)}
                          title={categoryListFooter.buttonTitle}
                        />
                      </Wrapper>
                    )}
                  </>
                )}
              </>
            }
            navigation={navigation}
            data={loading ? [] : listItems}
            horizontal={false}
            sectionByDate
            query={query}
            queryVariables={queryVariables}
            fetchMoreData={fetchMoreData}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[colors.accent]}
                tintColor={colors.accent}
              />
            }
            showBackToTop
          />
        </>
      )}
      {query === QUERY_TYPES.POINTS_OF_INTEREST &&
        switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.BOTTOM_FLOATING_BUTTON &&
        filterType.find((entry) => entry.title == texts.locationOverview.list)?.selected && (
          <IndexMapSwitch filter={filterType} setFilter={setFilterType} />
        )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

Overviews.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
