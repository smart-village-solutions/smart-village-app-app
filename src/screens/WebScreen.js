import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, normalize } from '../config';
import { Icon, LoadingContainer, SafeAreaViewFlex, WrapperWithOrientation } from '../components';
import { arrowLeft } from '../icons';
import { OrientationContext } from '../OrientationProvider';

export const WebScreen = ({ navigation }) => {
  const { orientation } = useContext(OrientationContext);
  const webUrl = navigation.getParam('webUrl', '');

  if (!webUrl) return null;

  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation orientation={orientation}>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
