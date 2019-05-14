import React, { Component } from 'react';
import { View, Image } from 'react-native';

export default class TopVisual extends Component {
  render() {
    return (
      <View>
        <Image style={{ width: 400, height: 200 }} source={require('./badBelzig.jpg')} />
      </View>
    );
  }
}
