import React from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation } from 'react-query';

import { colors, Icon, normalize, texts } from '../../config';
import { postNew } from '../../queries/volunteer';
import { VolunteerPost } from '../../types';
import { Input } from '../form';
import { WrapperRow, WrapperVertical } from '../Wrapper';

export const VolunteerPostTextField = ({
  contentContainerId,
  refetch
}: {
  contentContainerId: number;
  refetch: () => void;
}) => {
  const {
    control,
    handleSubmit,
    reset: resetForm
  } = useForm<VolunteerPost>({
    defaultValues: {
      contentContainerId
    }
  });

  const { mutateAsync } = useMutation(postNew);
  const onPress = async (postNewData: VolunteerPost) => {
    resetForm();
    Keyboard.dismiss();
    await mutateAsync(postNewData);
    await refetch();
  };

  return (
    <WrapperVertical>
      <Input name="contentContainerId" hidden control={control} />
      <WrapperRow>
        <Input
          chat
          placeholder={texts.volunteer.postNew}
          name="message"
          multiline
          rules={{ required: true }}
          control={control}
          renderErrorMessage={false}
        />
        <TouchableOpacity onPress={handleSubmit(onPress)} style={styles.button}>
          <Icon.Send color={colors.primary} />
        </TouchableOpacity>
      </WrapperRow>
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
