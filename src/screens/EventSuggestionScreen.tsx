import { NavigationProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, ScrollView, StyleSheet } from 'react-native';

import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  HeadlineText,
  HtmlView,
  Input,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperVertical
} from '../components';
import { colors, consts, normalize, texts } from '../config';
import { createQuery, QUERY_TYPES } from '../queries';

const { EMAIL_REGEX } = consts;

type TAppUserContent = {
  address: string;
  consent: boolean;
  email: string;
  eventName: string;
  message: string;
  name: string;
  phone: string;
};

export const EventSuggestionScreen = ({
  navigation,
  route
}: {
  navigation: NavigationProp<any>;
  route: { params: { formIntroText: string } };
}) => {
  const [loading, setLoading] = useState(false);
  const introText = route.params.formIntroText || '';

  const {
    control,
    formState: { errors },
    reset,
    handleSubmit
  } = useForm({
    defaultValues: {
      address: '',
      consent: false,
      email: '',
      eventName: '',
      description: '',
      name: '',
      phone: ''
    }
  });

  const [createAppUserContent] = useMutation(createQuery(QUERY_TYPES.APP_USER_CONTENT));

  const onSubmit = async (createAppUserContentNewData: TAppUserContent) => {
    Keyboard.dismiss();

    if (!createAppUserContentNewData.consent) {
      return Alert.alert(
        texts.feedbackScreen.inputsErrorMessages.hint,
        texts.feedbackScreen.inputsErrorMessages.checkbox
      );
    }

    const formData = {
      dataType: 'json',
      dataSource: 'form_event_suggestion',
      content: JSON.stringify({
        action: 'event_suggestion',
        address: createAppUserContentNewData.address,
        consent: createAppUserContentNewData.consent,
        email: createAppUserContentNewData.email,
        eventName: createAppUserContentNewData.eventName,
        description: createAppUserContentNewData.description,
        name: createAppUserContentNewData.name,
        phone: createAppUserContentNewData.phone
      })
    };

    setLoading(true);

    try {
      await createAppUserContent({ variables: formData });

      reset();

      Alert.alert(
        texts.eventSuggestionScreen.alert.title,
        texts.eventSuggestionScreen.alert.message
      );
      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Wrapper>
            <HtmlView html={introText} />

            <WrapperVertical />

            <HeadlineText big>{texts.eventSuggestionScreen.eventOwnerInfo}</HeadlineText>

            <Input
              boldLabel
              control={control}
              errorMessage={errors.name && errors.name.message}
              label={texts.feedbackScreen.inputsLabel.name + ' *'}
              name="name"
              placeholder={texts.feedbackScreen.inputsLabel.name}
              rules={{ required: texts.feedbackScreen.inputsErrorMessages.name }}
              validate
            />

            <Input
              boldLabel
              control={control}
              errorMessage={errors.email && errors.email.message}
              keyboardType="email-address"
              label={texts.feedbackScreen.inputsLabel.email + ' *'}
              name="email"
              placeholder={texts.feedbackScreen.inputsLabel.email}
              rules={{
                required: texts.feedbackScreen.inputsErrorMessages.email,
                pattern: {
                  value: EMAIL_REGEX,
                  message: texts.feedbackScreen.inputsErrorMessages.email
                }
              }}
              validate
            />

            <Input
              boldLabel
              control={control}
              keyboardType="phone-pad"
              label={texts.feedbackScreen.inputsLabel.phone}
              name="phone"
              placeholder={texts.feedbackScreen.inputsLabel.phone}
            />

            <WrapperVertical />

            <HeadlineText big>{texts.eventSuggestionScreen.eventInfo}</HeadlineText>

            <Input
              boldLabel
              control={control}
              errorMessage={errors.eventName && errors.eventName.message}
              label={texts.feedbackScreen.inputsLabel.eventName + ' *'}
              name="eventName"
              placeholder={texts.feedbackScreen.inputsLabel.eventName}
              rules={{ required: texts.feedbackScreen.inputsErrorMessages.eventName }}
              validate
            />

            <Input
              boldLabel
              control={control}
              errorMessage={errors.address && errors.address.message}
              inputStyle={styles.textArea}
              label={texts.feedbackScreen.inputsLabel.address + ' *'}
              multiline
              name="address"
              placeholder={texts.feedbackScreen.inputsLabel.address}
              rules={{ required: texts.feedbackScreen.inputsErrorMessages.address }}
              textAlignVertical="top"
              validate
            />

            <Input
              boldLabel
              control={control}
              errorMessage={errors.description && errors.description.message}
              inputStyle={styles.textArea}
              label={texts.feedbackScreen.inputsLabel.description + ' *'}
              multiline
              name="description"
              placeholder={texts.feedbackScreen.inputsLabel.description}
              rules={{ required: texts.feedbackScreen.inputsErrorMessages.description }}
              textAlignVertical="top"
              validate
            />

            <Controller
              control={control}
              name="consent"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  boldTitle
                  checked={value}
                  checkedColor={colors.accent}
                  checkedIcon="check-square-o"
                  containerStyle={styles.checkboxContainerStyle}
                  onPress={() => onChange(!value)}
                  title={texts.feedbackScreen.inputsLabel.checkbox + ' *'}
                  uncheckedColor={colors.darkText}
                  uncheckedIcon="square-o"
                />
              )}
            />

            <Button
              disabled={loading}
              onPress={handleSubmit(onSubmit)}
              title={
                loading
                  ? texts.feedbackScreen.sendButton.disabled
                  : texts.feedbackScreen.sendButton.enabled
              }
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
  checkboxContainerStyle: {
    marginTop: normalize(30)
  },
  textArea: {
    height: normalize(100),
    padding: normalize(10)
  }
});
