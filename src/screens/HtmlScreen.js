import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { Query } from 'react-apollo';
import { useMatomo } from 'matomo-tracker-react-native';

import { NetworkContext } from '../NetworkProvider';
import { auth } from '../auth';
import { colors, consts } from '../config';
import { Button, HtmlView, SafeAreaViewFlex, Wrapper, WrapperWithOrientation } from '../components';
import { graphqlFetchPolicy, trimNewLines } from '../helpers';
import { getQuery } from '../queries';
import { useRefreshTime } from '../hooks';
import { LoadingSpinner } from '../components/LoadingSpinner';

const { MATOMO_TRACKING } = consts;

export const HtmlScreen = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const title = route.params?.title ?? '';
  const [refreshing, setRefreshing] = useState(false);
  const { trackScreenView } = useMatomo();

  if (!query || !queryVariables?.name) return null;

  const refreshTime = useRefreshTime(`${query}-${queryVariables.name}`);

  useEffect(() => {
    isConnected && auth();
  }, []);

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `title` dependency
  useEffect(() => {
    isConnected && title && trackScreenView(`${MATOMO_TRACKING.SCREEN_VIEW.HTML} / ${title}`);
  }, [title]);

  if (!refreshTime) {
    return <LoadingSpinner loading />;
  }

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };
  const subQuery = route.params?.subQuery ?? '';
  const rootRouteName = route.params?.rootRouteName ?? '';
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
        name: 'Web',
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
        name: param.routeName,
        params: {
          title,
          webUrl: param.webUrl,
          rootRouteName
        }
      });
    }

    // if there is no `param`, use the main `subQuery` values for `routeName` and a `webUrl`
    return navigation.navigate({
      name: subQuery.routeName,
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
          return <LoadingSpinner loading />;
        }

        if (!data?.publicHtmlFile?.content) return null;

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

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
