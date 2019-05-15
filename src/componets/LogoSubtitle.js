import React, { Component } from 'react';

import { Image, View, Text } from 'react-native';

export default class LogoSubtitle extends Component {
  render() {
    return (
      <Image
        style={{
          width: '100%',
          height: 50,
          alignSelf: 'center',
          marginTop: 10,
          marginBottom: 10
        }}
        source={require('./maerkische-allgemeine.jpg')}
      />
    );
  }
}

// tryed with { Tile } from 'react-native-elements' but it seams still not good for size of pic
//  resizeMode: 'contain',
