import PropTypes from 'prop-types';
import React from 'react';

import { QUERY_TYPES } from '../../../../queries';
import { parseListItemsFromQuery } from '../../../../helpers';
import { Debates } from '../Debates';
import { Proposals } from '../Proposals';
import { UserComments } from '../UserComments';
import { momentFormatUtcToLocal } from '../../../../helpers';

const getComponent = (query) => {
  const COMPONENTS = {
    [QUERY_TYPES.CONSUL.PUBLIC_DEBATES]: Debates,
    [QUERY_TYPES.CONSUL.PUBLIC_PROPOSALS]: Proposals,
    [QUERY_TYPES.CONSUL.PUBLIC_COMMENTS]: UserComments
  };
  return COMPONENTS[query];
};

export const User = ({ navigation, data, route, extraQuery, refreshControl }) => {
  const query = extraQuery ?? '';

  const listItems = parseListItemsFromQuery(query, data?.user, {
    skipLastDivider: true
  });

  listItems?.sort((a, b) =>
    momentFormatUtcToLocal(b.createdAt)
      .split('.')
      .reverse()
      .join()
      .localeCompare(momentFormatUtcToLocal(a.createdAt).split('.').reverse().join())
  );

  const Component = getComponent(query);

  if (!Component || !listItems) return null;

  return (
    <Component
      myContent={true}
      query={query}
      listData={listItems}
      navigation={navigation}
      route={route}
      refreshControl={refreshControl}
    />
  );
};

User.propTypes = {
  data: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  extraQuery: PropTypes.string.isRequired,
  refreshControl: PropTypes.object.isRequired
};
