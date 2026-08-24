import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Dropdown from 'react-native-modal-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { consts, device, Icon, normalize, texts } from '../config';
import { baseFontStyle } from '../config/styles/baseFontStyle';
import { OrientationContext } from '../OrientationProvider';
import { useTheme } from '../hooks/useTheme';
import { useThemeStyles } from '../hooks/useThemeStyles';

import { Label } from './Label';
import { RegularText } from './Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from './Wrapper';

const { a11yLabel } = consts;

const checkboxAccessibilityLabel = (value, checked) =>
  `${value} (${a11yLabel.dropDownMenuItem}) (${
    checked
      ? texts.accessibilityLabels.checkbox.active
      : texts.accessibilityLabels.checkbox.inactive
  })`;

export const DropdownSelect = ({
  boldLabel = false,
  data,
  errorMessage,
  inlineDropdown = false,
  isOverlayFilter = false,
  label,
  labelWrapperStyle,
  multipleSelect,
  placeholder,
  requireSelection = false,
  renderSearch,
  searchInputStyle,
  searchPlaceholder,
  setData,
  showSearch
}) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const dropdownRef = useRef();
  const { orientation } = useContext(OrientationContext);
  const { left: safeAreaLeft } = useSafeAreaInsets();

  const marginHorizontal = normalize(14) + safeAreaLeft;

  const adjustFrame = useCallback(
    (styles) => ({
      ...styles,
      height: 'auto',
      left: marginHorizontal,
      marginTop:
        device.platform === 'android' ? -normalize(24) : isOverlayFilter ? normalize(65) : 0,
      maxHeight: normalize(320)
    }),
    [isOverlayFilter, marginHorizontal]
  );

  const [arrow, setArrow] = useState('down');
  const selectedData = data?.find((entry) => entry.selected);
  const selectedValue = selectedData?.value;
  const selectedIndex = selectedData?.index;
  const selectedMultipleData = data?.filter((entry) => entry.selected);
  const selectedMultipleValues = selectedMultipleData?.map((entry) => entry.value).join(', ');

  const renderRow = useCallback(
    (rowData, rowID, highlighted, accessible = true) => {
      const row = data.find((entry) => entry.value === rowData);
      highlighted = multipleSelect ? !!row?.selected : selectedValue === rowData;
      const isCheckboxOption = multipleSelect && row?.id !== 0;

      return (
        <Wrapper
          accessibilityLabel={
            isCheckboxOption
              ? checkboxAccessibilityLabel(rowData, highlighted)
              : `${rowData} (${a11yLabel.dropDownMenuItem})`
          }
          accessibilityRole={isCheckboxOption ? 'checkbox' : undefined}
          accessibilityState={isCheckboxOption ? { checked: highlighted } : undefined}
          accessible={accessible}
          style={styles.dropdownRowWrapper}
        >
          <WrapperRow itemsCenter>
            {isCheckboxOption &&
              (highlighted ? (
                <Icon.SquareCheckFilled
                  color={colors.primary}
                  size={normalize(22)}
                  style={styles.checkbox}
                />
              ) : (
                <Icon.Square color={colors.darkText} size={normalize(22)} style={styles.checkbox} />
              ))}
            <RegularText secondary={highlighted} placeholder={rowData == placeholder}>
              {rowData}
            </RegularText>
          </WrapperRow>
        </Wrapper>
      );
    },
    [colors.darkText, colors.primary, data, multipleSelect, placeholder, selectedValue, styles]
  );

  const preselect = (index) => dropdownRef.current?.select(index);

  useEffect(() => {
    preselect(selectedIndex);
  }, [selectedData, selectedIndex]);

  const accessibilityLabel = multipleSelect ? selectedMultipleValues : selectedValue;
  const handleSelect = (index, value) => {
    let updatedData = [...data];

    if (multipleSelect) {
      const selectedOptionCount = updatedData.filter(
        (entry) => entry.id !== 0 && entry.selected
      ).length;
      const selectedEntry = updatedData.find((entry) => entry.value === value);

      if (requireSelection && selectedEntry?.selected && selectedOptionCount === 1) {
        return false;
      }

      updatedData = updatedData.map((entry) => {
        if (entry.value === value) {
          return { ...entry, selected: !entry.selected };
        }

        return entry;
      });

      const anyOtherSelected = updatedData.some((entry, index) => index !== 0 && entry.selected);

      updatedData[0] = { ...updatedData[0], selected: !anyOtherSelected };
    } else {
      // only trigger onPress if a new selection is made
      if (selectedValue === value) return;

      updatedData = updatedData.map((entry) => ({
        ...entry,
        selected: entry.value === value
      }));
    }

    setData(updatedData);

    if (multipleSelect) return false;
  };
  const showInlineDropdown = inlineDropdown && isOverlayFilter && multipleSelect;

  if (showInlineDropdown) {
    return (
      <View>
        <WrapperHorizontal style={labelWrapperStyle}>
          <Label bold={boldLabel}>{label}</Label>
        </WrapperHorizontal>
        <TouchableOpacity
          accessibilityLabel={`${label} (${accessibilityLabel}) ${a11yLabel.dropDownMenu} (${
            arrow === 'down'
              ? texts.accessibilityLabels.dropDownMenu.closed
              : texts.accessibilityLabels.dropDownMenu.open
          })`}
          accessibilityRole="button"
          onPress={() => setArrow((currentArrow) => (currentArrow === 'down' ? 'up' : 'down'))}
        >
          <WrapperRow
            style={[styles.dropdownTextWrapper, !errorMessage && { marginBottom: normalize(8) }]}
          >
            <RegularText
              small
              style={styles.selectedValueText}
              placeholder={selectedValue == placeholder}
              numberOfLines={1}
            >
              {selectedMultipleValues}
            </RegularText>
            {arrow === 'down' ? <Icon.ArrowDown /> : <Icon.ArrowUp />}
          </WrapperRow>
        </TouchableOpacity>
        {arrow === 'up' && (
          <View style={[styles.dropdownDropdown, styles.inlineDropdown]}>
            {data.map((entry, index) => (
              <React.Fragment key={`${entry.id}-${entry.value}`}>
                {index > 0 && <View style={styles.dropdownSeparator} />}
                <TouchableOpacity
                  accessibilityLabel={
                    entry.id !== 0
                      ? checkboxAccessibilityLabel(entry.value, !!entry.selected)
                      : `${entry.value} (${a11yLabel.dropDownMenuItem})`
                  }
                  accessibilityRole={entry.id !== 0 ? 'checkbox' : undefined}
                  accessibilityState={entry.id !== 0 ? { checked: !!entry.selected } : undefined}
                  onPress={() => handleSelect(index, entry.value)}
                >
                  {renderRow(entry.value, index, false, false)}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    );
  }

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
        adjustFrame={adjustFrame}
        dropdownStyle={[
          styles.dropdownDropdown,
          {
            width:
              (orientation === 'portrait' ? device.width : device.height) - 2 * marginHorizontal
          }
        ]}
        dropdownTextStyle={styles.dropdownDropdownText}
        renderRow={renderRow}
        renderSeparator={() => <View style={styles.dropdownSeparator} />}
        onDropdownWillShow={() => setArrow('up')}
        onDropdownWillHide={() => setArrow('down')}
        onSelect={handleSelect}
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
            small
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

const createStyles = (colors) => ({
  checkbox: {
    marginRight: normalize(10)
  },
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
    backgroundColor: colors.lightestText,
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

  inlineDropdown: {
    marginBottom: normalize(8),
    maxHeight: normalize(320),
    overflow: 'hidden'
  },

  dropdownRowWrapper: {
    backgroundColor: colors.lightestText
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
  inlineDropdown: PropTypes.bool,
  isOverlayFilter: PropTypes.bool,
  label: PropTypes.string,
  labelWrapperStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  multipleSelect: PropTypes.bool,
  placeholder: PropTypes.string,
  requireSelection: PropTypes.bool,
  renderSearch: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  searchInputStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  searchPlaceholder: PropTypes.string,
  setData: PropTypes.func,
  showSearch: PropTypes.bool
};
