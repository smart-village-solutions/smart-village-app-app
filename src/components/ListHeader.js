import PropTypes from 'prop-types';
import React, { useState } from 'react';
import _sortBy from 'lodash/sortBy';
import _uniq from 'lodash/uniq';

import { texts } from '../config';
import { DropdownSelect } from './DropdownSelect';
import { Wrapper } from './Wrapper';

export const ListHeader = ({ data }) => {
  const dataProviders =
    data &&
    data.dataProviders &&
    _sortBy(_uniq(data.dataProviders.map((item) => item.dataProvider.name)), (item) =>
      item.toUpperCase()
    ).map((dataProvider, index) => ({
      id: index + 1,
      value: dataProvider,
      selected: false
    }));

  const [dropdownData, setDropdownData] = useState([
    {
      id: 0,
      value: '- Alle -',
      selected: true
    },
    ...dataProviders
  ]);

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
  data: PropTypes.object.isRequired
};
