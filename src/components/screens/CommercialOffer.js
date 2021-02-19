import PropTypes from 'prop-types';
import React from 'react';

import { consts } from '../../config';
import { matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView } from '../../hooks';
import { Offer } from '../Offer';

const { MATOMO_TRACKING } = consts;

export const CommercialOffer = ({ data, navigation }) => {
  const { dataProvider, title } = data;

  useMatomoTrackScreenView(
    matomoTrackingString([
      MATOMO_TRACKING.SCREEN_VIEW.COMMERCIAL_OFFER,
      dataProvider && dataProvider.name,
      title
    ])
  );

  return <Offer data={data} navigation={navigation} />;
};

CommercialOffer.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
};
