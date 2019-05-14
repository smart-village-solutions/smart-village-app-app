import React, { Component } from 'react';
import { Icon } from 'react-native-elements';
import { Linking, TouchableOpacity, View } from 'react-native';
import { LinkStyle } from '../styles/LinkStyle';
import { colors, texts } from '../config';

const data = [{ url: 'https://google.com', linktext: 'Weiterlesen auf maz-online.de' }];

export default class Link extends Component {
  render() {
    return (
      <TouchableOpacity onPress={() => Linking.openURL('https://google.com')}>
        <View>
          <LinkStyle>Weiterlesen auf maz-online.de</LinkStyle>
          <Icon name="share" type="material-community" color={colors.secondary} />
        </View>
      </TouchableOpacity>
    );
  }
}

/** console.warn(linktext)
 *  const linktext = this.props.data;
    const url = this.props.data;
 *  I still can't master the props...
 * can't get url, linktext
 */
