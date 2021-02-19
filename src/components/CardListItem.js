import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Card } from 'react-native-elements';
import { Platform, StyleSheet, View } from 'react-native';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { Image } from './Image';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';

export const CardListItem = memo(({ navigation, horizontal, item }) => {
  const { routeName, params, picture, subtitle, title } = item;

  // TODO: count articles logic could to be implemented
  return (
    <Touchable
      accessibilityLabel={`(${subtitle}) ${title} (Taste)`}
      onPress={() => navigation && navigation.push(routeName, params)}
      disabled={!navigation}
    >
      <Card containerStyle={styles.container}>
        <View style={stylesWithProps({ horizontal }).contentContainer}>
          {!!picture && !!picture.url && (
            <Image
              source={{ uri: picture.url }}
              style={stylesWithProps({ horizontal }).image}
              containerStyle={styles.imageContainer}
              borderRadius={5}
            />
          )}
          {!!subtitle && <RegularText small>{subtitle}</RegularText>}
          {!!title && (
            <BoldText>
              {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
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
  },
  imageContainer: {
    alignSelf: 'center'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ horizontal }) => {
  let width = imageWidth();

  if (horizontal || width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH) {
    // image width should be only 70% when rendering horizontal cards or on wider screens,
    // as there are 15% padding on each side
    width = width * 0.7;
  }

  const maxWidth = width - 2 * normalize(14); // width of an image minus paddings

  return StyleSheet.create({
    contentContainer: {
      alignSelf: 'center',
      width: maxWidth
    },
    image: {
      marginBottom: normalize(7),
      height: imageHeight(maxWidth),
      width: maxWidth
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

CardListItem.displayName = 'CardListItem';

CardListItem.propTypes = {
  navigation: PropTypes.object,
  item: PropTypes.object.isRequired,
  horizontal: PropTypes.bool
};

CardListItem.defaultProps = {
  horizontal: false
};
