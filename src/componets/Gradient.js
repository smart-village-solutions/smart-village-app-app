import { LinearGradient } from 'expo';
import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, texts } from '../config';

export default class Gradient extends Component {
  render() {
    return (
      <LinearGradient
        colors={['#08743c', '#26798e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text>Title</Text>
      </LinearGradient>
    );
  }
}

// Later on in your styles..
var styles = StyleSheet.create({
  gradient: {
    width: '100%',
    padding: 10,
    borderColor: 'black',
    borderRadius: 5
  }
});
//   buttonText: {
//     fontSize: 18,
//     fontFamily: 'Gill Sans',
//     textAlign: 'center',
//     margin: 10,
//     color: '#ffffff',
//     backgroundColor: 'transparent'
//   }

//TODO : aggiungi padding esterno , testo corretto al centro , usalo ovunque sia necessario
