import React, { Component } from 'react';

import { Image, View, Text } from 'react-native';

import { ListSubtitle } from '../styles/ListElements';

export default class LogoSubtitle extends Component {
  render() {
    const { navigation } = this.props;
    const subtitle = navigation.getParam('subtitle', 'otherParam fallback');
    return (
      <View>
        <Image style={{ height: 100 }} source={require('./maerkische-allgemeine.jpg')} />
        {!!subtitle && <ListSubtitle>{subtitle}</ListSubtitle>}
      </View>
    );
  }
}

// tryed with { Tile } from 'react-native-elements' but it seams still not good for size of pic
