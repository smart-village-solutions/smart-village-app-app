import PropTypes from 'prop-types';
import React from 'react';

import { About, SafeAreaViewFlex } from '../components';
import { consts } from '../config';
import { useMatomoTrackScreenView } from '../hooks';

const { MATOMO_TRACKING } = consts;

/**
 * Displays the static "About" view wrapped in the themed safe area while emitting the
 * Matomo "More" screen view event.
 *
 * @param {{ navigation: object }} props React Navigation helpers forwarded to the About component.
 */
export const AboutScreen = ({ navigation }) => {
  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.MORE);

  return (
    <SafeAreaViewFlex>
      <About navigation={navigation} withSettings />
    </SafeAreaViewFlex>
  );
};

AboutScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
