import { NavigationProp } from '@react-navigation/core';
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';

import { HtmlView } from '../HtmlView';
import { texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: NavigationProp<any>;
};

export const VolunteerWelcome = ({ navigation }: Props) => {
  const { data: welcomeHtml = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'ehrenamt-willkommen'
  });

  const onPressLogin = useCallback(() => {
    navigation.navigate(ScreenName.VolunteerLogin);
  }, [navigation]);

  const onPressRegister = useCallback(() => {
    navigation.navigate(ScreenName.VolunteerRegistration);
  }, [navigation]);

  const RefreshControl = usePullToRefetch(refetch);

  if (!welcomeHtml && loading) {
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
      <ScrollView refreshControl={RefreshControl}>
        <WrapperWithOrientation>
          <Wrapper>
            <HtmlView html={welcomeHtml} />
          </Wrapper>
          <Wrapper>
            <Button title={texts.volunteer.login} onPress={onPressLogin} />
            <Button invert title={texts.volunteer.register} onPress={onPressRegister} />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
