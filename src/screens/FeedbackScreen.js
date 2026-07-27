import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
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
import { Icon, colors, consts, device, normalize, texts } from '../config';
import { collectDeviceInfo } from '../helpers';
import { useAppInfo, useMatomoTrackScreenView } from '../hooks';
import { QUERY_TYPES, createQuery } from '../queries';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING, EMAIL_REGEX } = consts;

const diagnosticSettingKeys = [
  'includePermissions',
  'includePushInformation',
  'includeSystemInformation',
  'includeScheduledNotifications',
  'includeWasteConfiguration',
  'includeWasteDisruptionNotifications',
  'includeWastePushDiagnostics',
  'includeWasteReminderScheduling'
];

const hasEnabledDiagnosticSetting = (settings) =>
  diagnosticSettingKeys.some((key) => settings[key] === true);

const wasteDisruptionNotificationHint = (settings) =>
  settings.includeWasteDisruptionNotifications === true
    ? texts.feedbackScreen.diagnosticInformationHints.wasteDisruptionNotifications
    : null;

const pushInformationHint = () =>
  device.platform === 'android'
    ? texts.feedbackScreen.diagnosticInformationHints.pushInformationAndroid
    : texts.feedbackScreen.diagnosticInformationHints.pushInformation;

const diagnosticInformationHints = (settings) => {
  const legacyWasteDiagnostics =
    settings.includeScheduledNotifications === true ||
    settings.includeWastePushDiagnostics === true;

  return [
    settings.includeSystemInformation === true
      ? texts.feedbackScreen.diagnosticInformationHints.systemInformation
      : null,
    settings.includePermissions === true || legacyWasteDiagnostics
      ? texts.feedbackScreen.diagnosticInformationHints.permissions
      : null,
    settings.includePushInformation === true || legacyWasteDiagnostics
      ? pushInformationHint()
      : null,
    settings.includeWasteConfiguration === true || legacyWasteDiagnostics
      ? texts.feedbackScreen.diagnosticInformationHints.wasteConfiguration
      : null,
    wasteDisruptionNotificationHint(settings),
    settings.includeWasteReminderScheduling === true || legacyWasteDiagnostics
      ? texts.feedbackScreen.diagnosticInformationHints.wasteReminderScheduling
      : null
  ]
    .filter(Boolean)
    .join(' ');
};

export const FeedbackScreen = ({ route }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { globalSettings } = useContext(SettingsContext);
  const feedbackSettings = globalSettings?.settings?.feedback || {};
  const hasDiagnosticInformation = hasEnabledDiagnosticSetting(feedbackSettings);
  const {
    link,
    linkDescription,
    params = {},
    routeName,
    title = texts.feedbackScreen.inputsLabel.checkbox
  } = route.params?.checkbox || {};

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm({
    defaultValues: {
      consent: false,
      email: '',
      includeDiagnosticInformation: false,
      message: '',
      name: '',
      phone: ''
    }
  });
  const includeDiagnosticInformation = watch('includeDiagnosticInformation');
  const diagnosticInformationHint = diagnosticInformationHints(feedbackSettings);
  const consentTitle = `${title.replace(/\s*\*$/, '')} *`;

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

    setLoading(true);

    try {
      let deviceInfo;

      if (includeDiagnosticInformation === true) {
        try {
          deviceInfo = await collectDeviceInfo({
            settings: feedbackSettings,
            wasteSettings: globalSettings?.waste
          });
        } catch (error) {
          console.error(error);
        }
      }

      const content = {
        name: createAppUserContentNewData.name,
        email: createAppUserContentNewData.email,
        phone: createAppUserContentNewData.phone,
        message: createAppUserContentNewData.message,
        consent: createAppUserContentNewData.consent,
        appInfo,
        ...(deviceInfo && { deviceInfo })
      };
      const formData = {
        dataType: 'json',
        dataSource: 'form',
        content: JSON.stringify(content)
      };

      await createAppUserContent({ variables: formData });
      Alert.alert(texts.feedbackScreen.alert.title, texts.feedbackScreen.alert.message, [
        {
          text: texts.feedbackScreen.alert.ok,
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(texts.feedbackScreen.alert.errorTitle, texts.feedbackScreen.alert.errorMessage);
    } finally {
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
            {hasDiagnosticInformation && (
              <>
                <Controller
                  name="includeDiagnosticInformation"
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value}
                      checkedIcon={<Icon.SquareCheckFilled />}
                      onPress={() => onChange(!value)}
                      testID="diagnostic-information-checkbox"
                      title={texts.feedbackScreen.inputsLabel.includeDiagnosticInformation}
                      uncheckedIcon={<Icon.Square color={colors.placeholder} />}
                    />
                  )}
                  control={control}
                />
                <RegularText
                  smallest
                  placeholder
                  style={styles.diagnosticInformationHint}
                  testID="diagnostic-information-hint"
                >
                  {diagnosticInformationHint}
                </RegularText>
              </>
            )}

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
                  title={consentTitle}
                  uncheckedIcon={<Icon.Square color={colors.placeholder} />}
                />
              )}
              control={control}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
            <Button
              onPress={handleSubmit(onSubmit)}
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
  diagnosticInformationHint: {
    marginBottom: normalize(12)
  },
  textArea: {
    height: normalize(100),
    padding: normalize(10)
  }
});

FeedbackScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object
};
