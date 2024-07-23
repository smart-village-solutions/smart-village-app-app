import _omit from 'lodash/omit';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider } from 'react-native-elements';

import { Icon, colors, consts, device, normalize, texts } from '../../config';

import { Button } from './../Button';
import { BoldText } from './../Text';
import { WrapperVertical } from './../Wrapper';
import { DateFilter } from './DateFilter';
import { DropdownFilter } from './DropdownFilter';
import { StatusFilter } from './Sue';

const { FILTER_TYPES, a11yLabel } = consts;

export type FilterProps = {
  date: string;
  end_date: string;
  service_code: string;
  sort: string;
  sortBy: string;
  start_date: string;
  initial_start_date: string;
  status: string;
};

export type DropdownProps = {
  id: number;
  index: number;
  selected: boolean;
  value: string;
  filterValue?: string;
};

export type StatusProps = {
  status: string;
  matchingStatuses: string[];
  codesForFilter: string;
  iconName: string;
};

type FilterTypesProps = {
  data: DropdownProps[] | { name: keyof FilterProps; placeholder: string }[] | StatusProps[];
  label?: string;
  name: keyof FilterProps;
  placeholder?: string;
  type: string;
  value?: string;
};

type Props = {
  filterTypes?: FilterTypesProps[];
  initialFilters: FilterProps;
  setQueryVariables: React.Dispatch<FilterProps>;
};

export const Filter = ({ filterTypes, initialFilters, setQueryVariables }: Props) => {
  const [filters, setFilters] = useState(initialFilters);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(
    () => setQueryVariables((prev) => ({ search: prev.search || '', ...filters })),
    [filters]
  );

  if (!filterTypes?.length) {
    return null;
  }

  const isNoFilterSet =
    filters.initial_start_date && !Object.keys(_omit(filters, Object.keys(initialFilters))).length;

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        accessibilityLabel={a11yLabel.editIcon}
        accessibilityHint={a11yLabel.editHint}
        style={styles.button}
      >
        <BoldText small primary={!isCollapsed}>
          {isCollapsed ? texts.filter.showFilter : texts.filter.hideFilter}
        </BoldText>
        <Icon.Filter
          size={normalize(16)}
          style={styles.icon}
          color={!isCollapsed ? colors.primary : colors.darkText}
        />
      </TouchableOpacity>

      <Collapsible collapsed={isCollapsed}>
        <WrapperVertical style={styles.noPaddingTop}>
          {filterTypes.map((item) => (
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

        <WrapperVertical style={styles.noPaddingBottom}>
          <Button
            invert
            disabled={isNoFilterSet}
            title={texts.filter.resetFilter}
            onPress={() => {
              setIsCollapsed(true);

              setTimeout(() => {
                setFilters(initialFilters);
              }, 500);
            }}
          />
        </WrapperVertical>

        <Divider />
      </Collapsible>
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
