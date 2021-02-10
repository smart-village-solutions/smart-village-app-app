import moment from 'moment';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';
import { NavigationScreenProp } from 'react-navigation';

import { colors, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { lunch } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { DefaultWidget } from './DefaultWidget';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const LunchWidget = ({ navigation }: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime('lunch-widget');

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

  useHomeRefresh(refetch);

  const onPress = useCallback(() => navigation.navigate('Lunch', { title: texts.widgets.lunch }), [
    navigation
  ]);

  return (
    <DefaultWidget
      icon={lunch(colors.primary)}
      count={data?.[QUERY_TYPES.LUNCHES]?.length}
      onPress={onPress}
      text={texts.widgets.lunch}
    />
  );
};
