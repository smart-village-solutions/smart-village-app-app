import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Dropdown from 'react-native-modal-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, device, Icon, normalize } from '../config';
import { baseFontStyle } from '../config/styles/baseFontStyle';
import { OrientationContext } from '../OrientationProvider';

import { Label } from './Label';
import { RegularText } from './Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from './Wrapper';

export const DropdownSelect = ({
  data,
  setData,
  label,
  labelWrapperStyle,
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

  if (!data || !data.length) return null;

  const [arrow, setArrow] = useState('down');
  const selectedData = data.find((entry) => entry.selected);
  const selectedIndex = data.findIndex((entry) => entry.selected);
  const preselect = (index) => dropdownRef.current.select(index);

  useEffect(() => {
    preselect(selectedIndex);
  }, [selectedData]);

  return (
    <View>
      <WrapperHorizontal style={labelWrapperStyle}>
        <Label>{label}</Label>
      </WrapperHorizontal>
      <Dropdown
        ref={dropdownRef}
        options={data.map((entry) => entry.value)}
        dropdownStyle={[
          styles.dropdownDropdown,
          {
            width:
              (orientation === 'portrait' ? device.width : device.height) - 2 * marginHorizontal
          }
        ]}
        dropdownTextStyle={styles.dropdownDropdownText}
        adjustFrame={adjustFrame}
        renderRow={(rowData, rowID, highlighted) => (
          <Wrapper style={styles.dropdownRowWrapper}>
            <RegularText primary={highlighted}>{rowData}</RegularText>
          </Wrapper>
        )}
        renderSeparator={() => <View style={styles.dropdownSeparator} />}
        onDropdownWillShow={() => setArrow('up')}
        onDropdownWillHide={() => setArrow('down')}
        onSelect={(index, value) => {
          // only trigger onPress if a new selection is made
          if (selectedData?.value === value) return;

          const updatedData = data.map((entry) => ({
            ...entry,
            selected: entry.value === value
          }));

          setData(updatedData);
        }}
        showSearch={showSearch}
        searchInputStyle={searchInputStyle}
        renderSearch={renderSearch}
        searchPlaceholder={searchPlaceholder}
      >
        <WrapperRow style={styles.dropdownTextWrapper}>
          <RegularText>{selectedData?.value}</RegularText>
          {arrow === 'down' ? <Icon.ArrowDown /> : <Icon.ArrowUp />}
        </WrapperRow>
      </Dropdown>
    </View>
  );
};

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
    shadowRadius: 3
  },
  dropdownDropdownText: baseFontStyle,
  dropdownRowWrapper: {
    backgroundColor: colors.lightestText
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
  label: PropTypes.string,
  labelWrapperStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  showSearch: PropTypes.bool,
  searchInputStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  renderSearch: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  searchPlaceholder: PropTypes.string
};
