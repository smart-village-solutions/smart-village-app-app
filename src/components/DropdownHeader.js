import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { texts } from '../config';
import { QUERY_TYPES } from '../queries';
import { DropdownSelect } from './DropdownSelect';
import { Wrapper } from './Wrapper';

export const DropdownHeader = ({ query, queryVariables, data, updateListData }) => {
  const dropdownLabel = {
    [QUERY_TYPES.EVENT_RECORDS]: texts.categoryFilter.category,
    [QUERY_TYPES.NEWS_ITEMS]: texts.categoryFilter.dataProvider
  }[query];

  const dropdownInitialData = (query) => {
    switch (query) {
      case QUERY_TYPES.EVENT_RECORDS:
        return (
          data &&
          data.categories &&
          data.categories
            .filter((category) => !!category.upcomingEventRecordsCount)
            .map((category, index) => ({
              index: index + 1,
              id: category.id,
              value: category.name,
              selected: category.id === queryVariables.categoryId
            }))
        );
      case QUERY_TYPES.NEWS_ITEMS:
        return (
          data &&
          data.dataProviders &&
          data.dataProviders.map((dataProvider, index) => ({
            index: index + 1,
            value: dataProvider.name,
            selected: dataProvider.name === queryVariables.dataProvider
          }))
        );
    }
  };

  // check if there is something set in the certain `queryVariables`
  // if not, - Alle - will be selected in the `dropdownData`
  const selectedInitial = {
    [QUERY_TYPES.EVENT_RECORDS]: !queryVariables.categoryId,
    [QUERY_TYPES.NEWS_ITEMS]: !queryVariables.dataProvider
  }[query];
  const selectedKey = {
    [QUERY_TYPES.EVENT_RECORDS]: 'id',
    [QUERY_TYPES.NEWS_ITEMS]: 'value'
  }[query];

  const [dropdownData, setDropdownData] = useState([
    {
      index: 0,
      value: '- Alle -',
      selected: selectedInitial
    },
    ...(dropdownInitialData(query) || [])
  ]);

  const selectedDropdownData = dropdownData.find((entry) => entry.selected);

  // https://medium.com/swlh/prevent-useeffects-callback-firing-during-initial-render-the-armchair-critic-f71bc0e03536
  const initialRender = useRef(true);

  // influence list data when changing selected dropdown value
  // call update of the list with the selected data provider
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      // do not pass the value, if the index is 0, because we do not want to use "- Alle -"
      // inside of updateListData
      updateListData(!!selectedDropdownData.index && selectedDropdownData[selectedKey]);
    }
  }, [selectedDropdownData.value]);

  return (
    <Wrapper>
      <DropdownSelect data={dropdownData} setData={setDropdownData} label={dropdownLabel} />
    </Wrapper>
  );
};

DropdownHeader.propTypes = {
  query: PropTypes.string.isRequired,
  queryVariables: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  updateListData: PropTypes.func.isRequired
};
