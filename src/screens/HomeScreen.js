import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Query } from 'react-apollo';

import { CardList, TextList, Title, TitleContainer, TitleShadow, TopVisual } from '../components';
import {
  GET_EVENT_RECORDS,
  GET_NEWS_ITEMS,
  GET_POINTS_OF_INTEREST,
  GET_PUBLIC_JSON_FILE
} from '../queries';

export const HomeScreen = ({ navigation }) => (
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
            subtitle: newsItem.subtitle, // TODO: beautify date
            title: newsItem.contentBlocks[0].title,
            routeName: 'Detail',
            params: {
              title: 'Nachricht',
              query: 'newsItem',
              queryVariables: { id: `${newsItem.id}` },
              rootRouteName: 'NewsItems'
            },
            __typename: newsItem.__typename
          }));

        if (!newsItems.length) return null;

        // add index element, if not already present - check for the element with id: '-1'
        newsItems.map((newsItem) => newsItem.id).indexOf('-1') < 0 &&
          newsItems.push({
            id: '-1',
            title: 'Alle Nachrichten anzeigen',
            routeName: 'Index',
            params: {
              title: 'Nachrichten',
              query: 'newsItems',
              queryVariables: {},
              rootRouteName: 'NewsItems'
            }
          });

        return <TextList navigation={navigation} data={newsItems} />;
      }}
    </Query>
    <TitleShadow />
    <TitleContainer>
      <Title>{'Orte & Routen'.toUpperCase()}</Title>
    </TitleContainer>
    <TitleShadow />
    <Query query={GET_POINTS_OF_INTEREST} variables={{ limit: 3 }} fetchPolicy="cache-and-network">
      {({ data, loading }) => {
        if (loading) {
          return (
            <View style={styles.container}>
              <ActivityIndicator />
            </View>
          );
        }

        const pointsOfInterest =
          data &&
          data.pointsOfInterest &&
          data.pointsOfInterest.map((pointOfInterest) => ({
            id: pointOfInterest.id,
            name: pointOfInterest.name,
            category: pointOfInterest.category,
            image: pointOfInterest.mediaContents[0].sourceUrl.url, // TODO: only if .contentType == "image"
            routeName: 'Detail',
            params: {
              title: 'Ort',
              query: 'pointOfInterest',
              queryVariables: { id: `${pointOfInterest.id}` },
              rootRouteName: 'PointsOfInterest'
            },
            __typename: pointOfInterest.__typename
          }));

        if (!pointsOfInterest.length) return null;

        return (
          <View>
            <CardList navigation={navigation} data={pointsOfInterest} horizontal />
            <TextList
              navigation={navigation}
              data={[
                {
                  id: '-1',
                  title: 'Alle Orte & Routen anzeigen',
                  routeName: 'Index',
                  params: {
                    title: 'Orte & Routen',
                    rootRouteName: 'PointsOfInterest'
                  }
                }
              ]}
            />
          </View>
        );
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

        const eventRecords =
          data &&
          data.eventRecords &&
          data.eventRecords.map((eventRecord) => ({
            id: eventRecord.id,
            subtitle: eventRecord.subtitle, // TODO: beautify date
            title: eventRecord.title,
            routeName: 'Detail',
            params: {
              title: 'Veranstaltung',
              query: 'eventRecord',
              queryVariables: { id: `${eventRecord.id}` },
              rootRouteName: 'EventRecords'
            },
            __typename: eventRecord.__typename
          }));

        if (!eventRecords.length) return null;

        // add index element, if not already present - check for the element with id: '-1'
        eventRecords.map((eventRecord) => eventRecord.id).indexOf('-1') < 0 &&
          eventRecords.push({
            id: '-1',
            title: 'Alle Veranstaltungen anzeigen',
            routeName: 'Index',
            params: {
              title: 'Veranstaltungen',
              query: 'eventRecords',
              queryVariables: {},
              rootRouteName: 'EventRecords'
            }
          });

        return <TextList navigation={navigation} data={eventRecords} alternativeLayout />;
      }}
    </Query>
    <TitleShadow />
    <TitleContainer>
      <Title>{'Service'.toUpperCase()}</Title>
    </TitleContainer>
    <TitleShadow />
    <Query
      query={GET_PUBLIC_JSON_FILE}
      variables={{ name: 'homeRoutes' }}
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

        let publicJsonFileContent =
          data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

        if (publicJsonFileContent) {
          return <TextList navigation={navigation} data={publicJsonFileContent} noSubtitle />;
        }
      }}
    </Query>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
