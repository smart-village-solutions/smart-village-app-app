import React, { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { colors, normalize } from '../../config';
import { Wrapper } from '../Wrapper';

export const VolunteerMessageTextField = () => {
  const [message, setMessage] = useState('');

  return (
    <Wrapper>
      <TextInput
        onChangeText={(text) => {
          setMessage(text);
        }}
        value={message}
        style={styles.textArea}
        multiline
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  textArea: {
    borderColor: colors.shadow,
    borderWidth: 1,
    padding: normalize(5)
  }
});
