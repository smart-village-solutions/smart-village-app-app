import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import { ConsulList, ConsulWelcome, LoadingSpinner, SafeAreaViewFlex } from '../../components';
import { getConsulUser, homeData } from '../../helpers';
import { useConsulUser, usePullToRefetch } from '../../hooks';

export const ConsulHomeScreen = ({ navigation, route }) => {
  const [userId, setUserId] = useState();
  const { refresh: refreshUser, isLoading, isError, isLoggedIn } = useConsulUser();
  const RefreshControl = usePullToRefetch();

  const refresh = useCallback(() => {
    refreshUser();
  }, [refreshUser]);

  const userID = useCallback(() => {
    getConsulUser().then((userInfo) => {
      if (userInfo) return setUserId(userInfo);
    });
  }, [refreshUser]);

  useEffect(refresh, [route.params?.refreshUser]);
  useEffect(userID, [route.params?.refreshUser]);

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (!isLoggedIn || isError) {
    return <ConsulWelcome navigation={navigation} />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <ConsulList data={homeData(userId)} navigation={navigation} />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConsulHomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object
};
