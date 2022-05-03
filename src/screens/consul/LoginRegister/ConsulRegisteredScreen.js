import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import {
  Button,
  HtmlView,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../../../components';
import { texts } from '../../../config';
import { usePullToRefetch, useStaticContent } from '../../../hooks';
import { ScreenName } from '../../../types';

export const ConsulRegisteredScreen = ({ navigation }) => {
  const { data: registeredHtml = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'consul-registriert'
  });

  const RefreshControl = usePullToRefetch(refetch);

  if (loading) {
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
            <HtmlView html={registeredHtml} />
          </Wrapper>
          <Wrapper>
            <Button
              invert
              title={texts.consul.ok}
              onPress={() => navigation.navigate(ScreenName.ConsulLoginScreen)}
            />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConsulRegisteredScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
