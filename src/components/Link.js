import React, { Component } from 'react';

import { Linking, TouchableOpacity, View } from 'react-native';
import styled, { css } from 'styled-components/native';

import { link } from '../icons';
import { colors } from '../config';
import { Icon } from '../components';

const data = [{ url: 'https://google.com', linktext: 'Weiterlesen auf maz-online.de' }];

const LinkStyle = styled.Text`
  color: ${colors.secondary};
  font-family: titillium-web-bold;
`;

export class Link extends Component {
  render() {
    return (
      <TouchableOpacity onPress={() => Linking.openURL('https://google.com')}>
        <View style={{ flexDirection: 'row' }}>
          <LinkStyle>Weiterlesen auf maz-online.de</LinkStyle>
          <Icon icon={link(colors.secondary)} style={{ marginLeft: 5 }} />
        </View>
      </TouchableOpacity>
    );
  }
}
