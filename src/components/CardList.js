import PropTypes from 'prop-types';
import React from 'react';
import { Card } from 'react-native-elements';
import { FlatList, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { device, normalize } from '../config';
import { Image } from './Image';
import { ListSubtitle, ListTitle } from './TextList';

export class CardList extends React.Component {
  keyExtractor = (item, index) => item + index;

  renderItem = ({ item }) => {
    const { navigation } = this.props;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate({
            routeName: item.routeName,
            params: item.params
          })
        }
      >
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
          {!!item.image && (
            <Image source={{ uri: item.image }} style={stylesWithProps(this.props).image} />
          )}
          <ListSubtitle>{item.category}</ListSubtitle>
          <ListTitle style={styles.listTitle}>{item.name}</ListTitle>
        </Card>
      </TouchableOpacity>
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
  listTitle: {
    marginBottom: 10
  }
});

const imageHeight = (horizontal) => {
  const imageWidth = horizontal ? device.width * 0.7 : device.width;
  // image aspect ratio is 360x180, so for accurate ratio in our view we need to calculate
  // a factor with our current device with for the image, to set a correct height
  const factor = imageWidth / 360;
  const imageHeight = 180 * factor;

  return imageHeight;
};

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ horizontal }) =>
  StyleSheet.create({
    container: {
      borderWidth: 0,
      margin: 0,
      padding: normalize(14)
    },
    image: {
      borderRadius: 5,
      marginBottom: 10,
      height: imageHeight(horizontal),
      width: horizontal ? device.width * 0.7 : device.width
    }
  });
/* eslint-enable react-native/no-unused-styles */

CardList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  horizontal: PropTypes.bool
};

CardList.defaultProps = {
  horizontal: false
};
