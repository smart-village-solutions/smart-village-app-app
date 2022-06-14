import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { normalize } from 'react-native-elements';

import { colors, consts, Icon } from '../../config';
import { OrientationContext } from '../../OrientationProvider';
import { Image } from '../Image';
import { ServiceBox } from '../ServiceBox';
import { BoldText } from '../Text';

export const ServiceTile = ({
  navigation,
  item,
  hasDiagonalGradientBackground = false
}: {
  navigation: StackNavigationProp<any>;
  item: any;
  hasDiagonalGradientBackground?: boolean;
}) => {
  const { orientation, dimensions } = useContext(OrientationContext);

  return (
    <ServiceBox
      orientation={orientation}
      dimensions={dimensions}
      style={[!!item.tile && styles.bigTileBox]}
    >
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
              style={[styles.serviceImage, !!item.tile && stylesWithProps({ orientation }).bigTile]}
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
  },
  bigTileBox: {
    marginBottom: 0,
    marginTop: 0
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ orientation }: { orientation: string }) => {
  return StyleSheet.create({
    bigTile: {
      height: orientation === 'landscape' ? normalize(94) : normalize(80),
      marginBottom: 0
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
