import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { LoadingSpinner, SafeAreaViewFlex, ConsulWelcome } from '../../components';
import { colors } from '../../config';
import { useConsulUser } from '../../hooks';
import { getConsulUser, homeData } from '../../helpers';
import { ConsulListComponent } from '../../components';

export const ConsulHomeScreen = ({ navigation, route }) => {
  // useState
  const [refreshingHome, setRefreshingHome] = useState(false);
  const [userId, setUserId] = useState();
  const { refresh: refreshUser, isLoading, isError, isLoggedIn } = useConsulUser();

  //Get User id and set for homeData query variables
  getConsulUser().then((val) => {
    if (val) return setUserId(JSON.parse(val).id);
  });

  const refresh = useCallback(() => {
    refreshUser();
  }, [refreshUser]);

  const refreshHome = () => {
    setRefreshingHome(true);

    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshingHome(false);
    }, 1500);
  };

  useEffect(refresh, [route.params?.refreshUser]);

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (!isLoggedIn || isError) {
    return <ConsulWelcome navigation={navigation} />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshingHome}
            onRefresh={refreshHome}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <ConsulListComponent data={homeData(userId)} navigation={navigation} />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConsulHomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func,
    setOptions: PropTypes.func
  }).isRequired,
  route: PropTypes.object
};
