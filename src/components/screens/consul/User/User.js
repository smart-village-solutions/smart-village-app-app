import _orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';
import React from 'react';

import { parseListItemsFromQuery } from '../../../../helpers';
import { QUERY_TYPES } from '../../../../queries';
import { Debates } from '../Debates';
import { Proposals } from '../Proposals';
import { UserComments } from '../UserComments';

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

  let listItems = parseListItemsFromQuery(query, data?.user, {
    skipLastDivider: true
  });

  listItems = _orderBy(listItems, 'createdAt', 'desc');

  const Component = getComponent(query);

  if (!Component) return null;

  return (
    <Component
      myContent={true}
      query={query}
      data={listItems}
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
