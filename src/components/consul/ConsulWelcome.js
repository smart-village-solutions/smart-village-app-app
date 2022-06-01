import PropTypes from 'prop-types';
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

export const ConsulWelcome = ({ navigation }) => {
  const { data: welcomeHtml = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'consul-willkommen'
  });

  const onPressLogin = useCallback(() => {
    navigation.navigate(ScreenName.ConsulLoginScreen);
  }, [navigation]);

  const onPressRegister = useCallback(() => {
    navigation.navigate(ScreenName.ConsulRegisterScreen);
  }, [navigation]);

  const RefreshControl = usePullToRefetch(refetch);

  if (!welcomeHtml && loading) {
    return <LoadingSpinner loading />;
  }

  if (error) {
    return (
      <SafeAreaViewFlex>
        <Wrapper>
          <RegularText>{texts.consul.errorLoadingUser}</RegularText>
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
            <Button title={texts.consul.login} onPress={onPressLogin} />
            <Button invert title={texts.consul.register} onPress={onPressRegister} />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConsulWelcome.propTypes = {
  navigation: PropTypes.object.isRequired
};
