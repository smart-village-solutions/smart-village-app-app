import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, texts, ScreenTitle } from '../config';
import ListItems from '../componets/ListItems';

export default class IndexScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <Button
          title={texts.button.home}
          onPress={() => navigation.navigate('Home')}
          color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
        />
      )
    };
  };

  render() {
    const { navigation } = this.props;

    return (
      <View>
        <ScreenTitle>{texts.screenTitles.news}</ScreenTitle>
        <ListItems navigation={navigation} />
      </View>
    );
  }
}
