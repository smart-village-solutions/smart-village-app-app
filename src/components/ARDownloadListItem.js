import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { device, normalize } from '../config';

import { BoldText } from './Text';
import { Wrapper } from './Wrapper';

export const ARDownloadListItem = ({ item }) => {
  const { title } = item;

  return (
    <Wrapper style={styles.wrapper}>
      <BoldText>{title}</BoldText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: device.platform === 'ios' ? normalize(16) : normalize(14),
    paddingTop: device.platform === 'ios' ? normalize(16) : normalize(18)
  }
});

ARDownloadListItem.propTypes = {
  item: PropTypes.object.isRequired
};
