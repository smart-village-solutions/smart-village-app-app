import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, consts, device, Icon, normalize } from '../../config';
import { OrientationContext } from '../../OrientationProvider';
import { Image } from '../Image';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';

export const ServiceTile = ({
  item,
  hasDiagonalGradientBackground = false
}: {
  item: any;
  hasDiagonalGradientBackground?: boolean;
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { orientation, dimensions } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ServiceBox orientation={orientation} dimensions={dimensions} bigTile={!!item.tile}>
      <TouchableOpacity
        onPress={() => navigation.push(item.routeName, item.params)}
        accessibilityLabel={
          item.accessibilityLabel
            ? `(${item.accessibilityLabel}) ${consts.a11yLabel.button}`
            : undefined
        }
      >
        <View>
          {item.iconName ? (
            <Icon.NamedIcon
              color={hasDiagonalGradientBackground ? colors.lightestText : undefined}
              name={item.iconName}
              size={30}
              style={styles.serviceIcon}
            />
          ) : (
            <Image
              source={{ uri: item.icon || item.tile }}
              style={[
                styles.serviceImage,
                !!item.tile && stylesWithProps({ orientation, safeAreaInsets }).bigTile
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
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({
  orientation,
  safeAreaInsets
}: {
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
      height: tileSize,
      width: tileSize,
      marginBottom: 0
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
