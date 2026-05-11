import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';

import { VerticalList } from '../VerticalList';

import { IndexFilter } from './IndexFilter';

export const ServiceList = ({
  areaId,
  areaName,
  initialAreaId,
  initialAreaName,
  isListLoading,
  navigation,
  refreshControl,
  results = [],
  selectedFilter,
  setArea,
  top10
}) => {
  const activeFilter = selectedFilter || { id: 3 };
  const [listItems, setListItems] = useState(activeFilter.id === 1 ? top10 : []);
  const previousAreaId = useRef(areaId);

  useEffect(() => {
    if (previousAreaId.current !== areaId) {
      previousAreaId.current = areaId;
      setListItems([]);
    }
  }, [areaId]);

  useEffect(() => {
    if (activeFilter.id === 1) {
      setListItems(top10);
    }
  }, [activeFilter.id, results.length, top10]);

  return (
    <VerticalList
      navigation={navigation}
      data={listItems}
      noSubtitle
      ListHeaderComponent={
        <IndexFilter
          selectedFilter={activeFilter}
          results={results}
          listItems={listItems}
          setListItems={setListItems}
          areaId={areaId}
          areaName={areaName}
          initialAreaId={initialAreaId}
          initialAreaName={initialAreaName}
          setArea={setArea}
          loading={isListLoading}
        />
      }
      isLoading={isListLoading}
      showBackToTop
      refreshControl={refreshControl}
    />
  );
};

ServiceList.propTypes = {
  areaId: PropTypes.string.isRequired,
  areaName: PropTypes.string,
  initialAreaId: PropTypes.string,
  initialAreaName: PropTypes.string,
  isListLoading: PropTypes.bool.isRequired,
  navigation: PropTypes.object.isRequired,
  refreshControl: PropTypes.object,
  results: PropTypes.array,
  selectedFilter: PropTypes.object.isRequired,
  setArea: PropTypes.func.isRequired,
  top10: PropTypes.array.isRequired
};
