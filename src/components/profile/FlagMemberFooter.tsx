import React, { useContext } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { texts } from '../../config';
import { BoldText } from '../Text';

export const FlagMemberFooter = ({ onPress }: { onPress: () => void }) => {
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);

  return (
    <View style={styles.container}>
      <Pressable onPress={onPress} style={styles.button}>
        <BoldText underline placeholder={!isReduceTransparencyEnabled}>
          {texts.profile.flagProfile.toUpperCase()}
        </BoldText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    padding: 8
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
