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

export class CardListItem extends React.PureComponent {
  render() {
    const { navigation, horizontal, item, orientation } = this.props;
    const { routeName, params, image, category, name } = item;

    return (
      <Touchable
        onPress={() =>
          navigation.navigate({
            routeName,
            params
          })
        }
      >
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
            <WrapperWithOrientation orientation={orientation}>
              {!!image && (
                <Image source={{ uri: image }} style={stylesWithProps(this.props).image} />
              )}
              {!!category && <RegularText small>{category}</RegularText>}
              {!!name && (
                <BoldText>
                  {horizontal ? (name.length > 60 ? name.substring(0, 60) + '...' : name) : name}
                </BoldText>
              )}
            </WrapperWithOrientation>
          </View>
        </Card>
      </Touchable>
    );
  }
}

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
export const stylesWithProps = ({ horizontal }) => {
  const { orientation } = useContext(OrientationContext);
  // image width should be only 70% when rendering horizontal cards, otherwise substract paddings
  // when orientation image width should be device width + double padding TODO: need a fix
  const width = horizontal
    ? imageWidth() * 0.7
    : orientation === 'landscape'
    ? imageWidth() * 0.5
    : imageWidth() - 2 * normalize(14);

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
