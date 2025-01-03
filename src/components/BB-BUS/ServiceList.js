import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { VerticalList } from '../VerticalList';

import { IndexFilter } from './IndexFilter';

export const ServiceList = ({
  areaId,
  areas,
  loading,
  navigation,
  refreshControl,
  results = [],
  selectedFilter,
  setAreaId,
  top10
}) => {
  const [listItems, setListItems] = useState(selectedFilter.id === 1 ? top10 : []);

  useEffect(() => {
    if (selectedFilter.id === 1) {
      setListItems(top10);
    }
  }, [results.length, selectedFilter]);

  return (
    <VerticalList
      navigation={navigation}
      data={listItems}
      noSubtitle
      ListHeaderComponent={
        <IndexFilter
          selectedFilter={selectedFilter}
          results={results}
          listItems={listItems}
          setListItems={setListItems}
          areaId={areaId}
          setAreaId={setAreaId}
          areas={areas}
          loading={loading}
        />
      }
      showBackToTop
      refreshControl={refreshControl}
    />
  );
};

ServiceList.propTypes = {
  areaId: PropTypes.string.isRequired,
  areas: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  navigation: PropTypes.object.isRequired,
  refreshControl: PropTypes.object,
  results: PropTypes.array,
  selectedFilter: PropTypes.object.isRequired,
  setAreaId: PropTypes.func.isRequired,
  top10: PropTypes.array.isRequired
};
