import { useNavigation } from 'expo-router/react-navigation';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';

import { consts, Icon, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

const { REFRESH_INTERVALS } = consts;

export const VoucherWidget = ({ text, additionalProps, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();
  const refreshTime = useRefreshTime('voucher-widget', REFRESH_INTERVALS.ONCE_A_DAY);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.VOUCHERS), {
    fetchPolicy,
    skip: !refreshTime
  });

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.VoucherIndex, {
      query: QUERY_TYPES.VOUCHERS,
      title: texts.screenTitles.voucher.index
    });
  }, [navigation]);

  const count = data?.genericItems?.length || 0;

  return (
    <DefaultWidget
      count={loading ? undefined : count}
      Icon={Icon.Voucher}
      onPress={onPress}
      svg={additionalProps?.svg}
      text={text ?? texts.widgets.vouchers}
      widgetStyle={widgetStyle}
    />
  );
};
