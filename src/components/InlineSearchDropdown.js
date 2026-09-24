import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Keyboard, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

import { consts, Icon, normalize } from '../config';
import { useTheme } from '../hooks/useTheme';

import { Label } from './Label';
import { RegularText } from './Text';
import { WrapperHorizontal, WrapperRow } from './Wrapper';

// Keep the search input in the form's scroll view so focusing it scrolls the whole page.
export const InlineSearchDropdown = ({
  boldLabel,
  label,
  labelWrapperStyle,
  onSelect,
  onDropdownHeightChange,
  options,
  placeholder,
  renderRow,
  searchInputStyle,
  searchPlaceholder,
  selectedValue,
  styles
}) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filteredOptions = options.filter((entry) =>
    entry.value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  );

  const close = () => {
    Keyboard.dismiss();
    setOpen(false);
    onDropdownHeightChange?.(0);
    setSearch('');
  };

  return (
    <View>
      <WrapperHorizontal style={labelWrapperStyle}>
        <Label bold={boldLabel}>{label}</Label>
      </WrapperHorizontal>
      <TouchableOpacity
        accessibilityLabel={`${label} (${selectedValue}) ${consts.a11yLabel.dropDownMenu}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => (open ? close() : setOpen(true))}
      >
        <WrapperRow style={styles.dropdownTextWrapper}>
          <RegularText
            small
            style={styles.selectedValueText}
            placeholder={selectedValue === placeholder}
            numberOfLines={1}
          >
            {selectedValue}
          </RegularText>
          {open ? <Icon.ArrowUp /> : <Icon.ArrowDown />}
        </WrapperRow>
      </TouchableOpacity>
      {open && (
        <View onLayout={({ nativeEvent }) => onDropdownHeightChange?.(nativeEvent.layout.height)}>
          <View style={[styles.dropdownDropdown, { marginTop: normalize(8) }]}>
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              <TextInput
                accessibilityLabel={`${label}: ${searchPlaceholder}`}
                autoCorrect={false}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.placeholder}
                onChangeText={setSearch}
                style={searchInputStyle}
                value={search}
              />
              {filteredOptions.map((entry, index) => (
                <React.Fragment key={`${entry.id}-${entry.value}`}>
                  {index > 0 && <View style={styles.dropdownSeparator} />}
                  <TouchableOpacity
                    accessibilityLabel={`${entry.value} (${consts.a11yLabel.dropDownMenuItem})`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: !!entry.selected }}
                    onPress={() => {
                      onSelect(index, entry.value);
                      close();
                    }}
                  >
                    {renderRow(entry.value, index, false, false)}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

InlineSearchDropdown.propTypes = {
  boldLabel: PropTypes.bool,
  label: PropTypes.string,
  labelWrapperStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  onSelect: PropTypes.func.isRequired,
  onDropdownHeightChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  renderRow: PropTypes.func.isRequired,
  searchInputStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  searchPlaceholder: PropTypes.string,
  selectedValue: PropTypes.string,
  styles: PropTypes.object.isRequired
};
