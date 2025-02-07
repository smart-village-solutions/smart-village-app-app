import PropTypes from 'prop-types';
import React from 'react';

import { SafeAreaViewFlex, WasteCollectionSettings } from '../components';

export const WasteReminderScreen = ({ route }) => {
  return (
    <SafeAreaViewFlex>
      <WasteCollectionSettings currentSelectedStreetId={route.params?.currentSelectedStreetId} />
    </SafeAreaViewFlex>
  );
};

WasteReminderScreen.propTypes = {
  route: PropTypes.object.isRequired
};
