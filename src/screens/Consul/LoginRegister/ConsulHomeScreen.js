import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

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

export const ConsulHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingUser, setRefreshingUser] = useState(false);
  const loading = false;
  const error = false;
  const user = false;
  const userId = false;

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

  if (!userId) {
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
          <RegularText center>{texts.encounter.errorLoadingUser}</RegularText>
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
