import PropTypes from 'prop-types';
import React from 'react';
import { Card } from 'react-native-elements';
import { Platform, StyleSheet, View } from 'react-native';

import { colors, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { Image } from './Image';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';

export const CardListItem = ({ navigation, horizontal, item, orientation, dimensions }) => {
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
              elevation: 0,
            },
            ios: {
              shadowColor: colors.transparent,
            },
          }),
          stylesWithProps({ horizontal, orientation, dimensions }).container,
        ]}
      >
        <View style={stylesWithProps({ horizontal, orientation, dimensions }).contentContainer}>
          {!!image && (
            <Image
              source={{ uri: image }}
              style={stylesWithProps({ horizontal, orientation, dimensions }).image}
            />
          )}
          {!!category && <RegularText small>{category}</RegularText>}
          {!!name && (
            <BoldText>
              {horizontal ? (name.length > 60 ? name.substring(0, 60) + '...' : name) : name}
            </BoldText>
          )}
        </View>
      </Card>
    </Touchable>
  );
};

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */

const stylesWithProps = ({ horizontal, orientation, dimensions }) => {
  // image width should be only 70% when rendering horizontal cards, otherwise substract paddings

  const width = horizontal
    ? imageWidth() * 0.7
    : orientation === 'landscape' || (orientation === 'portrait' && dimensions.width > 450)
    ? dimensions.height
    : imageWidth() - 2 * normalize(14);

  return StyleSheet.create({
    container: {
      backgroundColor: colors.transparent,
      borderWidth: 0,
      margin: 0,
      padding: normalize(14)
    },
    contentContainer: {
      width
    },
    image: {
      borderRadius: 5,
      marginBottom: normalize(7),
      height: imageHeight(width)
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

CardListItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  horizontal: PropTypes.bool,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired,
};

CardListItem.defaultProps = {
  horizontal: false
};
