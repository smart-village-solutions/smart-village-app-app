import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize } from '../config';
import { Icon } from './Icon';
import { Switch } from './Switch';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { WrapperHorizontal, WrapperRow } from './Wrapper';

const previewListItem = {
  title: 'Proident tempor aliqua',
  name: 'Id duis nisi reprehenderit ut',
  category: 'Lorem ipsum',
  image: 'https://via.placeholder.com/400.png/bcbbc1/fff?text=Lorem+ipsum',
  topDivider: true
};

// TODO: toggle mit alert für matomo
// TODO: snack bar / toast als nutzerinfo
// TODO: overlay for selecting text list type: https://reactnativeelements.com/docs/1.2.0/overlay
export const SettingsListItem = ({ item, index, section, orientation, dimensions }) => {
  const { title, bottomDivider, topDivider, type, listSelection, Component } = item;

  const [loading, setLoading] = useState(false);
  // TODO: initial value from global settings
  const [switchValue, setSwitchValue] = useState(false);

  const toggleSwitch = () => setSwitchValue((previousState) => !previousState);

  // TODO: make loading state depend on real action
  useEffect(() => {
    setLoading(true);
    // imitate a short duration of something taking action
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [switchValue]);

  const onPress = () =>
    type === 'toggle' ? toggleSwitch() : console.warn(`${title} - ${listSelection}`);

  return (
    <ListItem
      title={
        type === 'toggle'
          ? title && <BoldText>{title}</BoldText>
          : title && (
            <View>
              <WrapperRow>
                <BoldText>{title}</BoldText>
                <RegularText> - </RegularText>
                <RegularText>{listSelection}</RegularText>
              </WrapperRow>
              <RegularText small></RegularText>
              <WrapperHorizontal>
                <Component
                  item={previewListItem}
                  horizontal
                  orientation={orientation}
                  dimensions={dimensions}
                />
              </WrapperHorizontal>
            </View>
          )
      }
      bottomDivider={
        // do not show a bottomDivider after last entry
        bottomDivider !== undefined || index < section.data.length - 1
      }
      topDivider={topDivider !== undefined ? topDivider : false}
      containerStyle={{
        backgroundColor: colors.transparent,
        paddingVertical: normalize(12)
      }}
      rightIcon={
        type === 'toggle' ? (
          <WrapperRow>
            {loading && <ActivityIndicator color={colors.accent} style={styles.marginRight} />}
            <Switch switchValue={switchValue} setSwitchValue={setSwitchValue} />
          </WrapperRow>
        ) : (
          <Icon name="md-create" size={22} style={styles.rightContentContainer} />
        )
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
  },
  rightContentContainer: {
    alignSelf: 'flex-start'
  }
});

SettingsListItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};
