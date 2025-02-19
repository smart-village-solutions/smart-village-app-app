import _isEqual from 'lodash/isEqual';
import _omit from 'lodash/omit';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, Header } from 'react-native-elements';

import { Icon, colors, consts, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { FilterProps, FilterTypesProps } from '../../types';

import { Button } from './../Button';
import { BoldText, RegularText } from './../Text';
import { Wrapper, WrapperRow, WrapperVertical } from './../Wrapper';
import { FilterComponent } from './FilterComponent';

const { a11yLabel } = consts;

type Props = {
  filterTypes?: FilterTypesProps[];
  initialQueryVariables?: FilterProps;
  isOverlay?: boolean;
  queryVariables: FilterProps;
  setQueryVariables: React.Dispatch<FilterProps>;
  withSearch?: boolean;
};

export const INITIAL_START_DATE = '1900-01-01T00:00:00+01:00';

const deleteInitialStartDateFromQueryVariables = (queryVariables: FilterProps): FilterProps => {
  if (queryVariables?.start_date === INITIAL_START_DATE) {
    const newQueryVariables = { ...queryVariables };
    delete newQueryVariables.start_date;

    return newQueryVariables;
  }

  return queryVariables;
};

export const Filter = ({
  filterTypes,
  initialQueryVariables,
  isOverlay = false,
  queryVariables,
  setQueryVariables,
  withSearch = false
}: Props) => {
  const updatedQueryVariables = deleteInitialStartDateFromQueryVariables(queryVariables);
  const [filters, setFilters] = useState<FilterProps>(updatedQueryVariables);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filterCount, setFilterCount] = useState(0);

  useEffect(() => {
    if (!isOverlay) {
      setQueryVariables((prev) => {
        const newFilters = { ...filters };

        if (newFilters.start_date === INITIAL_START_DATE) {
          delete newFilters.start_date;

          return {
            search: prev.search || '',
            ...newFilters
          };
        }

        if (!newFilters.start_date) {
          return {
            search: prev.search || '',
            start_date: INITIAL_START_DATE,
            ...newFilters
          };
        }

        return { search: prev.search || '', ...newFilters };
      });
    }
  }, [filters]);

  const resetFilters = () => {
    if (!isOverlay) {
      setIsCollapsed(!isCollapsed);

      setTimeout(() => {
        setFilters(updatedQueryVariables);

        setQueryVariables({
          ...queryVariables,
          start_date: INITIAL_START_DATE
        });
      }, 500);
    } else {
      setFilters(initialQueryVariables || {});
      setIsCollapsed(!isCollapsed);
      setQueryVariables({ saveable: false, ...(initialQueryVariables || {}) });
    }
  };

  useEffect(() => {
    if (!!isOverlay && !_isEqual(filters, queryVariables) && isCollapsed) {
      setFilters(queryVariables);
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (isOverlay) {
      const activeFilters = _omit(filters, Object.keys(initialQueryVariables || {}));
      const filteredActiveFilters = Object.keys(activeFilters).reduce((acc, key) => {
        if ((key !== 'saveable' || key !== 'onlyCurrentlyOpen') && activeFilters[key] !== false) {
          acc[key] = activeFilters[key];
        }

        return acc;
      }, {} as FilterProps);
      setFilterCount(Object.keys(filteredActiveFilters).length);
    }
  }, [filters, initialQueryVariables, isCollapsed]);

  if (!filterTypes?.length) {
    return null;
  }

  const isNoFilterSet =
    filters.start_date === INITIAL_START_DATE &&
    !Object.keys(_omit(filters, Object.keys(queryVariables))).length;

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
                  fontFamily: 'condbold',
                  fontSize: normalize(18),
                  lineHeight: normalize(23)
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
              <Wrapper noPaddingTop noPaddingBottom>
                <FilterComponent
                  filters={filters}
                  filterTypes={filterTypes}
                  isOverlayFilter
                  setFilters={setFilters}
                />
              </Wrapper>
            </ScrollView>

            <Wrapper style={styles.alignLeft} noPaddingTop>
              <WrapperRow style={{ gap: normalize(16) }}>
                <Button
                  disabled={!!isNoFilterSet}
                  invert
                  notFullWidth
                  onPress={resetFilters}
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
                    } else if (filters.start_date && !filters.end_date) {
                      // because of the requirement to specify the start and end date of the `dateRange`,
                      // if only `startDate` is selected, `endDate` is set to 31.12.9999
                      dateRange = [momentFormat(filters.start_date, 'YYYY-MM-DD'), '9999-12-31'];
                    } else if (!filters.start_date && filters.end_date) {
                      // because of the requirement to specify the start and end date of the `dateRange`,
                      // if only `endDate` is selected, `startDate` is set to today's date.
                      dateRange = [
                        moment().format('YYYY-MM-DD'),
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
                onPress={resetFilters}
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
