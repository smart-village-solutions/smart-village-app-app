import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import {
  ARModal,
  Button,
  EmptyMessage,
  HtmlView,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../../components';
import { consts, device, Icon, normalize, texts } from '../../config';
import { usePullToRefetch, useStaticContent } from '../../hooks';
import { ScreenName } from '../../types';
import { checkDownloadedData, downloadObject, DOWNLOAD_TYPE } from '../../helpers';

export const ArtworkDetailScreen = ({ route, navigation }) => {
  const { data: artworkDetail = '', error, loading, refetch } = useStaticContent({
    type: 'html',
    name: ''
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState(route?.params?.data ?? []);
  const [isLoading, setIsLoading] = useState(loading);
  const index = route?.params?.index;
  const { DOWNLOAD_TYPE: itemDownloadType } = data[index];

  const RefreshControl = usePullToRefetch(refetch);
  const a11yText = consts.a11yLabel;

  useEffect(() => {
    if (data?.length) {
      checkDownloadData({ data });
    }
  }, []);

  const checkDownloadData = async ({ data }) => {
    setIsLoading(true);
    const { checkedData } = await checkDownloadedData({ data });
    setData(checkedData);
    setIsLoading(false);
  };

  const onPress = async () => {
    if (itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED) {
      navigation.navigate(ScreenName.ARShow, { data, index });
    } else {
      setIsModalVisible(true);

      await downloadObject({
        index,
        data,
        setData
      });
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
          <TitleContainer>
            <Title
              accessibilityLabel={`(${texts.augmentedReality.whatIsAugmentedReality}) ${a11yText.heading}`}
            >
              {data[index].title}
            </Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
        </WrapperWithOrientation>

        <WrapperWithOrientation>
          <Wrapper>
            <HtmlView html={artworkDetail} />
          </Wrapper>

          <Wrapper>
            <Touchable onPress={() => navigation.navigate(ScreenName.ARInfo)}>
              <WrapperRow spaceBetween>
                <RegularText>{texts.augmentedReality.whatIsAugmentedReality}</RegularText>
                <Icon.ArrowRight size={normalize(20)} />
              </WrapperRow>
            </Touchable>
          </Wrapper>

          <Wrapper>
            <Button
              onPress={onPress}
              title={
                itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED
                  ? 'AR Kunst gucken'
                  : 'Downloaden & AR Kunst gucken'
              }
            />
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>

      <ARModal
        item={data[index]}
        isModalVisible={isModalVisible}
        onModalVisible={() => setIsModalVisible(!isModalVisible)}
      />
    </SafeAreaViewFlex>
  );
};

ArtworkDetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
