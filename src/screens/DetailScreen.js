import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, consts, normalize } from '../config';
import {
  EventRecord,
  Icon,
  LoadingContainer,
  NewsItem,
  PointOfInterest,
  SafeAreaViewFlex,
  Tour,
  WrapperRow
} from '../components';
import { getQuery, QUERY_TYPES } from '../queries';
import { arrowLeft, share } from '../icons';
import { graphqlFetchPolicy, openShare, refreshTimeFor } from '../helpers';

const getComponent = (query) => {
  switch (query) {
  case QUERY_TYPES.NEWS_ITEM:
    return NewsItem;
  case QUERY_TYPES.EVENT_RECORD:
    return EventRecord;
  case QUERY_TYPES.POINT_OF_INTEREST:
    return PointOfInterest;
  case QUERY_TYPES.TOUR:
    return Tour;
  }
};

const getRefreshInterval = (query) => {
  switch (query) {
  case QUERY_TYPES.NEWS_ITEM:
    return consts.NEWS;
  case QUERY_TYPES.EVENT_RECORD:
    return consts.EVENTS;
  case QUERY_TYPES.POINT_OF_INTEREST:
    return consts.POINTS_OF_INTEREST;
  case QUERY_TYPES.TOUR:
    return consts.TOURS;
  }
};

export const DetailScreen = ({ navigation }) => {
  const [refreshTime, setRefreshTime] = useState();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = navigation.getParam('query', '');
  const queryVariables = navigation.getParam('queryVariables', {});
  const [refreshing, setRefreshing] = useState(false);

  if (!query || !queryVariables || !queryVariables.id) return null;

  useEffect(() => {
    const getRefreshTime = async () => {
      const time = await refreshTimeFor(`${query}-${queryVariables.id}`, getRefreshInterval(query));

      setRefreshTime(time);
    };

    getRefreshTime();
  }, []);

  useEffect(() => {
    isConnected && auth();
  }, []);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const refresh = async (refetch) => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const details = navigation.getParam('details', {});
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  return (
    <Query query={getQuery(query)} variables={{ id: queryVariables.id }} fetchPolicy={fetchPolicy}>
      {({ data, loading, refetch }) => {
        if (loading) {
          return (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          );
        }

        // we can have `data` from GraphQL or `details` from the previous list view.
        // if there is no cached `data` or network fetched `data` we fallback to the `details`.
        if ((!data || !data[query]) && !details) return null;

        const Component = getComponent(query);

        return (
          <SafeAreaViewFlex>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => refresh(refetch)}
                  colors={[colors.accent]}
                  tintColor={colors.accent}
                />
              }
            >
              <Component data={(data && data[query]) || details} navigation={navigation} />
            </ScrollView>
          </SafeAreaViewFlex>
        );
      }}
    </Query>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  },
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14)
  }
});

DetailScreen.navigationOptions = ({ navigation, navigationOptions }) => {
  const shareContent = navigation.getParam('shareContent', '');
  const { headerRight } = navigationOptions;

  return {
    headerLeft: (
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    ),
    headerRight: (
      <WrapperRow>
        {shareContent && (
          <TouchableOpacity onPress={() => openShare(shareContent)}>
            <Icon
              xml={share(colors.lightestText)}
              style={headerRight ? styles.iconLeft : styles.iconRight}
            />
          </TouchableOpacity>
        )}
        {!!headerRight && headerRight}
      </WrapperRow>
    )
  };
};

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
