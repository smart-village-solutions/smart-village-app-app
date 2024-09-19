import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, Icon, texts } from '../config';
import { SettingsContext } from '../SettingsProvider';

import { Button } from './Button';

export const IndexMapSwitch = ({ filter, setFilter }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

  return (
    <View style={[styles.floatingButtonContainer, stylesWithProps({ navigationType }).position]}>
      <Button
        icon={<Icon.Map color={colors.surface} />}
        iconPosition="left"
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
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    alignSelf: 'center',
    position: 'absolute'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ navigationType }) => {
  return StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '5%' : 0
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

IndexMapSwitch.propTypes = {
  filter: PropTypes.array.isRequired,
  setFilter: PropTypes.func.isRequired
};
