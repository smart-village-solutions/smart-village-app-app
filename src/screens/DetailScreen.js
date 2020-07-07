import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, normalize } from '../config';
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
import { graphqlFetchPolicy, openShare } from '../helpers';

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

export const DetailScreen = ({ navigation }) => {
  const { isConnected } = useContext(NetworkContext);
  const query = navigation.getParam('query', '');
  const queryVariables = navigation.getParam('queryVariables', {});
  const details = navigation.getParam('details', {});

  useEffect(() => {
    isConnected && auth();
  }, []);

  if (!query) return null;

  const fetchPolicy = graphqlFetchPolicy(isConnected);

  /* eslint-disable complexity */
  /* NOTE: we need to check a lot for presence, so this is that complex */
  return (
    <Query query={getQuery(query)} variables={queryVariables} fetchPolicy={fetchPolicy}>
      {({ data, loading }) => {
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
            <ScrollView>
              <Component data={(data && data[query]) || details} navigation={navigation} />
            </ScrollView>
          </SafeAreaViewFlex>
        );
      }}
    </Query>
  );
  /* eslint-enable complexity */
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
