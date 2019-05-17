import PropTypes from 'prop-types';
import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { colors, texts } from '../config';

const GET_CACHE_ITEMS = gql`
  {
    cacheItems @client {
      itemId
      otherParam
    }
  }
`;

export default class IndexScreen extends React.Component {
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

    return (
      <Query query={GET_CACHE_ITEMS} fetchPolicy="cache-only">
        {({ data, client }) => {
          const { cacheItems } = data;

          return (
            <View style={styles.container}>
              <Text>Index Screen</Text>
              {!!cacheItems &&
                cacheItems.map((item) => (
                  <Button
                    key={`key${item.itemId}`}
                    title={`Got to Detail #${item.itemId}`}
                    // on press navigate to Detail route (DetailScreen) with the following params,
                    // that we use in that screen
                    onPress={() => navigation.navigate('Detail', item)}
                    color={colors.primary}
                  />
                ))}
              <Button
                title="Add element"
                onPress={() => {
                  const lastItem = cacheItems ? cacheItems.slice(-1)[0] : null;

                  client.writeData({
                    data: {
                      cacheItems: [
                        ...(cacheItems || []),
                        {
                          __typename: 'CacheItem',
                          itemId: (lastItem ? lastItem.itemId : 0) + 1,
                          otherParam: `${(lastItem ? lastItem.itemId : 0) + 1}thing you want here`
                        }
                      ]
                    }
                  });
                }}
                color={colors.secondary}
              />
              <Button
                title="Reset cache"
                onPress={() => {
                  client.resetStore();
                }}
                color={colors.secondary}
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

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
