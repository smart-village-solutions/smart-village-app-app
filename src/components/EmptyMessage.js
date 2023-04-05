import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, Icon, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';

import { SafeAreaViewFlex } from './SafeAreaViewFlex';
import { RegularText } from './Text';
import { Wrapper, WrapperWithOrientation } from './Wrapper';

export const EmptyMessage = ({ title, showIcon }) => {
  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
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
      </WrapperWithOrientation>
    </SafeAreaViewFlex>
  );
};

EmptyMessage.propTypes = {
  title: PropTypes.string.isRequired,
  showIcon: PropTypes.bool
};

EmptyMessage.defaultProps = {
  showIcon: true
};

const styles = StyleSheet.create({
  paddingContainer: {
    alignItems: 'center',
    paddingVertical: normalize(20)
  }
});
