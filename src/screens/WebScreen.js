import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useMatomo } from 'matomo-tracker-react-native';

import { colors, consts } from '../config';
import {
  HeaderLeft,
  LoadingContainer,
  SafeAreaViewFlex,
  WrapperWithOrientation
} from '../components';
import { NetworkContext } from '../NetworkProvider';

const { MATOMO_TRACKING } = consts;

export const WebScreen = ({ navigation }) => {
  const { isConnected } = useContext(NetworkContext);
  const { trackScreenView } = useMatomo();
  const webUrl = navigation.getParam('webUrl', '');

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `webUrl`
  //       dependency
  useEffect(() => {
    isConnected && webUrl && trackScreenView(`${MATOMO_TRACKING.SCREEN_VIEW.WEB} / ${webUrl}`);
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

WebScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

WebScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
