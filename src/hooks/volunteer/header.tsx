import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';

import { HeaderRight } from '../../components';
import { QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';

export const useConversationsHeader = ({
  query,
  navigation,
  route
}: { query: string } & StackScreenProps<any>) => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

  useEffect(() => {
    if (query !== QUERY_TYPES.VOLUNTEER.CONVERSATIONS) return;

    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            withChat: true,
            withDrawer: navigationType === 'drawer'
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
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

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
            withDrawer: navigationType === 'drawer'
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
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;

  useEffect(() => {
    if (query !== QUERY_TYPES.VOLUNTEER.GROUPS && query !== QUERY_TYPES.VOLUNTEER.GROUPS_MY) return;

    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            withGroup: true,
            withDrawer: navigationType === 'drawer'
          }}
        />
      )
    });
  }, [query, navigation]);
};
