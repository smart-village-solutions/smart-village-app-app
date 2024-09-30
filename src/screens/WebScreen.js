import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

import appJson from '../../app.json';
import { LoadingContainer, SafeAreaViewFlex } from '../components';
import { colors, consts, Icon, normalize } from '../config';
import { onDownloadAndSharePdf } from '../helpers';
import { useTrackScreenViewAsync } from '../hooks';
import { NetworkContext } from '../NetworkProvider';

const { MATOMO_TRACKING } = consts;

export const WebScreen = ({ navigation, route }) => {
  const { isConnected } = useContext(NetworkContext);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const webUrl = route.params?.webUrl ?? '';
  const documentData = route.params?.documentData ?? '';
  const injectedJavaScript = route.params?.injectedJavaScript ?? '';

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `webUrl`
  //       dependency
  useEffect(() => {
    isConnected && webUrl && trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.WEB} / ${webUrl}`);
  }, [webUrl]);

  useEffect(() => {
    if (documentData?.title) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => onDownloadAndSharePdf(documentData)}
          >
            <Icon.ArrowDownCircle color={colors.lightestText} />
          </TouchableOpacity>
        )
      });
    }
  }, [documentData]);

  if (!webUrl) return null;

  return (
    <SafeAreaViewFlex>
      <WebView
        source={{ uri: webUrl }}
        startInLoadingState
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

const styles = StyleSheet.create({
  headerRight: {
    paddingRight: normalize(7)
  }
});

WebScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object.isRequired
};
