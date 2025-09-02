import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Divider, Header } from 'react-native-elements';
import { useMutation } from 'react-query';

import { colors, consts, normalize, texts } from '../../config';
import { useComments } from '../../hooks';
import { uploadFile } from '../../queries/volunteer';
import { VolunteerComment, VolunteerObjectModelType } from '../../types';
import { Button } from '../Button';
import { Input } from '../form';
import { MultiImageSelector } from '../selectors';
import { BoldText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

export const VolunteerCommentModal = ({
  authToken,
  comment,
  isCollapsed,
  objectId,
  objectModel,
  setIsCollapsed
}: {
  authToken: string | null;
  comment?: {
    id: number;
    message: string;
    files: {
      id: number;
      guid: string;
      mime_type: string;
    }[];
  };
  isCollapsed: boolean;
  objectId: number;
  objectModel: VolunteerObjectModelType;
  setIsCollapsed: (isCollapsed: boolean) => void;
}) => {
  const isEdit = !!comment;
  const { createComment, deleteComment, updateComment } = useComments({ objectId, objectModel });

  const {
    control,
    handleSubmit,
    reset: resetForm,
    setValue
  } = useForm<VolunteerComment>({
    defaultValues: {
      id: comment?.id,
      message: comment?.message || '',
      files: comment?.files ? JSON.stringify(comment.files) : '[]'
    }
  });

  useEffect(() => {
    setValue('id', comment?.id);
    setValue('message', comment?.message || '');
    setValue('files', comment?.files ? JSON.stringify(comment.files) : '[]');
  }, [comment]);

  const { mutateAsync: mutateAsyncUpload } = useMutation(uploadFile);

  const onPress = async (commentData: VolunteerComment) => {
    if (!commentData.message) return;
    if (isEdit && !commentData.id) return;

    resetForm();
    Keyboard.dismiss();
    (isEdit
      ? updateComment(commentData.id as number, commentData.message)
      : createComment(commentData.message)
    ).then(async ({ id }: { id: number }) => {
      if (id) {
        const files = JSON.parse(commentData.files) || [];

        await Promise.all(
          files
            .filter((file) => file.uri)
            .map(
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
      onRequestClose={() => {
        resetForm();
        setIsCollapsed(true);
      }}
      presentationStyle="pageSheet"
      visible={!isCollapsed}
    >
      <Header
        backgroundColor={colors.transparent}
        centerComponent={{
          text: isEdit ? texts.volunteer.commentEdit : texts.volunteer.commentNew,
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
          onPress: () => {
            resetForm();
            setIsCollapsed(true);
          },
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
            label={texts.volunteer.commentLabel}
            minHeight={normalize(100)}
            multiline
            name="message"
            placeholder={texts.volunteer.commentLabel}
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
                  authToken,
                  control,
                  errorType: IMAGE_SELECTOR_ERROR_TYPES.VOLUNTEER,
                  field,
                  item: {
                    buttonTitle: texts.volunteer.addImage,
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
                texts.volunteer.commentDelete,
                texts.volunteer.commentDeleteConfirm,
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
                      await deleteComment(comment?.id);
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
            <BoldText small>{texts.volunteer.commentDelete}</BoldText>
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
