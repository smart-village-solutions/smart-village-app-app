import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useMatomo } from 'matomo-tracker-react-native';

import { colors, consts, normalize } from '../config';
import { Icon, LoadingContainer, SafeAreaViewFlex, WrapperWithOrientation } from '../components';
import { arrowLeft } from '../icons';
import { NetworkContext } from '../NetworkProvider';
import { OrientationContext } from '../OrientationProvider';

const { MATOMO_TRACKING } = consts;

export const WebScreen = ({ navigation }) => {
  const { isConnected } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
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
      <WrapperWithOrientation orientation={orientation} dimensions={dimensions}>
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
    headerLeft: (
      <View>
        <TouchableOpacity
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
          onPress={() => navigation.goBack()}
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

WebScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
