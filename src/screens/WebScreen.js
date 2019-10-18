import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, normalize } from '../config';
import { Icon } from '../components';
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
      <SafeAreaView style={styles.safeContainer}>
        <WebView
          source={{ uri: webUrl }}
          startInLoadingState
          mediaPlaybackRequiresUserAction
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1
  },
  icon: {
    paddingHorizontal: normalize(14)
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});

WebScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
