import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, Modal, Pressable, StyleSheet } from 'react-native';
import { Divider, Header } from 'react-native-elements';
import { useMutation } from 'react-query';

import { colors, normalize, texts } from '../../config';
import { postDelete, postEdit, postNew } from '../../queries/volunteer';
import { VolunteerPost } from '../../types';
import { Button } from '../Button';
import { Input } from '../form';
import { BoldText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

export const VolunteerPostModal = ({
  contentContainerId,
  isCollapsed,
  post,
  setIsCollapsed
}: {
  contentContainerId: number;
  isCollapsed: boolean;
  post?: {
    id: number;
    message: string;
  };
  setIsCollapsed: (isCollapsed: boolean) => void;
}) => {
  const isEdit = !!post;
  const {
    control,
    handleSubmit,
    reset: resetForm,
    setValue
  } = useForm<VolunteerPost>({
    defaultValues: {
      contentContainerId,
      id: post?.id || undefined,
      message: post?.message || ''
    }
  });

  useEffect(() => {
    setValue('id', post?.id || undefined);
    setValue('message', post?.message || '');
  }, [post]);

  const { mutateAsync } = useMutation(isEdit ? postEdit : postNew);
  const onPress = async (postData: VolunteerPost) => {
    resetForm();
    Keyboard.dismiss();
    await mutateAsync(postData);
    setIsCollapsed(true);
  };
  const { mutateAsync: mutateAsyncDelete } = useMutation(postDelete);

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => setIsCollapsed(!isCollapsed)}
      presentationStyle="pageSheet"
      visible={!isCollapsed}
    >
      <Header
        backgroundColor={colors.transparent}
        centerComponent={{
          text: isEdit ? texts.volunteer.postEdit : texts.volunteer.postNew,
          style: {
            color: colors.darkText,
            fontFamily: 'condbold',
            fontSize: normalize(18),
            lineHeight: normalize(23)
          }
        }}
        rightComponent={{
          color: colors.darkText,
          icon: 'close',
          onPress: () => setIsCollapsed(!isCollapsed),
          type: 'ionicon'
        }}
        rightContainerStyle={styles.headerRightContainer}
      />
      <Divider />
      <Wrapper>
        {!isEdit && <Input name="contentContainerId" hidden control={control} />}
        {!!isEdit && <Input name="id" hidden control={control} />}
        <Input
          label={texts.volunteer.postLabel}
          placeholder={texts.volunteer.postLabel}
          name="message"
          multiline
          minHeight={normalize(100)}
          textContentType="none"
          rules={{ required: true }}
          control={control}
          renderErrorMessage={false}
        />
      </Wrapper>

      <Wrapper>
        <WrapperRow spaceAround>
          <Button
            invert
            notFullWidth
            onPress={() => {
              resetForm();
              setIsCollapsed(true);
            }}
            title={texts.volunteer.abort}
          />
          <Button
            notFullWidth
            onPress={handleSubmit(onPress)}
            title={isEdit ? texts.volunteer.save : texts.volunteer.publish}
          />
        </WrapperRow>

        {!!isEdit && (
          <Pressable
            onPress={() => {
              Alert.alert(
                texts.volunteer.postDelete,
                texts.volunteer.postDeleteConfirm,
                [
                  {
                    text: texts.volunteer.abort,
                    style: 'cancel'
                  },
                  {
                    text: texts.volunteer.delete,
                    onPress: async () => {
                      resetForm();
                      Keyboard.dismiss();
                      await mutateAsyncDelete({ id: post?.id });
                      setIsCollapsed(true);
                    },
                    style: 'destructive'
                  }
                ],
                { cancelable: true }
              );
            }}
            style={styles.button}
          >
            <BoldText small>{texts.volunteer.postDelete}</BoldText>
          </Pressable>
        )}
      </Wrapper>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    padding: 8
  },
  headerRightContainer: {
    justifyContent: 'center'
  }
});
