import { NavigationProp } from '@react-navigation/core';
import React from 'react';
import { ScrollView } from 'react-native';

import {
  Button,
  HtmlView,
  LoadingSpinner,
  ReadAloudContent,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { useReadAloudScrollContentContainerStyle } from '../../ReadAloudAvailabilityProvider';
import { ScreenName } from '../../types';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: NavigationProp<any>;
};

export const VolunteerRegisteredScreen = ({ navigation }: Props) => {
  const scrollContentContainerStyle = useReadAloudScrollContentContainerStyle();
  const {
    data: registeredHtml = '',
    error,
    loading,
    refetch
  } = useStaticContent({
    type: 'html',
    name: 'ehrenamt-registriert'
  });

  const RefreshControl = usePullToRefetch(refetch);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (error) {
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
      <ScrollView
        contentContainerStyle={scrollContentContainerStyle}
        refreshControl={RefreshControl}
      >
        <Wrapper>
          <ReadAloudContent content={registeredHtml} contentId="volunteer-registered-content" />
          <HtmlView html={registeredHtml} />
        </Wrapper>
        <Wrapper>
          <Button
            onPress={() => {
              navigation.navigate(ScreenName.VolunteerHome, {
                // refreshUser param causes the home screen to update and to le logged in
                refreshUser: new Date().valueOf()
              });
            }}
            title={texts.volunteer.next}
            notFullWidth
          />
        </Wrapper>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
