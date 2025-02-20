import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Collapsible from 'react-native-collapsible';

import { consts, device, normalize } from '../../config';
import { updateFilters } from '../../helpers';
import { DatesTypes, DropdownProps, FilterProps, FilterTypesProps, StatusProps } from '../../types';
import { Label } from '../Label';
import { Switch } from '../Switch';
import { RegularText } from '../Text';

import { WrapperVertical } from './../Wrapper';
import { DateFilter } from './DateFilter';
import { DropdownFilter } from './DropdownFilter';
import { SliderFilter } from './SliderFilter';
import { StatusFilter } from './Sue';

const { FILTER_TYPES } = consts;

type Props = {
  filters: FilterProps;
  filterTypes?: FilterTypesProps[];
  isOverlayFilter: boolean;
  setFilters: React.Dispatch<FilterProps>;
};

export const FilterComponent = ({ filters, filterTypes, isOverlayFilter, setFilters }: Props) => {
  const [sliderVisible, setSliderVisible] = useState(
    !filters?.radiusSearch?.currentPosition || false
  );

  return (
    <>
      {filterTypes
        ?.filter((item) => !!item.data?.length || item.type === FILTER_TYPES.CHECKBOX)
        ?.map((item) => (
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

            {item.type === FILTER_TYPES.DROPDOWN && (
              <DropdownFilter
                filters={filters}
                setFilters={setFilters}
                {...item}
                data={item.data as DropdownProps[]}
                isOverlayFilter={isOverlayFilter}
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
                <Label bold>{item.label}</Label>
                <View style={styles.switchContainerStyle}>
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
              <>
                <Label bold>{item.currentPosition.label}</Label>
                <View style={styles.switchContainerStyle}>
                  <RegularText small>{item.currentPosition.placeholder}</RegularText>
                  <Switch
                    switchValue={filters[item.name]?.currentPosition || false}
                    toggleSwitch={(value) => {
                      setSliderVisible(!value);
                      if (!value) {
                        const updatedFilters = { ...filters };
                        delete updatedFilters[item.name];
                        setFilters(updatedFilters);
                        return;
                      }

                      setFilters((prev) => ({
                        ...prev,
                        [item.name]: {
                          ...prev[item.name],
                          currentPosition: value,
                          distance: item.data[0],
                          index: 0
                        }
                      }));
                    }}
                  />
                </View>

                <Collapsible collapsed={sliderVisible}>
                  <SliderFilter
                    index={filters?.[item.name]?.index || 0}
                    label={item.label}
                    onSlidingComplete={(index) => {
                      setFilters((prev: FilterProps) => ({
                        ...prev,
                        [item.name]: { ...prev?.[item.name], distance: item.data[index], index }
                      }));
                    }}
                    values={item.data as number[]}
                    {...item}
                  />
                </Collapsible>
              </>
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
  switchContainerStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: normalize(14),
    paddingTop: normalize(10)
  }
});
