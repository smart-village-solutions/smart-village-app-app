import PropTypes from 'prop-types';
import React from 'react';

import { WasteReminderSettings, SafeAreaViewFlex, HeaderLeft } from '../components';

export const WasteReminderScreen = ({ route }) => {
  const wasteTypes = route.params?.wasteTypes ?? {};
  const locationData = route.params?.locationData ?? {};

  return (
    <SafeAreaViewFlex>
      <WasteReminderSettings types={wasteTypes} locationData={locationData} />
    </SafeAreaViewFlex>
  );
};

// FIXME: Nav
// WasteReminderScreen.navigationOptions = ({ navigation }) => {
//   return {
//     headerLeft: <HeaderLeft navigation={navigation} />
//   };
// };

WasteReminderScreen.propTypes = {
  route: PropTypes.object.isRequired
};
