import React from 'react';
import { StyleSheet } from 'react-native';

import { colors, consts, device } from '../../config';
import { updateFilters } from '../../helpers';
import { DropdownProps, FilterProps, FilterTypesProps, StatusProps } from '../../types';
import { Checkbox } from '../Checkbox';
import { BoldText } from '../Text';

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
              data={item.data as { name: keyof FilterProps; placeholder: string }[]}
            />
          )}

          {item.type === FILTER_TYPES.DROPDOWN && item.data?.length && (
            <DropdownFilter
              filters={filters}
              setFilters={setFilters}
              {...item}
              data={item.data as DropdownProps[]}
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
              <Checkbox
                checked={filters[item.name] || false}
                onPress={() => {
                  setFilters(
                    updateFilters({
                      currentFilters: filters,
                      name: item.name,
                      removeFromFilter: !!item.checked,
                      value: !filters[item.name]
                    })
                  );
                }}
                title={item.placeholder}
                checkedColor={colors.accent}
                checkedIcon="check-square-o"
                uncheckedColor={colors.darkText}
                uncheckedIcon="square-o"
                containerStyle={styles.checkboxContainerStyle}
              />
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
    backgroundColor: colors.surface,
    borderWidth: 0,
    paddingLeft: 0,
    paddingRight: 0
  }
});
