import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { RegularText } from '../..';
import { colors } from '../../../config';

export const ConsulTagListItem = ({ item }) => {
  const { name } = item.item;
  return (
    <View style={styles.tagContainer}>
      <RegularText small style={styles.tagText}>
        {name}
      </RegularText>
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    backgroundColor: colors.borderRgba,
    margin: 5,
    borderRadius: 5
  },
  tagText: {
    padding: 10
  }
});

ConsulTagListItem.propTypes = {
  item: PropTypes.object.isRequired
};
