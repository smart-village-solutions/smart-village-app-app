import React from 'react';
import { TouchableOpacity } from 'react-native';

import { colors, consts, Icon, texts } from '../../config';

const a11yText = consts.a11yLabel;

export const InputSecureTextIcon = ({
  isSecureTextEntry,
  setIsSecureTextEntry
}: {
  isSecureTextEntry: boolean;
  setIsSecureTextEntry: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <TouchableOpacity
    accessibilityLabel={
      isSecureTextEntry
        ? `${texts.accessibilityLabels.secureInputIcons.visible} ${a11yText.button}`
        : `${texts.accessibilityLabels.secureInputIcons.invisible} ${a11yText.button}`
    }
    onPress={() => setIsSecureTextEntry(!isSecureTextEntry)}
  >
    {isSecureTextEntry ? (
      <Icon.Visible color={colors.darkText} />
    ) : (
      <Icon.Unvisible color={colors.darkText} />
    )}
  </TouchableOpacity>
);
