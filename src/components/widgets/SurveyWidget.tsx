import { useNavigation } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';

import { consts, Icon, normalize, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh, useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { SURVEYS } from '../../queries/survey';
import { ScreenName, Survey, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const SurveyWidget = ({ text, additionalProps, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime('survey-widget', consts.REFRESH_INTERVALS.ONCE_PER_HOUR);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const { data, loading, refetch } = useQuery<{
    ongoing: Survey[];
    archived: Survey[];
  }>(SURVEYS, { fetchPolicy });

  const onPress = useCallback(
    () =>
      navigation.navigate(ScreenName.SurveyOverview, {
        additionalProps,
        title: text ?? texts.widgets.surveys
      }),
    [navigation, text]
  );

  useHomeRefresh(refetch);

  const count = data?.ongoing?.length || 0;

  return (
    <DefaultWidget
      count={loading ? undefined : count}
      Icon={(props) => <Icon.Surveys {...props} size={normalize(22)} />}
      image={additionalProps?.image}
      onPress={onPress}
      text={text ?? texts.widgets.surveys}
      widgetStyle={widgetStyle}
    />
  );
};
