import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';

import { Button, HtmlView, LoadingSpinner, SafeAreaViewFlex, Wrapper } from '../../components';
import { texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { ScreenName } from '../../types';

// eslint-disable-next-line complexity
export const ProfileSignupScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const email = route.params?.email ?? '';
  const password = route.params?.password ?? '';
  const dataPrivacyLink = route.params?.webUrl ?? '';
  const from = route.params?.from ?? '';

  const { data, loading, refetch } = useStaticContent({
    refreshTimeKey: 'publicHtmlFile-profileSignup',
    name: 'profileSignup',
    type: 'html'
  });

  const RefreshControl = usePullToRefetch(refetch);

  const onPressLogin = useCallback(() => {
    navigation.navigate(ScreenName.ProfileLogin, {
      email,
      from,
      password,
      webUrl: dataPrivacyLink
    });
  }, [navigation]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <Wrapper>
          <HtmlView html={data} />
        </Wrapper>
        <Wrapper>
          <Button title={texts.profile.login} onPress={onPressLogin} />
        </Wrapper>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
