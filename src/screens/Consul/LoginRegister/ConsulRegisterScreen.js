import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';

import {
  BoldText,
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  Label,
  LoadingModal,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../../../components';
import { colors, consts, Icon, normalize, texts } from '../../../config';

const { a11yLabel } = consts;
const text = texts.consul;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const showInvalidRegistrationDataAlert = () =>
  Alert.alert(text.registrationAllFieldsRequiredTitle, text.registrationAllFieldsRequiredBody);

const showRegistrationFailAlert = () =>
  Alert.alert(text.registrationFailedTitle, text.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(text.privacyCheckRequireTitle, text.privacyCheckRequireBody);

export const ConsulRegisterScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const {
    control,
    formState: { isValid },
    handleSubmit,
    watch
  } = useForm();
  const pwd = watch('password');

  const onSubmit = async () => {
    //TODO!
    if (!isPrivacyChecked) showPrivacyCheckedAlert();

    if (isValid) {
      setRegistrationLoading(true);

      const userId = '0';

      if (!userId?.length) {
        showRegistrationFailAlert();

        setRegistrationLoading(false);
        showInvalidRegistrationDataAlert();
      }
      setTimeout(() => {
        setRegistrationLoading(false);
      }, 5000);
    }
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <TitleContainer>
              <Title
                big
                center
                accessibilityLabel={`${text.registrationTitle} ${a11yLabel.heading}`}
              >
                {text.registrationTitle}
              </Title>
            </TitleContainer>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="name"
                label={text.name}
                placeholder={text.name}
                autoCapitalize="none"
                rules={{ required: text.usernameError }}
                control={control}
              />
            </Wrapper>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="email"
                label={text.email}
                placeholder={text.email}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                rules={{
                  required: text.emailError,
                  pattern: { value: EMAIL_REGEX, message: text.emailInvalid }
                }}
                control={control}
              />
            </Wrapper>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="password"
                label={text.password}
                placeholder={text.password}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={secureTextEntry}
                rightIcon={rightIcon(secureTextEntry, setSecureTextEntry)}
                rules={{
                  required: text.passwordError,
                  minLength: { value: 8, message: text.passwordLengthError }
                }}
                control={control}
              />
            </Wrapper>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="password-repeat"
                label={text.passwordConfirmation}
                placeholder={text.passwordConfirmation}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={secureTextEntry}
                rightIcon={rightIcon(secureTextEntry, setSecureTextEntry)}
                rules={{
                  required: text.passwordError,
                  minLength: { value: 8, message: text.passwordLengthError },
                  validate: (value) => value === pwd || text.passwordDoNotMatch
                }}
                control={control}
              />
            </Wrapper>
            <Wrapper style={styles.noPaddingTop}>
              <Checkbox
                linkDescription={text.privacyCheckLink}
                link={'https://www.google.de'}
                title={text.privacyChecked}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checked={isPrivacyChecked}
                onPress={() => setIsPrivacyChecked(!isPrivacyChecked)}
              />
              <Label>{text.passwordConfirmation}</Label>
            </Wrapper>
            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={text.next}
                disabled={registrationLoading}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {text.abort.toUpperCase()}
                </BoldText>
              </Touchable>
            </Wrapper>
          </WrapperWithOrientation>
          <LoadingModal loading={registrationLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const rightIcon = (secureTextEntry, setSecureTextEntry) => {
  return (
    <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
      {secureTextEntry ? (
        <Icon.Visible color={colors.darkText} size={normalize(20)} />
      ) : (
        <Icon.Unvisible color={colors.darkText} size={normalize(20)} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});

ConsulRegisterScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired
};
