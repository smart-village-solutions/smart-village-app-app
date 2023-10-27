import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text } from 'react-native';
import { useQuery } from 'react-query';

import { colors } from '../../../config';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { SafeAreaViewFlex } from '../../SafeAreaViewFlex';

type Props = {
  navigation: StackNavigationProp<never>;
  route: RouteProp<any, never>;
};

export const SUEDetailScreen = ({ navigation, route }: Props) => {
  const queryVariables = route.params?.queryVariables ?? {};
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, queryVariables?.id],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID)(queryVariables?.id)
  );

  const refresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  console.warn({ data });

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        <Text>Detail Screen</Text>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

SUEDetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
