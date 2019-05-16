import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import HTML from 'react-native-render-html';
import html from '../config/html';

const htmlContent = `
    <h4>This is going to be the header of the article or whatever , default is h2 Bold, but is possible to customize it   </h4>
    <p >Enjoy a webview-free and blazing fast applicationEnjoy a webview-free and blazing. Fast applicatio Enjoy a webview-free and blazing fast applicationEnjoy a webview-free and blazing fast applicationEnjoy a webview-free and blazing fast application. Enjoy a webview-free and blazing fast applicationEnjoy a webview-free and blazing fast application</ContenTextStyle>
    <em style="textAlign: center;"> here some closing text, maybe INFO  </em>
`;

export default class ContenText extends Component {
  render() {
    return (
      <HTML html={htmlContent} tagsStyles={html} imagesMaxWidth={Dimensions.get('window').width} />
    );
  }
}

//STYLE COMPONENT not supported
// textAlign: 'justify',
//style={{ borderWidth: 1, textAlign: 'center' }}

// FINISCI DI POSIZIONARE , IL TESTO DA SINISTRA CON PADDING , DESTRA NON C'IMPORTA PER ORA
// aggiungi gradient
