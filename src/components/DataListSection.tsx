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
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: string;
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
  placeholder,
  query,
  queryVariables,
  sectionData,
  sectionTitle = getTitleForQuery(query),
  sectionTitleDetail,
  showButton,
  showLink
}: Props) => {
  if (loading) {
    return (
      <View>
        {!!sectionTitle && <SectionHeader onPress={navigate} title={sectionTitle} />}

        <LoadingContainer>
          <ActivityIndicator color={colors.refreshControl} />
        </LoadingContainer>
      </View>
    );
  }

  let listData = parseListItemsFromQuery(query, sectionData, sectionTitleDetail, {
    withDate:
      (query === QUERY_TYPES.EVENT_RECORDS && !queryVariables?.onlyUniqEvents) ||
      query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL ||
      query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY ||
      query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS,
    withTime: query === QUERY_TYPES.EVENT_RECORDS && !queryVariables?.onlyUniqEvents,
    skipLastDivider: true,
    queryKey: query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query
  });

  if (listData?.length && additionalData?.length) {
    listData.push(...additionalData);
    listData = _sortBy(listData, (item) => item.listDate);
  }

  if (listData?.length) {
    return (
      <View>
        {!!sectionTitle && <SectionHeader onPress={navigate} title={sectionTitle} />}

        <ListComponent
          data={isRandom ? _shuffle(listData).slice(0, limit) : listData.slice(0, limit)}
          horizontal={horizontal}
          navigation={navigation}
          query={query}
          isIndexStartingAt1={isIndexStartingAt1}
        />

        {!!linkTitle && !!navigateLink && showLink && (
          <Wrapper>
            <Touchable onPress={navigateLink}>
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
      {!!sectionTitle && <SectionHeader onPress={navigate} title={sectionTitle} />}

      {placeholder}
    </View>
  );
};
/* eslint-enable complexity */
