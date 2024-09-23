import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { consts, device, normalize } from '../../config';

import { WrapperVertical } from './../Wrapper';
import { DateFilter } from './DateFilter';
import { DropdownFilter } from './DropdownFilter';
import { DropdownProps, FilterProps, FilterTypesProps, StatusProps } from './Filter';
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
      <WrapperVertical style={styles.noPaddingTop}>
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
      </WrapperVertical>

      <Divider />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  icon: {
    paddingLeft: normalize(8)
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
