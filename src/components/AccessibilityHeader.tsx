import React, { useContext, useState } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import { colors, consts, Icon, normalize } from '../config';
import { getAccessibilityHeaderEntryEnabled } from '../helpers';

import { AccessibilitySettingsModal } from './AccessibilitySettingsModal';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

type Props = {
  style: StyleProp<ViewStyle>;
};

export const AccessibilityHeader = ({ style }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const [isVisible, setIsVisible] = useState(false);

  if (!getAccessibilityHeaderEntryEnabled(globalSettings)) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        accessibilityLabel={consts.a11yLabel.accessibilityIcon}
        accessibilityHint={consts.a11yLabel.accessibilityIconHint}
        accessibilityRole="button"
      >
        <Icon.NamedIcon
          name="accessible"
          color={colors.darkText}
          style={[style, styles.icon]}
          strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
        />
      </TouchableOpacity>

      <AccessibilitySettingsModal isVisible={isVisible} onClose={() => setIsVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(3)
  }
});
