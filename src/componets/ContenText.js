import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import HTML from 'react-native-render-html';
import { ContenTextStyle } from '../styles/ContenTextStyle';

const htmlContent = `
    <h4>This is going to be the header of the article or whatever , default is h2 Bold, but is possible to customize it   </h4>
    <p >Enjoy a webview-free and blazing fast applicationEnjoy a webview-free and blazing. Fast applicatio Enjoy a webview-free and blazing fast applicationEnjoy a webview-free and blazing fast applicationEnjoy a webview-free and blazing fast application. Enjoy a webview-free and blazing fast applicationEnjoy a webview-free and blazing fast application</ContenTextStyle>
    <em style="textAlign: center;"> here some closing text, maybe INFO  </em>
`;

export default class ContenText extends Component {
  render() {
    return (
      <View style={{ borderWidth: 1, textAlign: 'center' }}>
        <HTML html={htmlContent} imagesMaxWidth={Dimensions.get('window').width} />
      </View>
    );
  }
}

//STYLE COMPONENT not supported
// textAlign: 'justify',
