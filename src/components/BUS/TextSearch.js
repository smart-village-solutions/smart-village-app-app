import PropTypes from 'prop-types';
import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SearchBar } from 'react-native-elements';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { Label } from '../Label';
import { WrapperHorizontal } from '../Wrapper';

const { a11yLabel } = consts;

const SearchIcon = () => (
  <Icon.Search
    accessibilityLabel={`${texts.accessibilityLabels.searchInputIcons.search} ${a11yLabel.button}`}
    color={colors.primary}
    size={normalize(28)}
  />
);

const ClearIcon = ({ onPress }) => (
  <TouchableOpacity
    accessibilityLabel={`${texts.accessibilityLabels.searchInputIcons.delete} ${a11yLabel.button}`}
    activeOpacity={1}
    onPress={onPress}
  >
    <Icon.Close color={colors.primary} size={normalize(24)} />
  </TouchableOpacity>
);

ClearIcon.propTypes = {
  onPress: PropTypes.func.isRequired
};

export const TextSearch = memo(({ blurSignal = 0, data, setData, label, placeholder }) => {
  const inputRef = useRef(null);
  const clearSearch = () => setData('');

  useEffect(() => {
    if (!blurSignal) {
      return;
    }

    inputRef.current?.blur?.();
  }, [blurSignal]);

  return (
    <View>
      <WrapperHorizontal>
        <Label>{label}</Label>
      </WrapperHorizontal>
      <SearchBar
        clearIcon={() => <ClearIcon onPress={clearSearch} />}
        inputRef={inputRef}
        value={data}
        onChangeText={(value) => setData(value)}
        onClearText={clearSearch}
        placeholder={placeholder}
        placeholderTextColor={colors.darkText}
        lightTheme
        containerStyle={styles.containerStyle}
        inputContainerStyle={styles.inputContainerStyle}
        inputStyle={[styles.inputStyle, data.length && styles.marginLeft]}
        leftIconContainerStyle={styles.leftIconContainerStyle}
        rightIconContainerStyle={styles.rightIconContainerStyle}
        searchIcon={() => (data.length ? null : <SearchIcon />)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: colors.backgroundRgba,
    borderColor: colors.borderRgba,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderRgba,
    borderTopColor: colors.borderRgba,
    padding: normalize(6)
  },
  inputStyle: {
    backgroundColor: colors.transparent,
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16)
  },
  marginLeft: {
    marginLeft: normalize(8)
  },
  inputContainerStyle: {
    backgroundColor: colors.transparent
  },
  leftIconContainerStyle: {
    backgroundColor: colors.transparent,
    marginLeft: normalize(6)
  },
  rightIconContainerStyle: {
    backgroundColor: colors.transparent
  }
});

TextSearch.displayName = 'TextSearch';
TextSearch.propTypes = {
  blurSignal: PropTypes.number,
  data: PropTypes.string.isRequired,
  setData: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string
};
