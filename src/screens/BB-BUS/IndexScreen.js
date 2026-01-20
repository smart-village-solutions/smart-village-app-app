import _filter from 'lodash/filter';
import _memoize from 'lodash/memoize';
import _sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator, RefreshControl } from 'react-native';

import { BBBusClient } from '../../BBBusClient';
import {
  DefaultKeyboardAvoidingView,
  IndexFilterWrapperAndList,
  LoadingContainer,
  SafeAreaViewFlex
} from '../../components';
import { ServiceList } from '../../components/BB-BUS/ServiceList';
import { colors, consts, texts } from '../../config';
import { graphqlFetchPolicy, refreshTimeFor } from '../../helpers';
import { shareMessage } from '../../helpers/BB-BUS/shareHelper';
import { useMatomoTrackScreenView } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { GET_AREAS_AND_TOP_10, GET_SERVICES, GET_TOP_10_IDS } from '../../queries/BB-BUS';
import { SettingsContext } from '../../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const INITIAL_FILTER = [
  // NOTE: the top 10 should not be available as initial filter anymore
  // { id: 1, title: texts.bbBus.initialFilter.top10, selected: true },
  // TODO: commented out situations for now as we are not querying data for that section yet
  // { id: 2, title: texts.bbBus.initialFilter.situations, selected: false },
  { id: 3, title: texts.bbBus.initialFilter.search, selected: false },
  { id: 4, title: texts.bbBus.initialFilter.aToZ, selected: false }
];

const FILTER_IDS = {
  TOP10: 1,
  SITUATIONS: 2,
  SEARCH: 3,
  ATOZ: 4
};

export const IndexScreen = ({ navigation }) => {
  const [refreshTime, setRefreshTime] = useState();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { busBb = {} } = settings;
  const [areaId, setAreaId] = useState(busBb?.v2?.areaId?.toString());
  const [filter, setFilter] = useState(
    busBb?.initialFilter?.map((entry, index) => ({
      id: FILTER_IDS[entry.toUpperCase()],
      title: texts.bbBus.initialFilter[entry],
      selected: index === 0
    })) || INITIAL_FILTER
  );
  const [refreshing, setRefreshing] = useState(false);
  const [client] = useState(BBBusClient(busBb?.uri));
  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BB_BUS);

  useEffect(() => {
    const getRefreshTime = async () => {
      const time = await refreshTimeFor(`BBBUS-area-${areaId}`, consts.REFRESH_INTERVALS.BB_BUS);

      setRefreshTime(time);
    };

    getRefreshTime();
  }, []);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const refresh = () => {
    setRefreshing(true);
    // for refetching data on the home screen we need to re-render the whole screen,
    // in order to re-run every existing query.
    // there is no solution to call the Apollo `refetch` for every `Query` component.
    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const selectedFilter = filter.find((entry) => entry.selected);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const getListItems = _memoize(
    (data) =>
      // sort and filter data to return only data with present `object` or `name` alphabetically
      _sortBy(
        _filter(data, (bbBusService) => !!bbBusService.name),
        (bbBusService) => bbBusService.name.toUpperCase()
      ).map((bbBusService) => ({
        title: bbBusService.name,
        routeName: 'BBBUSDetail',
        params: {
          areaId,
          title: bbBusService.name,
          query: '',
          queryVariables: {},
          rootRouteName: 'BBBUS',
          shareContent: {
            message: shareMessage(bbBusService)
          },
          data: bbBusService
        }
      })),
    (data, areaId) => [(data[0].object || data[0]).id, data.length, areaId].join('-')
  );

  const getAreas = (data) => {
    const areas = data?.area;

    if (!areas?.length) return [];

    return _sortBy(areas, (item) => item.value.toUpperCase()).map((item) => ({
      ...item,
      selected: item.areaId == areaId // preselect the community with given area id
    }));
  };

  const getTop10 = (data, top10Ids) => {
    const top10 = data?.publicServiceTypes;

    if (!top10?.length) return [];

    return _sortBy(top10, (item) => top10Ids.indexOf(item.id)).map((bbBusService) => ({
      title: bbBusService.name,
      routeName: 'BBBUSDetail',
      params: {
        title: bbBusService.name,
        query: '',
        queryVariables: {},
        rootRouteName: 'BBBUS',
        shareContent: {
          message: shareMessage(bbBusService)
        },
        data: bbBusService
      }
    }));
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <Query query={GET_TOP_10_IDS} fetchPolicy={fetchPolicy}>
          {({ data, loading }) => {
            if (loading) {
              return (
                <LoadingContainer>
                  <ActivityIndicator color={colors.refreshControl} />
                </LoadingContainer>
              );
            }

            const top10Ids = data?.publicJsonFile?.content;

            return (
              <Query
                query={GET_AREAS_AND_TOP_10}
                variables={{
                  areaId: globalSettings?.settings?.busBb?.v2?.areaId?.toString(),
                  ids: top10Ids
                }}
                fetchPolicy={fetchPolicy}
                client={client}
              >
                {({ data, loading }) => {
                  if (loading) {
                    return (
                      <>
                        <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />
                        <LoadingContainer>
                          <ActivityIndicator color={colors.refreshControl} />
                        </LoadingContainer>
                      </>
                    );
                  }

                  const areas = getAreas(data);
                  const top10 = getTop10(data, top10Ids);

                  return (
                    <>
                      <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />
                      <Query
                        query={GET_SERVICES}
                        variables={{ areaId }}
                        fetchPolicy={fetchPolicy}
                        client={client}
                      >
                        {({ data, loading }) => {
                          if (loading) {
                            return selectedFilter.id === 1 ? (
                              <ServiceList
                                navigation={navigation}
                                selectedFilter={selectedFilter}
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
                            ) : (
                              <LoadingContainer>
                                <ActivityIndicator color={colors.refreshControl} />
                              </LoadingContainer>
                            );
                          }

                          const results = data?.publicServiceTypes?.length
                            ? getListItems(data.publicServiceTypes, areaId)
                            : [];

                          return (
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
                          );
                        }}
                      </Query>
                    </>
                  );
                }}
              </Query>
            );
          }}
        </Query>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object
};
