import PropTypes from 'prop-types';
import React from 'react';

import { WasteReminderSettings, SafeAreaViewFlex, HeaderLeft } from '../components';

export const WasteReminderScreen = ({ navigation }) => {
  const wasteTypes = navigation.getParam('wasteTypes');
  const locationData = navigation.getParam('locationData');

  return (
    <SafeAreaViewFlex>
      <WasteReminderSettings types={wasteTypes} locationData={locationData} />
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
