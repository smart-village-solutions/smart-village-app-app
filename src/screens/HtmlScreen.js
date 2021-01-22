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
import { useMatomo } from 'matomo-tracker-react-native';

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
  WrapperWithOrientation
} from '../components';
import { graphqlFetchPolicy, trimNewLines } from '../helpers';
import { getQuery } from '../queries';
import { arrowLeft } from '../icons';
import { useRefreshTime } from '../hooks';

const { MATOMO_TRACKING } = consts;

export const HtmlScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = navigation.getParam('query', '');
  const queryVariables = navigation.getParam('queryVariables', '');
  const title = navigation.getParam('title', '');
  const [refreshing, setRefreshing] = useState(false);
  const { trackScreenView } = useMatomo();

  if (!query || !queryVariables || !queryVariables.name) return null;

  const refreshTime = useRefreshTime(`${query}-${queryVariables.name}`);

  useEffect(() => {
    isConnected && auth();
  }, []);

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `title` dependency
  useEffect(() => {
    isConnected && title && trackScreenView(`${MATOMO_TRACKING.SCREEN_VIEW.HTML} / ${title}`);
  }, [title]);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };
  const rootRouteName = navigation.getParam('rootRouteName', '');
  const subQuery = navigation.getParam('subQuery', '');
  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

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
              }
            >
              <WrapperWithOrientation>
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
                          openWebScreen({
                            routeName: button.routeName,
                            webUrl: button.webUrl
                          })
                        }
                      />
                    ))}
                </Wrapper>
              </WrapperWithOrientation>
            </ScrollView>
          </SafeAreaViewFlex>
        );
      }}
    </Query>
  );
};

HtmlScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
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
