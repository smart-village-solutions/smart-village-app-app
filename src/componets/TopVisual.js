import React, { Component } from 'react';
import { View, Image } from 'react-native';

export default class TopVisual extends Component {
  render() {
    return (
      <Image
        style={{ width: '100%', height: 250, alignSelf: 'center' }}
        source={require('./badBelzig.jpg')}
      />
    );
  }
}
//alignSelf it's placing the single element at the center of the screen
