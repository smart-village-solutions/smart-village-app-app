import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, Button, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Query } from 'react-apollo';

import { CardList, TextList } from '../components';
import { colors, texts } from '../config';
import { GET_EVENT_RECORDS, GET_NEWS_ITEMS, GET_POINTS_OF_INTEREST } from '../queries';

export class IndexScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <Button
          title={texts.button.home}
          onPress={() => navigation.navigate('Home')}
          color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
        />
      )
    };
  };

  render() {
    const { navigation } = this.props;
    const query = navigation.getParam('query', '');
    const queryVariables = navigation.getParam('queryVariables', {});

    if (!query) return null;

    const getQuery = (query) => {
      switch (query) {
      case 'eventRecords':
        return GET_EVENT_RECORDS;
      case 'newsItems':
        return GET_NEWS_ITEMS;
      case 'pointsOfInterest':
        return GET_POINTS_OF_INTEREST;
      }
    };

    const getListItems = (query, data) => {
      switch (query) {
      case 'eventRecords':
        return data && data[query];
      case 'newsItems':
        return (
          data &&
            data[query] &&
            data[query].map((textListItem) => ({
              id: textListItem.id,
              title: textListItem.contentBlocks[0].title,
              subtitle: textListItem.contentBlocks[0].subtitle // TODO: beautify date
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
              image: pointOfInterest.mediaContents[0].sourceUrl.url // TODO: only if .contentType == "image"
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
      <ScrollView>
        <Query query={getQuery(query)} variables={queryVariables} fetchPolicy="cache-and-network">
          {({ data, loading }) => {
            if (loading) {
              return (
                <View style={styles.container}>
                  <ActivityIndicator />
                </View>
              );
            }

            const listItems = getListItems(query, data);

            if (!listItems || !listItems.length) return null;

            const Component = getComponent(query);

            return (
              <Component
                navigation={navigation}
                data={listItems}
                alternativeLayout={isAlternativeLayout(query)}
              />
            );
          }}
        </Query>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10
  }
});

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
