import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshControl, ScrollView, Text } from 'react-native';

import { LoadingSpinner, SafeAreaViewFlex, ConsulWelcome } from '../../../components';
import { colors } from '../../../config';
import { useConsulUser } from '../../../hooks/Consul/useConsulUser';

export const ConsulHomeScreen = ({ navigation, route }) => {
  // useState
  const [refreshingHome, setRefreshingHome] = useState(false);
  const { refresh: refreshUser, isLoading, isError, isLoggedIn } = useConsulUser();

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
        {/* TODO! */}
        {NAVIGATION.map((item, index) => (
          <Text key={index}>{item.name}</Text>
        ))}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConsulHomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func,
    setOptions: PropTypes.object
  }).isRequired,
  route: PropTypes.object
};

const NAVIGATION = [
  {
    name: 'User Logged In'
  }
];
