import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  IndexFilterWrapperAndList,
  SafeAreaViewFlex
} from '../../components';
import { ServiceList } from '../../components/BUS/ServiceList';
import { colors, consts, texts } from '../../config';
import { runAsyncTasksSafely, spaceNewLines } from '../../helpers';
import { shareMessage } from '../../helpers/BUS/shareHelper';
import {
  useBusCategoryChildren,
  useBusInitialArea,
  useBusLifeSituationsRoot,
  useBusServices,
  useBusTop10,
  useMatomoTrackScreenView
} from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const INITIAL_FILTER = [
  // NOTE: the top 10 should not be available as initial filter anymore
  // { id: 1, title: texts.bus.initialFilter.top10, selected: true },
  { id: 2, title: texts.bus.initialFilter.lifeSituations, selected: true },
  { id: 3, title: texts.bus.initialFilter.search, selected: false },
  { id: 4, title: texts.bus.initialFilter.aToZ, selected: false }
];

const getDefaultFilter = () => INITIAL_FILTER.map((entry) => ({ ...entry }));

const FILTER_IDS = {
  TOP10: 1,
  LIFE_SITUATIONS: 2,
  SEARCH: 3,
  ATOZ: 4
};

const FILTER_SETTING_IDS = {
  top10: FILTER_IDS.TOP10,
  lifeSituations: FILTER_IDS.LIFE_SITUATIONS,
  search: FILTER_IDS.SEARCH,
  aToZ: FILTER_IDS.ATOZ
};

const hasValue = (value) => value !== null && value !== undefined && `${value}`.trim().length > 0;
const normalizeName = (value) => `${value ?? ''}`.trim().toLowerCase();

const getFilterEntry = (id) => {
  switch (id) {
    case FILTER_IDS.TOP10:
      return { id, title: texts.bus.initialFilter.top10 };
    case FILTER_IDS.LIFE_SITUATIONS:
      return { id, title: texts.bus.initialFilter.lifeSituations };
    case FILTER_IDS.SEARCH:
      return { id, title: texts.bus.initialFilter.search };
    case FILTER_IDS.ATOZ:
      return { id, title: texts.bus.initialFilter.aToZ };
    default:
      return null;
  }
};

const getEffectiveInitialFilter = (configuredFilter = []) => {
  const configuredIds = configuredFilter
    .map((entry) => FILTER_SETTING_IDS[entry])
    .filter(Boolean)
    .filter((id, index, entries) => entries.indexOf(id) === index);

  if (!configuredIds.length) {
    return getDefaultFilter();
  }

  return configuredIds
    .map(getFilterEntry)
    .filter(Boolean)
    .map((entry, index) => ({
      ...entry,
      selected: index === 0
    }));
};

const getListItems = (areaId, data) =>
  _sortBy(
    _filter(data, (busService) => !!busService?.name),
    (busService) => busService.name.toUpperCase()
  ).map((busService) => ({
    id: busService.id,
    title: busService.name,
    routeName: 'BusDetail',
    params: {
      areaId,
      title: busService.name,
      query: '',
      queryVariables: {},
      rootRouteName: 'BUS',
      shareContent: {
        message: shareMessage(busService)
      },
      data: busService
    }
  }));

const getResolvedLifeSituationServices = (category, services = []) => {
  const servicesById = new Map(
    services
      .filter((service) => service?.id !== null && service?.id !== undefined)
      .map((service) => [`${service.id}`, service])
  );
  const servicesByName = new Map(
    services
      .filter((service) => !!normalizeName(service?.name))
      .map((service) => [normalizeName(service.name), service])
  );

  return (category?.publicServiceTypes ?? [])
    .map((serviceReference) => {
      const serviceId = serviceReference?.id;
      const serviceName = serviceReference?.name;

      return (
        servicesById.get(`${serviceId ?? ''}`) || servicesByName.get(normalizeName(serviceName))
      );
    })
    .filter(Boolean);
};

const getLifeSituationsItems = (areaId, category, childCategories = [], services = []) => {
  const hasValidCategoryId = hasValue(category?.id);
  if (!hasValidCategoryId) {
    return [];
  }

  const categoryItems = _sortBy(
    childCategories.filter(
      (childCategory) => hasValue(childCategory?.id) && hasValue(childCategory?.name)
    ),
    [
      (childCategory) =>
        Number.isFinite(Number(childCategory?.position))
          ? Number(childCategory.position)
          : Number.POSITIVE_INFINITY,
      (childCategory) => childCategory.name.toUpperCase()
    ]
  ).map((childCategory) => ({
    id: childCategory.id,
    picture: childCategory?.image?.url ? { url: childCategory.image.url } : undefined,
    subtitle: spaceNewLines(childCategory.description),
    title: childCategory.name,
    routeName: 'BusCategory',
    params: {
      areaId,
      category: childCategory,
      isRootCategory: false,
      title: childCategory.name
    }
  }));
  const serviceItems = getResolvedLifeSituationServices(category, services)
    .filter((service) => hasValue(service?.id) && hasValue(service?.name))
    .map((service) => ({
      id: service.id,
      title: service.name,
      routeName: 'BusDetail',
      params: {
        areaId,
        title: service.name,
        query: '',
        queryVariables: {},
        rootRouteName: 'BUS',
        shareContent: {
          message: shareMessage(service)
        },
        data: service
      }
    }));

  return [...categoryItems, ...serviceItems];
};

const getIsListLoading = ({
  hasLifeSituationsRoot,
  isFetchingLifeSituationChildren,
  isFetchingLifeSituationsRoot,
  isFetchingServices,
  isLoadingLifeSituationChildren,
  isLoadingLifeSituationsRoot,
  isLoadingServices,
  isLoadingTop10,
  selectedFilterId
}) => {
  switch (selectedFilterId) {
    case FILTER_IDS.LIFE_SITUATIONS:
      return (
        isLoadingLifeSituationsRoot ||
        isFetchingLifeSituationsRoot ||
        (hasLifeSituationsRoot &&
          (isLoadingLifeSituationChildren || isFetchingLifeSituationChildren))
      );
    case FILTER_IDS.TOP10:
      return isLoadingServices || isFetchingServices || isLoadingTop10;
    default:
      return isLoadingServices || isFetchingServices;
  }
};

export const IndexScreen = ({ navigation }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { bus = {} } = settings;
  const initialAreaId = bus?.areaId?.toString();
  const { data: initialArea } = useBusInitialArea(initialAreaId);
  const initialAreaName = initialArea?.label || '';
  const [areaId, setAreaId] = useState(initialAreaId);
  const [areaName, setAreaName] = useState('');
  const initialFilter = getEffectiveInitialFilter(bus?.initialFilter);
  const [filter, setFilter] = useState(initialFilter.length ? initialFilter : getDefaultFilter());
  const selectedFilter = filter.find((entry) => entry.selected) || filter[0];
  const [refreshing, setRefreshing] = useState(false);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BUS);

  const {
    data: lifeSituationsRoot,
    isError: isLifeSituationsRootError,
    isFetching: isFetchingLifeSituationsRoot,
    isLoading: isLoadingLifeSituationsRoot,
    refetch: refetchLifeSituationsRoot
  } = useBusLifeSituationsRoot(areaId);
  const hasLifeSituationsRoot = hasValue(lifeSituationsRoot?.id);
  const {
    data: lifeSituationChildren = [],
    isError: isLifeSituationChildrenError,
    isFetching: isFetchingLifeSituationChildren,
    isLoading: isLoadingLifeSituationChildren,
    refetch: refetchLifeSituationChildren
  } = useBusCategoryChildren(lifeSituationsRoot?.id, areaId);
  const {
    data: services = [],
    isFetching: isFetchingServices,
    isLoading: isLoadingServices,
    refetch: refetchServices
  } = useBusServices(areaId);
  const {
    data: top10Services = [],
    isLoading: isLoadingTop10,
    refetch: refetchTop10
  } = useBusTop10(services);
  // areaName is '' on first render while initialAreaName loads asynchronously.
  // Only use initialAreaName as a fallback when we are still on the configured default area.
  const resolvedAreaName = useMemo(
    () => areaName || (`${areaId}` === `${initialAreaId}` ? initialAreaName : ''),
    [areaId, areaName, initialAreaId, initialAreaName]
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await runAsyncTasksSafely([
        refetchLifeSituationsRoot,
        hasLifeSituationsRoot ? refetchLifeSituationChildren : undefined,
        refetchServices,
        refetchTop10
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const isLifeSituationsError = isLifeSituationsRootError || isLifeSituationChildrenError;
  const lifeSituations = isLifeSituationsError
    ? []
    : getLifeSituationsItems(areaId, lifeSituationsRoot, lifeSituationChildren, services);
  const lifeSituationsEmptyStateMessage = isLifeSituationsError
    ? texts.bus.emptyStates.lifeSituationsRoot
    : texts.bus.emptyStates.lifeSituations;
  const top10 = getListItems(areaId, top10Services);
  const isListLoading = getIsListLoading({
    hasLifeSituationsRoot,
    isFetchingLifeSituationChildren,
    isFetchingLifeSituationsRoot,
    isFetchingServices,
    isLoadingLifeSituationChildren,
    isLoadingLifeSituationsRoot,
    isLoadingServices,
    isLoadingTop10,
    selectedFilterId: selectedFilter?.id
  });
  const results = getListItems(areaId, services);

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />
        <ServiceList
          navigation={navigation}
          selectedFilter={selectedFilter}
          lifeSituationsEmptyStateMessage={lifeSituationsEmptyStateMessage}
          lifeSituations={lifeSituations}
          results={results}
          areaId={areaId}
          areaName={resolvedAreaName}
          initialAreaId={initialAreaId}
          initialAreaName={initialAreaName}
          setArea={(area) => {
            setAreaId(area.id);
            setAreaName(area.label);
          }}
          top10={top10}
          isListLoading={isListLoading}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        />
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
