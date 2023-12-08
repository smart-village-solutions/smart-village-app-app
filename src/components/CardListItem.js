import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';

import { Image } from './Image';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';

const renderCardContent = (item, horizontal) => {
  const { appDesignSystem = {}, picture, overtitle, subtitle, title } = item;
  const { contentSequence, imageBorderRadius = 5, imageStyle, textsStyle = {} } = appDesignSystem;
  const { generalStyle, subtitleStyle, titleStyle, overtitleStyle } = textsStyle;

  const cardContent = [];

  const sequenceMap = {
    picture: () =>
      !!picture?.url && (
        <Image
          source={{ uri: picture.url }}
          style={stylesWithProps({ horizontal }).image}
          containerStyle={(styles.imageContainer, !!imageStyle && imageStyle)}
          borderRadius={imageBorderRadius}
        />
      ),
    overtitle: () =>
      !!overtitle && (
        <RegularText
          small
          style={[!!generalStyle && generalStyle, !!overtitleStyle && overtitleStyle]}
        >
          {overtitle}
        </RegularText>
      ),
    subtitle: () =>
      !!subtitle && (
        <RegularText
          small
          style={[!!generalStyle && generalStyle, !!subtitleStyle && subtitleStyle]}
        >
          {subtitle}
        </RegularText>
      ),
    title: () =>
      !!title && (
        <BoldText style={[!!generalStyle && generalStyle, !!titleStyle && titleStyle]}>
          {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
        </BoldText>
      )
  };

  if (contentSequence?.length) {
    contentSequence.forEach((item) => {
      if (sequenceMap[item]) {
        cardContent.push(sequenceMap[item]());
      }
    });
  } else {
    cardContent.push(sequenceMap.picture());
    cardContent.push(sequenceMap.overtitle());
    cardContent.push(sequenceMap.subtitle());
    cardContent.push(sequenceMap.title());
  }

  return cardContent;
};

export const CardListItem = memo(({ navigation, horizontal, item }) => {
  const { appDesignSystem = {}, params, routeName: name, subtitle, title } = item;
  const { containerStyle, contentContainerStyle } = appDesignSystem;

  // TODO: count articles logic could to be implemented
  return (
    <Touchable
      accessibilityLabel={`${subtitle} (${title}) ${consts.a11yLabel.button}`}
      onPress={() => navigation && navigation.push(name, params)}
      disabled={!navigation}
    >
      <Card containerStyle={[styles.container, !!containerStyle && containerStyle]}>
        <View
          style={[
            stylesWithProps({ horizontal }).contentContainer,
            !!contentContainerStyle && contentContainerStyle
          ]}
        >
          {renderCardContent(item, horizontal)}
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
