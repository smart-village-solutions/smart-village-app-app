import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, normalize, texts } from '../../config';
import { search } from '../../helpers';
import { DropdownSelect } from '../DropdownSelect';
import { IndexFilterWrapper } from '../IndexFilterElement';
import { RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../Wrapper';

import { AreaAutocomplete } from './AreaAutocomplete';
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

export const IndexFilter = ({
  AZFilterData,
  areaId,
  areaName,
  blurAreaSignal = 0,
  blurSearchSignal = 0,
  initialAreaId,
  initialAreaName,
  listItems,
  loading,
  results,
  searchData,
  selectedFilter,
  setArea,
  setAZFilterData,
  setListItems,
  setSearchData
}) => {
  const [categoryFilterData, setCategoryFilterData] = useState(initialCategoryFilterData);
  const listItemsCount = listItems.length;
  const renderAreaAutocomplete = () => (
    <AreaAutocomplete
      areaId={areaId}
      areaName={areaName}
      blurSignal={blurAreaSignal}
      initialAreaId={initialAreaId}
      initialAreaName={initialAreaName}
      onSelectArea={setArea}
    />
  );

  const renderFilterComponents = (selectedFilterId) => {
    switch (selectedFilterId) {
      case 2:
        return (
          <WrapperVertical>
            <DropdownSelect
              data={categoryFilterData}
              setData={setCategoryFilterData}
              label={texts.bus.categoryFilter.label}
            />
            <Divider style={styles.divider} />
            {renderAreaAutocomplete()}
          </WrapperVertical>
        );
      case 3:
        return (
          <WrapperVertical>
            <TextSearch
              blurSignal={blurSearchSignal}
              data={searchData}
              setData={setSearchData}
              placeholder={texts.bus.textSearch.placeholder}
              label={texts.bus.textSearch.label}
            />
            <Divider style={styles.divider} />
            {renderAreaAutocomplete()}
          </WrapperVertical>
        );
      case 4:
        return (
          <WrapperVertical>
            <AZFilter data={AZFilterData} setData={setAZFilterData} />
            <WrapperVertical>{renderAreaAutocomplete()}</WrapperVertical>
          </WrapperVertical>
        );
      default:
        return <Wrapper></Wrapper>;
    }
  };

  useEffect(() => {
    if (loading) return;

    switch (selectedFilter.id) {
      case 2: {
        const category = categoryFilterData.find((item) => item.selected);

        setListItems(
          category?.id > 0
            ? search({
                results,
                category: category.value
              })
            : []
        );
        break;
      }
      case 3:
        break;
      case 4: {
        const character = (AZFilterData.find((item) => item.selected) || {}).value;

        setListItems(
          character
            ? search({
                results,
                character
              })
            : []
        );
        break;
      }
      default:
        break;
    }
  }, [AZFilterData, areaId, categoryFilterData, loading, results, selectedFilter.id, setListItems]);

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
  }
});

IndexFilter.propTypes = {
  AZFilterData: PropTypes.array.isRequired,
  areaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  areaName: PropTypes.string,
  blurAreaSignal: PropTypes.number,
  blurSearchSignal: PropTypes.number,
  initialAreaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialAreaName: PropTypes.string,
  listItems: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  results: PropTypes.array.isRequired,
  searchData: PropTypes.string.isRequired,
  selectedFilter: PropTypes.object.isRequired,
  setArea: PropTypes.func.isRequired,
  setAZFilterData: PropTypes.func.isRequired,
  setListItems: PropTypes.func.isRequired,
  setSearchData: PropTypes.func.isRequired
};
