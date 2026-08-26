import React, { useContext, useState } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import { consts, Icon, normalize } from '../config';
import { getAccessibilityHeaderEntryEnabled } from '../helpers';
import { useTheme } from '../hooks/useTheme';

import { AccessibilitySettingsModal } from './AccessibilitySettingsModal';
import { HeaderIconButton } from './HeaderIconButton';
import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

type Props = {
  style: StyleProp<ViewStyle>;
};

export const AccessibilityHeader = ({ style }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  if (!getAccessibilityHeaderEntryEnabled(globalSettings)) {
    return null;
  }

  return (
    <>
      <HeaderIconButton
        onPress={() => setIsVisible(true)}
        accessibilityLabel={consts.a11yLabel.accessibilityIcon}
        accessibilityHint={consts.a11yLabel.accessibilityIconHint}
      >
        <Icon.NamedIcon
          name="accessible"
          color={colors.darkText}
          size={HEADER_RIGHT_ICON_SIZE}
          style={[style, styles.icon]}
          strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
        />
      </HeaderIconButton>

      <AccessibilitySettingsModal isVisible={isVisible} onClose={() => setIsVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(3)
  }
});
