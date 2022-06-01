import PropTypes from 'prop-types';
import React from 'react';

import { texts } from '../../../../config';
import { EmptyMessage } from '../../../EmptyMessage';
import { ListComponent } from '../../../ListComponent';

export const UserComments = ({ navigation, query, data, refreshControl }) => {
  return (
    <ListComponent
      navigation={navigation}
      query={query}
      data={data}
      refreshControl={refreshControl}
      showBackToTop
      ListEmptyComponent={<EmptyMessage title={texts.empty.list} />}
    />
  );
};

UserComments.propTypes = {
  data: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  refreshControl: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
