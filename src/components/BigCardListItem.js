import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card, Divider } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';

import { Image } from './Image';
import { CategoryText, HeadlineText, RegularText } from './Text';
import { Touchable } from './Touchable';

export const BigCardListItem = memo(({ navigation, horizontal, item }) => {
  const { routeName: name, params, picture, subtitle, title } = item;

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
          {!!subtitle && (
            <CategoryText small style={{ marginTop: !!picture && !!picture.url && normalize(16) }}>
              {subtitle.split('| ')[1]}
            </CategoryText>
          )}
          {!!title && (
            <HeadlineText medium style={{ marginTop: normalize(4) }}>
              {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
            </HeadlineText>
          )}
          {!!subtitle && (
            <RegularText small style={{ marginTop: normalize(6) }}>
              {subtitle.split(' |')[0]}
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
  imageContainer: {
    alignSelf: 'center'
  },
  listItem: {
    alignItems: 'center'
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

BigCardListItem.displayName = 'BigCardListItem';

BigCardListItem.propTypes = {
  navigation: PropTypes.object,
  item: PropTypes.object.isRequired,
  horizontal: PropTypes.bool
};

BigCardListItem.defaultProps = {
  horizontal: false
};
