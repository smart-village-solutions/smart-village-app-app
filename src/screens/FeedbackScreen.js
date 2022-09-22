import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Mutation } from 'react-apollo';

import { createQuery, QUERY_TYPES } from '../queries';
import { colors, consts, normalize } from '../config';
import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  SafeAreaViewFlex,
  WrapperWithOrientation
} from '../components';
import { useMatomoTrackScreenView } from '../hooks';
import { useAppInfo } from '../hooks/appInfo';

const { MATOMO_TRACKING } = consts;

export const FeedbackScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  const appInfo = useAppInfo();

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.FEEDBACK);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setConsent(false);
  };

  const isFormValid = () => {
    return consent;
  };

  const submitForm = async (createAppUserContent) => {
    const formData = {
      dataType: 'json',
      dataSource: 'form',
      content: JSON.stringify({
        name,
        email,
        phone,
        message,
        consent,
        appInfo: appInfo
      })
    };

    if (isFormValid()) {
      await createAppUserContent({ variables: formData });
      Alert.alert(
        'Feedback',
        'Vielen Dank für Ihr Feedback!',
        [{ text: 'OK', onPress: () => resetForm() }],
        { cancelable: false }
      );
    } else {
      Alert.alert('Feedback', 'Bitte alle Felder prüfen.', [{ text: 'OK' }], {
        cancelable: false
      });
    }
  };

  const a11yText = consts.a11yLabel;
  // TODO: texts are hardcoded because they will come from the API later somewhen
  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <Mutation mutation={createQuery(QUERY_TYPES.APP_USER_CONTENT)}>
              {(createAppUserContent) => (
                <View style={{ padding: normalize(14) }}>
                  <BoldText>Name</BoldText>
                  <TextInput
                    accessibilityLabel={`${a11yText.textInput} (${name})`}
                    onChangeText={(text) => {
                      setName(text);
                    }}
                    value={name}
                    style={styles.inputField}
                  />
                  <BoldText>E-Mail</BoldText>
                  <TextInput
                    accessibilityLabel={`${a11yText.textInput} (${email})`}
                    onChangeText={(text) => {
                      setEmail(text);
                    }}
                    value={email}
                    style={styles.inputField}
                    keyboardType="email-address"
                  />
                  <BoldText>Telefon</BoldText>
                  <TextInput
                    accessibilityLabel={`${a11yText.textInput} (${phone})`}
                    onChangeText={(text) => {
                      setPhone(text);
                    }}
                    value={phone}
                    style={styles.inputField}
                    keyboardType="phone-pad"
                  />
                  <BoldText>Ihre Mitteilung</BoldText>
                  <TextInput
                    accessibilityLabel={`${a11yText.textInput} (${message})`}
                    onChangeText={(text) => {
                      setMessage(text);
                    }}
                    value={message}
                    style={styles.textArea}
                    multiline
                    textAlignVertical="top"
                  />
                  <CheckBox
                    accessibilityRole="button"
                    checked={consent}
                    onPress={() => setConsent(!consent)}
                    title="Ich bin mit dem Speichern meiner Daten einverstanden."
                    checkedColor={colors.accent}
                    checkedIcon="check-square-o"
                    uncheckedColor={colors.darkText}
                    uncheckedIcon="square-o"
                    containerStyle={styles.checkboxContainerStyle}
                    textStyle={styles.checkboxTextStyle}
                  />
                  <Button title="Senden" onPress={() => submitForm(createAppUserContent)}></Button>
                </View>
              )}
            </Mutation>
          </WrapperWithOrientation>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  inputField: {
    borderColor: colors.shadow,
    borderWidth: 1,
    height: normalize(44),
    marginBottom: normalize(30),
    paddingHorizontal: normalize(10)
  },
  textArea: {
    borderColor: colors.shadow,
    borderWidth: 1,
    height: normalize(100),
    marginBottom: normalize(30),
    padding: normalize(10)
  },
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginBottom: normalize(10),
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText
  }
});

FeedbackScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
