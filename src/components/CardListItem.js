import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Card } from 'react-native-elements';
import { Platform, StyleSheet, View } from 'react-native';

import { colors, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { Image } from './Image';
import { RegularText, BoldText } from './Text';
import { Touchable } from './Touchable';
import { WrapperWithOrientation } from './Wrapper';
import { OrientationContext } from '../OrientationProvider';

export const CardListItem = ({ navigation, horizontal, item }) => {
  const { routeName, params, image, category, name } = item;
  const { orientation } = useContext(OrientationContext);

  return (
    <Touchable
      onPress={() =>
        navigation.navigate({
          routeName,
          params
        })
      }
    >
      <WrapperWithOrientation orientation={orientation}>
        <Card
          containerStyle={[
            Platform.select({
              android: {
                elevation: 0
              },
              ios: {
                shadowColor: colors.transparent
              }
            }),
            stylesWithProps(this.props).container
          ]}
        >
          <View style={stylesWithProps(this.props).contentContainer}>
            {!!image && <Image source={{ uri: image }} style={stylesWithProps(this.props).image} />}
            {!!category && <RegularText small>{category}</RegularText>}
            {!!name && (
              <BoldText>
                {horizontal ? (name.length > 60 ? name.substring(0, 60) + '...' : name) : name}
              </BoldText>
            )}
          </View>
        </Card>
      </WrapperWithOrientation>
    </Touchable>
  );
};

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */

export const stylesWithProps = () => {
  const { orientation, dimensions } = useContext(OrientationContext);
  // image width should be only 70% when rendering horizontal cards, otherwise substract paddings
  // deleted horizontal logic momentarily because gives a red screen "undefined it's not an object"

  const width = orientation === 'landscape' ? dimensions.height : imageWidth() - 2 * normalize(14);

  return StyleSheet.create({
    container: {
      backgroundColor: colors.transparent,
      borderWidth: 0,
      margin: 0,
      padding: normalize(14)
    },
    contentContainer: {
      width
    },
    image: {
      borderRadius: 5,
      marginBottom: normalize(7),
      height: imageHeight(width)
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

CardListItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  horizontal: PropTypes.bool,
  orientation: PropTypes.string
};

CardListItem.defaultProps = {
  horizontal: false
};
