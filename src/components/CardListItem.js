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

const keyExtractor = (item, index) => `item${item}-index${index}`;

/* eslint-disable complexity */
const renderCardContent = (item, index, horizontal, noOvertitle, bigTitle, sue) => {
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
          style={[stylesWithProps({ aspectRatio, horizontal }).image, sue && styles.sueImage]}
          containerStyle={[styles.imageContainer, sue && styles.sueImage, imageStyle]}
          key={keyExtractor(picture.url, index)}
          placeholderStyle={styles.placeholderStyle}
          source={{ uri: picture.url }}
        />
      ),
    overtitle: () =>
      !!overtitle && (
        <HeadlineText
          key={keyExtractor(overtitle, index)}
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
        <RegularText
          key={keyExtractor(subtitle, index)}
          small
          style={[styles.subtitle, generalStyle, subtitleStyle]}
        >
          {subtitle}
        </RegularText>
      ),
    title: () =>
      !!title && (
        <HeadlineText
          key={keyExtractor(title, index)}
          small={!bigTitle}
          style={[generalStyle, titleStyle]}
        >
          {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
        </HeadlineText>
      ),

    // SUE
    sue: {
      address: () => (
        <Wrapper key={keyExtractor(address, index)}>
          <RegularText small>{address}</RegularText>
        </Wrapper>
      ),
      category: () => (
        <SueCategory
          key={keyExtractor(serviceName, index)}
          serviceName={serviceName}
          requestedDatetime={requestedDatetime}
        />
      ),
      divider: () => (
        <Wrapper key={keyExtractor('divider', index)} noPaddingTop>
          <Divider />
        </Wrapper>
      ),
      pictureFallback: () => (
        <SueImageFallback
          key={keyExtractor('fallbackImage', index)}
          style={[stylesWithProps({ aspectRatio, horizontal }).image, styles.sueImage]}
        />
      ),
      status: () => (
        <SueStatus key={keyExtractor(status, index)} iconName={iconName} status={status} />
      )
    }
  };

  if (contentSequence?.length) {
    contentSequence.forEach((item) => {
      sequenceMap[item] && cardContent.push(sequenceMap[item]());
    });
  } else {
    if (picture?.url) {
      cardContent.push(sequenceMap.picture());
    }
    if (!noOvertitle && overtitle) {
      cardContent.push(sequenceMap.overtitle());
    }
    if (!sue && title) {
      cardContent.push(sequenceMap.title());
    }
    if (subtitle) {
      cardContent.push(sequenceMap.subtitle());
    }

    if (sue) {
      if (!picture?.url) {
        cardContent.push(sequenceMap.sue.pictureFallback());
      }
      if (serviceName && requestedDatetime) {
        cardContent.push(sequenceMap.sue.category());
        cardContent.push(sequenceMap.sue.divider());
      }
      if (title) {
        cardContent.push(
          <WrapperHorizontal key={keyExtractor(title, index)}>
            {sequenceMap.title()}
          </WrapperHorizontal>
        );
      }
      if (address) {
        cardContent.push(sequenceMap.sue.address());
      }
      if (status) {
        cardContent.push(sequenceMap.sue.status());
      }
    }
  }

  return cardContent;
};
/* eslint-enable complexity */

export const CardListItem = memo(
  ({
    bigTitle = false,
    horizontal = false,
    index,
    item,
    navigation,
    noOvertitle = false,
    sue = false
  }) => {
    const {
      appDesignSystem = {},
      overtitle,
      params,
      routeName: name,
      serviceName,
      requestedDatetime,
      subtitle,
      title
    } = item;
    const { containerStyle, contentContainerStyle } = appDesignSystem;

    const accessibilityLabel = [
      !!requestedDatetime && momentFormat(requestedDatetime),
      !!serviceName && serviceName,
      !!overtitle && overtitle,
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
          <Card
            containerStyle={[
              styles.container,
              stylesWithProps({ horizontal }).container,
              containerStyle
            ]}
          >
            <View
              style={[
                stylesWithProps({ horizontal }).contentContainer,
                contentContainerStyle,
                sue && styles.sueContentContainer
              ]}
            >
              {renderCardContent(item, index, horizontal, noOvertitle, bigTitle, sue)}
            </View>
          </Card>
        </View>
      </Touchable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
    margin: 0,
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
    marginTop: normalize(6)
  },
  subtitle: {
    marginTop: normalize(6)
  },
  imageContainer: {
    marginBottom: normalize(8)
  },
  placeholderStyle: {
    backgroundColor: colors.surface,
    flex: 1
  },
  sueContentContainer: {
    borderColor: colors.gray20,
    borderRadius: normalize(8),
    borderWidth: 1,
    width: '100%'
  },
  sueImage: {
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
    container: {
      paddingHorizontal: horizontal ? normalize(14) : 0
    },
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
  bigTitle: PropTypes.bool,
  horizontal: PropTypes.bool,
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  noOvertitle: PropTypes.bool,
  sue: PropTypes.bool
};
