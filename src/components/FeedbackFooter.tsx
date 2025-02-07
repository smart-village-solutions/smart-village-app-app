import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { texts } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

import { BoldText } from './Text';

export const FeedbackFooter = ({ containerStyle }: { containerStyle?: StyleProp<ViewStyle> }) => {
  const navigation = useNavigation();
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { feedbackFooter } = settings;
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);

  if (!feedbackFooter) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable onPress={() => navigation.navigate(ScreenName.Feedback)} style={styles.button}>
        <BoldText underline placeholder={!isReduceTransparencyEnabled}>
          {texts.feedbackLink.toUpperCase()}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
