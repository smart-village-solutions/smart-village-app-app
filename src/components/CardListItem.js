import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card, Divider } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth, momentFormat, trimNewLines } from '../helpers';

import { Image } from './Image';
import { SueCategory, SueImageFallback, SueStatus } from './SUE';
import { HeadlineText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper, WrapperHorizontal } from './Wrapper';

/* eslint-disable complexity */
const renderCardContent = (item, horizontal, noOvertitle, bigTitle, sue) => {
  const {
    address,
    appDesignSystem = {},
    aspectRatio,
    iconName,
    overtitle,
    picture,
    requestedDatetime,
    serviceName,
    status,
    subtitle,
    title
  } = item;
  const {
    contentSequence,
    imageBorderRadius = normalize(8),
    imageStyle,
    textsStyle = {}
  } = appDesignSystem;
  const { generalStyle, subtitleStyle, titleStyle, overtitleStyle } = textsStyle;

  const cardContent = [];

  const sequenceMap = {
    picture: () =>
      !!picture?.url && (
        <Image
          borderRadius={sue ? 0 : imageBorderRadius}
          childrenContainerStyle={stylesWithProps({ aspectRatio, horizontal }).image}
          containerStyle={[styles.imageContainer, styles.sueImageContainer, imageStyle]}
          source={{ uri: picture.url }}
        />
      ),
    overtitle: () =>
      !!overtitle && (
        <HeadlineText
          smallest
          uppercase
          style={[
            picture?.url && styles.overtitleMarginTop,
            styles.overtitleMarginBottom,
            generalStyle,
            overtitleStyle
          ]}
        >
          {trimNewLines(overtitle)}
        </HeadlineText>
      ),
    subtitle: () =>
      !!subtitle && (
        <RegularText small style={[generalStyle, subtitleStyle]}>
          {subtitle}
        </RegularText>
      ),
    title: () =>
      !!title && (
        <HeadlineText small={!bigTitle} style={[generalStyle, titleStyle]}>
          {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
        </HeadlineText>
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
    !noOvertitle && overtitle && cardContent.push(sequenceMap.overtitle());
    !sue && title && cardContent.push(sequenceMap.title());
    subtitle && cardContent.push(sequenceMap.subtitle());

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

export const CardListItem = memo(({ navigation, horizontal, noOvertitle, item, bigTitle, sue }) => {
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
      <View>
        <Card containerStyle={[styles.container, containerStyle]}>
          <View
            style={[
              stylesWithProps({ horizontal }).contentContainer,
              contentContainerStyle,
              sue && styles.sueContentContainer
            ]}
          >
            {renderCardContent(item, horizontal, noOvertitle, bigTitle, sue)}
          </View>
        </Card>
        {!horizontal && <Divider />}
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

  const maxWidth = width - 2 * normalize(16); // width of an image minus paddings

  return StyleSheet.create({
    contentContainer: {
      width: maxWidth
    },
    image: {
      height: imageHeight(maxWidth, aspectRatio),
      marginBottom: normalize(7),
      width: maxWidth
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

CardListItem.displayName = 'CardListItem';

CardListItem.propTypes = {
  bigTitle: PropTypes.bool,
  horizontal: PropTypes.bool,
  item: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  noOvertitle: PropTypes.bool,
  sue: PropTypes.bool
};

CardListItem.defaultProps = {
  bigTitle: false,
  horizontal: false,
  noOvertitle: false,
  sue: false
};
