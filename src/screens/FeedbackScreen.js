import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  SafeAreaViewFlex,
  WrapperWithOrientation
} from '../components';
import { colors, consts, normalize, texts } from '../config';
import { useMatomoTrackScreenView } from '../hooks';
import { useAppInfo } from '../hooks/appInfo';
import { createQuery, QUERY_TYPES } from '../queries';

const { MATOMO_TRACKING, EMAIL_REGEX } = consts;

export const FeedbackScreen = () => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    formState: { errors },
    reset,
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

    const formData = {
      dataType: 'json',
      dataSource: 'form',
      content: JSON.stringify({
        name: createAppUserContentNewData.name,
        email: createAppUserContentNewData.email,
        phone: createAppUserContentNewData.phone,
        message: createAppUserContentNewData.message,
        consent: createAppUserContentNewData.consent,
        appInfo: appInfo
      })
    };

    setLoading(true);

    try {
      await createAppUserContent({ variables: formData });

      Alert.alert(
        texts.feedbackScreen.alert.title,
        texts.feedbackScreen.alert.message,
        [{ text: texts.feedbackScreen.alert.ok, onPress: () => reset() }],
        { cancelable: false }
      );
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <View style={{ padding: normalize(14) }}>
              <Input
                name="name"
                label={texts.feedbackScreen.inputsLabel.name + ' *'}
                boldLabel
                placeholder={texts.feedbackScreen.inputsLabel.name}
                validate
                rules={{ required: texts.feedbackScreen.inputsErrorMessages.name }}
                errorMessage={errors.name && errors.name.message}
                control={control}
                containerStyle={styles.containerStyle}
              />

              <Input
                name="email"
                label={texts.feedbackScreen.inputsLabel.email + ' *'}
                boldLabel
                placeholder={texts.feedbackScreen.inputsLabel.email}
                keyboardType="email-address"
                validate
                rules={{
                  required: texts.feedbackScreen.inputsErrorMessages.email,
                  pattern: {
                    value: EMAIL_REGEX,
                    message: texts.feedbackScreen.inputsErrorMessages.email
                  }
                }}
                errorMessage={errors.email && errors.email.message}
                control={control}
                containerStyle={styles.containerStyle}
              />

              <Input
                name="phone"
                label={texts.feedbackScreen.inputsLabel.phone + ' *'}
                boldLabel
                placeholder={texts.feedbackScreen.inputsLabel.phone}
                keyboardType="phone-pad"
                validate
                rules={{ required: texts.feedbackScreen.inputsErrorMessages.phone }}
                errorMessage={errors.phone && errors.phone.message}
                control={control}
                containerStyle={styles.containerStyle}
              />

              <Input
                name="message"
                label={texts.feedbackScreen.inputsLabel.message + ' *'}
                boldLabel
                placeholder={texts.feedbackScreen.inputsLabel.message}
                keyboardType="phone-pad"
                multiline
                textAlignVertical="top"
                validate
                rules={{ required: texts.feedbackScreen.inputsErrorMessages.message }}
                errorMessage={errors.message && errors.message.message}
                control={control}
                containerStyle={styles.containerStyle}
                inputStyle={styles.textArea}
              />

              <Controller
                name="consent"
                rules={{ required: texts.feedbackScreen.inputsErrorMessages.checkbox }}
                render={({ onChange, value }) => (
                  <>
                    <Checkbox
                      boldTitle
                      title={texts.feedbackScreen.inputsLabel.checkbox + ' *'}
                      checkedIcon="check-square-o"
                      checkedColor={colors.accent}
                      uncheckedIcon="square-o"
                      uncheckedColor={colors.darkText}
                      checked={value}
                      onPress={() => onChange(!value)}
                    />
                    <Input
                      control={control}
                      errorMessage={errors.consent && errors.consent.message}
                      hidden
                      name={'consent'}
                      validate
                    />
                  </>
                )}
                control={control}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                title={
                  loading
                    ? texts.feedbackScreen.sendButton.disabled
                    : texts.feedbackScreen.sendButton.enabled
                }
                disabled={loading}
              />
            </View>
          </WrapperWithOrientation>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    marginBottom: normalize(30)
  },
  textArea: {
    borderColor: colors.shadow,
    borderWidth: 1,
    height: normalize(100),
    padding: normalize(10)
  }
});

FeedbackScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
