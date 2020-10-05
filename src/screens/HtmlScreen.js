import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, consts, normalize } from '../config';
import {
  Button,
  HtmlView,
  Icon,
  LoadingContainer,
  SafeAreaViewFlex,
  Wrapper,
  WrapperLandscape
} from '../components';
import { graphqlFetchPolicy, refreshTimeFor, trimNewLines } from '../helpers';
import { getQuery } from '../queries';
import { arrowLeft } from '../icons';
import { OrientationContext } from '../OrientationProvider';

export const HtmlScreen = ({ navigation }) => {
  const [refreshTime, setRefreshTime] = useState();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = navigation.getParam('query', '');
  const queryVariables = navigation.getParam('queryVariables', '');
  const [refreshing, setRefreshing] = useState(false);

  if (!query || !queryVariables || !queryVariables.name) return null;

  useEffect(() => {
    const getRefreshTime = async () => {
      const time = await refreshTimeFor(
        `${query}-${queryVariables.name}`,
        consts.REFRESH_INTERVALS.STATIC_CONTENT
      );

      setRefreshTime(time);
    };

    getRefreshTime();
  }, []);

  useEffect(() => {
    isConnected && auth();
  }, []);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && await refetch();
    setRefreshing(false);
  };

  const title = navigation.getParam('title', '');
  const rootRouteName = navigation.getParam('rootRouteName', '');
  const subQuery = navigation.getParam('subQuery', '');
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });
  const { orientation } = useContext(OrientationContext);

  // action to open source urls
  const openWebScreen = (param) => {
    // if the `param` is a string, it is directly the web url to call
    if (!!param && typeof param === 'string') {
      return navigation.navigate({
        routeName: 'Web',
        params: {
          title,
          webUrl: param,
          rootRouteName
        }
      });
    }

    // if the `param` is an object, it contains a `routeName` and a `webUrl`
    if (!!param && typeof param === 'object') {
      return navigation.navigate({
        routeName: param.routeName,
        params: {
          title,
          webUrl: param.webUrl,
          rootRouteName
        }
      });
    }

    // if there is no `param`, use the main `subQuery` values for `routeName` and a `webUrl`
    return navigation.navigate({
      routeName: subQuery.routeName,
      params: {
        title,
        webUrl: subQuery.webUrl,
        rootRouteName
      }
    });
  };

  /* eslint-disable complexity */
  return (
    <Query
      query={getQuery(query)}
      variables={{ name: queryVariables.name }}
      fetchPolicy={fetchPolicy}
    >
      {({ data, loading, refetch }) => {
        if (loading) {
          return (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          );
        }

        if (!data || !data.publicHtmlFile || !data.publicHtmlFile.content) return null;

        return (
          <SafeAreaViewFlex>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => refresh(refetch)}
                  colors={[colors.accent]}
                  tintColor={colors.accent}
                />
              }>
              {orientation === 'landscape' ? (
                <WrapperLandscape>
                  <HtmlView
                    html={trimNewLines(data.publicHtmlFile.content)}
                    openWebScreen={openWebScreen}
                    navigation={navigation}
                  />
                  {!!subQuery && !!subQuery.routeName && !!subQuery.webUrl && (
                    <Button
                      title={subQuery.buttonTitle || `${title} öffnen`}
                      onPress={() => openWebScreen()}
                    />
                  )}
                  {!!subQuery &&
                    !!subQuery.buttons &&
                    subQuery.buttons.map((button, index) => (
                      <Button
                        key={`${index}-${button.webUrl}`}
                        title={button.buttonTitle || `${title} öffnen`}
                        onPress={() =>
                          openWebScreen({ routeName: button.routeName, webUrl: button.webUrl })
                        }
                      />
                    ))}
                </WrapperLandscape>
              ) : (
                <Wrapper>
                  <HtmlView
                    html={trimNewLines(data.publicHtmlFile.content)}
                    openWebScreen={openWebScreen}
                    navigation={navigation}
                  />
                  {!!subQuery && !!subQuery.routeName && !!subQuery.webUrl && (
                    <Button
                      title={subQuery.buttonTitle || `${title} öffnen`}
                      onPress={() => openWebScreen()}
                    />
                  )}
                  {!!subQuery &&
                    !!subQuery.buttons &&
                    subQuery.buttons.map((button, index) => (
                      <Button
                        key={`${index}-${button.webUrl}`}
                        title={button.buttonTitle || `${title} öffnen`}
                        onPress={() =>
                          openWebScreen({ routeName: button.routeName, webUrl: button.webUrl })
                        }
                      />
                    ))}
                </Wrapper>
              )}
            </ScrollView>
          </SafeAreaViewFlex>
        );
      }}
    </Query>
  );
};
/* eslint-enable complexity */
HtmlScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
