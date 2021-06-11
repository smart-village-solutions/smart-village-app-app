import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Mutation } from 'react-apollo';

import { createQuery, QUERY_TYPES } from '../queries';
import { colors, consts, device, normalize } from '../config';
import {
  BoldText,
  Button,
  HeaderLeft,
  SafeAreaViewFlex,
  WrapperWithOrientation
} from '../components';
import { OrientationContext } from '../OrientationProvider';
import { getHeaderHeight, statusBarHeight } from '../navigation/CustomDrawerContentComponent';
import { useMatomoTrackScreenView } from '../hooks';

const { MATOMO_TRACKING } = consts;

export const FormScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const { orientation } = useContext(OrientationContext);

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
        consent
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

  // TODO: texts are hardcoded because they will come from the API later somewhen
  return (
    <SafeAreaViewFlex>
      <KeyboardAvoidingView
        enabled={device.platform === 'ios'}
        behavior={device.platform === 'ios' && 'padding'}
        keyboardVerticalOffset={
          device.platform === 'ios' && getHeaderHeight(orientation) + statusBarHeight(orientation)
        }
        style={styles.flex}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <Mutation mutation={createQuery(QUERY_TYPES.APP_USER_CONTENT)}>
              {(createAppUserContent) => (
                <View style={{ padding: normalize(14) }}>
                  <BoldText>Name</BoldText>
                  <BoldText>Name</BoldText>
                  <TextInput
                    accessibilityLabel={`(Geben Sie Ihren Namen ein) ${name}`}
                    onChangeText={(text) => {
                      setName(text);
                    }}
                    value={name}
                    style={styles.inputField}
                  />
                  <BoldText>E-Mail</BoldText>
                  <TextInput
                    accessibilityLabel={`(Geben Sie Ihren E-Mail addresse ein) ${email}`}
                    onChangeText={(text) => {
                      setEmail(text);
                    }}
                    value={email}
                    style={styles.inputField}
                    keyboardType="email-address"
                  />
                  <BoldText>Telefon</BoldText>
                  <TextInput
                    accessibilityLabel={`(Geben Sie Ihren Telefon nummer ein) ${phone}`}
                    onChangeText={(text) => {
                      setPhone(text);
                    }}
                    value={phone}
                    style={styles.inputField}
                  />
                  <BoldText>Ihre Mitteilung</BoldText>
                  <TextInput
                    accessibilityLabel={`(Geben Sie Ihren Nachricht ein) ${message}`}
                    onChangeText={(text) => {
                      setMessage(text);
                    }}
                    value={message}
                    style={styles.textArea}
                    multiline
                    textAlignVertical="top"
                  />
                  <CheckBox
                    accessibilityRole="checkbox"
                    checked={consent}
                    onPress={() => setConsent(!consent)}
                    title="Ich bin mit dem Speichern meiner Daten einverstanden."
                    uncheckedColor={colors.darkText}
                    checkedColor={colors.accent}
                    containerStyle={styles.checkboxContainerStyle}
                    textStyle={styles.checkboxTextStyle}
                  />
                  <Button title="Senden" onPress={() => submitForm(createAppUserContent)}></Button>
                </View>
              )}
            </Mutation>
          </WrapperWithOrientation>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

FormScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
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
    backgroundColor: colors.lightestText,
    borderWidth: 0,
    marginBottom: normalize(10),
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText
  }
});

FormScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
