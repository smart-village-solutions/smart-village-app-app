import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { colors, normalize } from '../config';
import { CardListItem } from './CardListItem';

// TODO in order to implement landscape logic CardList needs to become a function component
export class CardList extends React.PureComponent {
  state = {
    listEndReached: false
  };

  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  render() {
    const { listEndReached } = this.state;
    const { data, navigation, horizontal, refreshControl } = this.props;

    if (horizontal) {
      return (
        <FlatList
          keyExtractor={this.keyExtractor}
          data={data}
          renderItem={({ item }) => (
            <CardListItem navigation={navigation} horizontal={horizontal} item={item} />
          )}
          showsHorizontalScrollIndicator={false}
          horizontal
        />
      );
    }

    return (
      <FlatList
        keyExtractor={this.keyExtractor}
        data={data}
        renderItem={({ item }) => (
          <CardListItem navigation={navigation} horizontal={horizontal} item={item} />
        )}
        ListFooterComponent={
          data.length > 10 &&
          !listEndReached && (
            <ActivityIndicator color={colors.accent} style={{ margin: normalize(14) }} />
          )
        }
        onEndReached={() => this.setState({ listEndReached: true })}
        refreshControl={refreshControl}
      />
    );
  }
}

CardList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  horizontal: PropTypes.bool,
  refreshControl: PropTypes.object
};

CardList.defaultProps = {
  horizontal: false
};
