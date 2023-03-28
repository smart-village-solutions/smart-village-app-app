import _isEmpty from 'lodash/isEmpty';
import _uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { texts } from '../config';
import { usePermanentFilter } from '../hooks';
import { QUERY_TYPES } from '../queries';

import { DropdownSelect } from './DropdownSelect';
import { Wrapper } from './Wrapper';

const dropdownEntries = (query, queryVariables, data, excludedDataProviders) => {
  // check if there is something set in the certain `queryVariables`
  // if not, - Alle - will be selected in the `dropdownData`
  const selected = {
    [QUERY_TYPES.EVENT_RECORDS]: !queryVariables.categoryId,
    [QUERY_TYPES.NEWS_ITEMS]: !queryVariables.dataProvider
  }[query];

  const blankEntry = {
    id: '0',
    index: 0,
    value: '- Alle -',
    selected
  };

  let entries = [];

  if (query === QUERY_TYPES.EVENT_RECORDS && data?.categories?.length) {
    entries = _uniqBy(data.categories, 'name')
      .filter((category) => !!category.upcomingEventRecordsCount)
      .map((category, index) => ({
        index: index + 1,
        id: category.id,
        value: category.name,
        selected: category.id === queryVariables.categoryId
      }));
  } else if (query === QUERY_TYPES.NEWS_ITEMS) {
    const filteredDataProviders = data?.dataProviders?.filter(
      (dataProvider) => !excludedDataProviders.includes(dataProvider.id)
    );

    if (filteredDataProviders?.length) {
      entries = _uniqBy(filteredDataProviders, 'name').map((dataProvider, index) => ({
        index: index + 1,
        id: dataProvider.id,
        value: dataProvider.name,
        selected: dataProvider.name === queryVariables.dataProvider
      }));
    }
  }
  return [blankEntry, ...entries];
};

export const DropdownHeader = ({
  data,
  isLocationFilter,
  query,
  queryVariables,
  updateListData
}) => {
  const dropdownLabel = {
    [QUERY_TYPES.EVENT_RECORDS]: texts.categoryFilter.category,
    [QUERY_TYPES.NEWS_ITEMS]: texts.categoryFilter.dataProvider
  }[query];

  const selectedKey = {
    [QUERY_TYPES.EVENT_RECORDS]: 'id',
    [QUERY_TYPES.NEWS_ITEMS]: 'value'
  }[query];

  const { state: excludedDataProviders } = usePermanentFilter();

  const [dropdownData, setDropdownData] = useState(
    dropdownEntries(query, queryVariables, data, excludedDataProviders)
  );

  const selectedDropdownData = dropdownData?.find((entry) => entry.selected) || {};

  // https://medium.com/swlh/prevent-useeffects-callback-firing-during-initial-render-the-armchair-critic-f71bc0e03536
  const initialRender = useRef(true);

  useEffect(() => {
    setDropdownData(dropdownEntries(query, queryVariables, data, excludedDataProviders));
  }, [data]);

  // influence list data when changing selected dropdown value,
  // call update of the list with the selected key
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      // update list data on selection only if there is some selected data from the dropdown and do
      // not pass the value, if the index is 0, because we do not want to use "- Alle -" or "0"
      // inside of `updateListData`
      !_isEmpty(selectedDropdownData) &&
        updateListData(!!selectedDropdownData.index && selectedDropdownData[selectedKey]);
    }
  }, [selectedDropdownData]);

  // if we have too few entries, we do not want to show the dropdown, where users would have
  // nothing to chose from
  if (dropdownData?.length <= 2) return null;

  return (
    <Wrapper>
      <DropdownSelect data={dropdownData} setData={setDropdownData} label={dropdownLabel} />
    </Wrapper>
  );
};

DropdownHeader.propTypes = {
  data: PropTypes.object.isRequired,
  isLocationFilter: PropTypes.bool,
  query: PropTypes.string.isRequired,
  queryVariables: PropTypes.object.isRequired,
  updateListData: PropTypes.func.isRequired
};
