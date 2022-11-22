import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BoldText, Wrapper } from '../../components';

export const NoticeboardSuccessScreen = ({ route }: { route: any }) => {
  const successText = route?.params?.successText ?? '';

  return (
    <View style={styles.containerStyle}>
      <Wrapper>
        <BoldText>{successText}</BoldText>
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});
