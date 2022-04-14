import PropTypes from 'prop-types';
import React from 'react';

import { ListComponent } from '../../../ListComponent';

export const Polls = ({ navigation, query, listData, refreshControl }) => {
  return (
    <ListComponent
      navigation={navigation}
      query={query}
      data={listData}
      refreshControl={refreshControl}
      showBackToTop
    />
  );
};

Polls.propTypes = {
  listData: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  refreshControl: PropTypes.object.isRequired
};
