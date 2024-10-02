import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card, Divider } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth, momentFormat } from '../helpers';

import { Image } from './Image';
import { SueCategory, SueImageFallback, SueStatus } from './SUE';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper, WrapperHorizontal } from './Wrapper';

/* eslint-disable complexity */
const renderCardContent = (item, horizontal, sue) => {
  const {
    address,
    appDesignSystem = {},
    aspectRatio,
    iconName,
    picture,
    requestedDatetime,
    serviceName,
    status,
    subtitle,
    title,
    topTitle
  } = item;
  const { contentSequence, imageBorderRadius = 5, imageStyle, textsStyle = {} } = appDesignSystem;
  const { generalStyle, subtitleStyle, titleStyle, topTitleStyle } = textsStyle;

  const cardContent = [];

  const sequenceMap = {
    picture: () =>
      !!picture?.url && (
        <Image
          borderRadius={sue ? 0 : imageBorderRadius}
          childrenContainerStyle={stylesWithProps({ aspectRatio, horizontal }).image}
          containerStyle={[styles.imageContainer, styles.sueImageContainer, imageStyle]}
          key={picture.url}
          source={{ uri: picture.url }}
        />
      ),
    subtitle: () =>
      !!subtitle && (
        <RegularText key={subtitle} small style={[generalStyle, subtitleStyle]}>
          {subtitle}
        </RegularText>
      ),
    title: () =>
      !!title && (
        <BoldText key={title} style={[generalStyle, titleStyle]}>
          {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
        </BoldText>
      ),
    topTitle: () => (
      <RegularText key={topTitle} small style={[!!topTitleStyle && topTitleStyle]}>
        {topTitle}
      </RegularText>
    ),

    // SUE
    sue: {
      address: () => (
        <Wrapper>
          <RegularText small>{address}</RegularText>
        </Wrapper>
      ),
      category: () => (
        <SueCategory serviceName={serviceName} requestedDatetime={requestedDatetime} />
      ),
      divider: () => (
        <Wrapper style={styles.noPaddingTop}>
          <Divider />
        </Wrapper>
      ),
      pictureFallback: () => (
        <SueImageFallback
          style={[stylesWithProps({ aspectRatio, horizontal }).image, styles.sueImageContainer]}
        />
      ),
      status: () => <SueStatus iconName={iconName} status={status} />
    }
  };

  if (contentSequence?.length) {
    contentSequence.forEach((item) => {
      sequenceMap[item] && cardContent.push(sequenceMap[item]());
    });
  } else {
    picture?.url && cardContent.push(sequenceMap.picture());
    topTitle && cardContent.push(sequenceMap.topTitle());
    subtitle && cardContent.push(sequenceMap.subtitle());
    !sue && title && cardContent.push(sequenceMap.title());

    if (sue) {
      !picture?.url && cardContent.push(sequenceMap.sue.pictureFallback());
      serviceName && requestedDatetime && cardContent.push(sequenceMap.sue.category());
      serviceName && requestedDatetime && cardContent.push(sequenceMap.sue.divider());
      title && cardContent.push(<WrapperHorizontal>{sequenceMap.title()}</WrapperHorizontal>);
      address && cardContent.push(sequenceMap.sue.address());
      status && cardContent.push(sequenceMap.sue.status());
    }
  }

  return cardContent;
};
/* eslint-enable complexity */

export const CardListItem = memo(({ navigation, horizontal = false, item, sue = false }) => {
  const {
    appDesignSystem = {},
    params,
    routeName: name,
    serviceName,
    requestedDatetime,
    subtitle,
    title,
    topTitle
  } = item;
  const { containerStyle, contentContainerStyle } = appDesignSystem;

  const accessibilityLabel = [
    !!requestedDatetime && momentFormat(requestedDatetime),
    !!serviceName && serviceName,
    !!topTitle && topTitle,
    !!title && title,
    !!subtitle && subtitle
  ]
    .filter((text) => !!text)
    .map((text) => `(${text})`)
    .join(' ');

  return (
    <Touchable
      accessibilityLabel={`${accessibilityLabel} ${consts.a11yLabel.button}`}
      onPress={() => navigation && navigation.push(name, params)}
      disabled={!navigation}
    >
      <Card containerStyle={[styles.container, !!containerStyle && containerStyle]}>
        <View
          style={[
            stylesWithProps({ horizontal }).contentContainer,
            !!contentContainerStyle && contentContainerStyle,
            sue && styles.sueContentContainer
          ]}
        >
          {renderCardContent(item, horizontal, sue)}
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
    alignSelf: 'center',
    marginBottom: normalize(7)
  },
  noPaddingTop: {
    paddingTop: 0
  },
  sueContentContainer: {
    borderColor: colors.gray20,
    borderRadius: normalize(8),
    borderWidth: 1,
    width: '100%'
  },
  sueImageContainer: {
    alignSelf: 'auto',
    borderTopLeftRadius: normalize(8),
    borderTopRightRadius: normalize(8),
    width: '100%'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ aspectRatio, horizontal }) => {
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
      height: imageHeight(maxWidth, aspectRatio),
      width: maxWidth
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

CardListItem.displayName = 'CardListItem';

CardListItem.propTypes = {
  navigation: PropTypes.object,
  item: PropTypes.object.isRequired,
  horizontal: PropTypes.bool,
  sue: PropTypes.bool
};
