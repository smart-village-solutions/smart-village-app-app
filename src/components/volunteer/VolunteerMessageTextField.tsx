import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation } from 'react-query';

import { colors, Icon, normalize } from '../../config';
import { conversationNewEntry } from '../../queries/volunteer';
import { VolunteerConversation } from '../../types';
import { Input } from '../form';
import { Wrapper, WrapperRow } from '../Wrapper';

export const VolunteerMessageTextField = ({
  conversationId,
  refetch,
  dataCount,
  scrollToBottom
}: {
  conversationId: number;
  refetch: () => void;
  dataCount?: number;
  scrollToBottom: (animated?: boolean) => void;
}) => {
  const { control, handleSubmit, reset: resetForm } = useForm<VolunteerConversation>({
    defaultValues: {
      id: conversationId,
      message: ''
    }
  });

  // needs a small timeout to trigger list scroll to the bottom
  const scrollDown = (ms = 50) => setTimeout(() => scrollToBottom(false), ms);

  const pollMessages = async () => {
    await refetch();
    scrollDown();
  };

  const { mutateAsync, isLoading, isError, data } = useMutation(conversationNewEntry);
  const onPress = async (conversationNewEntryData: VolunteerConversation) => {
    resetForm();
    await mutateAsync(conversationNewEntryData);
    pollMessages();
  };

  // update screen if the count of messages changed
  useEffect(() => {
    pollMessages();
  }, [dataCount]);

  return (
    <Wrapper>
      <Input name="id" hidden control={control} />
      <WrapperRow>
        <Input chat name="message" multiline rules={{ required: true }} control={control} />
        <TouchableOpacity onPress={handleSubmit(onPress)} style={styles.button}>
          <Icon.Mail color={colors.primary} />
        </TouchableOpacity>
      </WrapperRow>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: normalize(10),
    width: '10%'
  }
});
