import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';

import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  LoadingModal,
  RegularText,
  Input,
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

const showInvalidRegistrationDataAlert = () =>
  Alert.alert(text.registrationAllFieldsRequiredTitle, text.registrationAllFieldsRequiredBody);

const showRegistrationFailAlert = () =>
  Alert.alert(text.registrationFailedTitle, text.registrationFailedBody);

export const ConsulLoginScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const {
    control,
    formState: { isValid },
    handleSubmit
  } = useForm();

  const onSubmit = async () => {
    //TODO!
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
              <Title big center accessibilityLabel={`${text.loginTitle} ${a11yLabel.heading}`}>
                {text.loginTitle}
              </Title>
            </TitleContainer>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="email"
                label={text.usernameOrEmail}
                placeholder={text.usernameOrEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                rules={{ required: text.emailError }}
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
            <Wrapper>
              <Touchable accessibilityLabel={`${a11yLabel.privacy} ${a11yLabel.button}`}>
                <RegularText small underline>
                  {text.passwordForgotten}
                </RegularText>
              </Touchable>
            </Wrapper>
            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={text.login}
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

ConsulLoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired
};
