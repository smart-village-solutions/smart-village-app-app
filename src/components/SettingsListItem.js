import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize } from '../config';
import { Icon } from './Icon';
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

// TODO: snack bar / toast als nutzerinfo
// TODO: overlay for selecting text list type: https://reactnativeelements.com/docs/1.2.0/overlay
export const SettingsListItem = ({ item, index, section, orientation, dimensions }) => {
  const { title, bottomDivider, topDivider, listSelection, Component, value } = item;

  const onPress = () => console.warn(`${title} - ${listSelection}`);

  return (
    <ListItem
      title={
        title && (
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
      topDivider={topDivider ?? false}
      containerStyle={{
        backgroundColor: colors.transparent,
        paddingVertical: normalize(12)
      }}
      rightIcon={<Icon name="md-create" size={22} style={styles.rightContentContainer} />}
      onPress={onPress}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`${title} (Taste)`}
    />
  );
};

const styles = StyleSheet.create({
  rightContentContainer: {
    alignSelf: 'flex-start'
  }
});

SettingsListItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  orientation: PropTypes.string.isRequired,
  dimensions: PropTypes.object.isRequired
};
