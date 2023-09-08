import PropTypes from 'prop-types';
import React from 'react';

import { EventRecords, Overviews } from '../components';
import { QUERY_TYPES } from '../queries';

const getComponent = (query) => {
  switch (query) {
    case QUERY_TYPES.EVENT_RECORDS:
      return EventRecords;
    default:
      return Overviews;
  }
};

// TODO: make a list component for POIs that already includes the mapswitchheader?
// TODO: make a list component that already includes the news/events filter?
export const IndexScreen = ({ navigation, route }) => {
  const query = route.params?.query ?? '';
  const Component = getComponent(query);

  return <Component navigation={navigation} route={route} />;
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
