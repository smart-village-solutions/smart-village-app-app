import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, consts, device, normalize } from '../config';
import {
  BookmarkHeader,
  CommercialOffer,
  EventRecord,
  HeaderLeft,
  Icon,
  JobOffer,
  LoadingContainer,
  NewsItem,
  PointOfInterest,
  SafeAreaViewFlex,
  Tour,
  WrapperRow
} from '../components';
import { getQuery, QUERY_TYPES } from '../queries';
import { share } from '../icons';
import { graphqlFetchPolicy, openShare } from '../helpers';
import { useRefreshTime } from '../hooks';
import { GenericType } from '../types';

const getGenericComponent = (genericType) => {
  switch (genericType) {
    case GenericType.Commercial:
      return CommercialOffer;
    case GenericType.Job:
      return JobOffer;
  }
};

const getComponent = (query, genericType) => {
  const COMPONENTS = {
    [QUERY_TYPES.NEWS_ITEM]: NewsItem,
    [QUERY_TYPES.EVENT_RECORD]: EventRecord,
    [QUERY_TYPES.GENERIC_ITEM]: getGenericComponent(genericType),
    [QUERY_TYPES.POINT_OF_INTEREST]: PointOfInterest,
    [QUERY_TYPES.TOUR]: Tour
  };

  return COMPONENTS[query];
};

const getRefreshInterval = (query) => {
  const REFRESH_INTERVALS = {
    [QUERY_TYPES.NEWS_ITEM]: consts.REFRESH_INTERVALS.NEWS,
    [QUERY_TYPES.EVENT_RECORD]: consts.REFRESH_INTERVALS.EVENTS,
    [QUERY_TYPES.POINT_OF_INTEREST]: consts.REFRESH_INTERVALS.POINTS_OF_INTEREST,
    [QUERY_TYPES.TOUR]: consts.REFRESH_INTERVALS.TOURS
  };

  return REFRESH_INTERVALS[query];
};

export const DetailScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = navigation.getParam('query', '');
  const queryVariables = navigation.getParam('queryVariables', {});
  const [refreshing, setRefreshing] = useState(false);

  if (!query || !queryVariables || !queryVariables.id) return null;

  const refreshTime = useRefreshTime(`${query}-${queryVariables.id}`, getRefreshInterval(query));

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
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const details = navigation.getParam('details', {});
  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

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

        const Component = getComponent(query, data?.[query]?.genericType ?? details.genericType);

        if (!Component) return null;

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
  headerRight: {
    alignItems: 'center'
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
  const suffix = navigation.getParam('suffix', '');
  const query = navigation.getParam('query', '');
  const queryVariables = navigation.getParam('queryVariables', {});

  const { headerRight } = navigationOptions;

  const StyledBookmarkHeader =
    query && queryVariables?.id ? (
      <BookmarkHeader
        id={queryVariables.id}
        suffix={suffix}
        query={query}
        style={styles.iconLeft}
      />
    ) : null;

  return {
    headerLeft: <HeaderLeft navigation={navigation} />,
    headerRight: (
      <WrapperRow style={styles.headerRight}>
        {StyledBookmarkHeader}
        {!!shareContent && (
          <TouchableOpacity
            onPress={() => openShare(shareContent)}
            accessibilityLabel="Teilen Taste"
            accessibilityHint="Inhalte auf der Seite teilen"
          >
            {device.platform === 'ios' ? (
              <Icon
                name="ios-share"
                iconColor={colors.lightestText}
                style={headerRight ? styles.iconLeft : styles.iconRight}
              />
            ) : (
              <Icon
                xml={share(colors.lightestText)}
                style={headerRight ? styles.iconLeft : styles.iconRight}
              />
            )}
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
