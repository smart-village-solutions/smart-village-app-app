import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { ComponentProps, useCallback, useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { consts, Icon, IconSet, IconUrl, normalize } from '../../config';
import { normalizeStyleValues } from '../../helpers';
import { OrientationContext } from '../../OrientationProvider';
import { Image } from '../Image';
import { Badge } from '../profile';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

export type TServiceTile = {
  accessibilityLabel: string;
  icon: string;
  iconName?: ComponentProps<typeof IconSet>['name'];
  image: string;
  isVisible?: boolean;
  numberOfTiles?: {
    landscape?: number;
    portrait?: number;
  };
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

const resolveColumns = ({
  item,
  layoutColumns,
  orientation
}: {
  item: TServiceTile;
  layoutColumns: number;
  orientation: string;
}) => {
  const itemColumns =
    orientation === 'landscape' ? item?.numberOfTiles?.landscape : item?.numberOfTiles?.portrait;

  if (typeof itemColumns === 'number' && itemColumns > 0) return itemColumns;

  return layoutColumns;
};

const omitTileDimensionOverrides = (style: { [key: string]: any } = {}) => {
  const sanitizedStyle = { ...style };

  delete sanitizedStyle.width;
  delete sanitizedStyle.height;
  delete sanitizedStyle.minWidth;
  delete sanitizedStyle.minHeight;
  delete sanitizedStyle.maxWidth;
  delete sanitizedStyle.maxHeight;
  delete sanitizedStyle.aspectRatio;

  return sanitizedStyle;
};

/* eslint-disable complexity */
export const ServiceTile = ({
  draggableId,
  hasDiagonalGradientBackground = false,
  isEditMode = false,
  item,
  layoutColumns = 3,
  onToggleVisibility,
  serviceTiles,
  shouldAddMargin = false,
  tileSizeFactor = 1
}: {
  draggableId: string;
  hasDiagonalGradientBackground?: boolean;
  isEditMode?: boolean;
  item: TServiceTile;
  layoutColumns?: number;
  onToggleVisibility: (
    toggleableId: string,
    isVisible: boolean,
    setIsVisible: (isVisible: boolean) => void
  ) => void;
  serviceTiles?: any;
  shouldAddMargin?: boolean;
  tileSizeFactor?: number;
}) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { orientation, dimensions } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();
  const columns = resolveColumns({ item, layoutColumns, orientation });
  const [isVisible, setIsVisible] = useState(item.isVisible ?? true);
  const onPress = useCallback(
    () =>
      isEditMode
        ? onToggleVisibility(draggableId, isVisible, setIsVisible)
        : navigation.push(item.routeName, item.params),
    [isEditMode, onToggleVisibility, draggableId, isVisible, item, navigation]
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
  const normalizedTileStyle = omitTileDimensionOverrides(
    normalizeStyleValues(Object.keys(itemTileStyle).length ? itemTileStyle : tileStyle)
  );

  return (
    <ServiceBox
      bigTile={!!item.tile}
      columns={columns}
      hasTileStyle={hasTileStyle}
      orientation={orientation}
      style={[
        normalizedTileStyle,
        isEditMode && styles.editableTile,
        !isEditMode && shouldAddMargin && styles.marginLeft,
        styles.squareTile
      ]}
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
              style={[
                styles.serviceImage,
                !!item.icon && {
                  height: normalizedIconStyle.size || normalize(30)
                },
                !!item.tile &&
                  stylesWithProps({
                    columns,
                    dimensions,
                    safeAreaInsets,
                    tileSizeFactor
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
              style={[
                normalizedFontStyle,
                !!item.tile &&
                  stylesWithProps({
                    columns,
                    dimensions,
                    safeAreaInsets,
                    tileSizeFactor
                  }).bigTileTitle
              ]}
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

const createStyles = (colors) => ({
  button: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%'
  },

  editableTile: {
    flex: 1,
    marginBottom: 0,
    width: '100%'
  },

  marginLeft: {
    marginLeft: normalize(8)
  },

  squareTile: {
    aspectRatio: 1
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
    top: 0,
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
  columns,
  dimensions,
  safeAreaInsets,
  tileSizeFactor = 1
}: {
  columns: number;
  dimensions: { width: number; height: number };
  safeAreaInsets: EdgeInsets;
  tileSizeFactor?: number;
}) => {
  const containerPadding = normalize(14);
  const safeColumns = Math.max(1, columns);
  const availableWidth =
    dimensions.width - safeAreaInsets.left - safeAreaInsets.right - 2 * containerPadding;

  // calculate tile sizes based on live window dimensions, safe area insets and padding
  const tileSize = Math.max(0, availableWidth) / safeColumns;
  const computedBigTileSize = Math.min(
    tileSize,
    (tileSize - containerPadding / 2) * tileSizeFactor
  );
  const bigTileSize = Math.max(0, computedBigTileSize);

  return StyleSheet.create({
    bigTile: {
      height: bigTileSize,
      marginBottom: 0,
      width: bigTileSize
    },
    bigTileTitle: {
      marginBottom: 0,
      width: bigTileSize
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
