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
import { runAsyncTasksSafely } from '../../helpers';
import { shareMessage } from '../../helpers/BUS/shareHelper';
import {
  useBusInitialArea,
  useBusServices,
  useBusTop10,
  useMatomoTrackScreenView
} from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const INITIAL_FILTER = [
  // NOTE: the top 10 should not be available as initial filter anymore
  // { id: 1, title: texts.bus.initialFilter.top10, selected: true },
  // TODO: commented out 'Lebenslagen' as the main server does not have data for that section yet
  // { id: 2, title: 'Lebenslagen', selected: false },
  { id: 3, title: texts.bus.initialFilter.search, selected: true },
  { id: 4, title: texts.bus.initialFilter.aToZ, selected: false }
];

const FILTER_IDS = {
  TOP10: 1,
  SEARCH: 3,
  ATOZ: 4
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

export const IndexScreen = ({ navigation }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { bus = {} } = settings;
  const initialAreaId = bus?.areaId?.toString();
  const { data: initialArea } = useBusInitialArea(initialAreaId);
  const initialAreaName = initialArea?.label || '';
  const [areaId, setAreaId] = useState(initialAreaId);
  const [areaName, setAreaName] = useState('');
  const [filter, setFilter] = useState(
    bus?.initialFilter?.map((entry, index) => ({
      id: FILTER_IDS[entry.toUpperCase()],
      title: texts.bus.initialFilter[entry],
      selected: index === 0
    })) || INITIAL_FILTER
  );
  const selectedFilter = filter.find((entry) => entry.selected) || filter[0];
  const [refreshing, setRefreshing] = useState(false);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BUS);

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
  const resolvedAreaName = useMemo(() => {
    if (`${areaId}` === `${initialAreaId}`) {
      return areaName || initialAreaName;
    }

    return areaName;
  }, [areaId, areaName, initialAreaId, initialAreaName]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await runAsyncTasksSafely([refetchServices, refetchTop10]);
    } finally {
      setRefreshing(false);
    }
  };

  const top10 = getListItems(areaId, top10Services);
  const isListLoading =
    isLoadingServices ||
    isFetchingServices ||
    (selectedFilter?.id === FILTER_IDS.TOP10 && isLoadingTop10);
  const results = getListItems(areaId, services);

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />
        <ServiceList
          navigation={navigation}
          selectedFilter={selectedFilter}
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
