import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Divider, Header } from 'react-native-elements';
import { useMutation } from 'react-query';

import { colors, consts, normalize, texts } from '../../config';
import { postDelete, postEdit, postNew, uploadFile } from '../../queries/volunteer';
import { VolunteerPost } from '../../types';
import { Button } from '../Button';
import { Input } from '../form';
import { MultiImageSelector } from '../selectors';
import { BoldText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

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
    files: {
      id: number;
      guid: string;
      mime_type: string;
    }[];
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
      id: post?.id,
      message: post?.message || '',
      files: post?.files ? JSON.stringify(post?.files) : '[]'
    }
  });

  useEffect(() => {
    setValue('id', post?.id);
    setValue('message', post?.message || '');
    setValue('files', post?.files ? JSON.stringify(post.files) : '[]');
  }, [post]);

  const { mutateAsync } = useMutation(isEdit ? postEdit : postNew);
  const { mutateAsync: mutateAsyncUpload } = useMutation(uploadFile);
  const { mutateAsync: mutateAsyncDelete } = useMutation(postDelete);

  const onPress = async (postData: VolunteerPost) => {
    resetForm();
    Keyboard.dismiss();
    mutateAsync(
      isEdit
        ? { id: postData.id, message: postData.message }
        : { contentContainerId: postData.contentContainerId, message: postData.message }
    ).then(async ({ id }: { id: number }) => {
      if (id) {
        const files = JSON.parse(postData.files) || [];

        await Promise.all(
          files.map(
            async ({ uri, mimeType }) => await mutateAsyncUpload({ id, fileUri: uri, mimeType })
          )
        );
      }

      setIsCollapsed(true);
    });
  };

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

      <ScrollView>
        <Wrapper>
          {!isEdit && <Input name="contentContainerId" hidden control={control} />}
          {!!isEdit && <Input name="id" hidden control={control} />}
          <Input
            control={control}
            label={texts.volunteer.postLabel}
            minHeight={normalize(100)}
            multiline
            name="message"
            placeholder={texts.volunteer.postLabel}
            renderErrorMessage={false}
            rules={{ required: true }}
            textAlignVertical="top"
            textContentType="none"
          />
        </Wrapper>

        <Wrapper>
          <Controller
            name="files"
            render={({ field }) => (
              <MultiImageSelector
                {...{
                  control,
                  errorType: IMAGE_SELECTOR_ERROR_TYPES.VOLUNTEER,
                  field,
                  isDeletable: !isEdit,
                  isMultiImages: true,
                  item: {
                    buttonTitle: texts.noticeboard.addImages,
                    name: 'files'
                  },
                  selectorType: IMAGE_SELECTOR_TYPES.VOLUNTEER
                }}
              />
            )}
            control={control}
          />
        </Wrapper>
      </ScrollView>

      <Divider />

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
          <TouchableOpacity
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
          </TouchableOpacity>
        )}
      </Wrapper>

      <Wrapper></Wrapper>
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
