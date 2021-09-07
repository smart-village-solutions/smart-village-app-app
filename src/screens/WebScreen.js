import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, consts } from '../config';
import { LoadingContainer, SafeAreaViewFlex, WrapperWithOrientation } from '../components';
import { NetworkContext } from '../NetworkProvider';
import { useTrackScreenViewAsync } from '../hooks';

const { MATOMO_TRACKING } = consts;

export const WebScreen = ({ route }) => {
  const { isConnected } = useContext(NetworkContext);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const webUrl = route.params?.webUrl ?? '';

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `webUrl`
  //       dependency
  useEffect(() => {
    isConnected && webUrl && trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.WEB} / ${webUrl}`);
  }, [webUrl]);

  if (!webUrl) return null;

  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
        <WebView
          source={{ uri: webUrl }}
          startInLoadingState
          mediaPlaybackRequiresUserAction
          renderLoading={() => (
            <LoadingContainer web>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          )}
        />
      </WrapperWithOrientation>
    </SafeAreaViewFlex>
  );
};

WebScreen.propTypes = {
  route: PropTypes.object.isRequired
};
