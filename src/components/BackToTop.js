import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, normalize, texts } from '../config';

import { BoldText } from './Text.js';
import { Wrapper } from './Wrapper.js';

export const BackToTop = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Wrapper>
        <Icon.ArrowUp style={styles.icon} />
        <BoldText center primary style={styles.backToTop}>
          {texts.backToTop.toUpperCase()}
        </BoldText>
      </Wrapper>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backToTop: {
    marginTop: normalize(5)
  },
  icon: {
    alignSelf: 'center'
  }
});

BackToTop.propTypes = {
  onPress: PropTypes.func.isRequired
};
