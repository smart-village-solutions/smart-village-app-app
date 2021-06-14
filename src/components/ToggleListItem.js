import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize } from '../config';

import { Switch } from './Switch';
import { BoldText } from './Text';
import { Touchable } from './Touchable';
import { WrapperRow } from './Wrapper';

// TODO: snack bar / toast als nutzerinfo
export const ToggleListItem = ({ item, index, section }) => {
  const { title, bottomDivider, topDivider, value, onActivate, onDeactivate } = item;

  const [loading, setLoading] = useState(false);
  const [switchValue, setSwitchValue] = useState(value);

  const toggleSwitch = (newSwitchValue) => {
    setLoading(true);

    setSwitchValue(newSwitchValue);

    if (newSwitchValue && onActivate) {
      onActivate(() => setSwitchValue(false));
    } else if (!newSwitchValue && onDeactivate) {
      onDeactivate(() => setSwitchValue(true));
    }

    // imitate a short duration of toggling taking action
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const onPress = () => toggleSwitch(!switchValue);

  return (
    <ListItem
      title={title && <BoldText>{title}</BoldText>}
      bottomDivider={
        // do not show a bottomDivider after last entry
        bottomDivider !== undefined || index < section.data.length - 1
      }
      topDivider={topDivider ?? false}
      containerStyle={{
        backgroundColor: colors.transparent,
        paddingVertical: normalize(12)
      }}
      rightIcon={
        <WrapperRow>
          {loading && <ActivityIndicator color={colors.accent} style={styles.marginRight} />}
          <Switch switchValue={switchValue} toggleSwitch={toggleSwitch} />
        </WrapperRow>
      }
      onPress={onPress}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`${title} (Taste)`}
    />
  );
};

const styles = StyleSheet.create({
  marginRight: {
    marginRight: normalize(7)
  }
});

ToggleListItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired
};
