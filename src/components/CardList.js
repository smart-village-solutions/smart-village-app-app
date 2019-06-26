import PropTypes from 'prop-types';
import React from 'react';
import { Card } from 'react-native-elements';
import { ActivityIndicator, FlatList, Platform, StyleSheet, View } from 'react-native';

import { colors, device, normalize } from '../config';
import { Image } from './Image';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';

export class CardList extends React.Component {
  state = {
    listEndReached: false
  };

  keyExtractor = (item, index) => `index${index}-id${item.id}`;

  renderItem = ({ item }) => {
    const { navigation } = this.props;
    const { routeName, params, image, category, name } = item;

    return (
      <Touchable
        onPress={() =>
          navigation.navigate({
            routeName,
            params
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
                shadowColor: colors.transparent
              }
            }),
            stylesWithProps(this.props).container
          ]}
        >
          <View style={stylesWithProps(this.props).contentContainer}>
            {!!image && <Image source={{ uri: image }} style={stylesWithProps(this.props).image} />}
            {!!category && <RegularText small>{category}</RegularText>}
            {!!name && <BoldText>{name}</BoldText>}
          </View>
        </Card>
      </Touchable>
    );
  };

  render() {
    const { listEndReached } = this.state;
    const { data, horizontal } = this.props;

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
        showsHorizontalScrollIndicator={!horizontal}
        horizontal={horizontal}
      />
    );
  }
}

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
      backgroundColor: colors.transparent,
      borderWidth: 0,
      margin: 0,
      padding: normalize(14)
    },
    contentContainer: {
      width: horizontal ? device.width * 0.7 : device.width - 2 * normalize(14)
    },
    image: {
      borderRadius: 5,
      marginBottom: normalize(7),
      height: imageHeight(horizontal)
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
