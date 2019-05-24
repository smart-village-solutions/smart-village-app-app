import PropTypes from 'prop-types';
import React from 'react';
import { Button, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { TextList } from '../components';
import { colors, texts } from '../config';

// TODO: data coming later from API
const items = [
  {
    itemId: 1,
    title: 'China kündigt Vergeltungsmaßnahmen an',
    subtitle: '22.04.88|Polizei Brandeburg'
  },
  {
    itemId: 2,
    title: 'Die Führung in Peking reagiert auf Donald Trumps jüngste Maßnahmen. Zum 1. ',
    subtitle: '22.04.88|Coconat'
  },
  {
    itemId: 3,
    title: 'In der Nacht zum Freitag setzten die Amerikaner ',
    subtitle: '22.04.88|Terranova'
  },
  {
    itemId: 4,
    title: 'Wert von 200 Milliarden Dollar in Kraft.',
    subtitle: '22.04.88|Rathaus Bad Belsig'
  },
  {
    itemId: 5,
    title:
      'Handelsprotektionismus“, so die Behörden in Peking weiter. China hoffe, dass die Vereinigten Staaten im Sinne gegenseitigen Respekts zur bilateralen wirtschaftlichen Zusammenarbeit zurückkehrten.',
    subtitle: '22.04.88|Polizei Brandeburg'
  },
  {
    itemId: 6,
    title: ' bei 25 Prozent',
    subtitle: '22.04.88|Coconat'
  }
];

const GET_CACHE_ITEMS = gql`
  {
    cacheItems @client {
      itemId
      otherParam
    }
  }
`;

export class IndexScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Index',
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
      <ScrollView>
        <TextList navigation={navigation} data={items} />
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
