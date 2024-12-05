import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { ComponentProps, useCallback, useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, consts, device, Icon, IconSet, normalize } from '../../config';
import { OrientationContext } from '../../OrientationProvider';
import { Image } from '../Image';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';

import { LIST_TYPES } from './ServiceTiles';

export type TServiceTile = {
  accessibilityLabel: string;
  icon: string;
  iconName?: ComponentProps<typeof IconSet>['name'];
  image: string;
  isVisible?: boolean;
  params?: any;
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
  listType,
  onToggleVisibility,
  tileSizeFactor = 1
}: {
  draggableId: string;
  hasDiagonalGradientBackground?: boolean;
  isEditMode?: boolean;
  item: TServiceTile;
  listType?: string;
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
    <>
      <ServiceBox orientation={orientation} dimensions={dimensions} bigTile={!!item.tile}>
        <TouchableOpacity
          onPress={onPress}
          accessibilityLabel={
            item.accessibilityLabel
              ? `(${item.accessibilityLabel}) ${consts.a11yLabel.button}`
              : undefined
          }
        >
          {isEditMode && listType === LIST_TYPES.grid && (
            <ToggleVisibilityIcon
              color={colors.placeholder}
              size={normalize(20)}
              style={[
                styles.toggleVisibilityIcon,
                !!item.tile && styles.toggleVisibilityIconBigTile
              ]}
            />
          )}
          <View
            style={[
              !isVisible && styles.invisible,
              listType === LIST_TYPES.list && [styles.listContainer, styles.margin]
            ]}
          >
            <View style={[listType === LIST_TYPES.list && styles.listContainer]}>
              {isEditMode && listType === LIST_TYPES.list && (
                <ToggleVisibilityIcon color={colors.placeholder} size={normalize(20)} />
              )}

              {item.iconName ? (
                <Icon.NamedIcon
                  color={hasDiagonalGradientBackground ? colors.lightestText : undefined}
                  name={item.iconName}
                  size={normalize(30)}
                  style={[
                    styles.serviceIcon,
                    listType === LIST_TYPES.list && isEditMode && styles.margin
                  ]}
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
              {!!item.title && (
                <BoldText
                  small
                  lightest={hasDiagonalGradientBackground}
                  primary={!hasDiagonalGradientBackground}
                  center={listType === LIST_TYPES.grid}
                  accessibilityLabel={`(${item.title}) ${consts.a11yLabel.button}`}
                  style={listType === LIST_TYPES.list && [styles.margin]}
                >
                  {item.title}
                </BoldText>
              )}
            </View>
            {listType === LIST_TYPES.list && !isEditMode && <Icon.ArrowRight />}
          </View>
        </TouchableOpacity>
      </ServiceBox>
      {listType === LIST_TYPES.list && !isEditMode && <Divider />}
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  listContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  margin: {
    marginLeft: normalize(14)
  },
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
