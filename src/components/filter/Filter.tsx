import _isEqual from 'lodash/isEqual';
import _omit from 'lodash/omit';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, Header } from 'react-native-elements';

import { Icon, colors, consts, device, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { FilterProps, FilterTypesProps } from '../../types';

import { Button } from './../Button';
import { BoldText, RegularText } from './../Text';
import { Wrapper, WrapperRow, WrapperVertical } from './../Wrapper';
import { FilterComponent } from './FilterComponent';

const { a11yLabel } = consts;

type Props = {
  filterTypes?: FilterTypesProps[];
  initialFilters?: FilterProps;
  isOverlay?: boolean;
  queryVariables: FilterProps;
  setQueryVariables: React.Dispatch<FilterProps>;
  withSearch?: boolean;
};

export const Filter = ({
  filterTypes,
  initialFilters,
  isOverlay = false,
  queryVariables,
  setQueryVariables,
  withSearch = false
}: Props) => {
  const [filters, setFilters] = useState<FilterProps>(queryVariables);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filterCount, setFilterCount] = useState(0);

  useEffect(() => {
    if (!isOverlay) {
      setQueryVariables((prev) => ({ search: prev.search || '', ...filters }));
    }
  }, [filters]);

  useEffect(() => {
    if (!!isOverlay && !_isEqual(filters, queryVariables) && isCollapsed) {
      setFilters(queryVariables);
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (isOverlay) {
      const activeFilters = _omit(filters, Object.keys(initialFilters || {}));
      const filteredActiveFilters = Object.keys(activeFilters).reduce((acc, key) => {
        if (key !== 'saveable' || activeFilters[key] !== false) {
          acc[key] = activeFilters[key];
        }

        return acc;
      }, {} as FilterProps);
      setFilterCount(Object.keys(filteredActiveFilters).length);
    }
  }, [filters, initialFilters, isCollapsed]);

  if (!filterTypes?.length) {
    return null;
  }

  const isNoFilterSet =
    filters.initial_start_date && !Object.keys(_omit(filters, Object.keys(queryVariables))).length;

  return (
    <>
      <View style={[!withSearch && styles.container]}>
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
          {filterCount > 0 && (
            <View style={styles.countContainer}>
              <RegularText small lightest>
                {filterCount}
              </RegularText>
            </View>
          )}
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
                text: texts.filter.header,
                style: {
                  color: colors.darkText,
                  fontFamily: device.platform === 'ios' ? 'bold' : 'regular',
                  fontSize: normalize(20),
                  fontWeight: '400',
                  lineHeight: normalize(29)
                }
              }}
              rightComponent={{
                color: colors.darkText,
                icon: 'close',
                onPress: () => setIsCollapsed(!isCollapsed),
                type: 'ionicon'
              }}
              rightContainerStyle={styles.headerRightContainer}
            />
            <Divider />
            <ScrollView>
              <Wrapper style={[styles.noPaddingBottom, styles.noPaddingTop]}>
                <FilterComponent
                  filters={filters}
                  filterTypes={filterTypes}
                  setFilters={setFilters}
                />
              </Wrapper>
            </ScrollView>

            <Wrapper style={[styles.noPaddingTop, styles.alignLeft]}>
              <WrapperRow style={{ gap: normalize(16) }}>
                <Button
                  disabled={!!isNoFilterSet}
                  invert
                  notFullWidth
                  onPress={() => {
                    setFilters(initialFilters || {});
                    setIsCollapsed(!isCollapsed);
                    setQueryVariables({ saveable: false, ...(initialFilters || {}) });
                  }}
                  title={texts.filter.resetFilter}
                />
                <Button
                  disabled={!!isNoFilterSet}
                  notFullWidth
                  onPress={() => {
                    setIsCollapsed(!isCollapsed);
                    let dateRange = filters.dateRange || null;

                    if (filters.start_date && filters.end_date) {
                      dateRange = [
                        momentFormat(filters.start_date, 'YYYY-MM-DD'),
                        momentFormat(filters.end_date, 'YYYY-MM-DD')
                      ];
                    }

                    if (dateRange?.length) {
                      setQueryVariables({ ...filters, dateRange });
                    } else {
                      setQueryVariables({ ...filters });
                    }
                  }}
                  title={texts.filter.filter}
                />
              </WrapperRow>
            </Wrapper>
          </Modal>
        ) : (
          <Collapsible collapsed={isCollapsed}>
            <WrapperVertical style={styles.noPaddingTop}>
              <FilterComponent
                filters={filters}
                filterTypes={filterTypes}
                setFilters={setFilters}
              />
            </WrapperVertical>

            <Divider />

            <WrapperVertical style={styles.noPaddingBottom}>
              <Button
                disabled={!!isNoFilterSet}
                invert
                onPress={() => {
                  setIsCollapsed(!isCollapsed);

                  setTimeout(() => {
                    setFilters(queryVariables);
                  }, 500);
                }}
                title={texts.filter.resetFilter}
              />
            </WrapperVertical>
          </Collapsible>
        )}
      </View>

      {!withSearch && <Divider />}
    </>
  );
};

const styles = StyleSheet.create({
  alignLeft: {
    alignItems: 'flex-start'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  countContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(10),
    height: normalize(20),
    justifyContent: 'center',
    marginLeft: normalize(8),
    width: normalize(20)
  },
  container: {
    padding: normalize(14)
  },
  headerRightContainer: {
    justifyContent: 'center'
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
