import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import {
  ARModal,
  Button,
  EmptyMessage,
  HiddenModalAlert,
  HtmlView,
  LoadingSpinner,
  SafeAreaViewFlex,
  WhatIsARButton,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { texts } from '../../config';
import { checkDownloadedData, downloadObject, DOWNLOAD_TYPE } from '../../helpers';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { ScreenName } from '../../types';

export const ArtworkDetailScreen = ({ route, navigation }) => {
  const { data: artworkDetail = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: 'artworkDetail'
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState(route?.params?.data ?? []);
  const [isLoading, setIsLoading] = useState(loading);
  const index = route?.params?.index;
  const { downloadType: itemDownloadType } = data[index]?.payload;

  const RefreshControl = usePullToRefetch(refetch);

  useEffect(() => {
    if (data?.length) {
      checkDownloadData({ data });
    }
  }, []);

  const checkDownloadData = async ({ data }) => {
    setIsLoading(true);
    await checkDownloadedData({ data, setData });
    setIsLoading(false);
  };

  const onPress = async () => {
    switch (itemDownloadType) {
      case DOWNLOAD_TYPE.DOWNLOADABLE:
        setIsModalVisible(true);

        await downloadObject({ index, data, setData });

        break;
      case DOWNLOAD_TYPE.DOWNLOADED:
        navigation.navigate(ScreenName.ARShow, { data, index });

        break;
      default:
        setIsModalVisible(true);
    }
  };

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (error || !data.length) {
    return <EmptyMessage title={texts.augmentedReality.arInfoScreen.loadingError} />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <WrapperWithOrientation>
          <Wrapper>
            <HtmlView html={artworkDetail} />
          </Wrapper>

          <WhatIsARButton {...{ data, isLoading, navigation }} />

          <Wrapper>
            <Button
              onPress={onPress}
              title={
                itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED
                  ? texts.augmentedReality.artworkDetailScreen.lookAtArt
                  : texts.augmentedReality.artworkDetailScreen.downloadAndLookAtArt
              }
            />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>

      <ARModal
        data={data}
        index={index}
        isModalVisible={isModalVisible}
        onModalVisible={() => {
          switch (itemDownloadType) {
            case DOWNLOAD_TYPE.DOWNLOADING:
              HiddenModalAlert({ onPress: () => setIsModalVisible(!isModalVisible) });

              break;
            case DOWNLOAD_TYPE.DOWNLOADED:
              navigation.navigate(ScreenName.ARShow, { data, index });
              setIsModalVisible(!isModalVisible);

              break;
            default:
              setIsModalVisible(!isModalVisible);
          }
        }}
      />
    </SafeAreaViewFlex>
  );
};

ArtworkDetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
