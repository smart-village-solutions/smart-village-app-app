import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';

import { HeaderRight } from '../../components';
import { navigatorConfig } from '../../config/navigation';
import { QUERY_TYPES } from '../../queries';

export const useConversationsHeader = ({
  query,
  navigation,
  route
}: { query: string } & StackScreenProps<any>) => {
  useEffect(() => {
    if (query !== QUERY_TYPES.VOLUNTEER.CONVERSATIONS) return;

    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            withChat: true,
            withDrawer: navigatorConfig.type === 'drawer'
          }}
        />
      )
    });
  }, [query, navigation]);
};

export const useCalendarsHeader = ({
  query,
  navigation,
  route
}: { query: string } & StackScreenProps<any>) => {
  useEffect(() => {
    if (
      query !== QUERY_TYPES.VOLUNTEER.CALENDAR_ALL &&
      query !== QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY
    ) {
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            withCalendar: true,
            withDrawer: navigatorConfig.type === 'drawer'
          }}
        />
      )
    });
  }, [query, navigation]);
};

export const useGroupsHeader = ({
  query,
  navigation,
  route
}: { query: string } & StackScreenProps<any>) => {
  useEffect(() => {
    if (query !== QUERY_TYPES.VOLUNTEER.GROUPS && query !== QUERY_TYPES.VOLUNTEER.GROUPS_MY) return;

    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            withGroup: true,
            withDrawer: navigatorConfig.type === 'drawer'
          }}
        />
      )
    });
  }, [query, navigation]);
};
