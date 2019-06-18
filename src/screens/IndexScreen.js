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

import { auth } from '../auth';
import { colors, normalize } from '../config';
import { CardList, Icon, TextList } from '../components';
import { getQuery } from '../queries';
import { arrowLeft } from '../icons';
import { eventDate, momentFormat, shareMessage } from '../helpers';

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

  componentDidMount() {
    auth();
  }

  render() {
    const { navigation } = this.props;
    const query = navigation.getParam('query', '');
    const queryVariables = navigation.getParam('queryVariables', {});

    if (!query) return null;

    const getListItems = (query, data) => {
      switch (query) {
      case 'eventRecords':
        return (
          data &&
            data[query].map((eventRecord) => ({
              ...eventRecord,
              subtitle: `${eventRecord.dates[0] &&
                eventDate(
                  eventRecord.dates[0].dateStart,
                  eventRecord.dates[0].dateEnd
                )} | ${eventRecord.dataProvider && eventRecord.dataProvider.name}`, // TODO: refactor eventRecord.dates[0]
              routeName: 'Detail',
              params: {
                title: 'Veranstaltung',
                query: 'eventRecord',
                queryVariables: { id: `${eventRecord.id}` },
                rootRouteName: 'EventRecords',
                shareContent: {
                  message: shareMessage(eventRecord, query)
                }
              }
            }))
        );
      case 'newsItems':
        return (
          data &&
            data[query] &&
            data[query].map((newsItem) => ({
              id: newsItem.id,
              subtitle: `${momentFormat(newsItem.publishedAt)} | ${newsItem.dataProvider &&
                newsItem.dataProvider.name}`,
              title: newsItem.contentBlocks[0].title,
              routeName: 'Detail',
              params: {
                title: 'Nachricht',
                query: 'newsItem',
                queryVariables: { id: `${newsItem.id}` },
                rootRouteName: 'NewsItems',
                shareContent: {
                  message: shareMessage(newsItem, query)
                }
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
              image: pointOfInterest.mediaContents[0].sourceUrl.url, // TODO: only if .contentType == "image"
              routeName: 'Detail',
              params: {
                title: 'Ort',
                query: 'pointOfInterest',
                queryVariables: { id: `${pointOfInterest.id}` },
                rootRouteName: 'PointsOfInterest',
                shareContent: {
                  message: shareMessage(pointOfInterest, query)
                }
              }
            }))
        );
      }
    };

    const getComponent = (query) => {
      switch (query) {
      case 'eventRecords':
        return TextList;
      case 'newsItems':
        return TextList;
      case 'pointsOfInterest':
        return CardList;
      }
    };

    return (
      <Query query={getQuery(query)} variables={queryVariables} fetchPolicy="cache-and-network">
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          const listItems = getListItems(query, data);

          if (!listItems || !listItems.length) return null;

          const Component = getComponent(query);

          return (
            <SafeAreaView>
              <ScrollView>
                <Component navigation={navigation} data={listItems} />
              </ScrollView>
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
