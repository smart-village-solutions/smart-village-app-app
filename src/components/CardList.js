import PropTypes from 'prop-types';
import React from 'react';
import { Card } from 'react-native-elements';
import { ActivityIndicator, Platform, StyleSheet, FlatList } from 'react-native';
import { Image } from 'react-native-elements';

import { device } from '../config';
import { ListSubtitle, ListTitle } from './TextList';

export class CardList extends React.Component {
  keyExtractor = (item, index) => item + index;

  renderItem = ({ item }) => {
    return (
      <Card
        containerStyle={[
          Platform.select({
            android: {
              elevation: 0
            },
            ios: {
              shadowColor: 'transparent'
            }
          }),
          stylesWithProps(this.props).container
        ]}
      >
        <Image
          style={styles.image}
          source={{ uri: item.image }}
          PlaceholderContent={<ActivityIndicator />}
        />
        <ListSubtitle>{item.category}</ListSubtitle>
        <ListTitle style={styles.listTitle}>{item.name}</ListTitle>
      </Card>
    );
  };

  render() {
    const { data, horizontal } = this.props;

    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal={horizontal}
        keyExtractor={this.keyExtractor}
        data={data}
        renderItem={this.renderItem}
      />
    );
  }
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 5,
    height: 200,
    marginBottom: 10
  },
  listTitle: {
    marginBottom: 10
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = (props) =>
  StyleSheet.create({
    container: {
      borderWidth: 0,
      padding: 0,
      width: props.horizontal ? device.width * 0.7 : device.width * 0.9
    }
  });
/* eslint-enable react-native/no-unused-styles */

CardList.propTypes = {
  data: PropTypes.array.isRequired,
  horizontal: PropTypes.bool
};

CardList.defaultProps = {
  horizontal: false
};
