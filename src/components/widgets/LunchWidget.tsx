import { useNavigation } from '@react-navigation/core';
import moment from 'moment';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';

import { consts, Icon, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh, useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

const today = moment().format('YYYY-MM-DD');

export const LunchWidget = ({ text, additionalProps, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime('lunch-widget', consts.REFRESH_INTERVALS.ONCE_PER_HOUR);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });
  const [variables] = useState({ dateRange: [today, today] });

  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.LUNCHES), {
    fetchPolicy,
    variables,
    skip: !refreshTime
  });

  const onPress = useCallback(
    () => navigation.navigate(ScreenName.Lunch, { title: text ?? texts.widgets.lunch }),
    [navigation, text]
  );

  useHomeRefresh(refetch);

  const count = data?.lunches?.length || 0;

  return (
    <DefaultWidget
      count={loading ? undefined : count}
      Icon={Icon.Lunch}
      image={additionalProps?.image}
      onPress={onPress}
      text={text ?? texts.widgets.lunch}
      widgetStyle={widgetStyle}
    />
  );
};
