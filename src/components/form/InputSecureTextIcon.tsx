import React from 'react';
import { TouchableOpacity } from 'react-native';

import { consts, Icon, texts } from '../../config';
import { useTheme } from '../../hooks/useTheme';

const { a11yLabel } = consts;

export const InputSecureTextIcon = ({
  isSecureTextEntry,
  setIsSecureTextEntry
}: {
  isSecureTextEntry: boolean;
  setIsSecureTextEntry: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      accessibilityLabel={
        isSecureTextEntry
          ? `${texts.accessibilityLabels.secureInputIcons.visible} ${a11yLabel.button}`
          : `${texts.accessibilityLabels.secureInputIcons.invisible} ${a11yLabel.button}`
      }
      accessibilityRole="switch"
      accessibilityState={{ checked: !isSecureTextEntry }}
      onPress={() => setIsSecureTextEntry(!isSecureTextEntry)}
    >
      {isSecureTextEntry ? (
        <Icon.Visible color={colors.darkText} />
      ) : (
        <Icon.Unvisible color={colors.darkText} />
      )}
    </TouchableOpacity>
  );
};
