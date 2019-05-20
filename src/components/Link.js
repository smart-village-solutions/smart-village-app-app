import React, { Component } from 'react';
import { Icon } from 'react-native-elements';
import { Linking, TouchableOpacity, View } from 'react-native';
import styled, { css } from 'styled-components/native';

import { colors, texts } from '../config';

const data = [{ url: 'https://google.com', linktext: 'Weiterlesen auf maz-online.de' }];

const LinkStyle = styled.Text`
  color: ${colors.secondary};
  font-weight: bold;
`;

export class Link extends Component {
  render() {
    return (
      <TouchableOpacity onPress={() => Linking.openURL('https://google.com')}>
        <View style={{ alignSelf: 'center' }}>
          <LinkStyle>Weiterlesen auf maz-online.de</LinkStyle>
          <Icon name="share" type="material-community" color={colors.secondary} />
        </View>
      </TouchableOpacity>
    );
  }
}
