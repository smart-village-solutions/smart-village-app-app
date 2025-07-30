import { StackScreenProps } from '@react-navigation/stack';
import React, { memo } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Divider } from 'react-native-elements';

import { Icon, colors, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { TVoucherItem } from '../../types';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';

import { Discount } from './Discount';

export const VoucherListItem = memo(
  ({
    navigation,
    horizontal,
    item
  }: {
    navigation: StackScreenProps<any>;
    horizontal: boolean;
    item: TVoucherItem;
  }) => {
    const {
      discountType,
      id,
      picture,
      params,
      payload,
      pointOfInterest,
      routeName: name,
      subtitle,
      title
    } = item;

    return (
      <TouchableOpacity
        onPress={() => navigation && navigation.push(name, params)}
        disabled={!navigation}
      >
        <Card containerStyle={styles.container}>
          {!!picture?.url && (
            <Image
              source={{ uri: picture.url }}
              style={stylesWithProps({ horizontal }).image}
              containerStyle={styles.imageContainer}
              borderRadius={normalize(5)}
            />
          )}

          {!!discountType && (
            <WrapperVertical>
              <Discount
                discount={discountType}
                id={id}
                payloadId={payload.id}
                query={QUERY_TYPES.VOUCHERS}
              />
            </WrapperVertical>
          )}

          <WrapperRow spaceBetween style={styles.centeredItems}>
            <View style={styles.textContainer}>
              {!!title && (
                <BoldText small numberOfLines={2}>
                  {title}
                </BoldText>
              )}

              {!!subtitle && (
                <RegularText small numberOfLines={1}>
                  {subtitle}
                </RegularText>
              )}

              {!!pointOfInterest?.operatingCompany?.name && (
                <RegularText small numberOfLines={1}>
                  {pointOfInterest.operatingCompany.name}
                </RegularText>
              )}
            </View>

            <Icon.ArrowRight color={colors.darkText} />
          </WrapperRow>
        </Card>

        <WrapperHorizontal>
          <Divider />
        </WrapperHorizontal>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  centeredItems: {
    alignItems: 'center'
  },
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
  textContainer: {
    width: '90%'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ horizontal }: { horizontal: boolean }) => {
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
      height: imageHeight(maxWidth),
      width: maxWidth
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
