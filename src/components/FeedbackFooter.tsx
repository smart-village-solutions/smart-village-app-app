import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BoldText } from '.';

export const FeedbackFooter: FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.navigate('Feedback')} style={styles.button}>
        <BoldText underline placeholder>
          FEEDBACK
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
