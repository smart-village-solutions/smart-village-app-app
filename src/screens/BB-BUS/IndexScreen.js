import deepRenameKeys from 'deep-rename-keys';
import _filter from 'lodash/filter';
import _memoize from 'lodash/memoize';
import _sortBy from 'lodash/sortBy';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator, RefreshControl } from 'react-native';

import {
  DefaultKeyboardAvoidingView,
  IndexFilterWrapperAndList,
  LoadingContainer,
  SafeAreaViewFlex
} from '../../components';
import { ServiceList } from '../../components/BB-BUS/ServiceList';
import { colors, consts, namespace, secrets, texts } from '../../config';
import { graphqlFetchPolicy, refreshTimeFor } from '../../helpers';
import { shareMessage } from '../../helpers/BB-BUS/shareHelper';
import { useMatomoTrackScreenView } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import {
  GET_COMMUNITIES_AND_TOP_10,
  GET_DIRECTUS,
  GET_SERVICES,
  GET_TOP_10_IDS
} from '../../queries/BB-BUS/directus';

const { MATOMO_TRACKING } = consts;

const initialFilter = [
  { id: 1, title: texts.bbBus.initialFilter.top10, selected: true },
  // TODO: commented out 'Lebenslagen' as the main server does not have data for that section yet
  // { id: 2, title: 'Lebenslagen', selected: false },
  { id: 3, title: texts.bbBus.initialFilter.search, selected: false },
  { id: 4, title: texts.bbBus.initialFilter.aToZ, selected: false }
];

export const IndexScreen = ({ navigation }) => {
  const [refreshTime, setRefreshTime] = useState();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [areaId, setAreaId] = useState(secrets[namespace]?.busBb?.areaId);
  const queryVariables = { areaId };
  const [filter, setFilter] = useState(initialFilter);
  const [refreshing, setRefreshing] = useState(false);

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
        <ActivityIndicator color={colors.accent} />
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

  const getCommunities = (data) => {
    const snake_caseData = data?.directus?.community?.data;

    if (!snake_caseData) return [];

    // workaround for having camelCase keys in `communities`
    // GraphQL is returning snake_case, see: https://github.com/d12/graphql-remote_loader/issues/36
    // transforming method thanks to: https://coderwall.com/p/iprsng/convert-snake-case-to-camelcase
    const communities = deepRenameKeys(snake_caseData, (key) =>
      key.replace(/_\w/g, (m) => m[1].toUpperCase())
    );

    return _sortBy(communities, (item) => item.value.toUpperCase()).map((item) => ({
      ...item,
      selected: item.areaId == areaId // preselect the community with given area id
    }));
  };

  const getTop10 = (data, top10Ids) => {
    const snake_caseData = data?.directus?.service?.data;

    if (!snake_caseData) return [];

    // workaround for having camelCase keys in `communities`
    // GraphQL is returning snake_case, see: https://github.com/d12/graphql-remote_loader/issues/36
    // transforming method thanks to: https://coderwall.com/p/iprsng/convert-snake-case-to-camelcase
    const top10 = deepRenameKeys(snake_caseData, (key) =>
      key.replace(/_\w/g, (m) => m[1].toUpperCase())
    );

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
                  <ActivityIndicator color={colors.accent} />
                </LoadingContainer>
              );
            }

            const top10Ids =
              data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content).ids;

            return (
              <Query
                query={GET_DIRECTUS}
                variables={GET_COMMUNITIES_AND_TOP_10({ ids: top10Ids })}
                fetchPolicy={fetchPolicy}
              >
                {({ data, loading }) => {
                  if (loading) {
                    return (
                      <>
                        <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />
                        <LoadingContainer>
                          <ActivityIndicator color={colors.accent} />
                        </LoadingContainer>
                      </>
                    );
                  }

                  const communities = getCommunities(data);
                  const top10 = getTop10(data, top10Ids);

                  return (
                    <>
                      <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />
                      <Query
                        query={GET_DIRECTUS}
                        variables={GET_SERVICES(queryVariables)}
                        fetchPolicy={fetchPolicy}
                      >
                        {({ data, loading, client }) => {
                          if (loading) {
                            return selectedFilter.id === 1 ? (
                              <ServiceList
                                navigation={navigation}
                                selectedFilter={selectedFilter}
                                areaId={areaId}
                                setAreaId={setAreaId}
                                communities={communities}
                                top10={top10}
                                client={client}
                                fetchPolicy={fetchPolicy}
                                loading={loading}
                                refreshControl={
                                  <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={refresh}
                                    colors={[colors.accent]}
                                    tintColor={colors.accent}
                                  />
                                }
                              />
                            ) : (
                              <LoadingContainer>
                                <ActivityIndicator color={colors.accent} />
                              </LoadingContainer>
                            );
                          }

                          data =
                            data &&
                            data.directus &&
                            data.directus.service &&
                            data.directus.service.data;

                          const results = data && data.length ? getListItems(data, areaId) : [];

                          return (
                            <ServiceList
                              navigation={navigation}
                              selectedFilter={selectedFilter}
                              results={results}
                              areaId={areaId}
                              setAreaId={setAreaId}
                              communities={communities}
                              top10={top10}
                              client={client}
                              fetchPolicy={fetchPolicy}
                              loading={loading}
                              refreshControl={
                                <RefreshControl
                                  refreshing={refreshing}
                                  onRefresh={refresh}
                                  colors={[colors.accent]}
                                  tintColor={colors.accent}
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
