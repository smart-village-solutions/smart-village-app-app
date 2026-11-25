import { StackScreenProps } from 'expo-router/js-stack';
import React, { memo } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Divider } from 'react-native-elements';

import { Icon, normalize, texts } from '../../config';
import {
  isImportedKlimaTalerVoucher,
  readImportedKlimaTalerVoucher
} from '../../klimaTaler/importedVoucher';
import { useImportedVoucherOpening } from '../../klimaTaler/useImportedVoucherOpening';
import { imageHeight, imageWidth } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { TVoucherItem } from '../../types';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

import { Discount } from './Discount';

type VoucherListItemProps = {
  navigation: StackScreenProps<any>;
  horizontal: boolean;
  item: TVoucherItem;
  openKlimaTalerOffer?: boolean;
};

const useVoucherAction = ({
  navigation,
  item,
  openKlimaTalerOffer = false
}: VoucherListItemProps) => {
  const providerOffer = openKlimaTalerOffer && isImportedKlimaTalerVoucher(item.payload);
  const { available, opening, open } = useImportedVoucherOpening(item.payload);

  return {
    disabled: providerOffer ? !available || opening : !navigation,
    opening: providerOffer && opening,
    onPress: () => {
      if (providerOffer) {
        void open();
      } else {
        navigation && navigation.push(item.routeName, item.params);
      }
    }
  };
};

export const VoucherListItem = memo(
  ({ navigation, horizontal, item, openKlimaTalerOffer }: VoucherListItemProps) => {
    const { colors: colors } = useTheme();

    const styles = useThemeStyles(createStyles);
    const { discountType, id, picture, payload, pointOfInterest, subtitle, title } = item;
    const importedVoucher = readImportedKlimaTalerVoucher(payload);
    const { disabled, opening, onPress } = useVoucherAction({
      navigation,
      horizontal,
      item,
      openKlimaTalerOffer
    });

    return (
      <TouchableOpacity
        accessibilityLabel={title}
        accessibilityState={{ disabled, busy: opening }}
        onPress={onPress}
        disabled={disabled}
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

          {!!discountType && !isImportedKlimaTalerVoucher(payload) && (
            <WrapperVertical noPaddingTop>
              <Discount
                discount={discountType}
                id={id}
                payloadId={payload.id}
                query={QUERY_TYPES.VOUCHERS}
              />
            </WrapperVertical>
          )}

          <WrapperRow spaceBetween itemsCenter>
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

              {!!importedVoucher && (
                <RegularText small>
                  {`${importedVoucher.cost.toLocaleString('de-DE')} Klima-Taler · ${
                    importedVoucher.remaining > 10 ? '10+' : importedVoucher.remaining
                  } ${texts.klimaTaler.map.available}`}
                </RegularText>
              )}

              {opening && (
                <RegularText small accessibilityLiveRegion="polite">
                  {texts.klimaTaler.opening}
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

const createStyles = (colors) => ({
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
    marginBottom: normalize(8)
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
