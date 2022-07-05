import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';

import {
  ARModal,
  Button,
  EmptyMessage,
  HiddenModalAlert,
  HtmlView,
  LoadingSpinner,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';

export const ARInfoScreen = () => {
  const { data: arInfo = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'arInfo'
  });

  const RefreshControl = usePullToRefetch(refetch);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
              onPress={() => setIsModalVisible(!isModalVisible)}
            />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>

      <ARModal
        showTitle
        isListView
        item={{
          DOWNLOAD_TYPE: 'downloaded',
          progress: 0,
          progressSize: 0,
          size: 0,
          title: 'test',
          totalSize: 0
        }}
        isModalVisible={isModalVisible}
        onModalVisible={() =>
          HiddenModalAlert({ onPress: () => setIsModalVisible(!isModalVisible) })
        }
      />
    </SafeAreaViewFlex>
  );
};

ARInfoScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
