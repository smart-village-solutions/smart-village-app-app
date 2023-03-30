import _isEmpty from 'lodash/isEmpty';
import _uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { usePermanentFilter } from '../hooks';
import { QUERY_TYPES } from '../queries';

import { DropdownSelect } from './DropdownSelect';
import { Wrapper } from './Wrapper';

const dropdownEntries = ({
  data,
  dropdownKey,
  dropdownValue,
  excludedDataProviders,
  query,
  queryVariables,
  selectedKey
}) => {
  // check if there is something set in the certain `queryVariables`
  // if not, - Alle - will be selected in the `dropdownData`
  const selected = !queryVariables[selectedKey];

  const blankEntry = {
    id: '0',
    index: 0,
    value: '- Alle -',
    selected
  };

  if (!data?.length) return [blankEntry];

  let entries = [];

  if (query === QUERY_TYPES.NEWS_ITEMS) {
    const filteredDataProviders = data.filter(
      (dataProvider) => !excludedDataProviders.includes(dataProvider.id)
    );

    if (filteredDataProviders?.length) {
      entries = _uniqBy(filteredDataProviders, dropdownValue);
    }
  }

  if (query === QUERY_TYPES.EVENT_RECORDS) {
    entries = _uniqBy(data, dropdownValue);

    if (selectedKey === 'categoryId') {
      entries = entries.filter((category) => !!category.upcomingEventRecordsCount);
    } else if (selectedKey === 'location') {
      entries = entries.filter((address) => !!address.city);
    }
  }

  entries = entries.map((entry, index) => ({
    index: index + 1,
    id: entry.id,
    value: entry[dropdownValue],
    selected: entry[dropdownKey] === queryVariables[selectedKey]
  }));
  // console.warn({ entries, selectedKey, dropdownKey, queryVariables });
  return [blankEntry, ...entries];
};

export const DropdownHeader = ({
  data,
  dropdownKey,
  dropdownLabel,
  dropdownValue,
  query,
  queryVariables,
  selectedKey,
  updateListData
}) => {
  const { state: excludedDataProviders } = usePermanentFilter();

  const [dropdownData, setDropdownData] = useState(
    dropdownEntries({
      data,
      dropdownKey,
      dropdownValue,
      excludedDataProviders,
      query,
      queryVariables,
      selectedKey
    })
  );

  const selectedDropdownData = dropdownData?.find((entry) => entry.selected) || {};

  // https://medium.com/swlh/prevent-useeffects-callback-firing-during-initial-render-the-armchair-critic-f71bc0e03536
  const initialRender = useRef(true);

  useEffect(() => {
    setDropdownData(
      dropdownEntries({
        data,
        dropdownKey,
        dropdownValue,
        excludedDataProviders,
        query,
        queryVariables,
        selectedKey
      })
    );
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
        updateListData(!!selectedDropdownData.index && selectedDropdownData[dropdownKey]);
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
  data: PropTypes.array.isRequired,
  dropdownKey: PropTypes.string.isRequired,
  dropdownLabel: PropTypes.string.isRequired,
  dropdownValue: PropTypes.string.isRequired,
  isLocationFilter: PropTypes.bool,
  query: PropTypes.string.isRequired,
  queryVariables: PropTypes.object.isRequired,
  selectedKey: PropTypes.string.isRequired,
  updateListData: PropTypes.func.isRequired
};
