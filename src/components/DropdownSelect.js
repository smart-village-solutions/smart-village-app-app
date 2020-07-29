import PropTypes from 'prop-types';
import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Dropdown from 'react-native-modal-dropdown';

import { colors, device, normalize } from '../config';
import { RegularText } from './Text';
import { Wrapper, WrapperRow, WrapperHorizontal } from './Wrapper';
import { Icon } from './Icon';
import { arrowDown, arrowUp } from '../icons';
import { Touchable } from './Touchable';
import { Label } from './Label';

export const DropdownSelect = memo(({ data, setData, label }) => {
  if (!data || !data.length) return null;

  const [arrow, setArrow] = useState('down');
  const selectedData = data.find((entry) => entry.selected);
  const selectedIndex = data.findIndex((entry) => entry.selected);
  const preselect = (index) => this[`dropdown${label}`].select(index);

  useEffect(() => {
    preselect(selectedIndex);
  }, [selectedData]);

  return (
    <View>
      <WrapperHorizontal>
        <Label>{label}</Label>
      </WrapperHorizontal>
      <Dropdown
        ref={(ref) => (this[`dropdown${label}`] = ref)}
        options={data.map((entry) => entry.value)}
        dropdownStyle={styles.dropdownDropdown}
        dropdownTextStyle={styles.dropdownDropdownText}
        adjustFrame={(styles) => ({
          ...styles,
          height: styles.height + normalize(36), // space for four entries
          left: normalize(14),
          marginTop: device.platform === 'android' ? -normalize(24) : 0
        })}
        renderRow={(rowData, rowID, highlighted) => (
          <Touchable>
            <Wrapper>
              <RegularText placeholder={highlighted}>{rowData}</RegularText>
            </Wrapper>
          </Touchable>
        )}
        renderSeparator={() => <View style={styles.dropdownSeparator} />}
        onDropdownWillShow={() => setArrow('up')}
        onDropdownWillHide={() => setArrow('down')}
        onSelect={(index, value) => {
          // only trigger onPress if a new selection is made
          if (selectedData.value === value) return;

          const updatedData = data.map((entry) => ({
            ...entry,
            selected: entry.value === value
          }));

          setData(updatedData);
        }}
      >
        <WrapperRow style={styles.dropdownTextWrapper}>
          <RegularText>{selectedData.value}</RegularText>
          <Icon icon={arrow == 'down' ? arrowDown(colors.primary) : arrowUp(colors.primary)} />
        </WrapperRow>
      </Dropdown>
    </View>
  );
});

const styles = StyleSheet.create({
  dropdownTextWrapper: {
    borderColor: colors.borderRgba,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-between',
    padding: normalize(14)
  },
  dropdownDropdown: {
    borderColor: colors.borderRgba,
    borderRadius: 0,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    width: device.width - normalize(28) // substract two side padding
  },
  dropdownDropdownText: {
    color: colors.darkText,
    fontFamily: 'titillium-web-regular',
    fontSize: normalize(16),
    lineHeight: normalize(22)
  },
  dropdownSeparator: {
    backgroundColor: colors.borderRgba,
    height: StyleSheet.hairlineWidth
  }
});

DropdownSelect.displayName = 'DropdownSelect';
DropdownSelect.propTypes = {
  data: PropTypes.array,
  setData: PropTypes.func,
  label: PropTypes.string
};
