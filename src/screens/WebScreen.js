import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, consts, normalize } from '../config';
import { Icon, LoadingContainer, SafeAreaViewFlex, WrapperWithOrientation } from '../components';
import { arrowLeft } from '../icons';
import { OrientationContext } from '../OrientationProvider';
import { useMatomoTrackScreenView } from '../hooks';

const { MATOMO_TRACKING } = consts;

export const WebScreen = ({ navigation }) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const webUrl = navigation.getParam('webUrl', '');

  if (!webUrl) return null;

  // NOTE: if we are able to navigate to a web screen from another web screen, we would need an own
  //       useEffect here for tracking the screen view with the `webUrl` as dependency
  useMatomoTrackScreenView(`${MATOMO_TRACKING.SCREEN_VIEW.WEB} / ${webUrl}`);

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
