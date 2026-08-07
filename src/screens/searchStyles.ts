import { StyleSheet } from 'react-native';

import { ThemeColorPalette } from '../types/Theme';

export const createSearchStyles = (colors: ThemeColorPalette) =>
  StyleSheet.create({
    inputContainerStyle: {
      backgroundColor: colors.surfaceElevated
    },
    inputStyle: {
      color: colors.text
    },
    searchBarContainer: {
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      borderTopColor: colors.border
    }
  });
