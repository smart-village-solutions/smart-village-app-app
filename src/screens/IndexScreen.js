import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';

import { NetworkContext } from '../NetworkProvider';
import { EventRecords, Overviews } from '../components';
import { consts } from '../config';
import { matomoTrackingString } from '../helpers';
import { useTrackScreenViewAsync } from '../hooks';
import { QUERY_TYPES } from '../queries';

const getComponent = (query) => {
  switch (query) {
    case QUERY_TYPES.EVENT_RECORDS:
      return EventRecords;
    default:
      return Overviews;
  }
};

const { MATOMO_TRACKING } = consts;

// TODO: make a list component for POIs that already includes the mapswitchheader?
// TODO: make a list component that already includes the news/events filter?
export const IndexScreen = ({ navigation, route }) => {
  const { isConnected } = useContext(NetworkContext);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const title = route.params?.title ?? '';
  const query = route.params?.query ?? '';
  const Component = getComponent(query);

  useEffect(() => {
    if (query && isConnected) {
      const MATOMO_TRACKING_SCREEN = {
        [QUERY_TYPES.EVENT_RECORDS]: MATOMO_TRACKING.SCREEN_VIEW.EVENT_RECORDS,
        [QUERY_TYPES.GENERIC_ITEMS]: MATOMO_TRACKING.SCREEN_VIEW.GENERIC_ITEMS,
        [QUERY_TYPES.NEWS_ITEMS]: MATOMO_TRACKING.SCREEN_VIEW.NEWS_ITEMS,
        [QUERY_TYPES.POINTS_OF_INTEREST]: MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST,
        [QUERY_TYPES.TOURS]: MATOMO_TRACKING.SCREEN_VIEW.TOURS,
        [QUERY_TYPES.CATEGORIES]: MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST_AND_TOURS
      }[query];

      // in some cases we want to apply more information to the tracking string
      const MATOMO_TRACKING_CATEGORY = {
        [QUERY_TYPES.EVENT_RECORDS]: null,
        [QUERY_TYPES.GENERIC_ITEMS]: title, // the title should be the type of the generic items
        [QUERY_TYPES.NEWS_ITEMS]: title, // the title should be the category of news
        [QUERY_TYPES.POINTS_OF_INTEREST]: null,
        [QUERY_TYPES.TOURS]: null,
        [QUERY_TYPES.CATEGORIES]: null
      }[query];

      // NOTE: we cannot use the `useMatomoTrackScreenView` hook, as we need the `query` dependency
      trackScreenViewAsync(
        matomoTrackingString([MATOMO_TRACKING_SCREEN, MATOMO_TRACKING_CATEGORY])
      );
    }
  }, [isConnected, query]);

  return <Component navigation={navigation} route={route} />;
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
