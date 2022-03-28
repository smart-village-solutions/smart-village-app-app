import { StackNavigationProp } from '@react-navigation/stack';
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
  buttonTitle?: string;
  horizontal?: boolean;
  limit?: number;
  linkTitle?: string;
  loading?: boolean;
  navigate?: () => void;
  navigateButton?: () => void;
  navigateLink?: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: string;
  sectionData?: unknown[];
  sectionTitle?: string;
  sectionTitleDetail?: string;
  showButton?: boolean;
  showLink?: boolean;
};

// eslint-disable-next-line complexity
export const DataListSection = ({
  buttonTitle,
  horizontal,
  limit = 3,
  linkTitle,
  loading,
  navigate,
  navigateButton,
  navigateLink,
  navigation,
  placeholder,
  query,
  sectionData,
  sectionTitle,
  sectionTitleDetail,
  showButton,
  showLink
}: Props) => {
  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const listData = parseListItemsFromQuery(query, sectionData, sectionTitleDetail, {
    withDate:
      query === QUERY_TYPES.EVENT_RECORDS ||
      query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL ||
      query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY ||
      query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS,
    skipLastDivider: true
  });

  return (
    <View>
      {!!sectionTitle && (
        <SectionHeader onPress={navigate} title={sectionTitle ?? getTitleForQuery(query)} />
      )}
      {!!limit &&
        (listData?.length ? (
          <ListComponent
            data={listData.slice(0, limit)}
            horizontal={horizontal}
            navigation={navigation}
            query={query}
          />
        ) : (
          !!placeholder && placeholder
        ))}
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
};
