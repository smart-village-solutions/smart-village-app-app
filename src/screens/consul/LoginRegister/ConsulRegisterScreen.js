import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import {
  BoldText,
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  LoadingModal,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperHorizontal,
  WrapperWithOrientation
} from '../../../components';
import { colors, consts, Icon, namespace, normalize, secrets, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { usePullToRefetch } from '../../../hooks';
import { CONSUL_REGISTER_USER } from '../../../queries/consul';
import { ScreenName } from '../../../types';

const { a11yLabel } = consts;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const showRegistrationFailAlert = () =>
  Alert.alert(texts.consul.registrationFailedTitle, texts.consul.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);

export const ConsulRegisterScreen = ({ navigation }) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [hasAcceptedTermsOfService, setHasAcceptedTermsOfService] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      passwordConfirmation: ''
    }
  });
  const pwd = watch('password');

  const [userRegister] = useMutation(CONSUL_REGISTER_USER, {
    client: ConsulClient
  });

  const onSubmit = async (inputData) => {
    if (!hasAcceptedTermsOfService) return showPrivacyCheckedAlert();

    setIsLoading(true);

    try {
      await userRegister({
        variables: {
          email: inputData.email,
          username: inputData.name,
          password: inputData.password,
          passwordConfirmation: inputData.passwordConfirmation,
          termsOfService: hasAcceptedTermsOfService
        }
      });
      setIsLoading(false);
      navigation.navigate(ScreenName.ConsulRegisteredScreen);
    } catch (error) {
      console.error(error.message);
      setIsLoading(false);
      showRegistrationFailAlert();
    }
  };

  const RefreshControl = usePullToRefetch();

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled" refreshControl={RefreshControl}>
          <WrapperWithOrientation>
            <TitleContainer>
              <Title
                big
                center
                accessibilityLabel={`${texts.consul.registrationTitle} ${a11yLabel.heading}`}
              >
                {texts.consul.registrationTitle}
              </Title>
            </TitleContainer>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="name"
                label={texts.consul.name}
                placeholder={texts.consul.name}
                autoCapitalize="none"
                validate
                rules={{ required: true }}
                errorMessage={errors.password && `${texts.consul.usernameError}`}
                control={control}
              />
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="email"
                label={texts.consul.email}
                placeholder={texts.consul.email}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                validate
                rules={{
                  required: true,
                  pattern: { value: EMAIL_REGEX, message: texts.consul.emailInvalid }
                }}
                errorMessage={errors.email && `${texts.consul.emailError}`}
                control={control}
              />
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="password"
                label={texts.consul.password}
                placeholder={texts.consul.password}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={isSecureTextEntry}
                rightIcon={rightIcon(isSecureTextEntry, setIsSecureTextEntry)}
                validate
                rules={{
                  required: true,
                  minLength: { value: 8, message: texts.consul.passwordLengthError }
                }}
                errorMessage={errors.password && `${texts.consul.passwordError}`}
                control={control}
              />
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="passwordConfirmation"
                label={texts.consul.passwordConfirmation}
                placeholder={texts.consul.passwordConfirmation}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={isSecureTextEntry}
                rightIcon={rightIcon(isSecureTextEntry, setIsSecureTextEntry)}
                validate
                rules={{
                  required: true,
                  minLength: { value: 8, message: texts.consul.passwordLengthError },
                  validate: (value) => value === pwd || texts.consul.passwordDoNotMatch
                }}
                errorMessage={errors.passwordConfirmation && `${texts.consul.passwordError}`}
                control={control}
              />
            </Wrapper>

            <WrapperHorizontal>
              <Checkbox
                linkDescription={texts.consul.privacyCheckLink}
                link={`${secrets[namespace]?.consul.serverUrl}${secrets[namespace]?.consul.termsOfService}`}
                title={texts.consul.privacyChecked}
                checkedIcon="check-square-o"
                uncheckedIcon="square-o"
                checked={hasAcceptedTermsOfService}
                onPress={() => setHasAcceptedTermsOfService(!hasAcceptedTermsOfService)}
              />
            </WrapperHorizontal>

            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={texts.consul.next}
                disabled={isLoading}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {texts.consul.abort.toUpperCase()}
                </BoldText>
              </Touchable>
            </Wrapper>
          </WrapperWithOrientation>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const rightIcon = (isSecureTextEntry, setIsSecureTextEntry) => {
  return (
    <TouchableOpacity onPress={() => setIsSecureTextEntry(!isSecureTextEntry)}>
      {isSecureTextEntry ? (
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
  navigation: PropTypes.object.isRequired
};
