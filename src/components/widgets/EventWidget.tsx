import moment from 'moment';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, consts, normalize, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { calendar } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { Icon } from '../Icon';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

type Props = {
  navigation: NavigationScreenProp<never>;
};

export const EventWidget = ({ navigation }: Props) => {
  const refreshTime = useRefreshTime('event-widget', consts.REFRESH_INTERVALS.ONCE_A_DAY);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const currentDate = moment().format('YYYY-MM-DD');
  const queryVariables = {
    dateRange: [currentDate, currentDate]
  };

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.EVENT_RECORDS), {
    fetchPolicy,
    variables: queryVariables
  });

  const onPress = useCallback(() => {
    navigation.navigate('Index', {
      title: 'Veranstaltungen',
      query: QUERY_TYPES.EVENT_RECORDS,
      queryVariables,
      rootRouteName: 'EventRecords'
    });
  }, [navigation]);

  const eventCount = data?.eventRecords?.length;

  return (
    <Touchable onPress={onPress}>
      <Wrapper>
        <WrapperRow center>
          <Icon style={styles.icon} xml={calendar(colors.primary)} />
          <BoldText primary style={styles.count}>
            {loading ? ' ' : eventCount}
          </BoldText>
        </WrapperRow>
        <RegularText primary>{texts.homeTitles.events}</RegularText>
      </Wrapper>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  count: {
    fontSize: normalize(20),
    paddingTop: normalize(4)
  },
  icon: {
    paddingHorizontal: normalize(8)
  }
});
