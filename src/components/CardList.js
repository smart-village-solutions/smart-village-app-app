import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { normalize } from '../config';
import { CardListItem } from './CardListItem';

export class CardList extends React.PureComponent {
  state = {
    listEndReached: false
  };

  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  render() {
    const { listEndReached } = this.state;
    const { data, navigation, horizontal } = this.props;

    return (
      <FlatList
        keyExtractor={this.keyExtractor}
        data={data}
        renderItem={({ item }) => (
          <CardListItem navigation={navigation} horizontal={horizontal} item={item} />
        )}
        ListFooterComponent={
          data.length > 10 &&
          !listEndReached && <ActivityIndicator style={{ margin: normalize(14) }} />
        }
        onEndReached={() => this.setState({ listEndReached: true })}
        showsHorizontalScrollIndicator={!horizontal}
        horizontal={horizontal}
      />
    );
  }
}

CardList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  horizontal: PropTypes.bool
};

CardList.defaultProps = {
  horizontal: false
};
