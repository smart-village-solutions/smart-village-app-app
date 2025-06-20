import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { ComponentProps, useCallback, useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, consts, device, Icon, IconSet, IconUrl, normalize } from '../../config';
import { OrientationContext } from '../../OrientationProvider';
import { Image } from '../Image';
import { Badge } from '../profile';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';

const normalizeStyleValues = (styleObj: any) => {
  if (!Object.keys(styleObj).length) return styleObj;

  const normalizedStyle = {};

  for (const key in styleObj) {
    const value = styleObj[key];

    if (typeof value === 'number') {
      normalizedStyle[key] = normalize(value);
    } else if (typeof value === 'object' && value !== null) {
      normalizedStyle[key] = normalizeStyleValues(value);
    } else {
      normalizedStyle[key] = value;
    }
  }

  return normalizedStyle;
};

export type TServiceTile = {
  accessibilityLabel: string;
  icon: string;
  iconName?: ComponentProps<typeof IconSet>['name'];
  image: string;
  isVisible?: boolean;
  numberOfTiles?: number;
  params?: any;
  query?: string;
  routeName: string;
  style?: {
    fontStyle?: any;
    iconStyle?: any;
    numberOfLines?: number;
    tileStyle?: any;
  };
  svg?: string;
  tile?: string;
  tileSizeFactor?: number;
  title: string;
};

/* eslint-disable complexity */
export const ServiceTile = ({
  draggableId,
  hasDiagonalGradientBackground = false,
  isEditMode = false,
  isLastRow = false,
  item,
  onToggleVisibility,
  serviceTiles,
  tileSizeFactor = 1
}: {
  draggableId: string;
  hasDiagonalGradientBackground?: boolean;
  isEditMode?: boolean;
  isLastRow?: boolean;
  item: TServiceTile;
  onToggleVisibility: (
    toggleableId: string,
    isVisible: boolean,
    setIsVisible: (isVisible: boolean) => void
  ) => void;
  tileSizeFactor?: number;
  serviceTiles?: any;
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { orientation, dimensions } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(item.isVisible ?? true);
  const onPress = useCallback(
    () =>
      isEditMode
        ? onToggleVisibility(draggableId, isVisible, setIsVisible)
        : navigation.push(item.routeName, item.params),
    [isEditMode, isVisible]
  );
  const ToggleVisibilityIcon = isVisible ? Icon.Visible : Icon.Unvisible;
  const { fontStyle = {}, iconStyle = {}, numberOfLines, tileStyle = {} } = serviceTiles;
  const { style: itemStyle } = item;
  const {
    fontStyle: itemFontStyle = {},
    iconStyle: itemIconStyle = {},
    numberOfLines: itemNumberOfLines,
    tileStyle: itemTileStyle = {}
  } = itemStyle || {};

  const hasTileStyle = !!Object.keys(itemTileStyle).length || !!Object.keys(tileStyle).length;

  const normalizedFontStyle = normalizeStyleValues(
    Object.keys(itemFontStyle).length ? itemFontStyle : fontStyle
  );
  const normalizedIconStyle = normalizeStyleValues(
    Object.keys(itemIconStyle).length ? itemIconStyle : iconStyle
  );
  const normalizedTileStyle = normalizeStyleValues(
    Object.keys(itemTileStyle).length ? itemTileStyle : tileStyle
  );

  return (
    <ServiceBox
      bigTile={!!item.tile || hasTileStyle}
      dimensions={dimensions}
      numberOfTiles={item?.numberOfTiles}
      orientation={orientation}
      style={[normalizedTileStyle, isLastRow && styles.marginLeft]}
    >
      <TouchableOpacity
        style={[hasTileStyle && styles.button]}
        onPress={onPress}
        accessibilityLabel={
          item.accessibilityLabel
            ? `(${item.accessibilityLabel}) ${consts.a11yLabel.button}`
            : undefined
        }
      >
        {isEditMode && (
          <ToggleVisibilityIcon
            color={colors.placeholder}
            size={normalize(20)}
            style={[styles.toggleVisibilityIcon, !!item.tile && styles.toggleVisibilityIconBigTile]}
          />
        )}
        <View style={[!isVisible && styles.invisible]}>
          {item.iconName ? (
            <Icon.NamedIcon
              color={
                normalizedIconStyle.color
                  ? normalizedIconStyle.color
                  : hasDiagonalGradientBackground
                  ? colors.lightestText
                  : undefined
              }
              name={item.iconName}
              size={normalizedIconStyle.size || normalize(30)}
              strokeColor={normalizedIconStyle.strokeColor}
              strokeWidth={normalizedIconStyle.strokeWidth}
              style={[styles.serviceIcon, normalizedIconStyle]}
            />
          ) : item.svg ? (
            <IconUrl
              color={
                normalizedIconStyle.color
                  ? normalizedIconStyle.color
                  : hasDiagonalGradientBackground
                  ? colors.lightestText
                  : undefined
              }
              iconName={item.svg}
              size={normalizedIconStyle.size || normalize(30)}
              strokeColor={normalizedIconStyle.strokeColor}
              strokeWidth={normalizedIconStyle.strokeWidth}
              style={[styles.serviceIcon, normalizedIconStyle]}
            />
          ) : (
            <Image
              source={{ uri: item.icon || item.tile }}
              childrenContainerStyle={[
                styles.serviceImage,
                !!item.icon && {
                  height: normalizedIconStyle.size || normalize(30)
                },
                !!item.tile &&
                  stylesWithProps({
                    tileSizeFactor,
                    orientation,
                    safeAreaInsets
                  }).bigTile
              ]}
              PlaceholderContent={null}
              resizeMode="contain"
            />
          )}

          {!!item?.query && <Badge />}

          {!!item.title && (
            <BoldText
              small
              lightest={hasDiagonalGradientBackground}
              primary={!hasDiagonalGradientBackground}
              center
              accessibilityLabel={`(${item.title}) ${consts.a11yLabel.button}`}
              numberOfLines={itemNumberOfLines || numberOfLines}
              style={normalizedFontStyle}
            >
              {item.title}
            </BoldText>
          )}
        </View>
      </TouchableOpacity>
    </ServiceBox>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%'
  },
  marginLeft: {
    marginLeft: normalize(8)
  },
  serviceIcon: {
    alignSelf: 'center',
    paddingVertical: normalize(7.5)
  },
  serviceImage: {
    alignSelf: 'center',
    marginBottom: normalize(7),
    width: '100%'
  },
  toggleVisibilityIcon: {
    backgroundColor: colors.surface,
    position: 'absolute',
    right: 0,
    top: normalize(-14),
    zIndex: 1
  },
  toggleVisibilityIconBigTile: {
    top: normalize(2)
  },
  invisible: {
    opacity: 0.2
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({
  tileSizeFactor = 1,
  orientation,
  safeAreaInsets
}: {
  tileSizeFactor?: number;
  orientation: string;
  safeAreaInsets: EdgeInsets;
}) => {
  const containerPadding = normalize(14);
  const numberOfTiles = orientation === 'landscape' ? 5 : 3;
  const deviceHeight = device.height - safeAreaInsets.left - safeAreaInsets.right;

  // calculate tile sizes based on device orientation, safe are insets and padding
  const tileSize =
    ((orientation === 'landscape' ? deviceHeight : device.width) - 2 * containerPadding) /
    numberOfTiles;

  return StyleSheet.create({
    bigTile: {
      height: tileSize * tileSizeFactor,
      marginBottom: 0,
      width: tileSize
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
