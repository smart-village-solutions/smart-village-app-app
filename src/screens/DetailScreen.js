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
import { getQuery } from '../queries';
import { arrowLeft, share } from '../icons';
import { graphqlFetchPolicy, openShare, refreshTimeFor } from '../helpers';

const getComponent = (query) => {
  switch (query) {
  case 'newsItem':
    return NewsItem;
  case 'eventRecord':
    return EventRecord;
  case 'pointOfInterest':
    return PointOfInterest;
  case 'tour':
    return Tour;
  }
};

const getRefreshInterval = (query) => {
  switch (query) {
  case 'newsItem':
    return consts.NEWS;
  case 'eventRecord':
    return consts.EVENTS;
  case 'pointOfInterest':
    return consts.POINTS_OF_INTEREST;
  case 'tour':
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
          <Icon icon={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    ),
    headerRight: (
      <WrapperRow>
        {shareContent && (
          <TouchableOpacity onPress={() => openShare(shareContent)}>
            <Icon
              icon={share(colors.lightestText)}
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
