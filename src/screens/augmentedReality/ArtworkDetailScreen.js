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
  Wrapper
} from '../../components';
import { texts } from '../../config';
import { DOWNLOAD_TYPE, checkDownloadedData, downloadObject } from '../../helpers';
import { ScreenName } from '../../types';

export const ArtworkDetailScreen = ({ route, navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState(route?.params?.data ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const index = route?.params?.index;
  const description = data[index]?.description;
  const { downloadType } = data[index]?.payload;

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
    switch (downloadType) {
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

  if (!data.length) {
    return <EmptyMessage title={texts.augmentedReality.arInfoScreen.loadingError} />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        {!!description && (
          <Wrapper>
            <HtmlView html={description} />
          </Wrapper>
        )}

        <WhatIsARButton {...{ data, isLoading, navigation }} />

        <Wrapper>
          <Button
            onPress={onPress}
            title={
              downloadType === DOWNLOAD_TYPE.DOWNLOADED
                ? texts.augmentedReality.artworkDetailScreen.lookAtArt
                : texts.augmentedReality.artworkDetailScreen.downloadAndLookAtArt
            }
          />
        </Wrapper>
      </ScrollView>

      <ARModal
        data={data}
        index={index}
        isModalVisible={isModalVisible}
        onModalVisible={() => {
          switch (downloadType) {
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
