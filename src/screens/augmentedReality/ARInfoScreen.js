import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';

import {
  ARModal,
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

export const ARInfoScreen = ({ route }) => {
  const { data: arInfo = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'arInfo'
  });

  const RefreshControl = usePullToRefetch(refetch);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState(route?.params?.data ?? []);
  const [listItemDownloadType, setListItemDownloadType] = useState(
    route?.params?.listItemDownloadType ?? ''
  );

  const isLoading = route?.params?.isLoading ?? [];
  const objectRefetch = route?.params?.refetch ?? [];

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
        data={data}
        setData={setData}
        isListView
        isLoading={isLoading}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        listItemDownloadType={listItemDownloadType}
        setListItemDownloadType={setListItemDownloadType}
        refetch={objectRefetch}
        showTitle
      />
    </SafeAreaViewFlex>
  );
};

ARInfoScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
