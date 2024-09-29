import React from 'react';
import { StyleSheet, View } from 'react-native';

import { consts, device, normalize } from '../../config';
import { updateFilters } from '../../helpers';
import { DatesTypes, DropdownProps, FilterProps, FilterTypesProps, StatusProps } from '../../types';
import { Switch } from '../Switch';
import { BoldText, RegularText } from '../Text';

import { WrapperVertical } from './../Wrapper';
import { DateFilter } from './DateFilter';
import { DropdownFilter } from './DropdownFilter';
import { SliderFilter } from './SliderFilter';
import { StatusFilter } from './Sue';

const { FILTER_TYPES } = consts;

type Props = {
  filters: FilterProps;
  filterTypes?: FilterTypesProps[];
  setFilters: React.Dispatch<FilterProps>;
};

export const FilterComponent = ({ filters, filterTypes, setFilters }: Props) => {
  return (
    <>
      {filterTypes?.map((item) => (
        <WrapperVertical key={item.name} style={styles.noPaddingBottom}>
          {item.type === FILTER_TYPES.DATE && (
            <DateFilter
              filters={filters}
              setFilters={setFilters}
              containerStyle={{ width: device.width * 0.45 }}
              {...item}
              data={item.data as DatesTypes[]}
            />
          )}

          {item.type === FILTER_TYPES.DROPDOWN && !!item.data?.length && (
            <DropdownFilter
              filters={filters}
              setFilters={setFilters}
              {...item}
              data={item.data as DropdownProps[]}
              multipleSelect={item.isMultiselect}
              searchPlaceholder={item.searchPlaceholder}
              showSearch={item.searchable}
            />
          )}

          {item.type === FILTER_TYPES.SUE.STATUS && (
            <StatusFilter
              filters={filters}
              setFilters={setFilters}
              {...item}
              data={item.data as StatusProps[]}
            />
          )}

          {item.type === FILTER_TYPES.CHECKBOX && (
            <>
              <BoldText>{item.label}</BoldText>
              <View style={styles.checkboxContainerStyle}>
                <RegularText small>{item.placeholder}</RegularText>
                <Switch
                  switchValue={filters[item.name] || false}
                  toggleSwitch={(value) =>
                    setFilters(
                      updateFilters({
                        currentFilters: filters,
                        name: item.name,
                        removeFromFilter: !!item.checked,
                        value: value
                      })
                    )
                  }
                />
              </View>
            </>
          )}

          {item.type === FILTER_TYPES.SLIDER && (
            <SliderFilter
              index={filters?.[item.name]?.index || 0}
              label={item.label}
              onSlidingComplete={(index) => {
                setFilters((prev: FilterProps) => ({
                  ...prev,
                  [item.name]: { value: item.data[index], index }
                }));
              }}
              values={item.data as number[]}
              {...item}
            />
          )}
        </WrapperVertical>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  },
  checkboxContainerStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalize(14)
  }
});
