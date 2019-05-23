import PropTypes from 'prop-types';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { CardList, TextList, Title, TitleContainer, TitleShadow, TopVisual } from '../components';
import { GET_EVENT_RECORDS, GET_NEWS_ITEMS, GET_POINTS_OF_INTEREST } from '../queries';

export class HomeScreen extends React.Component {
  render() {
    const { navigation } = this.props;

    return (
      <ScrollView>
        <TopVisual />
        <TitleShadow />
        <TitleContainer>
          <Title>{'Nachrichten'.toUpperCase()}</Title>
        </TitleContainer>
        <TitleShadow />
        <Query query={GET_NEWS_ITEMS} variables={{ limit: 3 }} fetchPolicy="cache-and-network">
          {({ data, loading }) => {
            if (loading) {
              return (
                <View style={styles.container}>
                  <ActivityIndicator />
                </View>
              );
            }

            const newsItems =
              data &&
              data.newsItems &&
              data.newsItems.map((newsItem) => ({
                id: newsItem.id,
                title: newsItem.contentBlocks[0].title,
                subtitle: newsItem.contentBlocks[0].subtitle // TODO: beautify date
              }));

            if (!newsItems.length) return null;

            newsItems.map((newsItem) => newsItem.id).indexOf(-1) < 0 &&
              newsItems.push({
                id: -1,
                title: 'Alle Nachrichten anzeigen'
              });

            return <TextList navigation={navigation} data={newsItems} />;
          }}
        </Query>
        <TitleShadow />
        <TitleContainer>
          <Title>{'Orte & Routen'.toUpperCase()}</Title>
        </TitleContainer>
        <TitleShadow />
        <Query
          query={GET_POINTS_OF_INTEREST}
          variables={{ limit: 3 }}
          fetchPolicy="cache-and-network"
        >
          {({ data, loading }) => {
            if (loading) {
              return (
                <View style={styles.container}>
                  <ActivityIndicator />
                </View>
              );
            }

            const pointsOfInterest = data && data.pointsOfInterest;
            data.pointsOfInterest.map((pointOfInterest) => ({
              id: pointOfInterest.id,
              name: pointOfInterest.name,
              category: pointOfInterest.category,
              image: pointOfInterest.mediaContents[0].sourceUrl.url // TODO: only if .contentType == "image"
            }));

            if (!pointsOfInterest.length) return null;

            return [
              <CardList data={pointsOfInterest} horizontal key="cardList" />,
              <TextList
                navigation={navigation}
                data={[
                  {
                    title: 'Alle Orte & Routen anzeigen'
                  }
                ]}
                key="textList"
              />
            ];
          }}
        </Query>
        <TitleShadow />
        <TitleContainer>
          <Title>{'Veranstaltungen'.toUpperCase()}</Title>
        </TitleContainer>
        <TitleShadow />
        <Query query={GET_EVENT_RECORDS} variables={{ limit: 3 }} fetchPolicy="cache-and-network">
          {({ data, loading }) => {
            if (loading) {
              return (
                <View style={styles.container}>
                  <ActivityIndicator />
                </View>
              );
            }

            const eventRecords = data && data.eventRecords;

            if (!eventRecords.length) return null;

            eventRecords.map((eventRecord) => eventRecord.id).indexOf(-1) < 0 &&
              eventRecords.push({
                id: -1,
                title: 'Alle Veranstaltungen anzeigen'
              });

            return (
              <TextList navigation={navigation} data={eventRecords} alternativeLayout={true} />
            );
          }}
        </Query>
        <TitleShadow />
        <TitleContainer>
          <Title>{'Service'.toUpperCase()}</Title>
        </TitleContainer>
        <TitleShadow />
        {/* TODO: navigations correctly */}
        <TextList navigation={navigation} data={publicFilesItems} noSubtitle={true} />
        {publicFilesItems.map((publicFile, index) => (
          <View style={styles.container} key={index + publicFile.name}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate({
                  routeName: publicFile.screen,
                  params: { name: publicFile.name }
                })
              }
            >
              <Text>{publicFile.title}</Text>
            </TouchableOpacity>
          </View>
        ))}
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

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};

// TODO: config file fetch
const publicFilesItems = [
  {
    name: 'datenschutz',
    title: 'Datenschutz',
    screen: 'Index'
  },
  {
    name: 'impressum',
    title: 'Impressum',
    screen: 'Index'
  },
  {
    name: 'mitmachen',
    title: 'Mitmachen',
    screen: 'Index'
  }
];
