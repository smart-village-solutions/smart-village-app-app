import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, device, normalize } from '../config';

import { Switch } from './Switch';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { WrapperRow } from './Wrapper';

// TODO: snack bar / toast als nutzerinfo
export const SettingsToggle = ({ item }) => {
  const {
    bottomDivider,
    description,
    isDisabled,
    onActivate,
    onDeactivate,
    title,
    topDivider,
    value
  } = item;

  const [loading, setLoading] = useState(false);
  const [switchValue, setSwitchValue] = useState(!!value);

  useEffect(() => {
    setSwitchValue(!!value);
  }, [value]);

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
      accessibilityLabel={`(${title}) ${consts.a11yLabel.button}`}
      bottomDivider={bottomDivider ?? false}
      Component={!isDisabled ? Touchable : undefined}
      containerStyle={styles.container}
      delayPressIn={0}
      onPress={!isDisabled ? onPress : undefined}
      topDivider={topDivider ?? false}
    >
      <ListItem.Content>
        {!!title && <BoldText small>{title}</BoldText>}
        {!!description && <RegularText small>{description}</RegularText>}
      </ListItem.Content>

      <WrapperRow>
        {loading && <ActivityIndicator color={colors.refreshControl} style={styles.marginRight} />}
        <Switch isDisabled={isDisabled} switchValue={switchValue} toggleSwitch={toggleSwitch} />
      </WrapperRow>
    </ListItem>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: device.isTablet ? normalize(16) : normalize(10)
  },
  marginRight: {
    marginRight: device.isTablet ? normalize(7) : -normalize(2)
  }
});

SettingsToggle.propTypes = {
  item: PropTypes.object.isRequired
};
