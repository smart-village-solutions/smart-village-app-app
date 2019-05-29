import PropTypes from 'prop-types';
import React from 'react';
import { ListItem } from 'react-native-elements';
import { FlatList, TouchableNativeFeedback, TouchableOpacity } from 'react-native';
import styled, { css } from 'styled-components/native';

import { colors, device, normalize } from '../config';
import { arrowRight } from '../icons';
import { Icon } from './Icon';

export const ListTitle = styled.Text`
  font-size: ${normalize(16)};
  font-family: titillium-web-regular;
  color: ${colors.darkText};

  ${(props) =>
    (props.alternativeLayout || props.noSubtitle) &&
    css`
      font-family: titillium-web-bold;
    `};
`;

export const ListSubtitle = styled(ListTitle)`
  font-size: ${normalize(14)};
  color: ${colors.primary};
  margin-bottom: ${normalize(7)};

  ${(props) =>
    props.alternativeLayout &&
    css`
      color: ${colors.darkText};
      font-family: titillium-web-regular;
    `};
`;

export class TextList extends React.Component {
  keyExtractor = (item, index) => item + index;

  renderItem = ({ item }) => {
    const { navigation, alternativeLayout, noSubtitle } = this.props;
    const Touchable = device.platform === 'ios' ? TouchableOpacity : TouchableNativeFeedback;

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
        bottomDivider={item.bottomDivider !== undefined ? item.bottomDivider : true}
        topDivider={item.topDivider !== undefined ? item.topDivider : false}
        containerStyle={[
          {
            paddingVertical: normalize(12)
          },
          alternativeLayout
            ? {
              backgroundColor: colors.lighterText,
              borderBottomColor: colors.lightestText
            }
            : {
              backgroundColor: colors.transparent
            }
        ]}
        rightIcon={<Icon icon={arrowRight(colors.primary)} />}
        onPress={() =>
          navigation.navigate({
            routeName: item.routeName,
            params: item.params
          })
        }
        delayPressIn={0}
        Component={Touchable}
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
