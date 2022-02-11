import React, { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import {
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  VolunteerWelcome,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { colors, texts } from '../../config';

export const VolunteerHomeScreen = ({ navigation, route }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingUser, setRefreshingUser] = useState(false);
  const loading = false;
  const error = false;
  const user = false;
  const userId = false;

  const refresh = () => {
    setRefreshing(true);

    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const refreshUser = () => {
    setRefreshingUser(true);

    // we simulate state change of `refreshingUser` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshingUser(false);
    }, 500);
  };

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!userId) {
    return <VolunteerWelcome navigation={navigation} />;
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
