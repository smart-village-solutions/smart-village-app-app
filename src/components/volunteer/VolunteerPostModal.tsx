import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  DeviceEventEmitter,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Divider, Header } from 'react-native-elements';
import { useMutation, useQueryClient } from 'react-query';

import { colors, consts, normalize, texts } from '../../config';
import { VOLUNTEER_GROUP_REFRESH_EVENT, VOLUNTEER_STREAM_REFRESH_EVENT } from '../../hooks';
import { postDelete, postEdit, postNew, uploadFile } from '../../queries/volunteer';
import { VolunteerPost } from '../../types';
import { Button } from '../Button';
import { Input } from '../form';
import { MultiImageSelector } from '../selectors';
import { BoldText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

const { IMAGE_SELECTOR_ERROR_TYPES, IMAGE_SELECTOR_TYPES } = consts;

export const VolunteerPostModal = ({
  authToken,
  contentContainerId,
  isCollapsed,
  post,
  setIsCollapsed
}: {
  authToken: string | null;
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
  const [isPublishing, setIsPublishing] = React.useState(false);

  const defaultValues = useMemo(
    () => ({
      contentContainerId,
      id: post?.id,
      message: post?.message || '',
      files: post?.files ? JSON.stringify(post.files) : '[]'
    }),
    [contentContainerId, post?.id, post?.message, post?.files]
  );

  const {
    control,
    handleSubmit,
    reset: resetForm
  } = useForm<VolunteerPost>({
    defaultValues
  });

  useEffect(() => {
    resetForm(defaultValues);
  }, [defaultValues, resetForm]);

  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: isEdit ? postEdit : postNew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stream'] });
    }
  });
  const { mutateAsync: mutateAsyncUpload } = useMutation(uploadFile);
  const { mutateAsync: mutateAsyncDelete } = useMutation({
    mutationFn: postDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stream'] });
    }
  });

  const handleModalClose = () => {
    resetForm({
      ...defaultValues,
      files: '[]'
    });
    setIsCollapsed(true);
  };

  const onPress = async (postData: VolunteerPost) => {
    setIsPublishing(true);
    Keyboard.dismiss();
    mutateAsync(
      isEdit
        ? { id: postData.id, message: postData.message }
        : { contentContainerId: postData.contentContainerId, message: postData.message }
    ).then(async ({ id }: { id: number }) => {
      if (id) {
        const files = JSON.parse(postData.files) || [];

        await Promise.all(
          files
            .filter((file) => file.uri)
            .map(
              async ({ uri, mimeType }) => await mutateAsyncUpload({ id, fileUri: uri, mimeType })
            )
        );
      }

      setIsPublishing(false);
      handleModalClose();

      // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
      // in other components.
      DeviceEventEmitter.emit(VOLUNTEER_STREAM_REFRESH_EVENT);
      DeviceEventEmitter.emit(VOLUNTEER_GROUP_REFRESH_EVENT);
    });
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={handleModalClose}
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
          onPress: handleModalClose,
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
            disabled={isPublishing}
            invert
            notFullWidth
            onPress={handleModalClose}
            title={texts.volunteer.abort}
          />
          <Button
            disabled={isPublishing}
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
                      Keyboard.dismiss();
                      await mutateAsyncDelete({ id: post?.id });
                      handleModalClose();
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
