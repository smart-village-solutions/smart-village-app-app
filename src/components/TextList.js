import PropTypes from 'prop-types';
import React from 'react';

import { Icon, ListItem } from 'react-native-elements';
import { FlatList } from 'react-native';
import styled, { css } from 'styled-components/native';

import { colors } from '../config';

export const ListTitle = styled.Text`
  color: ${colors.darkText};

  ${(props) =>
    (props.alternativeLayout || props.noSubtitle) &&
    css`
      font-weight: 600;
    `};
`;

export const ListSubtitle = styled.Text`
  color: ${colors.primary};
  margin-bottom: 10;

  ${(props) =>
    props.alternativeLayout &&
    css`
      color: ${colors.darkText};
    `};
`;

export class TextList extends React.Component {
  keyExtractor = (item, index) => item + index;

  renderItem = ({ item }) => {
    const { navigation, alternativeLayout, noSubtitle } = this.props;

    return (
      <ListItem
        title={
          noSubtitle || !item.subtitle ? null : (
            <ListSubtitle alternativeLayout={alternativeLayout}>{item.subtitle}</ListSubtitle>
          )
        }
        subtitle={
          <ListTitle alternativeLayout={alternativeLayout} noSubtitle={noSubtitle}>
            {item.title}
          </ListTitle>
        }
        bottomDivider={true}
        containerStyle={
          alternativeLayout ? { backgroundColor: '#ddf2f3', borderBottomColor: '#fff' } : null
        }
        rightIcon={<Icon name="angle-right" type="font-awesome" color={colors.primary} />}
        onPress={() => navigation.navigate('Detail', item)}
        delayPressIn={0}
      />
    );
  };
  render() {
    const { data } = this.props;

    return (
      <FlatList
        scrollEnabled={false}
        keyExtractor={this.keyExtractor}
        data={data}
        renderItem={this.renderItem}
      />
    );
  }
}

TextList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  alternativeLayout: PropTypes.bool,
  noSubtitle: PropTypes.bool
};

TextList.defaultProps = {
  alternativeLayout: false,
  noSubtitle: false
};
