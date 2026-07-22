import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, ScrollView, StyleSheet } from 'react-native';

import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../components';
import { Icon, colors, consts, normalize, texts } from '../config';
import { useAppInfo, useMatomoTrackScreenView } from '../hooks';
import { QUERY_TYPES, createQuery } from '../queries';

const { MATOMO_TRACKING, EMAIL_REGEX } = consts;

export const FeedbackScreen = ({ route }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const {
    link,
    linkDescription,
    params = {},
    routeName,
    title = texts.feedbackScreen.inputsLabel.checkbox + ' *'
  } = route.params?.checkbox || {};

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      consent: false,
      email: '',
      message: '',
      name: '',
      phone: ''
    }
  });

  const appInfo = useAppInfo();
  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.FEEDBACK);

  const [createAppUserContent] = useMutation(createQuery(QUERY_TYPES.APP_USER_CONTENT));

  const onInvalid = (validationErrors) => {
    const firstError = Object.values(validationErrors).find(
      (error) => typeof error?.message === 'string'
    );

    if (firstError) {
      Alert.alert(texts.feedbackScreen.inputsErrorMessages.hint, firstError.message);
    }
  };

  const onSubmit = async (createAppUserContentNewData) => {
    Keyboard.dismiss();

    if (!createAppUserContentNewData.consent) {
      return Alert.alert(
        texts.feedbackScreen.inputsErrorMessages.hint,
        texts.feedbackScreen.inputsErrorMessages.checkbox
      );
    }

    const formData = {
      dataType: 'json',
      dataSource: 'form',
      content: JSON.stringify({
        name: createAppUserContentNewData.name,
        email: createAppUserContentNewData.email,
        phone: createAppUserContentNewData.phone,
        message: createAppUserContentNewData.message,
        consent: createAppUserContentNewData.consent,
        appInfo
      })
    };

    setLoading(true);

    try {
      await createAppUserContent({ variables: formData });
      setLoading(false);
      Alert.alert(texts.feedbackScreen.alert.title, texts.feedbackScreen.alert.message, [
        {
          text: texts.feedbackScreen.alert.ok,
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Wrapper>
            <Input
              name="name"
              label={texts.feedbackScreen.inputsLabel.name}
              boldLabel
              placeholder={texts.feedbackScreen.inputsLabel.name}
              control={control}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
            <Input
              name="email"
              label={texts.feedbackScreen.inputsLabel.email}
              boldLabel
              placeholder={texts.feedbackScreen.inputsLabel.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              validate
              rules={{
                pattern: {
                  value: EMAIL_REGEX,
                  message: texts.feedbackScreen.inputsErrorMessages.email
                }
              }}
              errorMessage={errors.email && errors.email.message}
              control={control}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
            <Input
              name="phone"
              label={texts.feedbackScreen.inputsLabel.phone}
              boldLabel
              placeholder={texts.feedbackScreen.inputsLabel.phone}
              keyboardType="phone-pad"
              control={control}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
            <Input
              control={control}
              errorMessage={errors.message && errors.message.message}
              inputStyle={styles.textArea}
              label={texts.feedbackScreen.inputsLabel.message + ' *'}
              multiline
              name="message"
              placeholder={texts.feedbackScreen.inputsLabel.message}
              rules={{ required: texts.feedbackScreen.inputsErrorMessages.message }}
              textAlignVertical="top"
              validate
            />
          </Wrapper>

          <Wrapper noPaddingTop>
            <Controller
              name="consent"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value}
                  checkedIcon={<Icon.SquareCheckFilled />}
                  link={link}
                  linkDescription={linkDescription}
                  navigate={routeName ? () => navigation.navigate(routeName, params) : undefined}
                  onPress={() => onChange(!value)}
                  title={title}
                  uncheckedIcon={<Icon.Square color={colors.placeholder} />}
                />
              )}
              control={control}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
            <Button
              onPress={handleSubmit(onSubmit, onInvalid)}
              title={
                loading
                  ? texts.feedbackScreen.sendButton.disabled
                  : texts.feedbackScreen.sendButton.enabled
              }
              disabled={loading}
            />

            <RegularText smallest placeholder>
              {texts.feedbackScreen.inputsLabel.requiredFields}
            </RegularText>
          </Wrapper>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  textArea: {
    height: normalize(100),
    padding: normalize(10)
  }
});

FeedbackScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object
};
