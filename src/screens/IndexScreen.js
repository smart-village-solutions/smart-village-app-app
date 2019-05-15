import React from 'react';
import { Button, Platform, View } from 'react-native';

import { colors, texts } from '../config';
import { ScreenTitle } from '../styles/ScreenTitle';
import ListItems from '../componets/ListItems';

export default class IndexScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const title = navigation.getParam('title', 0);

    return {
      headerTitle: <ScreenTitle>{title}</ScreenTitle>,
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
        <ListItems navigation={navigation} />
      </View>
    );
  }
}

//
