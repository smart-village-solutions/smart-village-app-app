import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { QUERY_TYPES } from '../../../../queries';
import { parseListItemsFromQuery, sortingHelper } from '../../../../helpers';
import { Debates } from '../Debates';
import { Proposals } from '../Proposals';
import { IndexFilterWrapperAndList } from '../../../IndexFilterWrapperAndList';
import { texts } from '../../../../config';
import { LoadingSpinner } from '../../../LoadingSpinner';

const text = texts.consul.sorting;
const queryType = QUERY_TYPES.CONSUL;
const type = QUERY_TYPES.CONSUL.SORTING;

const INITIAL_TOP_SORTING = [
  { id: type.MOSTACTIVE, title: text.mostActive, selected: true },
  { id: type.HIGHESTRATED, title: text.highestRated, selected: false },
  { id: type.NEWESTDATE, title: text.newest, selected: false }
];

const getComponent = (query) => {
  const COMPONENTS = {
    [queryType.PUBLIC_DEBATES]: Debates,
    [queryType.PUBLIC_PROPOSALS]: Proposals
  };
  return COMPONENTS[query];
};

export const User = ({ navigation, data, route, extraQuery, refreshControl }) => {
  const [sorting, setSorting] = useState(INITIAL_TOP_SORTING);
  const [sortingLoading, setSortingLoading] = useState(false);
  const [listData, setListData] = useState([]);
  const query = extraQuery ?? '';

  const listItems = parseListItemsFromQuery(query, data.user, {
    skipLastDivider: true
  });

  useEffect(() => {
    setSortingLoading(true);
    let type = sorting.find((data) => data.selected);
    sortingHelper(type.id, listItems)
      .then(async (val) => await setListData(val))
      .then(() => setSortingLoading(false))
      .catch((err) => console.error(err));
  }, [sorting]);

  const Component = getComponent(query);

  if (sortingLoading) return <LoadingSpinner loading />;

  if (!Component) return null;

  return (
    <>
      <IndexFilterWrapperAndList filter={sorting} setFilter={setSorting} />

      <Component
        query={query}
        listData={listData}
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
