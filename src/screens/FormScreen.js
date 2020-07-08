import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Mutation } from 'react-apollo';
import { getQuery } from '../queries';

import { colors, normalize } from '../config';
import { BoldText, Button, Icon, SafeAreaViewFlex } from '../components';
import { arrowLeft } from '../icons';

export const FormScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

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
      Alert.alert('Feedback', 'Bitte alle Felder prüfen.', [{ text: 'OK' }], { cancelable: false });
    }
  };

  // TODO: texts are hardcoded because they will come from the API later somewhen
  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <Mutation mutation={getQuery('appUserContent')}>
          {(createAppUserContent) => (
            <View style={{ padding: normalize(14) }}>
              <BoldText>Name</BoldText>
              <TextInput
                onChangeText={(text) => {
                  setName(text);
                }}
                value={name}
                style={styles.inputField}
              />
              <BoldText>E-Mail</BoldText>
              <TextInput
                onChangeText={(text) => {
                  setEmail(text);
                }}
                value={email}
                style={styles.inputField}
                keyboardType="email-address"
              />
              <BoldText>Telefon</BoldText>
              <TextInput
                onChangeText={(text) => {
                  setPhone(text);
                }}
                value={phone}
                style={styles.inputField}
              />
              <BoldText>Ihre Mitteilung</BoldText>
              <TextInput
                onChangeText={(text) => {
                  setMessage(text);
                }}
                value={message}
                style={styles.textArea}
                multiline
                textAlignVertical="top"
              />
              <CheckBox
                checked={consent}
                onPress={() => setConsent(!consent)}
                title="Ich bin mit dem Speichern meiner Daten einverstanden?"
                checkedColor={colors.accent}
                containerStyle={styles.checkboxContainerStyle}
                textStyle={styles.checkboxTextStyle}
              />
              <Button title="Senden" onPress={() => submitForm(createAppUserContent)}></Button>
            </View>
          )}
        </Mutation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

FormScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon icon={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

const styles = StyleSheet.create({
  inputField: {
    borderColor: colors.shadow,
    borderWidth: 1,
    height: normalize(40),
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
  },
  icon: {
    paddingHorizontal: normalize(14)
  }
});

FormScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
