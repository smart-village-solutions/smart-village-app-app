import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { colors, normalize } from '../config';
import { TextListItem } from './TextListItem';

export class TextList extends React.PureComponent {
  state = {
    listEndReached: false
  };

  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  onEndReached = async () => {
    const { query, fetchMoreData } = this.props;

    if (fetchMoreData) {
      // if there is a pagination, the end of the list is reached, when no more data is returned
      // from partially fetching, so we need to check the the data to determine the lists end
      const { data: moreData } = await fetchMoreData();

      this.setState({ listEndReached: !moreData[query].length });
    } else {
      this.setState({ listEndReached: true });
    }
  };

  render() {
    const { listEndReached } = this.state;
    const { data, navigation, noSubtitle, ListHeaderComponent, refreshControl } = this.props;

    return (
      <FlatList
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={this.keyExtractor}
        data={data}
        renderItem={({ item }) => (
          <TextListItem navigation={navigation} noSubtitle={noSubtitle} item={item} />
        )}
        ListFooterComponent={
          data.length > 10 &&
          !listEndReached && (
            <ActivityIndicator color={colors.accent} style={{ margin: normalize(14) }} />
          )
        }
        onEndReachedThreshold={0.5}
        onEndReached={this.onEndReached}
        refreshControl={refreshControl}
      />
    );
  }
}

TextList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  noSubtitle: PropTypes.bool,
  query: PropTypes.string,
  fetchMoreData: PropTypes.func,
  ListHeaderComponent: PropTypes.object,
  refreshControl: PropTypes.object
};

TextList.defaultProps = {
  noSubtitle: false
};
