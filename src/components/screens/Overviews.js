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
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import {
  filterTypesHelper,
  geoLocationFilteredListItem,
  getParticipationProjectStatusCounts,
  graphqlFetchPolicy,
  isOpen,
  isParticipationProjectMapEligible,
  isParticipationProjectStatus,
  openLink,
  parseListItemsFromQuery,
  PARTICIPATION_PROJECT_DEFAULT_STATUSES,
  PARTICIPATION_PROJECT_STATUS_FILTER,
  PARTICIPATION_PROJECT_STATUS_POSITION_PARAM,
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
import { GenericType, ScreenName } from '../../types';
import { Button } from '../Button';
import { CategoryList } from '../CategoryList';
import { EmptyMessage } from '../EmptyMessage';
import { Filter } from '../filter';
import { HeaderLeft } from '../HeaderLeft';
import { HtmlView } from '../HtmlView';
import { IndexFilterWrapperAndList } from '../IndexFilterWrapperAndList';
import { IndexMapSwitch } from '../IndexMapSwitch';
import { ListComponent } from '../ListComponent';
import { LoadingContainer } from '../LoadingContainer';
import { LocationOverview } from '../map/LocationOverview';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { RegularText } from '../Text';
import { WrapperVertical } from '../Wrapper';

const FILTER_TYPES = {
  LIST: 'list',
  MAP: 'map'
};

const { SWITCH_BETWEEN_LIST_AND_MAP } = consts;

const isMapSelected = (query, topFilter) =>
  query === QUERY_TYPES.POINTS_OF_INTEREST &&
  topFilter.find((entry) => entry.selected).id === FILTER_TYPES.MAP;

const hasNestedPointsOfInterestCategories = (categories = []) =>
  categories.some((category) => {
    if ((category?.pointsOfInterestTreeCount || 0) > 0) {
      return true;
    }

    return hasNestedPointsOfInterestCategories(category?.params?.categories || []);
  });

const collectNestedPointsOfInterestCategoryIds = (categories = []) => {
  const ids = [];

  categories.forEach((category) => {
    if ((category?.pointsOfInterestTreeCount || 0) > 0 && category?.id) {
      ids.push(String(category.id));
    }

    ids.push(...collectNestedPointsOfInterestCategoryIds(category?.params?.categories || []));
  });

  return [...new Set(ids)];
};

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

const toFiniteNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return null;
    }

    const parsedValue = Number(trimmedValue);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
};

const getSelectedParticipationProjectStatuses = (selectedStatuses) => {
  if (Array.isArray(selectedStatuses)) return selectedStatuses;

  return selectedStatuses ? [selectedStatuses] : [...PARTICIPATION_PROJECT_DEFAULT_STATUSES];
};

const getParticipationProjectStatusFilter = (statusCounts, selectedStatuses) => {
  if (
    !statusCounts.length ||
    (statusCounts.length === 1 &&
      PARTICIPATION_PROJECT_DEFAULT_STATUSES.includes(statusCounts[0].status))
  ) {
    return;
  }

  return {
    data: statusCounts.map(({ count, label, status }, index) => {
      const statusLabel = texts.participationProject.statuses?.[status] || label;

      return {
        filterValue: status,
        id: index + 1,
        index,
        selected: selectedStatuses.includes(status),
        value: `${statusLabel} (${count})`
      };
    }),
    isMultiselect: true,
    label: texts.participationProject.status,
    name: PARTICIPATION_PROJECT_STATUS_FILTER,
    placeholder: texts.participationProject.statusFilter,
    type: consts.FILTER_TYPES.DROPDOWN
  };
};

const ParticipationProjectIndexMapButton = ({ navigationType, onPress }) => (
  <View style={[styles.floatingButtonContainer, stylesWithProps({ navigationType }).position]}>
    <Button
      icon={<Icon.Map color={colors.surface} />}
      iconPosition="left"
      onPress={onPress}
      title={texts.locationOverview.map}
      notFullWidth
    />
  </View>
);

ParticipationProjectIndexMapButton.propTypes = {
  navigationType: PropTypes.string,
  onPress: PropTypes.func.isRequired
};

/* eslint-disable complexity */
export const Overviews = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { resourceFilters } = useContext(ConfigurationsContext);
  const { resourceFiltersState = {}, resourceFiltersDispatch } = useContext(PermanentFilterContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {}, navigation: navigationType, sections = {}, settings = {} } = globalSettings;
  const { news: showNewsFilter = false } = filter;
  const {
    switchBetweenListAndMap = SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER,
    locationService = {},
    news = {}
  } = settings;
  const {
    categoryListIntroText = texts.categoryList.intro,
    categoryListFooter,
    categoryTitles,
    poiListIntro
  } = sections;
  const query = route.params?.query ?? '';
  const dateTimeFormat = news?.listDateFormat;
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
  const isParticipationProjectOverview =
    query === QUERY_TYPES.GENERIC_ITEMS &&
    initialQueryVariables.genericType === GenericType.ParticipationProject;
  const initialParticipationStatus = initialQueryVariables[PARTICIPATION_PROJECT_STATUS_FILTER];
  const initialParticipationStatuses = useMemo(
    () =>
      initialParticipationStatus
        ? Array.isArray(initialParticipationStatus)
          ? initialParticipationStatus
          : [initialParticipationStatus]
        : PARTICIPATION_PROJECT_DEFAULT_STATUSES,
    [initialParticipationStatus]
  );
  const participationInitialQueryVariables = isParticipationProjectOverview
    ? {
        ...initialQueryVariables,
        [PARTICIPATION_PROJECT_STATUS_FILTER]: initialParticipationStatuses
      }
    : initialQueryVariables;
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
  const [queryVariables, setQueryVariables] = useState(() => ({
    ...participationInitialQueryVariables,
    ...resourceFiltersState[filterQuery],
    ...(isParticipationProjectOverview && {
      [PARTICIPATION_PROJECT_STATUS_FILTER]:
        participationInitialQueryVariables[PARTICIPATION_PROJECT_STATUS_FILTER]
    })
  }));
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
  const radiusSearchByDistance = !!queryVariables?.radiusSearch?.distance;
  const skipPosition =
    systemPermission?.status !== Location.PermissionStatus.GRANTED ||
    (!sortByDistance && !radiusSearchByDistance);
  const { loading: loadingPosition, position } = usePosition(skipPosition);
  const { position: lastKnownPosition } = useLastKnownPosition(skipPosition);
  const currentPosition = position || lastKnownPosition;
  const title = route.params?.title ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const categories = route.params?.categories; // HINT: defined on a nested category list screen
  const subQuery = route.params?.subQuery ?? {};
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
  const networkQueryVariables = useMemo(() => {
    if (!isParticipationProjectOverview) return queryVariables;

    const participationQueryVariables = { ...queryVariables };
    delete participationQueryVariables[PARTICIPATION_PROJECT_STATUS_FILTER];
    delete participationQueryVariables[PARTICIPATION_PROJECT_STATUS_POSITION_PARAM];
    delete participationQueryVariables.participationOrder;
    delete participationQueryVariables.subtitleNumberOfLines;
    delete participationQueryVariables.titleNumberOfLines;

    return participationQueryVariables;
  }, [isParticipationProjectOverview, queryVariables]);

  const { data, loading, fetchMore, refetch } = useQuery(getQuery(query, { showNewsFilter }), {
    fetchPolicy,
    variables: {
      ...networkQueryVariables,
      // if we want to sort by distance, we need to fetch all the entries at once. this is not a
      // big issue if we want to sort by distance, because getting the location usually takes longer
      // than fetching all entries.
      // if we filter by opening times, we need to also remove the limit as otherwise we might not
      // have any open POIs in the next batch that would result in the list not getting any new
      // items and not reliably triggering another `fetchMore`
      limit:
        isParticipationProjectOverview || sortByDistance || queryVariables.onlyCurrentlyOpen
          ? undefined
          : route.params?.queryVariables?.limit
    }
  });

  const participationProjectStatusCounts = useMemo(
    () =>
      isParticipationProjectOverview
        ? getParticipationProjectStatusCounts(data?.[QUERY_TYPES.GENERIC_ITEMS] || [])
        : [],
    [data, isParticipationProjectOverview]
  );
  const selectedParticipationProjectStatuses = useMemo(
    () =>
      getSelectedParticipationProjectStatuses(queryVariables[PARTICIPATION_PROJECT_STATUS_FILTER]),
    [queryVariables]
  );

  const listItems = useMemo(() => {
    let parsedListItems = parseListItemsFromQuery(query, data, titleDetail, {
      bookmarkable,
      dateTimeFormat,
      queryVariables,
      subQuery,
      withDate: false
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

    if (isParticipationProjectOverview) {
      parsedListItems = parsedListItems?.filter((entry) =>
        selectedParticipationProjectStatuses.some((status) =>
          isParticipationProjectStatus(entry.params?.details, status)
        )
      );
    }

    if (sortByDistance && currentPosition && parsedListItems?.length) {
      parsedListItems = sortPOIsByDistanceFromPosition(parsedListItems, currentPosition.coords);
    }

    if (radiusSearchByDistance && currentPosition && parsedListItems?.length) {
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
    if (
      queryVariables?.genericType === GenericType.ParticipationProject &&
      !!queryVariables.participationOrder
    ) {
      // Keep ordering numeric when possible and deterministic for mixed/non-numeric values.
      parsedListItems = [...parsedListItems].sort((leftEntry, rightEntry) => {
        const leftRawValue =
          leftEntry.params?.details?.payload?.[queryVariables.participationOrder];
        const rightRawValue =
          rightEntry.params?.details?.payload?.[queryVariables.participationOrder];

        const leftNumericValue = toFiniteNumber(leftRawValue);
        const rightNumericValue = toFiniteNumber(rightRawValue);
        const leftIsNumeric = leftNumericValue !== null;
        const rightIsNumeric = rightNumericValue !== null;

        if (leftIsNumeric && rightIsNumeric && leftNumericValue !== rightNumericValue) {
          return leftNumericValue - rightNumericValue;
        }

        if (leftIsNumeric !== rightIsNumeric) {
          return leftIsNumeric ? -1 : 1;
        }

        const leftText = leftRawValue == null ? '' : String(leftRawValue);
        const rightText = rightRawValue == null ? '' : String(rightRawValue);
        const textComparison = leftText.localeCompare(rightText, undefined, {
          sensitivity: 'base'
        });

        if (textComparison !== 0) {
          return textComparison;
        }

        const leftFallback = String(leftEntry.id ?? leftEntry.params?.details?.id ?? '');
        const rightFallback = String(rightEntry.id ?? rightEntry.params?.details?.id ?? '');
        return leftFallback.localeCompare(rightFallback, undefined, { sensitivity: 'base' });
      });
    }

    return parsedListItems;
  }, [
    bookmarkable,
    currentPosition,
    data,
    dateTimeFormat,
    isLocationAlertShow,
    isParticipationProjectOverview,
    locationSettings,
    navigation,
    query,
    queryVariables,
    radiusSearchByDistance,
    selectedParticipationProjectStatuses,
    setIsLocationAlertShow,
    sortByDistance,
    subQuery,
    titleDetail
  ]);

  const hasParticipationProjectMapItems =
    isParticipationProjectOverview &&
    !!data?.[QUERY_TYPES.GENERIC_ITEMS]?.some(
      (item) =>
        isParticipationProjectMapEligible(item) &&
        selectedParticipationProjectStatuses.some(
          (status) =>
            PARTICIPATION_PROJECT_DEFAULT_STATUSES.includes(status) &&
            isParticipationProjectStatus(item, status)
        )
    );

  const refresh = useCallback(() => {
    setRefreshing(true);
    if (isConnected) {
      refetch();
    }
    setRefreshing(false);
  }, [isConnected, setRefreshing, refetch]);

  const filterTypes = useMemo(() => {
    const configuredFilterTypes = filterTypesHelper({
      categories,
      category: initialQueryVariables?.category,
      data,
      excludeDataProviderIds,
      query: resourceFiltersQuery,
      queryVariables,
      resourceFilters
    });

    if (!isParticipationProjectOverview) return configuredFilterTypes;

    const participationStatusFilter = getParticipationProjectStatusFilter(
      participationProjectStatusCounts,
      selectedParticipationProjectStatuses
    );

    return participationStatusFilter
      ? [...configuredFilterTypes, participationStatusFilter]
      : configuredFilterTypes;
  }, [
    data,
    categories,
    excludeDataProviderIds,
    initialQueryVariables.category,
    queryVariables,
    isParticipationProjectOverview,
    participationProjectStatusCounts,
    resourceFilters,
    resourceFiltersQuery,
    selectedParticipationProjectStatuses
  ]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueryVariables({
      ...(route.params?.queryVariables ?? {}),
      ...resourceFiltersState?.[filterQuery],
      ...getAdditionalQueryVariables(
        query,
        undefined,
        excludeDataProviderIds,
        excludeMowasRegionalKeys
      ),
      ...(isParticipationProjectOverview && {
        [PARTICIPATION_PROJECT_STATUS_FILTER]: initialParticipationStatuses
      })
    });
  }, [
    excludeDataProviderIds,
    excludeMowasRegionalKeys,
    isParticipationProjectOverview,
    initialParticipationStatuses,
    query,
    route.params?.queryVariables
  ]);

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
        ...networkQueryVariables,
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
  }, [data, query, networkQueryVariables, fetchMore]);

  const hasNestedPoiCategories = useMemo(
    () => hasNestedPointsOfInterestCategories(categories),
    [categories]
  );

  const locationOverviewQueryVariables = useMemo(() => {
    if (
      query !== QUERY_TYPES.POINTS_OF_INTEREST ||
      !hasNestedPoiCategories ||
      (queryVariables?.categoryIds?.length || 0) > 0
    ) {
      return queryVariables;
    }

    const categoryIds = collectNestedPointsOfInterestCategoryIds(categories);

    if (!categoryIds.length) {
      return queryVariables;
    }

    return {
      ...queryVariables,
      category: undefined,
      categoryId: undefined,
      categoryIds
    };
  }, [categories, hasNestedPoiCategories, query, queryVariables]);

  if (!query) return null;

  const initialNewsItemsFetch =
    query === QUERY_TYPES.NEWS_ITEMS &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'dataProvider') &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'refetch');

  const isShowMapSwitchButton = query === QUERY_TYPES.POINTS_OF_INTEREST;
  const canShowFloatingMapSwitch =
    isShowMapSwitchButton && (!!listItems?.length || hasNestedPoiCategories);

  if ((loading && (!data || initialNewsItemsFetch)) || loadingPosition) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const hasMultipleMapCategories = (locationOverviewQueryVariables?.categoryIds?.length || 0) > 1;
  const hideModalFilter = isShowMapSwitchButton && showMap && hasMultipleMapCategories;

  return (
    <SafeAreaViewFlex>
      {!hideModalFilter && (
        <Filter
          filterTypes={filterTypes}
          initialQueryVariables={participationInitialQueryVariables}
          isOverlay
          queryVariables={queryVariables}
          setQueryVariables={setQueryVariables}
        />
      )}

      {isShowMapSwitchButton &&
        switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER && (
          <>
            <IndexFilterWrapperAndList filter={filterType} setFilter={setFilterType} />
            <Divider />
          </>
        )}
      {isShowMapSwitchButton && showMap ? (
        <LocationOverview
          currentPosition={currentPosition}
          navigation={navigation}
          position={position}
          queryVariables={locationOverviewQueryVariables}
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
            fetchMoreData={isParticipationProjectOverview ? undefined : fetchMoreData}
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
        canShowFloatingMapSwitch &&
        switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.BOTTOM_FLOATING_BUTTON &&
        filterType.find((entry) => entry.title == texts.locationOverview.list)?.selected && (
          <IndexMapSwitch filter={filterType} setFilter={setFilterType} />
        )}
      {!loading && hasParticipationProjectMapItems && (
        <ParticipationProjectIndexMapButton
          navigationType={navigationType}
          onPress={() =>
            navigation.navigate(ScreenName.ParticipationProjectMap, {
              queryVariables,
              rootRouteName: route.params?.rootRouteName,
              subtitleNumberOfLines: queryVariables?.subtitleNumberOfLines,
              title,
              titleNumberOfLines: queryVariables?.titleNumberOfLines
            })
          }
        />
      )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  floatingButtonContainer: {
    alignSelf: 'center',
    position: 'absolute'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ navigationType }) =>
  StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '5%' : 0
    }
  });
/* eslint-enable react-native/no-unused-styles */

Overviews.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
