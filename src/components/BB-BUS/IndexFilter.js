import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, normalize, texts } from '../../config';
import { RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../Wrapper';
import { DropdownSelect } from '../DropdownSelect';
import { search } from '../../helpers';
import { IndexFilterWrapper } from '../IndexFilterElement';

import { AZFilter } from './AZFilter';
import { TextSearch } from './TextSearch';

/* category filter initial data */
const initialCategoryFilterData = [
  {
    id: 0,
    value: '- Bitte wählen -',
    selected: true
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

export const IndexFilter = ({
  areaId,
  areas,
  listItems,
  loading,
  results,
  selectedFilter,
  setAreaId,
  setListItems
}) => {
  const [serviceSearchData, setServiceSearchData] = useState('');
  const [categoryFilterData, setCategoryFilterData] = useState(initialCategoryFilterData);
  const [locationFilterData, setLocationFilterData] = useState(areas);
  const [AZFilterData, setAZFilterData] = useState(initialAZFilterData);
  const listItemsCount = listItems.length;

  /* eslint-disable indent */
  /* NOTE: there are differences in eslint config and auto linting for switch */
  const renderFilterComponents = (selectedFilterId) => {
    if (loading) return <Wrapper></Wrapper>;

    switch (selectedFilterId) {
      case 2:
        return (
          <WrapperVertical>
            <DropdownSelect
              data={categoryFilterData}
              setData={setCategoryFilterData}
              label={texts.bbBus.categoryFilter.label}
            />
            <Divider style={styles.divider} />
            <DropdownSelect
              data={locationFilterData}
              setData={setLocationFilterData}
              label={texts.bbBus.locationFilter.label}
              showSearch
              searchInputStyle={styles.searchInput}
              searchPlaceholder={texts.bbBus.locationFilter.searchPlaceholder}
            />
          </WrapperVertical>
        );
      case 3:
        return (
          <WrapperVertical>
            <TextSearch
              data={serviceSearchData}
              setData={setServiceSearchData}
              placeholder={texts.bbBus.textSearch.placeholder}
              label={texts.bbBus.textSearch.label}
            />
            <Divider style={styles.divider} />
            <DropdownSelect
              data={locationFilterData}
              setData={setLocationFilterData}
              label={texts.bbBus.locationFilter.label}
              showSearch
              searchInputStyle={styles.searchInput}
              searchPlaceholder={texts.bbBus.locationFilter.searchPlaceholder}
            />
          </WrapperVertical>
        );
      case 4:
        return (
          <WrapperVertical>
            <AZFilter data={AZFilterData} setData={setAZFilterData} />
            <WrapperVertical>
              <DropdownSelect
                data={locationFilterData}
                setData={setLocationFilterData}
                label={texts.bbBus.locationFilter.label}
                showSearch
                searchInputStyle={styles.searchInput}
                searchPlaceholder={texts.bbBus.locationFilter.searchPlaceholder}
              />
            </WrapperVertical>
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

  useEffect(() => {
    if (!loading && selectedFilter.id === 2) {
      const category = categoryFilterData.find((item) => item.selected).value;

      if (category.id > 0) {
        const searchResults = search({
          results,
          previousResults: listItems,
          location: !!locationFilterData && locationFilterData.find((item) => item.selected)?.value,
          category: categoryFilterData.find((item) => item.selected).value
        });

        setListItems(searchResults);
      } else {
        setListItems([]);
      }
    }
  }, [areaId, selectedFilter, categoryFilterData]);

  useEffect(() => {
    if (!loading && selectedFilter.id === 3) {
      const searchResults = search({
        results,
        previousResults: listItems,
        location: !!locationFilterData && locationFilterData.find((item) => item.selected)?.value,
        keyword: serviceSearchData
      });

      setListItems(searchResults);
    }
  }, [areaId, selectedFilter, serviceSearchData]);

  useEffect(() => {
    if (!loading && selectedFilter.id === 4) {
      const character = (AZFilterData.find((item) => item.selected) || {}).value;

      if (character) {
        const searchResults = search({
          results,
          previousResults: listItems,
          location: !!locationFilterData && locationFilterData.find((item) => item.selected)?.value,
          character
        });

        setListItems(searchResults);
      } else {
        setListItems([]);
      }
    }
  }, [areaId, selectedFilter, AZFilterData]);

  return (
    <View>
      {renderFilterComponents(selectedFilter.id)}
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
    backgroundColor: colors.surface,
    height: normalize(18),
    opacity: 0
  },
  results: {
    fontSize: normalize(10),
    letterSpacing: normalize(1.5),
    lineHeight: normalize(30)
  },
  searchInput: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderRgba,
    borderWidth: 0,
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16),
    justifyContent: 'space-between',
    lineHeight: normalize(22),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(12)
  }
});

IndexFilter.propTypes = {
  areaId: PropTypes.string.isRequired,
  areas: PropTypes.array,
  listItems: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  results: PropTypes.array.isRequired,
  selectedFilter: PropTypes.object.isRequired,
  setAreaId: PropTypes.func.isRequired,
  setListItems: PropTypes.func.isRequired
};
