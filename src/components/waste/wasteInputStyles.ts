import { Platform } from 'react-native';

import { device, normalize } from '../../config';
import { ThemeColorPalette } from '../../types/Theme';

export const createWasteInputStyles = (colors: ThemeColorPalette) => ({
  autoCompleteContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 0
  },

  autoCompleteInputContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    height: normalize(42)
  },

  autoCompleteInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    paddingLeft: normalize(12),
    paddingRight: normalize(6),
    paddingVertical: device.platform === 'ios' ? normalize(10) : normalize(8),
    fontFamily: 'regular',
    fontSize: normalize(14),
    height: normalize(42),
    lineHeight: normalize(20)
  },

  autoCompleteList: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    paddingHorizontal: normalize(6),
    position: 'relative' as const,
    ...Platform.select({
      ios: {
        borderWidth: 0
      },
      android: {
        borderColor: colors.border,
        borderRadius: 0,
        borderWidth: normalize(1),
        maxHeight: normalize(300)
      }
    })
  },

  autoCompleteListContainer: {
    backgroundColor: colors.surfaceElevated,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },

  noPaddingTop: {
    paddingTop: 0
  },

  noBorderTop: {
    borderTopWidth: 0,
    marginTop: normalize(-1)
  }
});
