import PropTypes from 'prop-types';
import React from 'react';

import { WasteReminderSettings, SafeAreaViewFlex } from '../components';

export const WasteReminderScreen = ({ route }) => {
  const wasteTypes = route.params?.wasteTypes ?? {};
  const locationData = route.params?.locationData ?? {};

  return (
    <SafeAreaViewFlex>
      <WasteReminderSettings types={wasteTypes} locationData={locationData} />
    </SafeAreaViewFlex>
  );
};

WasteReminderScreen.propTypes = {
  route: PropTypes.object.isRequired
};
