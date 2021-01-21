import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SearchBar } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { WrapperHorizontal } from '../Wrapper';
import { Label } from './Label';

export const TextSearch = memo(({ data, setData, label, placeholder }) => {
  return (
    <View>
      <WrapperHorizontal>
        <Label>{label}</Label>
      </WrapperHorizontal>
      <SearchBar
        value={data}
        onChangeText={(value) => setData(value)}
        onClearText={() => setData('')}
        placeholder={placeholder}
        placeholderTextColor={colors.darkText}
        lightTheme
        containerStyle={styles.containerStyle}
        inputContainerStyle={styles.inputContainerStyle}
        inputStyle={[styles.inputStyle, data.length && styles.marginLeft]}
        leftIconContainerStyle={styles.leftIconContainerStyle}
        rightIconContainerStyle={styles.rightIconContainerStyle}
        searchIcon={data.length ? null : { color: colors.primary, size: normalize(28) }}
        clearIcon={{ color: colors.primary, size: normalize(24) }}
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
    fontFamily: 'titillium-web-regular',
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
  data: PropTypes.string.isRequired,
  setData: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string
};
