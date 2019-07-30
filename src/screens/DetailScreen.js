import PropTypes from 'prop-types';
import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, normalize } from '../config';
import { EventRecord, Icon, NewsItem, PointOfInterest, Tour, WrapperRow } from '../components';
import { getQuery } from '../queries';
import { arrowLeft, drawerMenu, share } from '../icons';
import { graphqlFetchPolicy, openShare } from '../helpers';

export class DetailScreen extends React.PureComponent {
  static navigationOptions = ({ navigation }) => {
    const shareContent = navigation.getParam('shareContent', '');

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
          <TouchableOpacity onPress={() => shareContent && openShare(shareContent)}>
            <Icon icon={share(colors.lightestText)} style={styles.iconLeft} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon icon={drawerMenu(colors.lightestText)} style={styles.iconRight} />
          </TouchableOpacity>
        </WrapperRow>
      )
    };
  };

  static contextType = NetworkContext;

  componentDidMount() {
    const isConnected = this.context.isConnected;

    isConnected && auth();
  }

  getComponent(query) {
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
  }

  render() {
    const { navigation } = this.props;
    const query = navigation.getParam('query', '');
    const queryVariables = navigation.getParam('queryVariables', {});
    const details = navigation.getParam('details', {});

    if (!query) return null;

    const isConnected = this.context.isConnected;
    const fetchPolicy = graphqlFetchPolicy(isConnected);

    /* eslint-disable complexity */
    /* NOTE: we need to check a lot for presence, so this is that complex */
    return (
      <Query query={getQuery(query)} variables={queryVariables} fetchPolicy={fetchPolicy}>
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          // we can have `data` from GraphQL or `details` from the previous list view.
          // if there is no cached `data` or network fetched `data` we fallback to the `details`.
          if ((!data || !data[query]) && !details) return null;

          const Component = this.getComponent(query);

          return (
            <SafeAreaView>
              <ScrollView>
                <Component data={(data && data[query]) || details} />
              </ScrollView>
            </SafeAreaView>
          );
        }}
      </Query>
    );
    /* eslint-enable complexity */
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
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

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
