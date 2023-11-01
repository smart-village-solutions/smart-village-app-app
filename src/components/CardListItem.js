import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Card } from 'react-native-elements';
import { Divider } from 'react-native-elements/dist/divider/Divider';

import { colors, consts, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';

import { Image } from './Image';
import { SueCategory, SueImageFallback, SueStatus } from './SUE';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper, WrapperHorizontal } from './Wrapper';

/* eslint-disable complexity */
export const CardListItem = memo(({ navigation, horizontal, item, sue }) => {
  const {
    address,
    aspectRatio,
    iconName,
    params,
    picture,
    requestedDatetime,
    routeName: name,
    serviceName,
    status,
    subtitle,
    title
  } = item;

  return (
    <Touchable
      accessibilityLabel={`${subtitle} (${title}) ${consts.a11yLabel.button}`}
      onPress={() => navigation && navigation.push(name, params)}
      disabled={!navigation}
    >
      <Card containerStyle={styles.container}>
        <View
          style={[
            stylesWithProps({ horizontal }).contentContainer,
            sue && styles.sueContentContainer
          ]}
        >
          {!!picture?.url && (
            <Image
              borderRadius={sue ? 0 : 5}
              containerStyle={[styles.imageContainer, sue && styles.sueImageContainer]}
              source={{ uri: picture.url }}
              style={stylesWithProps({ aspectRatio, horizontal }).image}
            />
          )}
          {!!subtitle && <RegularText small>{subtitle}</RegularText>}
          {!sue && !!title && (
            <BoldText>
              {horizontal ? (title.length > 60 ? title.substring(0, 60) + '...' : title) : title}
            </BoldText>
          )}

          {sue && (
            <>
              {!picture?.url && (
                <SueImageFallback
                  style={[
                    stylesWithProps({ aspectRatio, horizontal }).image,
                    styles.sueImageContainer
                  ]}
                />
              )}
              {!!serviceName && !!requestedDatetime && (
                <SueCategory serviceName={serviceName} requestedDatetime={requestedDatetime} />
              )}
              <Wrapper style={styles.noPaddingTop}>
                <Divider />
              </Wrapper>
              {!!title && (
                <WrapperHorizontal>
                  <BoldText>
                    {horizontal
                      ? title.length > 60
                        ? title.substring(0, 60) + '...'
                        : title
                      : title}
                  </BoldText>
                </WrapperHorizontal>
              )}
              {!!address && (
                <Wrapper>
                  <RegularText small>{address.replace('\r\n ', '\r\n')}</RegularText>
                </Wrapper>
              )}
              {!!status && <SueStatus iconName={iconName} status={status} />}
            </>
          )}
        </View>
      </Card>
    </Touchable>
  );
});
/* eslint-enable complexity */

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
  noPaddingTop: {
    paddingTop: 0
  },
  sueContentContainer: {
    borderWidth: 1,
    borderColor: colors.gray20,
    borderRadius: normalize(8)
  },
  sueImageContainer: {
    alignSelf: 'auto',
    borderTopLeftRadius: normalize(8),
    borderTopRightRadius: normalize(8)
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
      marginBottom: normalize(7),
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

CardListItem.defaultProps = {
  horizontal: false,
  sue: false
};
