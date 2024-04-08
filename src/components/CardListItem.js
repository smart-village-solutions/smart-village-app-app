import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card, Divider } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth, trimNewLines } from '../helpers';

import { Image } from './Image';
import { HeadlineText, RegularText } from './Text';
import { Touchable } from './Touchable';

const renderCardContent = (item, horizontal, noOvertitle, bigTitle) => {
  const { appDesignSystem = {}, picture, overtitle, subtitle, title } = item;
  const {
    contentSequence,
    imageBorderRadius = normalize(8),
    imageStyle,
    textsStyle = {}
  } = appDesignSystem;
  const { generalStyle, subtitleStyle, titleStyle, overtitleStyle } = textsStyle;

  const cardContent = [];

  const sequenceMap = {
    picture: () => (
      <Image
        source={{ uri: picture.url }}
        style={stylesWithProps({ horizontal }).image}
        containerStyle={[styles.imageContainer, !!imageStyle && imageStyle]}
        borderRadius={imageBorderRadius}
      />
    ),
    overtitle: () => (
      <HeadlineText
        smallest
        uppercase
        style={[
          picture?.url && styles.overtitleMarginTop,
          styles.overtitleMarginBottom,
          !!generalStyle && generalStyle,
          !!overtitleStyle && overtitleStyle
        ]}
      >
        {trimNewLines(overtitle)}
      </HeadlineText>
    ),
    subtitle: () => (
      <RegularText
        small
        style={[styles.subtitle, !!generalStyle && generalStyle, !!subtitleStyle && subtitleStyle]}
      >
        {subtitle}
      </RegularText>
    ),
    title: () => (
      <HeadlineText
        small={!bigTitle}
        style={[!!generalStyle && generalStyle, !!titleStyle && titleStyle]}
      >
        {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
      </HeadlineText>
    )
  };

  if (contentSequence?.length) {
    contentSequence.forEach((item) => {
      if (sequenceMap[item]) {
        cardContent.push(sequenceMap[item]());
      }
    });
  } else {
    picture?.url && cardContent.push(sequenceMap.picture());
    !noOvertitle && overtitle && cardContent.push(sequenceMap.overtitle());
    title && cardContent.push(sequenceMap.title());
    subtitle && cardContent.push(sequenceMap.subtitle());
  }

  return cardContent;
};

export const CardListItem = memo(({ navigation, horizontal, noOvertitle, item, bigTitle }) => {
  const { appDesignSystem = {}, params, routeName: name, subtitle, title } = item;
  const { containerStyle, contentContainerStyle } = appDesignSystem;

  // TODO: count articles logic could to be implemented
  return (
    <Touchable
      accessibilityLabel={`${subtitle} (${title}) ${consts.a11yLabel.button}`}
      onPress={() => navigation && navigation.push(name, params)}
      disabled={!navigation}
    >
      <View>
        <Card containerStyle={[styles.container, !!containerStyle && containerStyle]}>
          <View
            style={[
              stylesWithProps({ horizontal }).contentContainer,
              !!contentContainerStyle && contentContainerStyle
            ]}
          >
            {renderCardContent(item, horizontal, noOvertitle, bigTitle)}
          </View>
        </Card>
        <Divider />
      </View>
    </Touchable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: normalize(16),
    ...Platform.select({
      android: {
        elevation: 0
      },
      ios: {
        shadowColor: colors.transparent
      }
    })
  },
  overtitleMarginBottom: {
    marginBottom: normalize(4)
  },
  overtitleMarginTop: {
    marginTop: normalize(14)
  },
  imageContainer: {},
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

  const maxWidth = width - 2 * normalize(16); // width of an image minus paddings

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
  horizontal: PropTypes.bool,
  noOvertitle: PropTypes.bool,
  bigTitle: PropTypes.bool
};

CardListItem.defaultProps = {
  horizontal: false,
  noOvertitle: false,
  bigTitle: false
};
