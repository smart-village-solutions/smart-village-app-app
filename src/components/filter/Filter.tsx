import _omit from 'lodash/omit';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, Header } from 'react-native-elements';

import { Icon, colors, consts, normalize, texts } from '../../config';
import { FilterProps, FilterTypesProps } from '../../types';

import { Button } from './../Button';
import { BoldText } from './../Text';
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

  useEffect(() => {
    if (!isOverlay) {
      setQueryVariables((prev) => ({ search: prev.search || '', ...filters }));
    }
  }, [filters]);

  if (!filterTypes?.length) {
    return null;
  }

  const isNoFilterSet =
    filters.initial_start_date && !Object.keys(_omit(filters, Object.keys(queryVariables))).length;

  return (
    <>
      <Wrapper style={[withSearch && styles.noPadding]}>
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
                text: texts.filter.header,
                style: { color: colors.darkText, fontSize: normalize(18), fontWeight: '700' }
              }}
              rightComponent={{
                icon: 'close',
                color: colors.darkText,
                onPress: () => setIsCollapsed(!isCollapsed)
              }}
            />
            <Divider />
            <Wrapper style={styles.noPaddingBottom}>
              <FilterComponent
                filters={filters}
                filterTypes={filterTypes}
                setFilters={setFilters}
              />
            </Wrapper>

            <Wrapper style={[styles.noPaddingTop, styles.alignLeft]}>
              <WrapperRow style={{ gap: normalize(16) }}>
                <Button
                  disabled={!!isNoFilterSet}
                  invert
                  notFullWidth
                  onPress={() => {
                    setIsCollapsed(!isCollapsed);
                    setQueryVariables(initialFilters);
                  }}
                  title={texts.filter.resetFilter}
                />
                <Button
                  disabled={!!isNoFilterSet}
                  notFullWidth
                  onPress={() => {
                    setIsCollapsed(!isCollapsed);
                    setQueryVariables((prev) => ({ search: prev.search || '', ...filters }));
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
      </Wrapper>

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
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
