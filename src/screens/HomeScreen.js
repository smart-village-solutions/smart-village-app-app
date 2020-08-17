import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Query } from 'react-apollo';
import _shuffle from 'lodash/shuffle';

import { NetworkContext } from '../NetworkProvider';
import { GlobalSettingsContext } from '../GlobalSettingsProvider';
import { auth } from '../auth';
import { colors, consts, device, normalize, texts } from '../config';
import {
  BoldText,
  Button,
  CardList,
  DiagonalGradient,
  Image,
  ImagesCarousel,
  LoadingContainer,
  SafeAreaViewFlex,
  ServiceBox,
  TextList,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  VersionNumber,
  Wrapper,
  WrapperWrap
} from '../components';
import { getQuery } from '../queries';
import {
  eventDate,
  graphqlFetchPolicy,
  mainImageOfMediaContents,
  momentFormat,
  shareMessage
} from '../helpers';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const HomeScreen = ({ navigation }) => {
  const { isConnected } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy(isConnected);
  const globalSettings = useContext(GlobalSettingsContext);
  const { sections } = globalSettings;
  const {
    showNews = true,
    showPointsOfInterestAndTours = true,
    showEvents = true,
    headlineNews = texts.homeTitles.news,
    headlinePointsOfInterestAndTours = texts.homeTitles.pointsOfInterest,
    headlineEvents = texts.homeTitles.events,
    headlineService = texts.homeTitles.service,
    headlineAbout = texts.homeTitles.about
  } = sections;

  useEffect(() => {
    isConnected && auth();
  }, []);

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <Query
          query={getQuery('publicJsonFile')}
          variables={{ name: 'homeCarousel' }}
          fetchPolicy={fetchPolicy}
        >
          {({ data, loading }) => {
            if (loading) {
              return (
                <LoadingContainer>
                  <ActivityIndicator color={colors.accent} />
                </LoadingContainer>
              );
            }

            let carouselImages =
              data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

            if (!carouselImages) return null;

            return (
              <ImagesCarousel
                navigation={navigation}
                data={_shuffle(carouselImages)}
                fetchPolicy={fetchPolicy}
              />
            );
          }}
        </Query>

        {showNews && (
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
              <Title>{headlineNews}</Title>
            </Touchable>
          </TitleContainer>
        )}
        {showNews && device.platform === 'ios' && <TitleShadow />}
        {showNews && (
          <Query query={getQuery('newsItems')} variables={{ limit: 3 }} fetchPolicy={fetchPolicy}>
            {({ data, loading }) => {
              if (loading) {
                return (
                  <LoadingContainer>
                    <ActivityIndicator color={colors.accent} />
                  </LoadingContainer>
                );
              }

              const newsItems =
                data &&
                data.newsItems &&
                data.newsItems.map((newsItem, index) => ({
                  id: newsItem.id,
                  subtitle: `${momentFormat(newsItem.publishedAt)} | ${
                    !!newsItem.dataProvider && newsItem.dataProvider.name
                  }`,
                  title:
                    !!newsItem.contentBlocks &&
                    !!newsItem.contentBlocks.length &&
                    newsItem.contentBlocks[0].title,
                  routeName: 'Detail',
                  params: {
                    title: 'Nachricht',
                    query: 'newsItem',
                    queryVariables: { id: `${newsItem.id}` },
                    rootRouteName: 'NewsItems',
                    shareContent: {
                      message: shareMessage(newsItem, 'newsItem')
                    },
                    details: newsItem
                  },
                  bottomDivider: index !== data.newsItems.length - 1,
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
        )}

        {showPointsOfInterestAndTours && (
          <TitleContainer>
            <Touchable
              onPress={() =>
                navigation.navigate({
                  routeName: 'Index',
                  params: {
                    title: 'Touren und Orte',
                    query: 'categories',
                    queryVariables: {},
                    rootRouteName: 'PointsOfInterestAndTours'
                  }
                })
              }
            >
              <Title>{headlinePointsOfInterestAndTours}</Title>
            </Touchable>
          </TitleContainer>
        )}
        {showPointsOfInterestAndTours && device.platform === 'ios' && <TitleShadow />}
        {showPointsOfInterestAndTours && (
          <Query
            query={getQuery('pointsOfInterestAndTours')}
            variables={{ limit: 10, orderPoi: 'RAND', orderTour: 'RAND' }}
            fetchPolicy={fetchPolicy}
          >
            {({ data, loading }) => {
              if (loading) {
                return (
                  <LoadingContainer>
                    <ActivityIndicator color={colors.accent} />
                  </LoadingContainer>
                );
              }

              const pointsOfInterest =
                data &&
                data.pointsOfInterest &&
                data.pointsOfInterest.map((pointOfInterest) => ({
                  id: pointOfInterest.id,
                  name: pointOfInterest.name,
                  category: !!pointOfInterest.category && pointOfInterest.category.name,
                  image: mainImageOfMediaContents(pointOfInterest.mediaContents),
                  routeName: 'Detail',
                  params: {
                    title: 'Ort',
                    query: 'pointOfInterest',
                    queryVariables: { id: `${pointOfInterest.id}` },
                    rootRouteName: 'PointsOfInterest',
                    shareContent: {
                      message: shareMessage(pointOfInterest, 'pointOfInterest')
                    },
                    details: pointOfInterest
                  },
                  __typename: pointOfInterest.__typename
                }));

              const tours =
                data &&
                data.tours &&
                data.tours.map((tour) => ({
                  id: tour.id,
                  name: tour.name,
                  category: !!tour.category && tour.category.name,
                  image: mainImageOfMediaContents(tour.mediaContents),
                  routeName: 'Detail',
                  params: {
                    title: 'Tour',
                    query: 'tour',
                    queryVariables: { id: `${tour.id}` },
                    rootRouteName: 'Tours',
                    shareContent: {
                      message: shareMessage(tour, 'tour')
                    },
                    details: tour
                  },
                  __typename: tour.__typename
                }));

              return (
                <View>
                  <CardList
                    navigation={navigation}
                    data={_shuffle([...(pointsOfInterest || []), ...(tours || [])])}
                    horizontal
                  />

                  <Wrapper>
                    <Button
                      title="Alle Touren und Orte anzeigen"
                      onPress={() =>
                        navigation.navigate({
                          routeName: 'Index',
                          params: {
                            title: 'Touren und Orte',
                            query: 'categories',
                            queryVariables: {},
                            rootRouteName: 'PointsOfInterestAndTours'
                          }
                        })
                      }
                    />
                  </Wrapper>
                </View>
              );
            }}
          </Query>
        )}

        {showEvents && (
          <TitleContainer>
            <Touchable
              onPress={() =>
                navigation.navigate({
                  routeName: 'Index',
                  params: {
                    title: 'Veranstaltungen',
                    query: 'eventRecords',
                    queryVariables: { order: 'listDate_ASC' },
                    rootRouteName: 'EventRecords'
                  }
                })
              }
            >
              <Title>{headlineEvents}</Title>
            </Touchable>
          </TitleContainer>
        )}
        {showEvents && device.platform === 'ios' && <TitleShadow />}
        {showEvents && (
          <Query
            query={getQuery('eventRecords')}
            variables={{ limit: 3, order: 'listDate_ASC' }}
            fetchPolicy={fetchPolicy}
          >
            {({ data, loading }) => {
              if (loading) {
                return (
                  <LoadingContainer>
                    <ActivityIndicator color={colors.accent} />
                  </LoadingContainer>
                );
              }

              const eventRecords =
                data &&
                data.eventRecords &&
                data.eventRecords.map((eventRecord, index) => ({
                  id: eventRecord.id,
                  subtitle: `${eventDate(eventRecord.listDate)} | ${
                    !!eventRecord.addresses &&
                    !!eventRecord.addresses.length &&
                    (eventRecord.addresses[0].addition || eventRecord.addresses[0].city)
                  }`,
                  title: eventRecord.title,
                  routeName: 'Detail',
                  params: {
                    title: 'Veranstaltung',
                    query: 'eventRecord',
                    queryVariables: { id: `${eventRecord.id}` },
                    rootRouteName: 'EventRecords',
                    shareContent: {
                      message: shareMessage(eventRecord, 'eventRecord')
                    },
                    details: eventRecord
                  },
                  bottomDivider: index !== data.eventRecords.length - 1,
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
                            queryVariables: { order: 'listDate_ASC' },
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
        )}

        {globalSettings.navigation === consts.DRAWER && (
          <>
            <Query
              query={getQuery('publicJsonFile')}
              variables={{ name: 'homeService' }}
              fetchPolicy={fetchPolicy}
            >
              {({ data, loading }) => {
                if (loading) return null;

                let publicJsonFileContent =
                  data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

                if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

                return (
                  <View>
                    {!!headlineService && (
                      <TitleContainer>
                        <Title>{headlineService}</Title>
                      </TitleContainer>
                    )}
                    {!!headlineService && device.platform === 'ios' && <TitleShadow />}
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
                                  <BoldText small lightest>
                                    {item.title}
                                  </BoldText>
                                </View>
                              </TouchableOpacity>
                            </ServiceBox>
                          );
                        })}
                      </WrapperWrap>
                    </DiagonalGradient>
                  </View>
                );
              }}
            </Query>

            <Query
              query={getQuery('publicJsonFile')}
              variables={{ name: 'homeAbout' }}
              fetchPolicy={fetchPolicy}
            >
              {({ data, loading }) => {
                if (loading) return null;

                let publicJsonFileContent =
                  data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

                if (!publicJsonFileContent || !publicJsonFileContent.length) return null;

                return (
                  <View>
                    {!!headlineAbout && (
                      <TitleContainer>
                        <Title>{headlineAbout}</Title>
                      </TitleContainer>
                    )}
                    {!!headlineAbout && device.platform === 'ios' && <TitleShadow />}
                    {device.platform === 'ios' && <TitleShadow />}
                    <TextList navigation={navigation} data={publicJsonFileContent} noSubtitle />
                  </View>
                );
              }}
            </Query>
            <VersionNumber />
          </>
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  serviceImage: {
    alignSelf: 'center',
    height: normalize(40),
    marginBottom: normalize(7),
    resizeMode: 'contain',
    width: '100%'
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
