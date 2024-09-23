import _omit from 'lodash/omit';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, Header } from 'react-native-elements';

import { Icon, colors, consts, normalize, texts } from '../../config';

import { Button } from './../Button';
import { BoldText } from './../Text';
import { Wrapper, WrapperRow, WrapperVertical } from './../Wrapper';
import { FilterComponent } from './FilterComponent';

const { a11yLabel } = consts;

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

export type FilterTypesProps = {
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
  isOverlay?: boolean;
  setQueryVariables: React.Dispatch<FilterProps>;
  widthSearch?: boolean;
};

export const Filter = ({
  filterTypes,
  initialFilters,
  isOverlay,
  setQueryVariables,
  widthSearch = false
}: Props) => {
  const [filters, setFilters] = useState<FilterProps>(initialFilters);
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
    <Wrapper style={widthSearch && styles.noPadding}>
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        accessibilityLabel={`${isCollapsed ? texts.filter.showFilter : texts.filter.hideFilter} ${
          a11yLabel.button
        }`}
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

      {isOverlay ? (
        <Modal
          animationType="slide"
          onRequestClose={() => setIsCollapsed(!isCollapsed)}
          presentationStyle="pageSheet"
          visible={!isCollapsed}
        >
          <Header
            backgroundColor={colors.transparent}
            centerComponent={{
              text: texts.filter.filter,
              style: { color: colors.darkText, fontSize: normalize(18), fontWeight: '700' }
            }}
            rightComponent={{
              icon: 'close',
              color: colors.darkText,
              onPress: () => setIsCollapsed(!isCollapsed)
            }}
          />
          <Divider />
          <Wrapper>
            <FilterComponent filters={filters} filterTypes={filterTypes} setFilters={setFilters} />
          </Wrapper>

          <WrapperVertical style={styles.noPaddingBottom}>
            <WrapperRow center spaceAround>
              <Button
                disabled={!!isNoFilterSet}
                invert
                notFullWidth
                onPress={() => {
                  setIsCollapsed(!isCollapsed);

                  setTimeout(() => {
                    setFilters(initialFilters);
                  }, 500);
                }}
                title={texts.filter.resetFilter}
              />
              <Button
                disabled={!!isNoFilterSet}
                notFullWidth
                onPress={() => {
                  setIsCollapsed(!isCollapsed);
                }}
                title={texts.filter.filter}
              />
            </WrapperRow>
          </WrapperVertical>
        </Modal>
      ) : (
        <Collapsible collapsed={isCollapsed}>
          <FilterComponent filters={filters} filterTypes={filterTypes} setFilters={setFilters} />

          <WrapperVertical style={styles.noPaddingBottom}>
            <Button
              disabled={!!isNoFilterSet}
              invert
              onPress={() => {
                setIsCollapsed(true);

                setTimeout(() => {
                  setFilters(initialFilters);
                }, 500);
              }}
              title={texts.filter.resetFilter}
            />
          </WrapperVertical>
        </Collapsible>
      )}
    </Wrapper>
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
  noPadding: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0
  },
  noPaddingBottom: {
    paddingBottom: 0
  }
});
