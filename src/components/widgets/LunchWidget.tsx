import { useNavigation } from '@react-navigation/core';
import moment from 'moment';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';

import { consts, NewIcon, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const LunchWidget = ({ text }: WidgetProps) => {
  const navigation = useNavigation();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime('lunch-widget', consts.REFRESH_INTERVALS.ONCE_PER_HOUR);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const currentDate = moment().format('YYYY-MM-DD');

  const variables = {
    dateRange: [currentDate, currentDate]
  };

  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.LUNCHES), {
    fetchPolicy,
    variables,
    skip: !refreshTime
  });

  const onPress = useCallback(
    () => navigation.navigate('Lunch', { title: text ?? texts.widgets.lunch }),
    [navigation, text]
  );

  useHomeRefresh(refetch);

  return (
    <DefaultWidget
      count={data?.[QUERY_TYPES.LUNCHES]?.length}
      Icon={NewIcon.Lunch}
      onPress={onPress}
      text={text ?? texts.widgets.lunch}
    />
  );
};
