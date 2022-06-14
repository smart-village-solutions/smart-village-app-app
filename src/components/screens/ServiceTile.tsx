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
    <ServiceBox orientation={orientation} dimensions={dimensions}>
      <TouchableOpacity
        onPress={() => {
          navigation.push(item.routeName, item.params);
        }}
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
              source={{ uri: item.icon }}
              style={styles.serviceImage}
              PlaceholderContent={null}
              resizeMode="contain"
            />
          )}
          <BoldText
            small
            lightest={hasDiagonalGradientBackground}
            primary={!hasDiagonalGradientBackground}
            center
            accessibilityLabel={`(${item.title}) ${consts.a11yLabel.button}`}
          >
            {item.title}
          </BoldText>
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
