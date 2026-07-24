import PropTypes from 'prop-types';
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
} from '../../../components';
import { texts } from '../../../config';
import { usePullToRefetch, useStaticContent } from '../../../hooks';
import { useReadAloudScrollContentContainerStyle } from '../../../ReadAloudAvailabilityProvider';
import { ScreenName } from '../../../types';

export const ConsulRegisteredScreen = ({ navigation }) => {
  const scrollContentContainerStyle = useReadAloudScrollContentContainerStyle();
  const {
    data: registeredHtml = '',
    error,
    loading,
    refetch
  } = useStaticContent({
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
      <ScrollView
        contentContainerStyle={scrollContentContainerStyle}
        refreshControl={RefreshControl}
      >
        <Wrapper>
          <ReadAloudContent content={registeredHtml} contentId="consul-registered-content" />
          <HtmlView html={registeredHtml} />
        </Wrapper>
        <Wrapper>
          <Button
            invert
            title={texts.consul.ok}
            onPress={() => navigation.navigate(ScreenName.ConsulLoginScreen)}
          />
        </Wrapper>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConsulRegisteredScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
