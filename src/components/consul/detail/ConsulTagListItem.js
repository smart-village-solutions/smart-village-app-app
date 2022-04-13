import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { RegularText } from '../../Text';
// import { colors } from '../../../config';

export const ConsulTagListItem = ({ item, onPress }) => {
  const { name } = item.item;

  return (
    <TouchableOpacity style={styles.tagContainer} onPress={onPress} activeOpacity={1}>
      {/* TODO: Touchable will be added to filter  */}
      <RegularText small style={styles.tagText}>
        {name},
      </RegularText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    // backgroundColor: colors.borderRgba,
    // margin: 5,
    // borderRadius: 5
  },
  tagText: {
    // padding: 10
  }
});

ConsulTagListItem.propTypes = {
  item: PropTypes.object.isRequired,
  onPress: PropTypes.object
};
