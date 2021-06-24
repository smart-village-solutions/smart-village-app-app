import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { ServiceTiles } from '../components';
import { consts, texts } from '../config';
import { useMatomoTrackScreenView } from '../hooks';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING } = consts;

export const CompanyScreen = ({ navigation }) => {
  const { globalSettings } = useContext(SettingsContext);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.COMPANY);
  const { sections = {} } = globalSettings;
  const { headlineCompany: title = texts.homeTitles.company } = sections;

  return <ServiceTiles navigation={navigation} staticJsonName="homeCompanies" title={title} />;
};

CompanyScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
