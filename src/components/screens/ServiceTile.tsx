import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { ComponentProps, useCallback, useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, consts, device, Icon, IconSet, normalize } from '../../config';
import { OrientationContext } from '../../OrientationProvider';
import { Image } from '../Image';
import { Badge } from '../profile';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';

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
  tile?: string;
  tileSizeFactor?: number;
  title: string;
};

/* eslint-disable complexity */
export const ServiceTile = ({
  draggableId,
  hasDiagonalGradientBackground = false,
  isEditMode = false,
  item,
  onToggleVisibility,
  tileSizeFactor = 1
}: {
  draggableId: string;
  hasDiagonalGradientBackground?: boolean;
  isEditMode?: boolean;
  item: TServiceTile;
  onToggleVisibility: (
    toggleableId: string,
    isVisible: boolean,
    setIsVisible: (isVisible: boolean) => void
  ) => void;
  tileSizeFactor?: number;
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

  return (
    <ServiceBox
      orientation={orientation}
      dimensions={dimensions}
      bigTile={!!item.tile}
      numberOfTiles={item?.numberOfTiles}
    >
      <TouchableOpacity
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
        <View style={!isVisible && styles.invisible}>
          {item.iconName ? (
            <Icon.NamedIcon
              color={hasDiagonalGradientBackground ? colors.lightestText : undefined}
              name={item.iconName}
              size={normalize(30)}
              style={styles.serviceIcon}
            />
          ) : (
            <Image
              source={{ uri: item.icon || item.tile }}
              childrenContainerStyle={[
                styles.serviceImage,
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
  serviceIcon: {
    alignSelf: 'center',
    paddingVertical: normalize(7.5)
  },
  serviceImage: {
    alignSelf: 'center',
    height: normalize(40),
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
