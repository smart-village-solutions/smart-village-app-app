import { NavigationProp } from '@react-navigation/core';
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';

import * as appJson from '../../../app.json';
import { secrets, texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { HtmlView } from '../HtmlView';
import { LoadingSpinner } from '../LoadingSpinner';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

const namespace = appJson.expo.slug as keyof typeof secrets;

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: NavigationProp<any>;
};

export const VolunteerWelcome = ({ navigation }: Props) => {
  const { data: welcomeHtml = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'ehrenamt-willkommen'
  });

  const onPressLogin = () => navigation.navigate(ScreenName.VolunteerLogin);
  const onPressRegister = () => navigation.navigate(ScreenName.VolunteerRegistration);

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
