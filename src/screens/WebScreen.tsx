import { noop } from 'lodash';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

import appJson from '../../app.json';
import { LoadingContainer, SafeAreaViewFlex } from '../components';
import { colors, consts } from '../config';
import { openLink } from '../helpers';
import { useTrackScreenViewAsync } from '../hooks';
import { NetworkContext } from '../NetworkProvider';

const { MATOMO_TRACKING } = consts;

export const WebScreen = ({
  route
}: {
  route: {
    params: {
      injectedJavaScript: string;
      isExternal?: boolean;
      webUrl: string;
    };
  };
}) => {
  const { isConnected } = useContext(NetworkContext);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const webUrl = route.params?.webUrl ?? '';
  const injectedJavaScript = route.params?.injectedJavaScript ?? '';
  const isExternal = route.params?.isExternal ?? '';

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `webUrl`
  //       dependency
  useEffect(() => {
    isConnected && webUrl && trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.WEB} / ${webUrl}`);
  }, [webUrl]);

  useEffect(() => {
    if (isExternal) {
      openLink(webUrl);
      navigation.goBack();
    }
  }, []);

  if (!webUrl || isExternal) return null;

  return (
    <SafeAreaViewFlex>
      <WebView
        source={{ uri: webUrl }}
        startInLoadingState
        style={{ backgroundColor: colors.surface }}
        mediaPlaybackRequiresUserAction
        renderLoading={() => (
          <LoadingContainer web>
            <ActivityIndicator color={colors.refreshControl} />
          </LoadingContainer>
        )}
        injectedJavaScript={injectedJavaScript}
        onMessage={noop} // needed for making `injectedJavaScript` work in some cases
        // https://github.com/react-native-webview/react-native-webview/blob/19980d888d66554875f3ac64b3e8a35bd7ad998b/src/WebViewTypes.ts#L378-L389
        decelerationRate="normal"
        // https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#applicationnameforuseragent
        applicationNameForUserAgent={
          !webUrl.includes('bbnavi.de') ? appJson.expo.scheme : undefined
        }
      />
    </SafeAreaViewFlex>
  );
};
