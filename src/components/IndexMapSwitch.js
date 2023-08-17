import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { texts } from '../config';

import { Button } from './Button';

export const IndexMapSwitch = ({ filter, setFilter }) => (
  <View style={styles.floatingButtonContainer}>
    <Button
      onPress={() => {
        const selectedFilter = filter.find((entry) => entry.selected);
        const updatedFilter = filter.map((entry) => {
          if (entry.id !== selectedFilter.id) {
            entry.selected = true;
          } else {
            entry.selected = false;
          }

          return entry;
        });

        setFilter(updatedFilter);
      }}
      title={
        filter.find((entry) => entry.selected).title === texts.locationOverview.list
          ? texts.locationOverview.map
          : texts.locationOverview.list
      }
      notFullWidth
    />
  </View>
);

const styles = StyleSheet.create({
  floatingButtonContainer: {
    alignSelf: 'center',
    bottom: '5%',
    position: 'absolute'
  }
});

IndexMapSwitch.propTypes = {
  filter: PropTypes.array.isRequired,
  setFilter: PropTypes.func.isRequired
};
