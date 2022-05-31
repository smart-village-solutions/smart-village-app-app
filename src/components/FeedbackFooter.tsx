import { useNavigation } from '@react-navigation/native';
import React, { FC, useContext } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { texts } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

import { BoldText } from './Text';

export const FeedbackFooter: FC = () => {
  const navigation = useNavigation();
  // @ts-expect-error settings are not properly typed
  const feedbackFooter = useContext(SettingsContext).globalSettings.settings?.feedbackFooter;

  if (!feedbackFooter) return null;

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.navigate(ScreenName.Feedback)} style={styles.button}>
        <BoldText underline placeholder>
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
