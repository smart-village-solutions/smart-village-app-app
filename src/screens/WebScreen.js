import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, normalize } from '../config';
import { Icon, LoadingContainer, SafeAreaViewFlex } from '../components';
import { arrowLeft } from '../icons';

export class WebScreen extends React.PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon={arrowLeft(colors.lightestText)} style={styles.icon} />
          </TouchableOpacity>
        </View>
      )
    };
  };

  render() {
    const { navigation } = this.props;
    const webUrl = navigation.getParam('webUrl', '');

    if (!webUrl) return null;

    return (
      <SafeAreaViewFlex>
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
      </SafeAreaViewFlex>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

WebScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
