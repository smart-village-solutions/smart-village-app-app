import _isEqual from 'lodash/isEqual';
import _omit from 'lodash/omit';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, Header } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, consts, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { FilterProps, FilterTypesProps } from '../../types';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

import { Button } from './../Button';
import { BoldText, RegularText } from './../Text';
import { Wrapper, WrapperRow, WrapperVertical } from './../Wrapper';
import { FilterComponent } from './FilterComponent';

const { a11yLabel } = consts;

type Props = {
  countInitialFilter?: keyof FilterProps;
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

  if (queryVariables.dateRange?.length) {
    const newQueryVariables = { ...queryVariables };

    return {
      ...newQueryVariables,
      start_date: queryVariables.dateRange[0],
      // if only `start_date` is selected, `end_date` is automatically set to '9999-12-31' and `end_date`
      // is set to null to avoid seeing this value in the filter
      end_date: queryVariables.dateRange[1] === '9999-12-31' ? null : queryVariables.dateRange[1]
    };
  }

  return queryVariables;
};

const areFiltersReset = (
  filters: FilterProps,
  initialQueryVariables: FilterProps | undefined,
  isOverlay: boolean,
  isNoFilterSet: boolean
) => {
  if (!isOverlay) return isNoFilterSet;

  return _isEqual(
    _omit(filters, ['saveable', 'search']),
    _omit(deleteInitialStartDateFromQueryVariables(initialQueryVariables || {}), [
      'saveable',
      'search'
    ])
  );
};

export const Filter = ({
  countInitialFilter,
  filterTypes,
  initialQueryVariables,
  isOverlay = false,
  queryVariables,
  setQueryVariables,
  withSearch = false
}: Props) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const updatedQueryVariables = deleteInitialStartDateFromQueryVariables(queryVariables);
  const [filters, setFilters] = useState<FilterProps>(updatedQueryVariables);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filterCount, setFilterCount] = useState(0);
  const [filterResetKey, setFilterResetKey] = useState(0);

  useEffect(() => {
    if (!isOverlay) {
      setQueryVariables((prev) => {
        const newFilters = { search: prev.search || '', ...filters };

        if (newFilters.start_date === INITIAL_START_DATE) {
          delete newFilters.start_date;

          return newFilters;
        }

        if (!newFilters.start_date) {
          return {
            start_date: INITIAL_START_DATE,
            ...newFilters
          };
        }

        return newFilters;
      });
    }
  }, [filters]);

  const resetFilters = () => {
    if (!isOverlay) {
      setIsCollapsed(!isCollapsed);

      setTimeout(() => {
        setFilterResetKey((previous) => previous + 1);
        setFilters(updatedQueryVariables);

        setQueryVariables({
          ...queryVariables,
          start_date: INITIAL_START_DATE
        });
      }, 500);
    } else {
      setIsCollapsed(!isCollapsed);
      setFilterResetKey((previous) => previous + 1);

      const rest = _omit(initialQueryVariables || {}, ['dateRange']);

      setFilters((prev) => ({
        saveable: false,
        search: prev.search || '',
        ...(rest || {})
      }));
      setQueryVariables((prev) => ({
        saveable: false,
        search: prev.search || '',
        ...(rest || {})
      }));
    }
  };

  useEffect(() => {
    if (isOverlay && !_isEqual(filters, queryVariables) && isCollapsed) {
      setFilters(updatedQueryVariables);
      setQueryVariables(updatedQueryVariables);
    }
  }, [filters, queryVariables, isCollapsed, updatedQueryVariables]);

  useEffect(() => {
    if (isOverlay) {
      const ignoredInitialFilters = Object.keys(initialQueryVariables || {}).filter(
        (name) => name !== countInitialFilter
      );
      const activeFilters = _omit(filters, [...ignoredInitialFilters, 'start_date', 'end_date']);

      const filteredActiveFilters = Object.keys(activeFilters).reduce((acc, key) => {
        if (key !== 'saveable' && key !== 'search' && activeFilters[key] !== false) {
          acc[key] = activeFilters[key];
        }

        return acc;
      }, {} as FilterProps);

      const changedInitialFilters =
        filterTypes?.filter(
          ({ name }) =>
            name !== countInitialFilter &&
            Object.prototype.hasOwnProperty.call(initialQueryVariables || {}, name) &&
            !_isEqual(filters[name], initialQueryVariables?.[name])
        ).length || 0;

      setFilterCount(Object.keys(filteredActiveFilters).length + changedInitialFilters);
    }
  }, [countInitialFilter, filters, filterTypes, initialQueryVariables, isCollapsed]);

  if (!filterTypes?.length) {
    return null;
  }

  const isNoFilterSet =
    filters.start_date === INITIAL_START_DATE &&
    !Object.keys(_omit(filters, Object.keys(queryVariables))).length;
  const isApplyDisabled = _isEqual(filters, updatedQueryVariables);
  const isResetDisabled = areFiltersReset(filters, initialQueryVariables, isOverlay, isNoFilterSet);

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
            <View style={styles.overlayContent}>
              <Header
                backgroundColor={colors.background}
                centerComponent={{
                  text: texts.filter.header,
                  style: {
                    color: colors.text,
                    fontFamily: 'condbold',
                    fontSize: normalize(18),
                    lineHeight: normalize(23)
                  }
                }}
                rightComponent={
                  <TouchableOpacity
                    accessibilityLabel={`${texts.accessibilityLabels.actions.close} ${a11yLabel.button}`}
                    accessibilityRole="button"
                    onPress={() => setIsCollapsed(!isCollapsed)}
                    style={styles.closeButton}
                  >
                    <Icon.Close color={colors.text} size={normalize(20)} />
                  </TouchableOpacity>
                }
                rightContainerStyle={styles.headerRightContainer}
              />
              <Divider style={styles.overlayDivider} />
              <ScrollView style={styles.overlayScrollView}>
                <Wrapper noPaddingTop noPaddingBottom>
                  <FilterComponent
                    key={filterResetKey}
                    filters={filters}
                    filterTypes={filterTypes}
                    isOverlayFilter
                    setFilters={setFilters}
                  />
                </Wrapper>
              </ScrollView>

              <SafeAreaView edges={['bottom']}>
                <Wrapper style={styles.alignLeft} noPaddingTop>
                  <WrapperRow style={{ gap: normalize(16) }}>
                    <Button
                      disabled={isResetDisabled}
                      invert
                      notFullWidth
                      onPress={resetFilters}
                      title={texts.filter.resetFilter}
                    />
                    <Button
                      disabled={isApplyDisabled}
                      notFullWidth
                      onPress={() => {
                        let dateRange = filters.dateRange || null;

                        if (filters.start_date && filters.end_date) {
                          dateRange = [
                            momentFormat(filters.start_date, 'YYYY-MM-DD'),
                            momentFormat(filters.end_date, 'YYYY-MM-DD')
                          ];
                        } else if (filters.start_date && !filters.end_date) {
                          dateRange = [
                            momentFormat(filters.start_date, 'YYYY-MM-DD'),
                            '9999-12-31'
                          ];
                        } else if (!filters.start_date && filters.end_date) {
                          dateRange = [
                            moment().isAfter(filters.end_date)
                              ? momentFormat(filters.end_date, 'YYYY-MM-DD')
                              : moment().format('YYYY-MM-DD'),
                            momentFormat(filters.end_date, 'YYYY-MM-DD')
                          ];
                        }

                        setQueryVariables(dateRange?.length ? { ...filters, dateRange } : filters);
                        setIsCollapsed(!isCollapsed);
                      }}
                      title={texts.filter.filter}
                    />
                  </WrapperRow>
                </Wrapper>
              </SafeAreaView>
            </View>
          </Modal>
        ) : (
          <Collapsible collapsed={isCollapsed}>
            <WrapperVertical noPaddingTop>
              <FilterComponent
                key={filterResetKey}
                filters={filters}
                filterTypes={filterTypes}
                setFilters={setFilters}
              />
            </WrapperVertical>

            <Divider />

            <WrapperVertical noPaddingBottom>
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

const createStyles = (colors) => ({
  alignLeft: {
    alignItems: 'flex-start'
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end'
  },

  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: normalize(32),
    minWidth: normalize(32)
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

  overlayContent: {
    backgroundColor: colors.background,
    flex: 1
  },

  overlayDivider: {
    backgroundColor: colors.border
  },

  overlayScrollView: {
    backgroundColor: colors.background
  }
});
