import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '../config';
import { getTitleForQuery, parseListItemsFromQuery } from '../helpers';

import { Button } from './Button';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { SectionHeader } from './SectionHeader';
import { Wrapper } from './Wrapper';

type Props = {
  buttonTitle?: string;
  horizontal?: boolean;
  limit?: number;
  loading?: boolean;
  navigate?: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: string;
  sectionData?: unknown[];
  sectionTitle?: string;
  sectionTitleDetail?: string;
  showButton?: boolean;
};

export const DataListSection = ({
  buttonTitle,
  horizontal,
  limit = 3,
  loading,
  navigate,
  navigation,
  placeholder,
  query,
  sectionData,
  sectionTitle,
  sectionTitleDetail,
  showButton
}: Props) => {
  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const listData = parseListItemsFromQuery(query, sectionData, sectionTitleDetail, {
    skipLastDivider: true
  });

  if (listData?.length) {
    return (
      <View>
        <SectionHeader onPress={navigate} title={sectionTitle ?? getTitleForQuery(query)} />
        <ListComponent
          data={listData.slice(0, limit)}
          horizontal={horizontal}
          navigation={navigation}
          query={query}
        />
        {!!buttonTitle && !!navigate && showButton && (
          <Wrapper>
            <Button title={buttonTitle} onPress={navigate} />
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
      <SectionHeader onPress={navigate} title={sectionTitle ?? getTitleForQuery(query)} />
      {placeholder}
    </View>
  );
};
