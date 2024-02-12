import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider } from 'react-native-elements';

import { Icon, consts, device, normalize, texts } from '../../config';

import { Button } from './../Button';
import { BoldText } from './../Text';
import { WrapperVertical } from './../Wrapper';
import { DateFilter } from './DateFilter';
import { DropdownFilter } from './DropdownFilter';
import { StatusFilter } from './Sue';

const { FILTER_TYPES, a11yLabel } = consts;

type FilterProps = {
  endDate: string;
  serviceCode: string;
  sort: string;
  startDate: string;
  status: string;
};

type FilterTypesProps = {
  data:
    | { id: number; index: number; selected: boolean; value: string }[]
    | { name: string; placeholder: string }[]
    | {
        status: string;
        matchingStatuses: string[];
        iconName: string;
      }[];
  label?: string;
  name: string;
  placeholder?: string;
  type: string;
  value?: string;
  startDate?: {
    name: string;
    placeholder: string;
  };
  endDate?: {
    name: string;
    placeholder: string;
  };
};

type Props = {
  filterTypes?: FilterTypesProps[];
  setQueryVariables: (data: FilterProps) => void;
};

export const Filter = ({ filterTypes, setQueryVariables }: Props) => {
  const [filters, setFilters] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => setQueryVariables(filters), [filters]);

  if (!filterTypes?.length) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        accessibilityLabel={a11yLabel.editIcon}
        accessibilityHint={a11yLabel.editHint}
        style={styles.button}
      >
        <BoldText smallest primary>
          {isCollapsed ? texts.filter.showFilter : texts.filter.hideFilter}
        </BoldText>
        <Icon.Filter size={normalize(24)} style={styles.icon} />
      </TouchableOpacity>

      <Collapsible collapsed={isCollapsed}>
        <WrapperVertical style={styles.noPaddingTop}>
          {filterTypes.map((item) => (
            <WrapperVertical key={item.name} style={styles.noPaddingBottom}>
              {item.type === FILTER_TYPES.DATE && (
                <DateFilter
                  filter={filters}
                  setFilter={setFilters}
                  containerStyle={{ width: device.width / normalize(2) }}
                  {...item}
                  data={item.data as { name: string; placeholder: string }[]}
                />
              )}

              {item.type === FILTER_TYPES.DROPDOWN && item.data?.length && (
                <DropdownFilter
                  filter={filters}
                  setFilter={setFilters}
                  {...item}
                  data={
                    item.data as { id: number; index: number; selected: boolean; value: string }[]
                  }
                />
              )}

              {item.type === FILTER_TYPES.SUE.STATUS && (
                <StatusFilter
                  filter={filters}
                  setFilter={setFilters}
                  {...item}
                  data={
                    item.data as { status: string; matchingStatuses: string[]; iconName: string }[]
                  }
                />
              )}
            </WrapperVertical>
          ))}
        </WrapperVertical>

        <WrapperVertical style={styles.noPaddingBottom}>
          <Button
            disabled={!Object.keys(filters).length}
            title={texts.filter.resetFilter}
            onPress={() => setFilters({})}
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
    paddingLeft: normalize(12)
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
