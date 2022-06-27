import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import {
  Button,
  EmptyMessage,
  HtmlView,
  LoadingSpinner,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  TitleShadow,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { consts, device, texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { ScreenName } from '../../types';

export const ARInfoScreen = ({ navigation }) => {
  const { data: arInfoHTML = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'arInfo'
  });

  const RefreshControl = usePullToRefetch(refetch);
  const a11yText = consts.a11yLabel;

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (error) {
    return <EmptyMessage title={texts.augmentedReality.arInfoScreen.loadingError} />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <WrapperWithOrientation>
          <TitleContainer>
            <Title
              accessibilityLabel={`(${texts.augmentedReality.whatIsAugmentedReality}) ${a11yText.heading}`}
            >
              {texts.augmentedReality.whatIsAugmentedReality}
            </Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
        </WrapperWithOrientation>

        <WrapperWithOrientation>
          <Wrapper>
            <HtmlView html={arInfoHTML} />
          </Wrapper>
          <Wrapper>
            <Button
              invert
              title={texts.augmentedReality.arInfoScreen.settingsButton}
              onPress={() => navigation.navigate(ScreenName.Settings)}
            />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ARInfoScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
