import * as Location from 'expo-location';
import _uniqBy from 'lodash/uniqBy';
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
  EmptyMessage,
  Filter,
  HeaderLeft,
  HtmlView,
  IndexFilterWrapperAndList,
  IndexMapSwitch,
  ListComponent,
  LoadingContainer,
  LocationOverview,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors, Icon, normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import {
  filterTypesHelper,
  geoLocationFilteredListItem,
  graphqlFetchPolicy,
  isOpen,
  openLink,
  parseListItemsFromQuery,
  sortPOIsByDistanceFromPosition
} from '../../helpers';
import { updateResourceFiltersStateHelper } from '../../helpers/updateResourceFiltersStateHelper';
import {
  useLastKnownPosition,
  useLocationSettings,
  useOpenWebScreen,
  usePermanentFilter,
  usePosition,
  useStaticContent,
  useSystemPermission
} from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { PermanentFilterContext } from '../../PermanentFilterProvider';
import { getFetchMoreQuery, getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { GenericType } from '../../types';

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

const getAdditionalQueryVariables = (
  query,
  selectedValue,
  excludeDataProviderIds,
  excludeMowasRegionalKeys
) => {
  const keyForSelectedValue = keyForSelectedValueByQuery(query);
  const additionalQueryVariables = {};

  if (selectedValue) {
    additionalQueryVariables[keyForSelectedValue] = selectedValue;
  }

  if (excludeDataProviderIds?.length) {
    additionalQueryVariables.excludeDataProviderIds = excludeDataProviderIds;
  }

  if (excludeMowasRegionalKeys?.length) {
    additionalQueryVariables.excludeMowasRegionalKeys = excludeMowasRegionalKeys;
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
  const { resourceFilters } = useContext(ConfigurationsContext);
  const { resourceFiltersState = {}, resourceFiltersDispatch } = useContext(PermanentFilterContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {}, sections = {}, settings = {} } = globalSettings;
  const { news: showNewsFilter = false } = filter;
  const {
    showFilterByOpeningTimes = true,
    switchBetweenListAndMap = SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER,
    locationService = {}
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
  const initialQueryVariables = route?.params?.queryVariables || {};
  const resourceFiltersQuery =
    query === QUERY_TYPES.GENERIC_ITEMS ? initialQueryVariables.genericType : query;
  const filterQuery =
    query === QUERY_TYPES.GENERIC_ITEMS
      ? initialQueryVariables.genericType
      : query === QUERY_TYPES.POINTS_OF_INTEREST
      ? initialQueryVariables.category
      : query;
  const [queryVariables, setQueryVariables] = useState({
    ...initialQueryVariables,
    ...resourceFiltersState[filterQuery]
  });
  const [refreshing, setRefreshing] = useState(false);
  const showMap = isMapSelected(query, filterType);
  const sortByDistance =
    query === QUERY_TYPES.POINTS_OF_INTEREST && (locationService.sortByDistance ?? true);
  const [filterByOpeningTimes, setFilterByOpeningTimes] = useState(false);
  const { excludeDataProviderIds, excludeMowasRegionalKeys } = usePermanentFilter();
  const { loading: loadingPosition, position } = usePosition(
    !sortByDistance ||
      systemPermission?.status !== Location.PermissionStatus.GRANTED ||
      !locationServiceEnabled
  );
  const title = route.params?.title ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const categories = route.params?.categories;
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
  const { locationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();
  const { locationService: locationServiceEnabled } = locationSettings;
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED || !locationServiceEnabled
  );
  const currentPosition = position || lastKnownPosition;
  const [isLocationAlertShow, setIsLocationAlertShow] = useState(false);

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
        sortByDistance || queryVariables.onlyCurrentlyOpen
          ? undefined
          : route.params?.queryVariables?.limit
    }
  });

  const listItems = useMemo(() => {
    let parsedListItems = parseListItemsFromQuery(query, data, titleDetail, {
      bookmarkable,
      withDate: false,
      queryVariables
    });

    if (queryVariables.onlyCurrentlyOpen) {
      parsedListItems = parsedListItems?.filter(
        (entry) => isOpen(entry.params?.details?.openingHours)?.open
      );
    }

    if (queryVariables?.genericType === GenericType.Voucher) {
      parsedListItems = parsedListItems?.filter(
        (entry) => !!entry.params?.details?.vouchers?.length
      );
    }

    if (sortByDistance && position && parsedListItems?.length) {
      parsedListItems = sortPOIsByDistanceFromPosition(parsedListItems, position.coords);
    }

    if (queryVariables?.radiusSearch?.distance) {
      parsedListItems = geoLocationFilteredListItem({
        currentPosition,
        isLocationAlertShow,
        listItem: parsedListItems,
        locationSettings,
        navigation,
        queryVariables,
        setIsLocationAlertShow
      });
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
    position,
    isLocationAlertShow
  ]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    if (isConnected) {
      refetch();
    }
    setRefreshing(false);
  }, [isConnected, setRefreshing, refetch]);

  const filterTypes = useMemo(() => {
    return filterTypesHelper({
      categories,
      category: initialQueryVariables?.category,
      data,
      excludeDataProviderIds,
      query: resourceFiltersQuery,
      queryVariables,
      resourceFilters
    });
  }, [data]);

  useEffect(() => {
    updateResourceFiltersStateHelper({
      query: filterQuery,
      queryVariables,
      resourceFiltersDispatch,
      resourceFiltersState
    });
  }, [query, queryVariables]);

  useEffect(() => {
    // we want to ensure when changing from one index screen to another of the same resource, that
    // the query variables are taken freshly. otherwise the mounted screen can have query variables
    // from the previous screen, what does not work. this can result in an unchanged screen because
    // the query is not returning anything.
    setQueryVariables({
      ...(route.params?.queryVariables ?? {}),
      ...resourceFiltersState?.[filterQuery],
      ...getAdditionalQueryVariables(
        query,
        undefined,
        excludeDataProviderIds,
        excludeMowasRegionalKeys
      )
    });
  }, [excludeDataProviderIds, excludeMowasRegionalKeys, query, route.params?.queryVariables]);

  useLayoutEffect(() => {
    if (
      query === QUERY_TYPES.POINTS_OF_INTEREST &&
      showMap &&
      initialFilter === FILTER_TYPES.LIST &&
      switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.BOTTOM_FLOATING_BUTTON
    ) {
      navigation.setOptions({
        headerLeft: () => (
          <HeaderLeft
            onPress={() => setFilterType(INITIAL_FILTER)}
            backImage={({ tintColor }) => (
              <Icon.Close
                color={tintColor}
                size={normalize(22)}
                style={{ paddingHorizontal: normalize(14) }}
              />
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
        offset: data?.[query]?.length
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult?.[query]?.length) return prevResult;

        const uniqueData = _uniqBy([...prevResult[query], ...fetchMoreResult[query]], 'id');

        return {
          ...prevResult,
          [query]: uniqueData
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
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const showMapFilter = (queryVariables?.categoryIds?.length || 0) > 1;

  return (
    <SafeAreaViewFlex>
      {!showMapFilter && (
        <Filter
          filterTypes={filterTypes}
          initialFilters={initialQueryVariables}
          isOverlay
          queryVariables={queryVariables}
          setQueryVariables={setQueryVariables}
        />
      )}

      {query === QUERY_TYPES.POINTS_OF_INTEREST &&
        switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER && (
          <View>
            <IndexFilterWrapperAndList filter={filterType} setFilter={setFilterType} />
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
          currentPosition={currentPosition}
        />
      ) : (
        <>
          <ListComponent
            ListHeaderComponent={
              <>
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
                  <ActivityIndicator color={colors.refreshControl} />
                </LoadingContainer>
              ) : (
                <EmptyMessage
                  title={!categories?.length ? texts.empty.list : ''}
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
            noOvertitle={query === QUERY_TYPES.POINTS_OF_INTEREST}
            sectionByDate
            query={query}
            queryVariables={queryVariables}
            fetchMoreData={fetchMoreData}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[colors.refreshControl]}
                tintColor={colors.refreshControl}
              />
            }
            showBackToTop
          />
        </>
      )}
      {!loading &&
        !!listItems?.length &&
        query === QUERY_TYPES.POINTS_OF_INTEREST &&
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
