import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { texts } from '../config';
import { DropdownSelect } from './DropdownSelect';
import { Wrapper } from './Wrapper';

export const ListHeader = ({ queryVariables, data, updateListData }) => {
  const dataProviders =
    data &&
    data.dataProviders &&
    data.dataProviders.map((dataProvider, index) => ({
      id: index + 1,
      value: dataProvider.name,
      selected: dataProvider.name === queryVariables.dataProvider
    }));

  const [dropdownData, setDropdownData] = useState([
    {
      id: 0,
      value: '- Alle -',
      selected: !queryVariables.dataProvider
    },
    ...dataProviders
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
      // do not pass the value, if the id is 0, because we do not want to use "- Alle -" inside of
      // updateListData
      updateListData(!!selectedDropdownData.id && selectedDropdownData.value);
    }
  }, [selectedDropdownData.value]);

  return (
    <Wrapper>
      <DropdownSelect
        data={dropdownData}
        setData={setDropdownData}
        label={texts.categoryFilter.label}
      />
    </Wrapper>
  );
};

ListHeader.propTypes = {
  queryVariables: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  updateListData: PropTypes.func.isRequired
};
