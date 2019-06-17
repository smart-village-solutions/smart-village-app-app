import PropTypes from 'prop-types';
import React from 'react';
import { ListItem } from 'react-native-elements';
import { FlatList } from 'react-native';

import { colors, normalize } from '../config';
import { arrowRight } from '../icons';
import { Icon } from './Icon';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';

export class TextList extends React.Component {
  keyExtractor = (item, index) => item + index;

  renderItem = ({ item }) => {
    const { navigation, noSubtitle } = this.props;

    return (
      <ListItem
        title={
          noSubtitle || !item.subtitle ? null : <RegularText small>{item.subtitle}</RegularText>
        }
        subtitle={<BoldText noSubtitle={noSubtitle}>{item.title}</BoldText>}
        bottomDivider={item.bottomDivider !== undefined ? item.bottomDivider : true}
        topDivider={item.topDivider !== undefined ? item.topDivider : false}
        containerStyle={{
          backgroundColor: colors.transparent,
          paddingVertical: normalize(12)
        }}
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
  noSubtitle: PropTypes.bool
};

TextList.defaultProps = {
  noSubtitle: false
};
