import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { ServiceTiles } from '../components';
import { consts, texts } from '../config';
import { useMatomoTrackScreenView } from '../hooks';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING } = consts;

export const ServiceScreen = ({ navigation }) => {
  const { globalSettings } = useContext(SettingsContext);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.SERVICE);
  const { sections = {} } = globalSettings;
  const { headlineService: title = texts.homeTitles.service } = sections;

  return <ServiceTiles navigation={navigation} staticJsonName="homeService" title={title} />;
};

ServiceScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
