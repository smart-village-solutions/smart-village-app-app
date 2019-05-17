import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { colors } from '../config';

const GET_ALL_NEWS_ITEMS = gql`
  query {
    allNewsItems {
      id
      createdAt
      contentBlocks {
        title
      }
    }
  }
`;

export default class HomeScreen extends React.Component {
  render() {
    const { navigation } = this.props;

    return (
      <Query query={GET_ALL_NEWS_ITEMS} fetchPolicy="cache-and-network">
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.container}>
                <ActivityIndicator />
              </View>
            );
          }

          return (
            <View style={styles.container}>
              {!!data &&
                !!data.allNewsItems &&
                data.allNewsItems.map((newsItem, index) => (
                  <View style={styles.container} key={index + newsItem.contentBlocks[0].title}>
                    <Text>{newsItem.contentBlocks[0].title}</Text>
                  </View>
                ))}
              <Button
                title="Go to news"
                onPress={() => navigation.navigate('News')}
                color={colors.primary}
              />
              <Button
                title="Go to events"
                onPress={() => navigation.navigate('Events')}
                color={colors.primary}
              />
            </View>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
