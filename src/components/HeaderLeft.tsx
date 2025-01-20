import { HeaderBackButtonProps } from '@react-navigation/elements';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, device, Icon, normalize } from '../config';

// TODO: can this be exchanged with https://reactnavigation.org/docs/elements/#headerbackbutton?
export const HeaderLeft = ({ onPress, backImage }: HeaderBackButtonProps) => {
  if (!onPress && !backImage) {
    return device.platform == 'android' ? <Icon.ArrowLeft color={colors.surface} /> : null;
  }

  if (!onPress && backImage) {
    return <View>{backImage({ tintColor: colors.darkText })}</View>;
  }

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={consts.a11yLabel.backIcon}
        accessibilityHint={consts.a11yLabel.backIconHint}
      >
        {backImage ? (
          backImage({ tintColor: colors.lightestText })
        ) : (
          <Icon.ArrowLeft color={colors.lightestText} style={styles.icon} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
