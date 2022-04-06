import PropTypes from 'prop-types';
import React from 'react';

import { QUERY_TYPES } from '../../../../queries';
import { parseListItemsFromQuery } from '../../../../helpers';
import { Debates } from '../Debates';
import { Proposals } from '../Proposals';
const queryType = QUERY_TYPES.CONSUL;

const getComponent = (query) => {
  const COMPONENTS = {
    [queryType.PUBLIC_DEBATES]: Debates,
    [queryType.PUBLIC_PROPOSALS]: Proposals
  };
  return COMPONENTS[query];
};

export const User = ({ navigation, data, route, extraQuery, refreshControl }) => {
  const query = extraQuery ?? '';

  const listItems = parseListItemsFromQuery(query, data.user, {
    skipLastDivider: true
  });

  const Component = getComponent(query);

  if (!Component) return null;

  return (
    <>
      <Component
        query={query}
        listData={listItems}
        data={data}
        navigation={navigation}
        route={route}
        extraQuery={extraQuery}
        refreshControl={refreshControl}
      />
    </>
  );
};

User.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  extraQuery: PropTypes.string.isRequired,
  refreshControl: PropTypes.object.isRequired
};
