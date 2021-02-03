import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native';

import {
  Icon,
  WasteNotificationSection,
  SafeAreaViewFlex,
  WrapperWithOrientation,
  Wrapper
} from '../components';
import { colors, normalize } from '../config';
import { arrowLeft } from '../icons';

export const WasteReminderScreen = ({ navigation }) => {
  const data = navigation.getParam('data');
  const street = navigation.getParam('street');

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="always">
        <WrapperWithOrientation>
          <Wrapper>
            <WasteNotificationSection data={data} street={street} />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

WasteReminderScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

WasteReminderScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
