import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { RefreshControl } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  IndexFilterWrapperAndList,
  LoadingSpinner,
  SafeAreaViewFlex
} from '../../components';
import { ServiceList } from '../../components/BUS/ServiceList';
import { colors, consts, texts } from '../../config';
import { runAsyncTasksSafely } from '../../helpers';
import { shareMessage } from '../../helpers/BUS/shareHelper';
import { useBusAreas, useBusServices, useBusTop10, useMatomoTrackScreenView } from '../../hooks';
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
  const [areaId, setAreaId] = useState(bus?.areaId?.toString());
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

  const { data: areas = [], isLoading: isLoadingAreas } = useBusAreas(areaId);

  const {
    data: services = [],
    isLoading: isLoadingServices,
    refetch: refetchServices
  } = useBusServices(areaId);
  const {
    data: top10Services = [],
    isLoading: isLoadingTop10,
    refetch: refetchTop10
  } = useBusTop10(services);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await runAsyncTasksSafely([refetchServices, refetchTop10]);
    } finally {
      setRefreshing(false);
    }
  };

  const top10 = getListItems(areaId, top10Services);
  const loading =
    isLoadingAreas ||
    isLoadingServices ||
    (selectedFilter?.id === FILTER_IDS.TOP10 && isLoadingTop10);
  const shouldShowInitialLoading = loading && !services.length && !top10.length;
  const shouldShowLoadingOverlay = loading && selectedFilter?.id !== FILTER_IDS.TOP10;

  if (shouldShowInitialLoading) {
    return <LoadingSpinner loading />;
  }

  const results = getListItems(areaId, services);

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />
        {shouldShowLoadingOverlay ? (
          <LoadingSpinner loading />
        ) : (
          <ServiceList
            navigation={navigation}
            selectedFilter={selectedFilter}
            results={results}
            areaId={areaId}
            setAreaId={setAreaId}
            areas={areas}
            top10={top10}
            loading={loading}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[colors.refreshControl]}
                tintColor={colors.refreshControl}
              />
            }
          />
        )}
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
