import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card, Divider } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth, trimNewLines } from '../helpers';

import { Image } from './Image';
import { HeadlineText, RegularText } from './Text';
import { Touchable } from './Touchable';

export const CardListItem = memo(({ navigation, horizontal, item }) => {
  const { routeName: name, params, picture, subtitle, title, overtitle } = item;

  // TODO: count articles logic could to be implemented
  return (
    <Touchable
      accessibilityLabel={`${subtitle} (${title}) ${consts.a11yLabel.button}`}
      onPress={() => navigation && navigation.push(name, params)}
      disabled={!navigation}
    >
      <Card containerStyle={styles.container}>
        <View style={stylesWithProps({ horizontal }).contentContainer}>
          {!!picture && !!picture.url && (
            <Image
              source={{ uri: picture.url }}
              style={stylesWithProps({ horizontal }).image}
              containerStyle={styles.imageContainer}
            />
          )}
          {!!overtitle && (
            <HeadlineText smallest uppercase style={styles.overtitle}>
              {trimNewLines(overtitle)}
            </HeadlineText>
          )}
          {!!title && (
            <HeadlineText>
              {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
            </HeadlineText>
          )}
          {!!subtitle && (
            <RegularText smallest style={styles.subtitle}>
              {subtitle}
            </RegularText>
          )}
        </View>
      </Card>
      <Divider />
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
  overtitle: {
    marginBottom: normalize(4),
    marginTop: normalize(16)
  },
  imageContainer: {
    alignSelf: 'center'
  },
  subtitle: {
    marginTop: normalize(6)
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ horizontal }) => {
  let width = imageWidth();

  if (horizontal) {
    // image width should be only 70% when rendering horizontal cards
    width = width * 0.7;
  }

  const maxWidth = width - 2 * normalize(14); // width of an image minus paddings

  return StyleSheet.create({
    contentContainer: {
      width: maxWidth
    },
    image: {
      marginBottom: normalize(7),
      height: imageHeight(width),
      width: width
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
