import PropTypes from 'prop-types';
import React from 'react';

import { RegularText, SafeAreaViewFlex } from '../../components';

export const ARShowScreen = ({ navigation }) => {
  return (
    <SafeAreaViewFlex>
      <RegularText>AR Show Screen</RegularText>
      <RegularText onPress={() => navigation.goBack()}>Zurück</RegularText>
    </SafeAreaViewFlex>
  );
};

ARShowScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
