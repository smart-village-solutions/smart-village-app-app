import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';
import _filter from 'lodash/filter';
import _groupBy from 'lodash/groupBy';
import _keys from 'lodash/keys';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, normalize } from '../config';
import { CardList, CategoryList, Icon, TextList } from '../components';
import { getQuery } from '../queries';
import { arrowLeft } from '../icons';
import {
  eventDate,
  graphqlFetchPolicy,
  isUpcomingEvent,
  momentFormat,
  shareMessage
} from '../helpers';

export class IndexScreen extends React.PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon={arrowLeft(colors.lightestText)} style={styles.icon} />
          </TouchableOpacity>
        </View>
      )
    };
  };

  static contextType = NetworkContext;

  componentDidMount() {
    const isConnected = this.context.isConnected;

    isConnected && auth();
  }

  /* eslint-disable complexity */
  /* NOTE: we need to check a lot for presence, so this is that complex */
  getListItems(query, data) {
    switch (query) {
    case 'eventRecords':
      return (
        data &&
          data[query] &&
          _filter(data[query], (eventRecord) => isUpcomingEvent(eventRecord.listDate)).map(
            (eventRecord) => ({
              id: eventRecord.id,
              subtitle: `${eventDate(eventRecord.listDate)} | ${!!eventRecord.addresses &&
                !!eventRecord.addresses.length &&
                (eventRecord.addresses[0].addition || eventRecord.addresses[0].city)}`,
              title: eventRecord.title,
              routeName: 'Detail',
              params: {
                title: 'Veranstaltung',
                query: 'eventRecord',
                queryVariables: { id: `${eventRecord.id}` },
                rootRouteName: 'EventRecords',
                shareContent: {
                  message: shareMessage(eventRecord, 'eventRecord')
                },
                details: eventRecord
              }
            })
          )
      );
    case 'newsItems':
      return (
        data &&
          data[query] &&
          data[query].map((newsItem) => ({
            id: newsItem.id,
            subtitle: `${momentFormat(newsItem.publishedAt)} | ${!!newsItem.dataProvider &&
              newsItem.dataProvider.name}`,
            title:
              !!newsItem.contentBlocks &&
              !!newsItem.contentBlocks.length &&
              newsItem.contentBlocks[0].title,
            routeName: 'Detail',
            params: {
              title: 'Nachricht',
              query: 'newsItem',
              queryVariables: { id: `${newsItem.id}` },
              rootRouteName: 'NewsItems',
              shareContent: {
                message: shareMessage(newsItem, 'newsItem')
              },
              details: newsItem
            }
          }))
      );
    case 'pointsOfInterest':
      return (
        data &&
          data[query] &&
          data[query].map((pointOfInterest) => ({
            id: pointOfInterest.id,
            name: pointOfInterest.name,
            category: !!pointOfInterest.category && pointOfInterest.category.name,
            image:
              !!pointOfInterest.mediaContents &&
              !!pointOfInterest.mediaContents.length &&
              !!pointOfInterest.mediaContents[0].sourceUrl &&
              pointOfInterest.mediaContents[0].sourceUrl.url, // TODO: some logic to get the first image/thumbnail
            routeName: 'Detail',
            params: {
              title: 'Ort',
              query: 'pointOfInterest',
              queryVariables: { id: `${pointOfInterest.id}` },
              rootRouteName: 'PointsOfInterest',
              shareContent: {
                message: shareMessage(pointOfInterest, 'pointOfInterest')
              },
              details: pointOfInterest
            }
          }))
      );
    case 'tours':
      return (
        data &&
          data[query] &&
          data[query].map((tour) => ({
            id: tour.id,
            name: tour.name,
            category: !!tour.category && tour.category.name,
            image:
              !!tour.mediaContents &&
              !!tour.mediaContents.length &&
              !!tour.mediaContents[0].sourceUrl &&
              tour.mediaContents[0].sourceUrl.url, // TODO: some logic to get the first image/thumbnail
            routeName: 'Detail',
            params: {
              title: 'Tour',
              query: 'tour',
              queryVariables: { id: `${tour.id}` },
              rootRouteName: 'Tours',
              shareContent: {
                message: shareMessage(tour, 'tour')
              },
              details: tour
            }
          }))
      );

    case 'pointsOfInterestAndTours': {
      const pointsOfInterestByCategories =
          data &&
          data.pointsOfInterest &&
          _groupBy(
            data.pointsOfInterest,
            (pointOfInterest) => !!pointOfInterest.category && pointOfInterest.category.name
          );
      const pointsOfInterestCategories = _keys(pointsOfInterestByCategories).sort();

      const pointsOfInterest =
          data &&
          data.pointsOfInterest &&
          pointsOfInterestCategories.map((category, index) => ({
            title: category,
            routeName: 'Index',
            params: {
              title: category,
              query: 'pointsOfInterest',
              queryVariables: { category: `${category}` },
              rootRouteName: 'PointsOfInterest'
            },
            bottomDivider: index !== pointsOfInterestCategories.length - 1
          }));

      const toursByCategories =
          data &&
          data.tours &&
          _groupBy(data.tours, (tour) => !!tour.category && tour.category.name);
      const toursCategories = _keys(toursByCategories).sort();

      const tours =
          data &&
          data.tours &&
          toursCategories.map((category, index) => ({
            title: category,
            routeName: 'Index',
            params: {
              title: category,
              query: 'tours',
              queryVariables: { category: `${category}` },
              rootRouteName: 'Tours'
            },
            bottomDivider: index !== toursCategories.length - 1
          }));

      const pointsOfInterestAndTours = [...(pointsOfInterest || []), ...(tours || [])];

      return pointsOfInterestAndTours;
    }
    }
  }
  /* eslint-enable complexity */

  getComponent(query) {
    switch (query) {
    case 'eventRecords':
      return TextList;
    case 'newsItems':
      return TextList;
    case 'pointsOfInterest':
      return CardList;
    case 'tours':
      return CardList;
    case 'pointsOfInterestAndTours':
      return CategoryList;
    }
  }

  render() {
    const { navigation } = this.props;
    const query = navigation.getParam('query', '');
    const queryVariables = navigation.getParam('queryVariables', {});

    if (!query) return null;

    const isConnected = this.context.isConnected;
    const fetchPolicy = graphqlFetchPolicy(isConnected);

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

          const listItems = this.getListItems(query, data);

          if (!listItems || !listItems.length) return null;

          const Component = this.getComponent(query);

          return (
            <SafeAreaView>
              <Component navigation={navigation} data={listItems} />
            </SafeAreaView>
          );
        }}
      </Query>
    );
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
  }
});

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
