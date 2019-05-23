import PropTypes from 'prop-types';
import React from 'react';
import { Image, Platform, StyleSheet, ScrollView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { TextContent, Link, ListSubtitle, Logo, TopVisual } from '../components';
import { colors, texts } from '../config';

export default class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const itemId = navigation.getParam('itemId', 0);

    return {
      title: `Detail #${itemId}`,
      headerLeft: (
        <View>
          <Icon
            name="angle-left"
            type="font-awesome"
            color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
            onPress={() => navigation.goBack()}
          />
        </View>
      ),
      headerRight: (
        <View>
          <Image
            source={require('../share.png')}
            color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
            onPress={() => alert(texts.button.share)}
          />
          <Image
            color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
            onPress={() => navigation.openDrawer()}
            source={require('../drower-menu.png')}
          />
        </View>
      )
    };
  };

  render() {
    const { navigation } = this.props;
    const notAvailable = navigation.getParam('notAvailable', '');
    const subtitle = navigation.getParam('subtitle', 'otherParam fallback');

    return (
      <ScrollView>
        {!!notAvailable && <Text>{notAvailable}</Text>}
        <View style={styles.container}>
          <TopVisual />
          <Logo navigation={navigation} />
          {!!subtitle && <ListSubtitle>{subtitle}</ListSubtitle>}
          <TextContent />
          <Link />
          <Image source={require('../link.png')} />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
  //   rowContainer: {
  //     flexDirection: 'row',
  //     justifyContent: 'space-around'
  //   }
});

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
