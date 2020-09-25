import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Card } from 'react-native-elements';
import { Platform, StyleSheet, View } from 'react-native';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { Image } from './Image';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';

export const CardListItem = memo(({ navigation, horizontal, item, orientation, dimensions }) => {
  const { routeName, params, image, category, name } = item;

  // TODO: accessibility logic needs to be implemented
  return (
    <Touchable
      onPress={() =>
        navigation.navigate({
          routeName,
          params
        })
      }
    >
      <Card containerStyle={styles.container}>
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
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
    margin: 0,
    padding: normalize(14),
    ...Platform.select({
      android: {
        elevation: 0
      },
      ios: {
        shadowColor: colors.transparent
      }
    })
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ horizontal, orientation, dimensions }) => {
  let width = imageWidth();

  if (horizontal || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH) {
    // image width should be only 70% when rendering horizontal cards or on wider screens,
    // as there are 15% padding on each side
    width = width * 0.7;
  }

  if (orientation === 'landscape') {
    // image width should be smaller than full width on landscape, so take the device height,
    // which is the same as the device width in portrait
    width = dimensions.height;

    // if the device is in landscape mode but the device height is larger than our max for full
    // screen, we want to also apply 70% to have not too large images
    if (dimensions.height > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH) {
      width = dimensions.height * 0.7;
    }
  }

  const maxWidth = width - 2 * normalize(14); // width of an image minus paddings

  return StyleSheet.create({
    contentContainer: {
      width: maxWidth
    },
    image: {
      borderRadius: 5,
      marginBottom: normalize(7),
      height: imageHeight(maxWidth)
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

CardListItem.displayName = 'CardListItem';

CardListItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  horizontal: PropTypes.bool,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};

CardListItem.defaultProps = {
  horizontal: false
};
