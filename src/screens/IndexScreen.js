import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';

import { colors, normalize } from '../config';
import { CardList, Icon, TextList } from '../components';
import { getQuery } from '../queries';
import { arrowLeft } from '../icons';
import { momentFormat, shareMessage } from '../helpers';

export class IndexScreen extends React.Component {
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
              subtitle: `${momentFormat(eventRecord.createdAt)} | ${eventRecord.dataProvider &&
                eventRecord.dataProvider.name}`,
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
              category: pointOfInterest.category,
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

    const isAlternativeLayout = (query) => {
      switch (query) {
      case 'eventRecords':
        return true;
      default:
        return false;
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
            <ScrollView>
              <Component
                navigation={navigation}
                data={listItems}
                alternativeLayout={isAlternativeLayout(query)}
              />
            </ScrollView>
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
