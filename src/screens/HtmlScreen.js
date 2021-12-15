import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { auth } from '../auth';
import { Button, HtmlView, SafeAreaViewFlex, Wrapper, WrapperWithOrientation } from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, consts } from '../config';
import { trimNewLines } from '../helpers';
import { useStaticContent, useTrackScreenViewAsync } from '../hooks';
import { NetworkContext } from '../NetworkProvider';

const { MATOMO_TRACKING } = consts;

// eslint-disable-next-line complexity
export const HtmlScreen = ({ navigation, route }) => {
  const { isConnected } = useContext(NetworkContext);
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const title = route.params?.title ?? '';
  const [refreshing, setRefreshing] = useState(false);
  const trackScreenViewAsync = useTrackScreenViewAsync();

  if (!query || !queryVariables?.name) return null;

  const { data, loading, refetch } = useStaticContent({
    name: queryVariables.name,
    type: 'html',
    refreshTimeKey: `${query}-${queryVariables.name}`
  });

  useEffect(() => {
    isConnected && auth();
  }, []);

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `title` dependency
  useEffect(() => {
    isConnected && title && trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.HTML} / ${title}`);
  }, [title]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch?.());
    setRefreshing(false);
  }, [refetch]);
  const subQuery = route.params?.subQuery ?? '';
  const rootRouteName = route.params?.rootRouteName ?? '';

  // action to open source urls or navigate to sub screens
  const navigate = (param) => {
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

    const subParams = { ...(subQuery.params ?? {}) };

    // if there is no `param`, use the main `subQuery` values for `routeName` and a `webUrl` or `params`
    // if the params contain a webUrl as well, the webUrl property of the subQuery will be ignored
    return navigation.navigate({
      name: subQuery.routeName,
      params: {
        title,
        webUrl: subQuery.webUrl,
        rootRouteName,
        ...subParams
      }
    });
  };

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!data) return null;

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
            <HtmlView html={trimNewLines(data)} openWebScreen={navigate} navigation={navigation} />
            {!!subQuery && !!subQuery.routeName && (!!subQuery.webUrl || subQuery.params) && (
              <Button
                title={subQuery.buttonTitle || `${title} öffnen`}
                onPress={() => navigate()}
              />
            )}
            {!!subQuery &&
              !!subQuery.buttons &&
              subQuery.buttons.map((button, index) => (
                <Button
                  key={`${index}-${button.webUrl}`}
                  title={button.buttonTitle || `${title} öffnen`}
                  onPress={() =>
                    navigate({
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
};

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
