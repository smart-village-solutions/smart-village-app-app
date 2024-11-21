import _isEmpty from 'lodash/isEmpty';
import _sortBy from 'lodash/sortBy';
import _uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { texts } from '../config';
import { usePermanentFilter } from '../hooks';
import { QUERY_TYPES } from '../queries';

import { DropdownSelect } from './DropdownSelect';
import { Wrapper } from './Wrapper';

export const dropdownEntries = (
  query,
  queryVariables,
  data,
  excludeDataProviderIds,
  isLocationFilter
) => {
  let entries = [];

  if (query === QUERY_TYPES.EVENT_RECORDS) {
    if (isLocationFilter) {
      entries = data?.eventRecordsAddresses?.filter((location) => !!location.city);
      entries = _sortBy(
        _uniqBy(entries, (location) => location.city.toLowerCase()),
        'city'
      ).map((location, index) => ({
        index: index + 1,
        value: location.city,
        selected:
          location.city === queryVariables.location ||
          queryVariables.locations?.includes(location.city)
      }));
    }

    if (data?.categories?.length) {
      entries = _uniqBy(data.categories, 'name')
        .filter((category) => !!category.upcomingEventRecordsCount)
        .map((category, index) => ({
          index: index + 1,
          id: category.id,
          value: category.name,
          selected:
            category.id === queryVariables.categoryId ||
            queryVariables.categoryIds?.includes(category.id)
        }));
    }
  } else if (query === QUERY_TYPES.NEWS_ITEMS) {
    const filteredDataProviders = data?.dataProviders?.filter(
      (dataProvider) => !excludeDataProviderIds.includes(dataProvider.id)
    );

    if (filteredDataProviders?.length) {
      entries = _uniqBy(filteredDataProviders, 'name').map((dataProvider, index) => ({
        index: index + 1,
        id: dataProvider.id,
        value: dataProvider.name,
        selected:
          dataProvider.name === queryVariables.dataProvider ||
          queryVariables.dataProviderIds?.includes(dataProvider.id)
      }));
    }
  } else if (query === QUERY_TYPES.VOUCHERS) {
    const categories = data?.categories?.filter((category) => !!category.name);

    if (categories?.length) {
      entries = _sortBy(_uniqBy(categories, 'name'), 'name').map((category, index) => ({
        index: index + 1,
        id: category.id,
        value: category.name,
        selected: category.id === queryVariables.categoryId
      }));
    }
  }

  return entries;
};

export const DropdownHeader = ({
  data,
  isLocationFilter,
  query,
  queryVariables,
  updateListData
}) => {
  const dropdownLabel = {
    [QUERY_TYPES.EVENT_RECORDS]: isLocationFilter
      ? texts.dropdownFilter.location
      : texts.dropdownFilter.category,
    [QUERY_TYPES.NEWS_ITEMS]: texts.dropdownFilter.dataProvider,
    [QUERY_TYPES.VOUCHERS]: texts.dropdownFilter.category
  }[query];

  const selectedKey = {
    [QUERY_TYPES.EVENT_RECORDS]: isLocationFilter ? 'value' : 'id',
    [QUERY_TYPES.NEWS_ITEMS]: 'value',
    [QUERY_TYPES.VOUCHERS]: 'id'
  }[query];

  const { excludeDataProviderIds } = usePermanentFilter();

  const [dropdownData, setDropdownData] = useState(
    dropdownEntries(query, queryVariables, data, excludeDataProviderIds, isLocationFilter)
  );

  const selectedDropdownData = dropdownData?.find((entry) => entry.selected) || {};

  // https://medium.com/swlh/prevent-useeffects-callback-firing-during-initial-render-the-armchair-critic-f71bc0e03536
  const initialRender = useRef(true);

  useEffect(() => {
    setDropdownData(
      dropdownEntries(query, queryVariables, data, excludeDataProviderIds, isLocationFilter)
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
        updateListData(
          !!selectedDropdownData.index && selectedDropdownData[selectedKey],
          isLocationFilter
        );
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
