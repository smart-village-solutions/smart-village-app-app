import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { CardList, TextList, Title, TitleContainer, TitleShadow, TopVisual } from '../components';
import { colors } from '../config';

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
  }
];

const cards = [
  {
    name: 'Burg Eisenhardt Bad Belzig',
    kategorie: 'Museum',
    url: 'https://api.tmb.pixelpoint.biz/api/asset/91380/thumbnail/593/365.jpg'
  },
  {
    name: 'Heimatstube Wiesenburg',
    kategorie: 'Museum',
    url: 'https://api.tmb.pixelpoint.biz/api/asset/80032/thumbnail/593/365.jpg'
  },

  {
    name: 'Roger Loewig Haus czvgubhzuzgizbi  hjvuhbuz',
    kategorie: 'Wellness',
    url: 'https://api.tmb.pixelpoint.biz/api/asset/88671/thumbnail/593/365.jpg'
  }
];

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
      <ScrollView>
        <TopVisual />
        <TitleShadow />
        <TitleContainer>
          <Title>nachrichten</Title>
        </TitleContainer>
        <TitleShadow />
        <TextList navigation={navigation} data={items} />
        <TitleShadow />
        <TitleContainer>
          <Title>orte & routen</Title>
        </TitleContainer>
        <TitleShadow />
        <CardList data={cards} />
        <TitleShadow />
        <TitleContainer>
          <Title>veranstaltungen</Title>
        </TitleContainer>
        <TitleShadow />
        <TextList navigation={navigation} data={items} alternativeLayout={true} />
        <TitleShadow />
        <TitleContainer>
          <Title>service</Title>
        </TitleContainer>
        <TitleShadow />
        <TextList navigation={navigation} data={items} noSubtitle={true} />
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
      </ScrollView>
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
