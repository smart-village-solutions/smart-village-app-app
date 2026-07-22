import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { device, normalize, texts } from '../config';
import { useTheme } from '../hooks/useTheme';
import { NetworkContext } from '../NetworkProvider';
import { serverConnectionAlert } from '../pushNotifications';

import { Switch } from './Switch';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { WrapperRow } from './Wrapper';

// TODO: snack bar / toast als nutzerinfo
export const SettingsToggle = ({ item, needsConnection = true }) => {
  const { isConnected } = useContext(NetworkContext);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    if (!isConnected && needsConnection) {
      serverConnectionAlert(isConnected, texts.errors.noData);
      return;
    }
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
    }, 1300);
  };

  const onPress = () => toggleSwitch(!switchValue);

  return (
    <ListItem
      accessible={false}
      bottomDivider={bottomDivider ?? false}
      Component={!isDisabled ? Touchable : undefined}
      containerStyle={styles.container}
      delayPressIn={0}
      importantForAccessibility="no"
      onPress={!isDisabled ? onPress : undefined}
      topDivider={topDivider ?? false}
    >
      <ListItem.Content>
        {!!title && <BoldText small>{title}</BoldText>}
        {!!description && <RegularText small>{description}</RegularText>}
      </ListItem.Content>

      <WrapperRow>
        <ActivityIndicator
          color={colors.refreshControl}
          style={[styles.loadingIndicator, !loading && styles.loadingIndicatorHidden]}
        />
        <Switch
          accessibilityLabel={title}
          isDisabled={isDisabled}
          switchValue={switchValue}
          toggleSwitch={toggleSwitch}
        />
      </WrapperRow>
    </ListItem>
  );
};

/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.transparent,
      paddingHorizontal: 0,
      paddingVertical: device.isTablet ? normalize(16) : normalize(10)
    },
    loadingIndicator: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: device.isTablet ? normalize(7) : -normalize(2),
      width: normalize(18)
    },
    loadingIndicatorHidden: {
      opacity: 0
    }
  });
/* eslint-enable react-native/no-unused-styles */

SettingsToggle.propTypes = {
  item: PropTypes.object.isRequired,
  needsConnection: PropTypes.bool
};
