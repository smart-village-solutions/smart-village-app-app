import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import {
  Button,
  EmptyMessage,
  HtmlView,
  LoadingSpinner,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { ScreenName } from '../../types';

export const ARInfoScreen = ({ navigation }) => {
  const { data: arInfo = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'arInfo'
  });

  const RefreshControl = usePullToRefetch(refetch);

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
          <Wrapper>
            <HtmlView html={arInfo} />
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
