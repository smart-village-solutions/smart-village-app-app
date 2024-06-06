import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  SafeAreaViewFlex,
  Wrapper
} from '../components';
import { Icon, colors, consts, normalize, texts } from '../config';
import { useAppInfo, useMatomoTrackScreenView } from '../hooks';
import { QUERY_TYPES, createQuery } from '../queries';

const { MATOMO_TRACKING, EMAIL_REGEX } = consts;

export const FeedbackScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

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
      Alert.alert(texts.feedbackScreen.alert.title, texts.feedbackScreen.alert.message);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
    navigation.goBack();
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

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={texts.feedbackScreen.inputsLabel.email}
              boldLabel
              placeholder={texts.feedbackScreen.inputsLabel.email}
              keyboardType="email-address"
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

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="phone"
              label={texts.feedbackScreen.inputsLabel.phone}
              boldLabel
              placeholder={texts.feedbackScreen.inputsLabel.phone}
              keyboardType="phone-pad"
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
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

          <Wrapper style={styles.noPaddingTop}>
            <Controller
              name="consent"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value}
                  checkedIcon={<Icon.SquareCheckFilled />}
                  onPress={() => onChange(!value)}
                  title={texts.feedbackScreen.inputsLabel.checkbox + ' *'}
                  uncheckedIcon={<Icon.Square color={colors.placeholder} />}
                />
              )}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={
                loading
                  ? texts.feedbackScreen.sendButton.disabled
                  : texts.feedbackScreen.sendButton.enabled
              }
              disabled={loading}
            />
          </Wrapper>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  },
  textArea: {
    height: normalize(100),
    padding: normalize(10)
  }
});

FeedbackScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
