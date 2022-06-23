import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useQuery } from 'react-query';

import {
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  VolunteerUser,
  Wrapper
} from '../../components';
import { texts } from '../../config';
import { storeVolunteerUserData } from '../../helpers';
import { useLogoutHeader, usePullToRefetch } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { me } from '../../queries/volunteer';

export const VolunteerMeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  useLogoutHeader({ query: QUERY_TYPES.VOLUNTEER.PROFILE, navigation });

  const { isLoading, isError, isSuccess, data, refetch } = useQuery(QUERY_TYPES.VOLUNTEER.ME, me);

  const RefreshControl = usePullToRefetch(refetch);

  useEffect(() => {
    if (isSuccess && data?.account) {
      // save user data to global state if there are no errors
      storeVolunteerUserData(data.account);
    }
  }, [isSuccess, data]);

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (isError || (isSuccess && data?.status !== 200)) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <RegularText>{texts.volunteer.errorLoadingUser}</RegularText>
        </Wrapper>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <VolunteerUser data={data} navigation={navigation} route={route} />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
