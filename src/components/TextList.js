import React, { Component } from 'react';

import { Icon, ListItem } from 'react-native-elements';
import { FlatList, ScrollView, TouchableHighlight } from 'react-native';
import styled, { css } from 'styled-components/native';

import { colors, texts } from '../config';

export const ListTitle = styled.Text`
  color: ${colors.darkText};
  font-weight: bold;
`;

export const ListSubtitle = styled(ListTitle)`
  color: ${colors.primary};
  font-weight: 100;
`;

export const Divider = styled.View`
  border-bottom-color: ${colors.secondary};
  border-bottom-width: 3px;
`;

export class TextList extends React.Component {
  keyExtractor = (item, index) => item + index;

  renderItem = ({ item }) => {
    const { navigation } = this.props;

    return (
      <Divider>
        <ListItem
          title={<ListSubtitle>{item.subtitle}</ListSubtitle>}
          subtitle={<ListTitle>{item.title}</ListTitle>}
          bottomDivider={true}
          rightIcon={<Icon name="angle-right" type="font-awesome" color={colors.primary} />}
          onPress={() => navigation.navigate('Detail', item)}
        />
      </Divider>
    );
  };
  render() {
    const { data } = this.props;

    return (
      <FlatList
        scrollEnabled="false"
        keyExtractor={this.keyExtractor}
        data={data}
        renderItem={this.renderItem}
      />
    );
  }
}
