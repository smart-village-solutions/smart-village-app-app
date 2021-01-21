import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, normalize, texts } from '../config';
import { arrowUp } from '../icons';
import { Icon } from './Icon';
import { BoldText } from './Text.js';
import { Wrapper } from './Wrapper.js';

export const BackToTop = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Wrapper>
        <Icon xml={arrowUp(colors.primary)} style={styles.icon} />
        <BoldText link style={styles.backToTop}>
          {texts.backToTop.toUpperCase()}
        </BoldText>
      </Wrapper>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backToTop: {
    color: colors.primary,
    marginTop: normalize(5),
    textAlign: 'center'
  },
  icon: {
    alignSelf: 'center'
  }
});

BackToTop.propTypes = {
  onPress: PropTypes.func.isRequired
};
