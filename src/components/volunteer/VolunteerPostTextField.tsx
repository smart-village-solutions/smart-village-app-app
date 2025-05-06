import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../config';
import { Input } from '../form';
import { WrapperRow, WrapperVertical } from '../Wrapper';

export const VolunteerPostTextField = ({ onPress }: { onPress: () => void }) => {
  const { control } = useForm({
    defaultValues: {
      dummy: ''
    }
  });

  return (
    <WrapperVertical>
      <TouchableOpacity onPress={onPress}>
        <WrapperRow pointerEvents="none">
          <Input
            disabled
            chat
            placeholder={texts.volunteer.postNew}
            name="dummy"
            control={control}
            renderErrorMessage={false}
          />
          <View style={styles.button}>
            <Icon.Send color={colors.primary} />
          </View>
        </WrapperRow>
      </TouchableOpacity>
    </WrapperVertical>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    alignItems: 'flex-end',
    marginBottom: normalize(4),
    width: '10%'
  }
});
