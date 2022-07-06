import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { consts, device, Icon, normalize, texts } from '../../config';
import { checkDownloadedData, DOWNLOAD_TYPE } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow, WrapperWithOrientation } from '../Wrapper';

import { ARModal } from './ARModal';
import { ARObjectList } from './ARObjectList';

export const AugmentedReality = ({ navigation, onSettingsScreen }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: staticData, loading, refetch } = useStaticContent({
    name: 'arDownloadableDataList',
    type: 'json'
  });

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [listItemDownloadType, setListItemDownloadType] = useState(DOWNLOAD_TYPE.DOWNLOADABLE);

  useEffect(() => {
    setData(staticData);

    if (staticData?.length) {
      checkDownloadData({ data: staticData });
    }
  }, [staticData]);

  const checkDownloadData = async ({ data }) => {
    setIsLoading(true);
    await checkDownloadedData({ data, setData });
    setIsLoading(false);
  };

  const a11yText = consts.a11yLabel;

  if (onSettingsScreen) {
    return (
      <ARObjectList
        data={data}
        setData={setData}
        isLoading={isLoading}
        refetch={refetch}
        setListItemDownloadType={setListItemDownloadType}
        showDeleteAllButton
        showDownloadAllButton
        showFreeSpace
        showTitle
      />
    );
  }

  return (
    <>
      <WrapperWithOrientation>
        <Wrapper>
          <Touchable
            onPress={() =>
              navigation.navigate(ScreenName.ARInfo, {
                data,
                isLoading,
                listItemDownloadType,
                refetch
              })
            }
          >
            <WrapperRow spaceBetween>
              <RegularText>{texts.augmentedReality.whatIsAugmentedReality}</RegularText>
              <Icon.ArrowRight size={normalize(20)} />
            </WrapperRow>
          </Touchable>
        </Wrapper>
        <Wrapper>
          <Button
            onPress={() => setIsModalVisible(!isModalVisible)}
            invert
            title={texts.augmentedReality.loadingArtworks}
          />
        </Wrapper>
        <TitleContainer>
          <Title accessibilityLabel={`(${texts.augmentedReality.worksOfArt}) ${a11yText.heading}`}>
            {texts.augmentedReality.worksOfArt}
          </Title>
        </TitleContainer>
        {device.platform === 'ios' && <TitleShadow />}

        <ARObjectList
          data={data}
          setData={setData}
          isLoading={isLoading}
          navigation={navigation}
          refetch={refetch}
          showOnDetailPage
        />
      </WrapperWithOrientation>

      <ARModal
        data={data}
        setData={setData}
        isListView
        isLoading={isLoading}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        listItemDownloadType={listItemDownloadType}
        setListItemDownloadType={setListItemDownloadType}
        refetch={refetch}
        showTitle
      />
    </>
  );
};

AugmentedReality.propTypes = {
  navigation: PropTypes.object,
  onSettingsScreen: PropTypes.bool
};
