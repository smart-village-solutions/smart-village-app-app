import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, Icon, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';

import { SafeAreaViewFlex } from './SafeAreaViewFlex';
import { RegularText } from './Text';
import { Wrapper } from './Wrapper';

export const EmptyMessage = ({ title, showIcon = true }) => {
  return (
    <SafeAreaViewFlex>
      <Wrapper>
        {showIcon && (
          <View style={styles.paddingContainer}>
            <Icon.EmptySection color={colors.placeholder} size={imageHeight(imageWidth()) / 2} />
          </View>
        )}

        <RegularText placeholder small center>
          {title}
        </RegularText>
      </Wrapper>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  paddingContainer: {
    alignItems: 'center',
    paddingVertical: normalize(20)
  }
});

EmptyMessage.propTypes = {
  title: PropTypes.string.isRequired,
  showIcon: PropTypes.bool
};
