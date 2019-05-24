import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Icon, TextContent, Link, ListSubtitle, Logo, TopVisual } from '../components';
import { colors, texts } from '../config';
import { arrowLeft, drawerMenu, link, share } from '../icons';

export default class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon icon={arrowLeft(colors.lightestText)} />
          </TouchableOpacity>
        </View>
      ),
      headerRight: (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => alert(texts.button.share)}>
            <Icon icon={share(colors.lightestText)} style={{ padding: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon icon={drawerMenu(colors.lightestText)} style={{ padding: 10 }} />
          </TouchableOpacity>
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
