import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import {
  WasteNotificationSection,
  SafeAreaViewFlex,
  WrapperWithOrientation,
  Wrapper,
  HeaderLeft
} from '../components';

export const WasteReminderScreen = ({ navigation }) => {
  const wasteTypes = navigation.getParam('wasteTypes');
  const street = navigation.getParam('streetData');

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="always">
        <WrapperWithOrientation>
          <Wrapper>
            <WasteNotificationSection types={wasteTypes} street={street} />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

WasteReminderScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

WasteReminderScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
