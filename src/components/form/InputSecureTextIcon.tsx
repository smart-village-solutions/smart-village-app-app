import React from 'react';
import { TouchableOpacity } from 'react-native';

import { colors, Icon } from '../../config';

export const InputSecureTextIcon = ({
  isSecureTextEntry,
  setIsSecureTextEntry
}: {
  isSecureTextEntry: boolean;
  setIsSecureTextEntry: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <TouchableOpacity onPress={() => setIsSecureTextEntry(!isSecureTextEntry)}>
    {isSecureTextEntry ? (
      <Icon.Visible color={colors.darkText} />
    ) : (
      <Icon.Unvisible color={colors.darkText} />
    )}
  </TouchableOpacity>
);
