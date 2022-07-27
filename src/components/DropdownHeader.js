import _isEmpty from 'lodash/isEmpty';
import _uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, device, Icon, normalize, texts } from '../config';
import { usePermanentFilter } from '../hooks';
import { OrientationContext } from '../OrientationProvider';
import { QUERY_TYPES } from '../queries';

import { DropdownSelect } from './DropdownSelect';
import { Label } from './Label';
import { RegularText } from './Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from './Wrapper';

const dropdownEntries = (query, queryVariables, data, excludedDataProviders) => {
  // check if there is something set in the certain `queryVariables`
  // if not, - Alle - will be selected in the `dropdownData`
  const selected = {
    [QUERY_TYPES.EVENT_RECORDS]: !queryVariables.categoryId,
    [QUERY_TYPES.NEWS_ITEMS]: !queryVariables.dataProvider
  }[query];

  const blankEntry = {
    id: '-1',
    index: 0,
    value: '- Alle -',
    selected
  };

  let entries = [];

  if (query === QUERY_TYPES.EVENT_RECORDS && data?.categories?.length) {
    entries = _uniqBy(data.categories, 'name')
      .filter((category) => !!category.upcomingEventRecordsCount)
      .map((category, index) => ({
        index: index + 1,
        id: category.id,
        value: category.name,
        selected: category.id === queryVariables.categoryId
      }));
  } else if (query === QUERY_TYPES.NEWS_ITEMS) {
    const filteredDataProviders = data?.dataProviders?.filter(
      (dataProvider) => !excludedDataProviders.includes(dataProvider.id)
    );

    if (filteredDataProviders?.length) {
      entries = _uniqBy(filteredDataProviders, 'name').map((dataProvider, index) => ({
        index: index + 1,
        id: dataProvider.id,
        value: dataProvider.name,
        selected: dataProvider.name === queryVariables.dataProvider
      }));
    }
  }
  return [blankEntry, ...entries];
};

export const DropdownHeader = ({ query, queryVariables, data, updateListData }) => {
  const isEmptyData = _isEmpty(data);
  const { orientation } = useContext(OrientationContext);
  const { left: safeAreaLeft } = useSafeAreaInsets();

  const marginHorizontal = normalize(14) + safeAreaLeft;

  const dropdownLabel = {
    [QUERY_TYPES.EVENT_RECORDS]: texts.categoryFilter.category,
    [QUERY_TYPES.NEWS_ITEMS]: texts.categoryFilter.dataProvider
  }[query];

  const selectedKey = {
    [QUERY_TYPES.EVENT_RECORDS]: 'id',
    [QUERY_TYPES.NEWS_ITEMS]: 'value'
  }[query];

  const { state: excludedDataProviders } = usePermanentFilter();

  const [dropdownData, setDropdownData] = useState(
    dropdownEntries(query, queryVariables, data, excludedDataProviders)
  );

  // https://medium.com/swlh/prevent-useeffects-callback-firing-during-initial-render-the-armchair-critic-f71bc0e03536
  const initialRender = useRef(true);

  const selectedDropdownData = dropdownData?.find((entry) => entry.selected) || {};

  useEffect(() => {
    !isEmptyData &&
      setDropdownData(dropdownEntries(query, queryVariables, data, excludedDataProviders));
  }, [data]);

  // influence list data when changing selected dropdown value
  // call update of the list with the selected key
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      // do not pass the value, if the index is 0, because we do not want to use "- Alle -" or "-1"
      // inside of updateListData
      !isEmptyData &&
        updateListData(!!selectedDropdownData?.index && selectedDropdownData[selectedKey]);
    }
  }, [selectedDropdownData]);

  if (!isEmptyData && dropdownData.length <= 2) return null;

  return (
    <Wrapper>
      {isEmptyData ? (
        <View>
          <WrapperHorizontal>
            <Label>{dropdownLabel}</Label>
          </WrapperHorizontal>
          <View
            style={[
              styles.dropdownDropdown,
              {
                width:
                  (orientation === 'portrait' ? device.width : device.height) - 2 * marginHorizontal
              }
            ]}
          >
            <WrapperRow style={styles.dropdownTextWrapper}>
              <RegularText style={styles.selectedValueText}>
                {selectedDropdownData?.value || '- Alle -'}
              </RegularText>
              <Icon.ArrowDown />
            </WrapperRow>
          </View>
        </View>
      ) : (
        <DropdownSelect data={dropdownData} setData={setDropdownData} label={dropdownLabel} />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  dropdownTextWrapper: {
    borderColor: colors.borderRgba,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-between',
    padding: normalize(14)
  },
  dropdownDropdown: {
    borderColor: colors.borderRgba,
    borderRadius: 0,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  selectedValueText: { width: '90%' }
});

DropdownHeader.propTypes = {
  query: PropTypes.string.isRequired,
  queryVariables: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  updateListData: PropTypes.func.isRequired
};
