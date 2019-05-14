import React from 'react';
import { Button, Platform, View } from 'react-native';

import { colors, texts } from '../config';
import { ScreenTitle } from '../styles/ScreenTitle';
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
