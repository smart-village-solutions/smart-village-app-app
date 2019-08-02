import PropTypes from 'prop-types';
import React from 'react';
import { ListItem } from 'react-native-elements';
import { ActivityIndicator, FlatList } from 'react-native';

import { colors, normalize } from '../config';
import { arrowRight } from '../icons';
import { Icon } from './Icon';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';

export class TextList extends React.PureComponent {
  state = {
    listEndReached: false
  };

  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  renderItem = ({ item }) => {
    const { navigation, noSubtitle } = this.props;
    const { routeName, params, subtitle, title, bottomDivider, topDivider } = item;

    return (
      <ListItem
        title={noSubtitle || !subtitle ? null : <RegularText small>{subtitle}</RegularText>}
        subtitle={<BoldText noSubtitle={noSubtitle}>{title}</BoldText>}
        bottomDivider={bottomDivider !== undefined ? bottomDivider : true}
        topDivider={topDivider !== undefined ? topDivider : false}
        containerStyle={{
          backgroundColor: colors.transparent,
          paddingVertical: normalize(12)
        }}
        rightIcon={<Icon icon={arrowRight(colors.primary)} />}
        onPress={() =>
          navigation.navigate({
            routeName,
            params
          })
        }
        delayPressIn={0}
        Component={Touchable}
      />
    );
  };

  render() {
    const { listEndReached } = this.state;
    const { data } = this.props;

    return (
      <FlatList
        keyExtractor={this.keyExtractor}
        data={data}
        renderItem={this.renderItem}
        ListFooterComponent={
          data.length > 10 &&
          !listEndReached && <ActivityIndicator style={{ margin: normalize(14) }} />
        }
        onEndReached={() => this.setState({ listEndReached: true })}
        removeClippedSubviews
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
