import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Dropdown from 'react-native-modal-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, consts, device, Icon, normalize, texts } from '../config';
import { baseFontStyle } from '../config/styles/baseFontStyle';
import { OrientationContext } from '../OrientationProvider';

import { Label } from './Label';
import { RegularText } from './Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from './Wrapper';

const { a11yLabel } = consts;

export const DropdownSelect = ({
  boldLabel = false,
  data,
  errorMessage,
  multipleSelect,
  setData,
  label,
  labelWrapperStyle,
  placeholder,
  showSearch,
  searchInputStyle,
  renderSearch,
  searchPlaceholder
}) => {
  const dropdownRef = useRef();
  const { orientation } = useContext(OrientationContext);
  const { left: safeAreaLeft } = useSafeAreaInsets();

  const marginHorizontal = normalize(14) + safeAreaLeft;

  const adjustFrame = useCallback(
    (styles) => ({
      ...styles,
      height: styles.height + normalize(36), // space for four entries
      left: marginHorizontal,
      marginTop: device.platform === 'android' ? -normalize(24) : 0
    }),
    [marginHorizontal]
  );

  const [arrow, setArrow] = useState('down');
  const selectedData = data?.find((entry) => entry.selected);
  const selectedValue = selectedData?.value;
  const selectedIndex = selectedData?.index;
  const selectedMultipleData = data?.filter((entry) => entry.selected);
  const selectedMultipleValues = selectedMultipleData?.map((entry) => entry.value).join(', ');

  const renderRow = useCallback(
    (rowData, rowID, highlighted) => {
      if (multipleSelect) {
        highlighted = selectedMultipleValues.includes(rowData);
      }

      return (
        <Wrapper
          accessibilityLabel={`${rowData} (${a11yLabel.dropDownMenuItem})`}
          accessible
          style={styles.dropdownRowWrapper}
        >
          <RegularText primary={highlighted} placeholder={rowData == placeholder}>
            {rowData}
          </RegularText>
        </Wrapper>
      );
    },
    [data]
  );

  const preselect = (index) => dropdownRef.current.select(index);

  useEffect(() => {
    preselect(selectedIndex);
  }, [selectedData]);

  const accessibilityLabel = multipleSelect ? selectedMultipleValues : selectedValue;
  return (
    <View
      accessibilityLabel={`${label} (${accessibilityLabel}) ${a11yLabel.dropDownMenu} (${texts.accessibilityLabels.dropDownMenu.closed})`}
      accessible
    >
      <WrapperHorizontal style={labelWrapperStyle}>
        <Label bold={boldLabel}>{label}</Label>
      </WrapperHorizontal>
      <Dropdown
        accessible={false}
        ref={dropdownRef}
        options={data.map((entry) => entry.value)}
        multipleSelect={multipleSelect}
        dropdownStyle={[
          styles.dropdownDropdown,
          {
            width:
              (orientation === 'portrait' ? device.width : device.height) - 2 * marginHorizontal
          }
        ]}
        dropdownTextStyle={styles.dropdownDropdownText}
        adjustFrame={adjustFrame}
        renderRow={renderRow}
        renderSeparator={() => <View style={styles.dropdownSeparator} />}
        onDropdownWillShow={() => setArrow('up')}
        onDropdownWillHide={() => setArrow('down')}
        onSelect={(index, value) => {
          let updatedData = [...data];

          if (multipleSelect) {
            updatedData = updatedData.map((entry) => {
              if (entry.value === value) {
                entry.selected = !entry.selected;
              }

              return entry;
            });
          } else {
            // only trigger onPress if a new selection is made
            if (selectedValue === value) return;

            updatedData = updatedData.map((entry) => ({
              ...entry,
              selected: entry.value === value
            }));
          }

          setData(updatedData);
        }}
        showSearch={showSearch}
        searchInputStyle={searchInputStyle}
        renderSearch={renderSearch}
        searchPlaceholder={searchPlaceholder}
        keyboardShouldPersistTaps="handled"
      >
        <WrapperRow
          style={[styles.dropdownTextWrapper, !errorMessage && { marginBottom: normalize(8) }]}
        >
          <RegularText
            style={styles.selectedValueText}
            placeholder={selectedValue == placeholder}
            numberOfLines={1}
          >
            {multipleSelect ? selectedMultipleValues : selectedValue}
          </RegularText>
          {arrow === 'down' ? <Icon.ArrowDown /> : <Icon.ArrowUp />}
        </WrapperRow>
      </Dropdown>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownTextWrapper: {
    alignItems: 'center',
    borderBottomWidth: normalize(1),
    borderColor: colors.gray40,
    borderRadius: normalize(8),
    borderLeftWidth: normalize(1),
    borderRightWidth: normalize(1),
    borderTopWidth: normalize(1),
    flexDirection: 'row',
    minHeight: normalize(42),
    justifyContent: 'space-between',
    paddingHorizontal: normalize(12)
  },
  dropdownDropdown: {
    backgroundColor: colors.surface,
    borderColor: colors.borderRgba,
    borderRadius: 0,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    maxHeight: normalize(320),
    shadowColor: colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  dropdownDropdownText: baseFontStyle,
  dropdownRowWrapper: {
    backgroundColor: colors.surface
  },
  dropdownSeparator: {
    backgroundColor: colors.gray40,
    height: StyleSheet.hairlineWidth
  },
  selectedValueText: { width: '90%' }
});

DropdownSelect.displayName = 'DropdownSelect';
DropdownSelect.propTypes = {
  boldLabel: PropTypes.bool,
  data: PropTypes.array,
  errorMessage: PropTypes.string,
  multipleSelect: PropTypes.bool,
  setData: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  labelWrapperStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  showSearch: PropTypes.bool,
  searchInputStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  renderSearch: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  searchPlaceholder: PropTypes.string
};
