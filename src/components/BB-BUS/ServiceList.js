import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { TextList } from '../TextList';
import { IndexFilter } from './IndexFilter';

export const ServiceList = ({
  navigation,
  selectedFilter,
  results,
  areaId,
  setAreaId,
  communities,
  top10,
  loading,
  refreshControl
}) => {
  const [listItems, setListItems] = useState(selectedFilter.id === 1 ? top10 : []);

  useEffect(() => {
    if (selectedFilter.id === 1) {
      setListItems(top10);
    }
  }, [results.length, selectedFilter]);

  return (
    <TextList
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
          communities={communities}
          loading={loading}
        />
      }
      showBackToTop
      refreshControl={refreshControl}
    />
  );
};

ServiceList.propTypes = {
  navigation: PropTypes.object.isRequired,
  selectedFilter: PropTypes.object.isRequired,
  results: PropTypes.array,
  areaId: PropTypes.number.isRequired,
  setAreaId: PropTypes.func.isRequired,
  communities: PropTypes.array,
  top10: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  refreshControl: PropTypes.object
};

ServiceList.defaultProps = {
  results: []
};
