import PropTypes from 'prop-types';
import React from 'react';

import { ListComponent } from '../../../ListComponent';

export const Polls = ({ navigation, query, pollData, refreshControl }) => {
  return (
    <>
      <ListComponent
        navigation={navigation}
        query={query}
        data={pollData}
        refreshControl={refreshControl}
        showBackToTop
      />
    </>
  );
};

Polls.propTypes = {
  pollData: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  refreshControl: PropTypes.object.isRequired
};
