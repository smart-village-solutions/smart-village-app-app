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

export const WebScreen = ({ route }) => {
  const { isConnected } = useContext(NetworkContext);
  const { trackScreenView } = useMatomo();
  const webUrl = route.params?.webUrl ?? '';

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

// FIXME: Nav
// WebScreen.navigationOptions = ({ navigation }) => {
//   return {
//     headerLeft: <HeaderLeft navigation={navigation} />
//   };
// };

WebScreen.propTypes = {
  route: PropTypes.object.isRequire
};
