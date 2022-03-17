import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useQuery } from 'react-apollo';

import {
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  ConsulWelcome,
  SectionHeader,
  Wrapper,
  WrapperWithOrientation
} from '../../../components';
import { colors, texts } from '../../../config';
import { CONSUL_USER } from '../../../queries/Consul';
import { ConsulClient } from '../../../ConsulClient';

export const ConsulHomeScreen = ({ navigation }) => {
  // useState
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingUser, setRefreshingUser] = useState(false);
  const [user, setUser] = useState(null);

  // GraphQL
  const { loading, data, error } = useQuery(CONSUL_USER, {
    client: ConsulClient,
    variables: { id: 1 }
  });

  useEffect(() => {
    if (data) {
      setUser(data.user);
    }
  }, []);

  const refresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const refreshUser = () => {
    setRefreshingUser(true);

    setTimeout(() => {
      setRefreshingUser(false);
    }, 500);
  };

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!user?.id) {
    return <ConsulWelcome navigation={navigation} />;
  }

  if (!user || error) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshingUser}
            onRefresh={refreshUser}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <Wrapper>
          <RegularText center>{texts.consul.errorLoadingUser}</RegularText>
        </Wrapper>
      </ScrollView>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <WrapperWithOrientation>
          <SectionHeader title={texts.encounter.homeTitle} />
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConsulHomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired
};
