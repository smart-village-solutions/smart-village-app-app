import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';
import _memoize from 'lodash/memoize';
import _sortBy from 'lodash/sortBy';

import { colors, normalize, texts } from '../../config';
import { RegularText } from '../Text';
import { IndexFilterWrapper } from './IndexFilterElement';
import { AZFilter } from './AZFilter';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../Wrapper';
import { DropdownSelect } from './DropdownSelect';
import { TextSearch } from './TextSearch';
import { search } from '../../helpers';
import { GET_DIRECTUS, GET_SERVICES } from '../../queries/BB-BUS/directus';
import { shareMessage } from '../../helpers/BB-BUS/shareHelper';

/* category filter initial data */
const initialCategoryFilterData = [
  {
    id: 0,
    value: '- Bitte wählen -',
    selected: true
  },
  {
    id: 1,
    value: 'Dummy 1',
    selected: false
  },
  {
    id: 2,
    value: 'Dummy 2',
    selected: false
  },
  {
    id: 3,
    value: 'Dummy 3',
    selected: false
  }
];
/* *** */

/* A-Z filter initial data */
const alphabet = [...Array(26)].map((value, index) => String.fromCharCode(index + 65));
const umlauts = ['Ä', 'Ö', 'Ü'];
const alphabetWithUmlauts = [...alphabet, ...umlauts];

const initialAZFilterData = alphabetWithUmlauts.map((value, index) => ({
  id: index + 1,
  value,
  selected: false
}));
/* *** */

const getListItems = _memoize(
  (data, areaId) =>
    data.map((bbBusService) => ({
      title: bbBusService.name,
      routeName: 'BBBUSDetail',
      params: {
        title: bbBusService.name,
        query: '',
        queryVariables: {},
        rootRouteName: 'BBBUS',
        shareContent: {
          message: shareMessage(bbBusService)
        },
        data: bbBusService,
        areaId
      }
    })),
  (data, areaId, top10CacheKey) => `${top10CacheKey}-${[data.length, areaId].join('-')}`
);

export const IndexFilter = ({
  selectedFilter,
  results,
  listItems,
  areaId,
  setAreaId,
  setListItems,
  top10Ids,
  communities,
  client,
  fetchPolicy
}) => {
  const [serviceSearchData, setServiceSearchData] = useState('');
  const [categoryFilterData, setCategoryFilterData] = useState(initialCategoryFilterData);
  const [locationFilterData, setLocationFilterData] = useState(communities);
  const [AZFilterData, setAZFilterData] = useState(initialAZFilterData);
  const [top10, setTop10] = useState();
  const [top10CacheKey, setTop10CacheKey] = useState();
  const listItemsCount = listItems.length;

  /* eslint-disable indent */
  /* NOTE: there are differences in eslint config and auto linting for switch */
  const renderFilterComponents = (selectedFilterId) => {
    switch (selectedFilterId) {
      case 2:
        return (
          <Wrapper>
            <DropdownSelect
              data={categoryFilterData}
              setData={setCategoryFilterData}
              label={texts.categoryFilter.label}
            />
            <Divider style={styles.divider} />
            <DropdownSelect
              data={locationFilterData}
              setData={setLocationFilterData}
              label={texts.locationFilter.label}
            />
          </Wrapper>
        );
      case 3:
        return (
          <Wrapper>
            <TextSearch
              data={serviceSearchData}
              setData={setServiceSearchData}
              placeholder={texts.textSearch.placeholder}
              label={texts.textSearch.label}
            />
            <Divider style={styles.divider} />
            <DropdownSelect
              data={locationFilterData}
              setData={setLocationFilterData}
              label={texts.locationFilter.label}
            />
          </Wrapper>
        );
      case 4:
        return (
          <WrapperVertical>
            <AZFilter data={AZFilterData} setData={setAZFilterData} />
            <WrapperHorizontal>
              <DropdownSelect
                data={locationFilterData}
                setData={setLocationFilterData}
                label={texts.locationFilter.label}
              />
            </WrapperHorizontal>
          </WrapperVertical>
        );
      default:
        return <Wrapper></Wrapper>;
    }
    /* eslint-enable indent */
  };

  // read about useCallback here https://overreacted.io/a-complete-guide-to-useeffect/
  const getAreaId = useCallback(() => {
    if (!locationFilterData || !locationFilterData.length) return areaId;

    return locationFilterData.find((item) => item.selected).areaId;
  }, [locationFilterData]);

  useEffect(() => {
    areaId = getAreaId();

    // trigger a refetch and re-rendering of the IndexScreen for the new area
    // if the areaId has changed
    areaId && setAreaId(areaId);
  }, [getAreaId]);

  // fetch top 10 data
  // returned cached data if `top10Ids` has not changed
  const fetchTop10 = useCallback(async () => {
    const { data } = await client.query({
      query: GET_DIRECTUS,
      variables: GET_SERVICES({ ids: top10Ids, areaId }),
      fetchPolicy
    });

    const top10 = data && data.directus && data.directus.service && data.directus.service.data;

    // sort and set top 10 if top 10 data is present
    if (top10 && top10Ids) {
      const sortedTop10 = _sortBy(top10, (item) => top10Ids.indexOf(item.id));

      setTop10(sortedTop10);
    }
  }, [top10Ids]);

  // fetch top 10 data if ids for top 10 have changed
  useEffect(() => {
    // fetch latest top 10 if ids are present
    top10Ids && fetchTop10();
  }, [top10Ids]);

  // set a cache key for top 10 data if top 10 data has changed
  // the cache key is used to determine the need to fetch new data or not
  useEffect(() => {
    // set top 10 cache key if top 10 are present
    top10 && setTop10CacheKey(top10.map((item) => item.id).join('-'));
  }, [top10]);

  useEffect(() => {
    if (selectedFilter.id === 1) {
      // if some `top10CacheKey` is present, this means, that `top10` was fetched successfully
      if (top10CacheKey) {
        setListItems(getListItems(top10, getAreaId(), top10CacheKey));
      } else {
        setListItems([]);
      }
    }
  }, [selectedFilter, top10CacheKey]);

  useEffect(() => {
    if (selectedFilter.id === 2) {
      const category = categoryFilterData.find((item) => item.selected).value;

      if (category.id > 0) {
        const searchResults = search({
          results,
          previousResults: listItems,
          location: !!locationFilterData && locationFilterData.find((item) => item.selected).value,
          category: categoryFilterData.find((item) => item.selected).value
        });

        setListItems(searchResults);
      } else {
        setListItems([]);
      }
    }
  }, [selectedFilter, categoryFilterData]);

  useEffect(() => {
    if (selectedFilter.id === 3) {
      const searchResults = search({
        results,
        previousResults: listItems,
        location: !!locationFilterData && locationFilterData.find((item) => item.selected).value,
        keyword: serviceSearchData
      });

      setListItems(searchResults);
    }
  }, [selectedFilter, serviceSearchData]);

  useEffect(() => {
    if (selectedFilter.id === 4) {
      const character = (AZFilterData.find((item) => item.selected) || {}).value;

      if (character) {
        const searchResults = search({
          results,
          previousResults: listItems,
          location: !!locationFilterData && locationFilterData.find((item) => item.selected).value,
          character
        });

        setListItems(searchResults);
      } else {
        setListItems([]);
      }
    }
  }, [selectedFilter, AZFilterData]);

  return (
    <View>
      {renderFilterComponents(selectedFilter.id)}
      <Divider style={styles.divider} />
      <IndexFilterWrapper>
        <WrapperHorizontal>
          <RegularText style={styles.results}>
            {selectedFilter.id === 1 ? `TOP ${listItemsCount}` : `${listItemsCount} TREFFER`}
          </RegularText>
        </WrapperHorizontal>
      </IndexFilterWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.lightestText,
    height: normalize(18),
    opacity: 0
  },
  results: {
    fontSize: normalize(10),
    letterSpacing: normalize(1.5),
    lineHeight: normalize(30)
  }
});

IndexFilter.propTypes = {
  selectedFilter: PropTypes.object.isRequired,
  results: PropTypes.array.isRequired,
  listItems: PropTypes.array.isRequired,
  areaId: PropTypes.number.isRequired,
  setAreaId: PropTypes.func.isRequired,
  setListItems: PropTypes.func.isRequired,
  top10Ids: PropTypes.string.isRequired,
  communities: PropTypes.array.isRequired,
  client: PropTypes.object.isRequired,
  fetchPolicy: PropTypes.string.isRequired
};
