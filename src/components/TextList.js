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

  render() {
    const { listEndReached } = this.state;
    const { data, navigation, noSubtitle } = this.props;

    return (
      <FlatList
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
        onEndReached={() => this.setState({ listEndReached: true })}
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
