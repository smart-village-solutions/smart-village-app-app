import React from 'react';
import { TouchableOpacity } from 'react-native';

import { colors, consts, Icon, texts } from '../../config';

const { a11yLabel } = consts;

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
        ? `${texts.accessibilityLabels.secureInputIcons.visible} ${a11yLabel.button}`
        : `${texts.accessibilityLabels.secureInputIcons.invisible} ${a11yLabel.button}`
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
