import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { consts, Icon, normalize } from '../config';
import { SueViewType } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { RegularText } from './Text';
import { WrapperRow } from './Wrapper';

export const MapAndListSwitcher = ({
  containerStyle,
  viewType,
  setViewType
}: {
  containerStyle?: ViewStyle;
  viewType: SueViewType;
  setViewType: (viewType: SueViewType) => void;
}) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  return (
    <WrapperRow
      style={[
        containerStyle,
        viewType === SueViewType.List && styles.listViewContainer,
        viewType === SueViewType.Map && styles.mapViewContainer,
        styles.container
      ]}
    >
      {Object.values(SueViewType).map((type, index) => (
        <TouchableOpacity
          accessibilityLabel={`${type} ${consts.a11yLabel.button}`}
          activeOpacity={0.7}
          key={`${type}-${index}`}
          onPress={() => setViewType(type)}
          style={[
            styles.buttonContainer,
            {
              backgroundColor: viewType === type ? colors.primary : colors.secondary
            }
          ]}
        >
          <RegularText smallest lightest>
            {type}
          </RegularText>
          {type === SueViewType.Map ? (
            <Icon.Map color={colors.surface} size={normalize(16)} style={styles.icon} />
          ) : (
            <Icon.List color={colors.surface} size={normalize(12)} style={styles.icon} />
          )}
        </TouchableOpacity>
      ))}
    </WrapperRow>
  );
};

const createStyles = (colors) => ({
  buttonContainer: {
    alignItems: 'center',
    borderRadius: normalize(8),
    flexDirection: 'row',
    justifyContent: 'center',
    padding: normalize(16)
  },

  container: {
    backgroundColor: colors.secondary,
    borderRadius: normalize(8),
    position: 'absolute',
    zIndex: 1
  },

  icon: {
    marginLeft: normalize(6)
  },

  listViewContainer: {
    left: 0,
    top: 0
  },

  mapViewContainer: {
    left: normalize(16),
    top: normalize(16)
  }
});
