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

import { device, normalize, texts } from '../config';
import {
  CardList,
  DiagonalGradient,
  Image,
  BoldText,
  Button,
  ServiceBox,
  TextList,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  Wrapper,
  WrapperWrap
} from '../components';
import { getQuery } from '../queries';
import { momentFormat, shareMessage } from '../helpers';

export const HomeScreen = ({ navigation }) => (
  <SafeAreaView>
    <ScrollView>
      <Image source={require('../../assets/images/home.jpg')} />
      <TitleContainer>
        <Touchable
          onPress={() =>
            navigation.navigate({
              routeName: 'Index',
              params: {
                title: 'Nachrichten',
                query: 'newsItems',
                queryVariables: {},
                rootRouteName: 'NewsItems'
              }
            })
          }
        >
          <Title>{texts.homeTitles.news}</Title>
        </Touchable>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query query={getQuery('newsItems')} variables={{ limit: 3 }} fetchPolicy="cache-and-network">
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          const newsItems =
            data &&
            data.newsItems &&
            data.newsItems.map((newsItem, index) => ({
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
                  message: shareMessage(newsItem, 'newsItem')
                }
              },
              bottomDivider: index === data.newsItems.length - 1,
              __typename: newsItem.__typename
            }));

          if (!newsItems || !newsItems.length) return null;

          return (
            <View>
              <TextList navigation={navigation} data={newsItems} />

              <Wrapper>
                <Button
                  title="Alle Nachrichten anzeigen"
                  onPress={() =>
                    navigation.navigate({
                      routeName: 'Index',
                      params: {
                        title: 'Nachrichten',
                        query: 'newsItems',
                        queryVariables: {},
                        rootRouteName: 'NewsItems'
                      }
                    })
                  }
                />
              </Wrapper>
            </View>
          );
        }}
      </Query>

      <TitleContainer>
        <Touchable
          onPress={() =>
            navigation.navigate({
              routeName: 'Index',
              params: {
                title: 'Orte und Touren',
                query: 'pointsOfInterest',
                queryVariables: {},
                rootRouteName: 'PointsOfInterest'
              }
            })
          }
        >
          <Title>{texts.homeTitles.pointsOfInterest}</Title>
        </Touchable>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query
        query={getQuery('pointsOfInterest')}
        variables={{ limit: 10 }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
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
              category: !!pointOfInterest.category && pointOfInterest.category.name,
              image: pointOfInterest.mediaContents[0].sourceUrl.url, // TODO: only if .contentType == "image"
              routeName: 'Detail',
              params: {
                title: 'Ort',
                query: 'pointOfInterest',
                queryVariables: { id: `${pointOfInterest.id}` },
                rootRouteName: 'PointsOfInterest',
                shareContent: {
                  message: shareMessage(pointOfInterest, 'pointOfInterest')
                }
              },
              __typename: pointOfInterest.__typename
            }));

          if (!pointsOfInterest || !pointsOfInterest.length) return null;

          return (
            <View>
              <CardList navigation={navigation} data={pointsOfInterest} horizontal />

              <Wrapper>
                <Button
                  title="Alle Orte und Touren anzeigen"
                  onPress={() =>
                    navigation.navigate({
                      routeName: 'Index',
                      params: {
                        title: 'Orte und Touren',
                        query: 'pointsOfInterest',
                        queryVariables: {},
                        rootRouteName: 'PointsOfInterest'
                      }
                    })
                  }
                />
              </Wrapper>
            </View>
          );
        }}
      </Query>
      <TitleContainer>
        <Touchable
          onPress={() =>
            navigation.navigate({
              routeName: 'Index',
              params: {
                title: 'Veranstaltungen',
                query: 'eventRecords',
                queryVariables: {},
                rootRouteName: 'EventRecords'
              }
            })
          }
        >
          <Title>{texts.homeTitles.events}</Title>
        </Touchable>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query
        query={getQuery('eventRecords')}
        variables={{ limit: 3 }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          const eventRecords =
            data &&
            data.eventRecords &&
            data.eventRecords.map((eventRecord, index) => ({
              id: eventRecord.id,
              subtitle: `${momentFormat(eventRecord.createdAt)} | ${eventRecord.dataProvider &&
                eventRecord.dataProvider.name}`,
              title: eventRecord.title,
              routeName: 'Detail',
              params: {
                title: 'Veranstaltung',
                query: 'eventRecord',
                queryVariables: { id: `${eventRecord.id}` },
                rootRouteName: 'EventRecords',
                shareContent: {
                  message: shareMessage(eventRecord, 'eventRecord')
                }
              },
              bottomDivider: index === data.eventRecords.length - 1,
              __typename: eventRecord.__typename
            }));

          if (!eventRecords || !eventRecords.length) return null;

          return (
            <View>
              <TextList navigation={navigation} data={eventRecords} />

              <Wrapper>
                <Button
                  title="Alle Veranstaltungen anzeigen"
                  onPress={() =>
                    navigation.navigate({
                      routeName: 'Index',
                      params: {
                        title: 'Veranstaltungen',
                        query: 'eventRecords',
                        queryVariables: {},
                        rootRouteName: 'EventRecords'
                      }
                    })
                  }
                />
              </Wrapper>
            </View>
          );
        }}
      </Query>
      <TitleContainer>
        <Title>{texts.homeTitles.service}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query
        query={getQuery('publicJsonFile')}
        variables={{ name: 'homeService' }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          let publicJsonFileContent =
            data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

          if (publicJsonFileContent) {
            return (
              <DiagonalGradient style={{ padding: normalize(14) }}>
                <WrapperWrap>
                  {publicJsonFileContent.map((item, index) => {
                    return (
                      <ServiceBox key={index + item.title}>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate({
                              routeName: item.routeName,
                              params: item.params
                            })
                          }
                        >
                          <View>
                            <Image
                              source={{ uri: item.icon }}
                              style={styles.serviceImage}
                              PlaceholderContent={null}
                            />
                            <BoldText light>{item.title}</BoldText>
                          </View>
                        </TouchableOpacity>
                      </ServiceBox>
                    );
                  })}
                </WrapperWrap>
              </DiagonalGradient>
            );
          }
        }}
      </Query>
      <TitleContainer>
        <Title>{texts.homeTitles.about}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query
        query={getQuery('publicJsonFile')}
        variables={{ name: 'homeAbout' }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
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
  </SafeAreaView>
);

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: normalize(14)
  },
  serviceImage: {
    alignSelf: 'center',
    height: normalize(40),
    marginBottom: normalize(7),
    width: normalize(40)
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
