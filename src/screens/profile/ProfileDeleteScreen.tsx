import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  HtmlView,
  LoadingModal,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperHorizontal,
  WrapperVertical
} from '../../components';
import { colors, Icon, texts } from '../../config';
import { useAppInfo, useProfileUser, useStaticContent } from '../../hooks';
import { createQuery, QUERY_TYPES } from '../../queries';

export const ProfileDeleteScreen = ({ navigation }: StackScreenProps<any>) => {
  const [loading, setLoading] = useState(false);
  const { currentUserData } = useProfileUser();

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      consent: false,
      email: '',
      message: '',
      name: ''
    }
  });

  const appInfo = useAppInfo();

  const [createAppUserContent] = useMutation(createQuery(QUERY_TYPES.APP_USER_CONTENT));

  const {
    data: dataProfileDeleteScreenTop,
    loading: loadingProfileDeleteScreenTop,
    refetch: refetchProfileDeleteScreenTop
  } = useStaticContent({
    name: 'profileDeleteScreenTop',
    type: 'html'
  });

  const {
    data: dataProfileDeleteScreenBottom,
    loading: loadingProfileDeleteScreenBottom,
    refetch: refetchProfileDeleteScreenBottom
  } = useStaticContent({
    name: 'profileDeleteScreenBottom',
    type: 'html'
  });

  const onSubmit = async (createAppUserContentNewData) => {
    Keyboard.dismiss();

    if (!createAppUserContentNewData.consent) {
      return Alert.alert(texts.profile.hint, texts.profile.deleteProfileConsentOptIn);
    }

    const formData = {
      dataType: 'json',
      dataSource: 'form',
      content: JSON.stringify({
        name:
          [currentUserData?.member?.first_name, currentUserData?.member?.last_name]
            .join(' ')
            .trim() || '',
        email: currentUserData?.member?.email || '',
        message: texts.profile.deleteProfileSubject,
        consent: createAppUserContentNewData.consent,
        action: 'delete_member',
        keycloakId: currentUserData?.member?.keycloak_id || '',
        memberId: currentUserData?.member?.id || '',
        appInfo
      })
    };

    setLoading(true);

    try {
      await createAppUserContent({ variables: formData });
      Alert.alert(texts.profile.deleteProfileAlertTitle, texts.profile.deleteProfileAlertMessage);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    navigation.goBack();
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={loadingProfileDeleteScreenTop || loadingProfileDeleteScreenBottom}
              onRefresh={() => {
                refetchProfileDeleteScreenTop();
                refetchProfileDeleteScreenBottom();
              }}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        >
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.deleteProfile} />
          </WrapperVertical>

          {!!dataProfileDeleteScreenTop && (
            <WrapperHorizontal>
              <HtmlView html={dataProfileDeleteScreenTop} />
            </WrapperHorizontal>
          )}

          <Wrapper style={styles.noPaddingTop}>
            <Controller
              name="consent"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value}
                  checkedIcon={<Icon.SquareCheckFilled />}
                  onPress={() => onChange(!value)}
                  title={texts.profile.deleteProfileConsent + ' *'}
                  uncheckedIcon={<Icon.Square color={colors.placeholder} />}
                />
              )}
              control={control}
            />
          </Wrapper>

          {!!dataProfileDeleteScreenBottom && (
            <WrapperHorizontal>
              <HtmlView html={dataProfileDeleteScreenBottom} />
            </WrapperHorizontal>
          )}

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.deleteProfile}
              disabled={loading}
            />
          </Wrapper>

          <LoadingModal loading={loading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
