import * as Location from 'expo-location';
import _camelCase from 'lodash/camelCase';
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
import { ActivityIndicator, RefreshControl } from 'react-native';
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
  WrapperVertical
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

/* eslint-disable complexity */
export const Overviews = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { resourceFilters } = useContext(ConfigurationsContext);
  const { resourceFiltersState = {}, resourceFiltersDispatch } = useContext(PermanentFilterContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {}, sections = {}, settings = {} } = globalSettings;
  const { news: showNewsFilter = false } = filter;
  const { switchBetweenListAndMap = SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER, locationService = {} } =
    settings;
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
      : query === QUERY_TYPES.NEWS_ITEMS
      ? _camelCase(route.params?.title)
      : query;
  const [queryVariables, setQueryVariables] = useState({
    ...initialQueryVariables,
    ...resourceFiltersState[filterQuery]
  });
  const [refreshing, setRefreshing] = useState(false);
  const showMap = isMapSelected(query, filterType);
  const { excludeDataProviderIds, excludeMowasRegionalKeys } = usePermanentFilter();
  const { locationSettings } = useLocationSettings();
  const { locationService: locationServiceEnabled } = locationSettings;
  const systemPermission = useSystemPermission();
  const sortByDistance =
    query === QUERY_TYPES.POINTS_OF_INTEREST &&
    locationServiceEnabled &&
    (locationService.sortByDistance ?? true);
  const { loading: loadingPosition, position } = usePosition(
    !sortByDistance || systemPermission?.status !== Location.PermissionStatus.GRANTED
  );
  const { position: lastKnownPosition } = useLastKnownPosition(
    !sortByDistance || systemPermission?.status !== Location.PermissionStatus.GRANTED
  );
  const currentPosition = position || lastKnownPosition;
  const title = route.params?.title ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const categories = route.params?.categories; // HINT: defined on a nested category list screen
  const subQuery = route.params?.subQuery;
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
      queryVariables,
      subQuery
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
    } else if (query === QUERY_TYPES.POINTS_OF_INTEREST && !showMap) {
      navigation.setOptions({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      });
    }
  }, [query, showMap]);

  const fetchMoreData = useCallback(() => {
    return fetchMore({
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
  }, [data, query, queryVariables]);

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

  return (
    <SafeAreaViewFlex>
      <Filter
        filterTypes={filterTypes}
        initialQueryVariables={initialQueryVariables}
        isOverlay
        queryVariables={queryVariables}
        setQueryVariables={setQueryVariables}
      />

      {query === QUERY_TYPES.POINTS_OF_INTEREST &&
        switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER && (
          <>
            <IndexFilterWrapperAndList filter={filterType} setFilter={setFilterType} />
            <Divider />
          </>
        )}
      {query === QUERY_TYPES.POINTS_OF_INTEREST && showMap ? (
        <LocationOverview
          currentPosition={currentPosition}
          navigation={navigation}
          position={position}
          queryVariables={queryVariables}
          route={route}
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
                  <WrapperVertical>
                    <RegularText>{categoryListIntroText}</RegularText>
                  </WrapperVertical>
                )}
                {!!htmlContent && (
                  <WrapperVertical>
                    <HtmlView html={htmlContent} />
                  </WrapperVertical>
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
                      <WrapperVertical>
                        <RegularText small>{categoryListFooter.footerText}</RegularText>
                      </WrapperVertical>
                    )}
                    {!!categoryListFooter.url && !!categoryListFooter.buttonTitle && (
                      <WrapperVertical>
                        <Button
                          onPress={() => openLink(categoryListFooter.url, openWebScreen)}
                          title={categoryListFooter.buttonTitle}
                        />
                      </WrapperVertical>
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
