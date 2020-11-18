import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, normalize } from '../config';
import { Icon, LoadingContainer, SafeAreaViewFlex, WrapperWithOrientation } from '../components';
import { arrowLeft } from '../icons';
import { OrientationContext } from '../OrientationProvider';
import { useMatomoTrackScreenView } from '../hooks';

export const WebScreen = ({ navigation }) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const webUrl = navigation.getParam('webUrl', '');

  useMatomoTrackScreenView(`Web / ${webUrl}`);

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
