import { useNavigation } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';

import { consts, Icon, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { NetworkContext } from '../../NetworkProvider';
import { SURVEYS } from '../../queries/survey';
import { Survey, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const SurveyWidget = ({ text }: WidgetProps) => {
  const navigation = useNavigation();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime('survey-widget', consts.REFRESH_INTERVALS.ONCE_PER_HOUR);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const { data: surveys, refetch } = useQuery<{
    ongoing: Survey[];
    archived: Survey[];
  }>(SURVEYS, { fetchPolicy });

  const onPress = useCallback(
    () => navigation.navigate('SurveyOverview', { title: text ?? texts.widgets.surveys }),
    [navigation, text]
  );

  useHomeRefresh(refetch);

  return (
    <DefaultWidget
      count={surveys?.ongoing.length}
      Icon={(props) => <Icon.Surveys {...props} size={26} />}
      onPress={onPress}
      text={text ?? texts.widgets.surveys}
    />
  );
};
