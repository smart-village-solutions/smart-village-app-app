import React from 'react';
import { StyleSheet } from 'react-native';

import { consts, device } from '../../config';
import { DropdownProps, FilterProps, FilterTypesProps, StatusProps } from '../../types';

import { WrapperVertical } from './../Wrapper';
import { DateFilter } from './DateFilter';
import { DropdownFilter } from './DropdownFilter';
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
        </WrapperVertical>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});
