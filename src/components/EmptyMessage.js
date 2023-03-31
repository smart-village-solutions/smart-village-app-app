import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, Icon, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';

import { SafeAreaViewFlex } from './SafeAreaViewFlex';
import { RegularText } from './Text';
import { Wrapper } from './Wrapper';

export const EmptyMessage = ({ title }) => {
  return (
    <SafeAreaViewFlex>
      <Wrapper>
        <View style={styles.paddingContainer}>
          <Icon.EmptySection color={colors.placeholder} size={imageHeight(imageWidth()) / 2} />
        </View>

        <RegularText placeholder small center>
          {title}
        </RegularText>
      </Wrapper>
    </SafeAreaViewFlex>
  );
};

EmptyMessage.propTypes = {
  title: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  paddingContainer: {
    alignItems: 'center',
    paddingVertical: normalize(20)
  }
});
