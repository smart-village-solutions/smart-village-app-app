import { StackNavigationProp } from '@react-navigation/stack';
import _shuffle from 'lodash/shuffle';
import _sortBy from 'lodash/sortBy';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '../config';
import { getTitleForQuery, parseListItemsFromQuery } from '../helpers';
import { QUERY_TYPES } from '../queries';

import { Button } from './Button';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { SectionHeader } from './SectionHeader';
import { BoldText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper } from './Wrapper';

const pointsOfInterestAndToursListCache = new Map<number, unknown[]>();

// Keep exactly one shuffled snapshot per fetched data version so tab switches reuse the same order.
const cachePointsOfInterestAndToursListData = (cacheKey: number, listData: unknown[]) => {
  pointsOfInterestAndToursListCache.set(cacheKey, listData);

  if (pointsOfInterestAndToursListCache.size > 1) {
    const oldestKey = pointsOfInterestAndToursListCache.keys().next().value;

    if (oldestKey !== undefined) {
      pointsOfInterestAndToursListCache.delete(oldestKey);
    }
  }

  return listData;
};

type Props = {
  additionalData?: unknown[];
  buttonTitle?: string;
  horizontal?: boolean;
  isIndexStartingAt1?: boolean;
  isRandom?: boolean;
  limit?: number;
  linkTitle?: string;
  loading?: boolean;
  navigate?: () => void;
  navigateButton?: () => void;
  navigateLink?: () => void;
  navigation: StackNavigationProp<Record<string, object | undefined>>;
  listType?: string;
  placeholder?: React.ReactElement;
  query: string;
  queryUpdatedAt?: number;
  queryVariables?: Record<string, unknown>;
  sectionData?: unknown[];
  sectionTitle?: string;
  sectionTitleDetail?: string;
  showButton?: boolean;
  showLink?: boolean;
};

/* eslint-disable complexity */
export const DataListSection = ({
  additionalData,
  buttonTitle,
  horizontal,
  isIndexStartingAt1,
  isRandom = false,
  limit = 3,
  linkTitle,
  loading,
  navigate,
  navigateButton,
  navigateLink,
  navigation,
  listType,
  placeholder,
  query,
  queryUpdatedAt,
  queryVariables,
  sectionData,
  sectionTitle = getTitleForQuery(query),
  sectionTitleDetail,
  showButton,
  showLink
}: Props) => {
  const renderSectionHeader = () => {
    if (!sectionTitle) return null;

    return <SectionHeader onPress={navigate} title={sectionTitle} />;
  };

  if (loading) {
    return (
      <View>
        {renderSectionHeader()}

        <LoadingContainer>
          <ActivityIndicator color={colors.refreshControl} />
        </LoadingContainer>
      </View>
    );
  }

  const isPointsOfInterestAndTours = query === QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS;
  const queryOptions = {
    withDate:
      (query === QUERY_TYPES.EVENT_RECORDS && !queryVariables?.onlyUniqEvents) ||
      query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL ||
      query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY ||
      query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS,
    withTime: query === QUERY_TYPES.EVENT_RECORDS && !queryVariables?.onlyUniqEvents,
    queryKey: query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query
  };

  let listData =
    isPointsOfInterestAndTours && queryUpdatedAt
      ? pointsOfInterestAndToursListCache.get(queryUpdatedAt)
      : undefined;

  if (!listData) {
    listData = parseListItemsFromQuery(query, sectionData, sectionTitleDetail, queryOptions);

    if (isPointsOfInterestAndTours && queryUpdatedAt && listData?.length) {
      // Cache the already shuffled output so the same query result keeps the same order.
      listData = cachePointsOfInterestAndToursListData(queryUpdatedAt, listData);
    }
  }

  if (listData?.length && additionalData?.length) {
    listData.push(...additionalData);
    listData = _sortBy(listData, (item) => item.listDate);
  }

  if (listData?.length) {
    return (
      <View>
        {renderSectionHeader()}

        <ListComponent
          data={isRandom ? _shuffle(listData).slice(0, limit) : listData.slice(0, limit)}
          horizontal={horizontal}
          navigation={navigation}
          listType={listType}
          query={query}
          isIndexStartingAt1={isIndexStartingAt1}
        />

        {!!linkTitle && !!navigateLink && showLink && (
          <Wrapper>
            <Touchable accessibilityLabel={linkTitle} onPress={navigateLink}>
              <BoldText center primary underline>
                {linkTitle}
              </BoldText>
            </Touchable>
          </Wrapper>
        )}

        {!!buttonTitle && !!navigateButton && showButton && (
          <Wrapper>
            <Button title={buttonTitle} onPress={navigateButton} />
          </Wrapper>
        )}
      </View>
    );
  }

  if (!placeholder) {
    return null;
  }

  return (
    <View>
      {renderSectionHeader()}

      {placeholder}
    </View>
  );
};
/* eslint-enable complexity */
