import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { consts, device, texts } from '../../config';
import { checkDownloadedData, ARSupportingDevice } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';

import { ARModal } from './ARModal';
import { ARObjectList } from './ARObjectList';
import { WhatIsARButton } from './WhatIsARButton';

export const AugmentedReality = ({ navigation, onSettingsScreen, tourID }) => {
  const {
    data: staticData,
    error,
    loading,
    refetch
  } = useStaticContent({
    name: `arDownloadableDataList-${tourID}`,
    type: 'json'
  });

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isARSupported } = ARSupportingDevice();

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

  if (error || !isARSupported) return null;

  if (isLoading || !staticData) return <LoadingSpinner loading />;

  const a11yText = consts.a11yLabel;

  if (onSettingsScreen) {
    return (
      <ARObjectList
        data={data}
        setData={setData}
        isLoading={isLoading}
        refetch={refetch}
        showDeleteAllButton
        showDownloadAllButton
        showFreeSpace
        showTitle
      />
    );
  }

  return (
    <>
      <WhatIsARButton {...{ data, isLoading, navigation, refetch }} />

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

      <ARModal
        data={data}
        setData={setData}
        isListView
        isLoading={isLoading}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        refetch={refetch}
        showTitle
      />
    </>
  );
};

AugmentedReality.propTypes = {
  navigation: PropTypes.object,
  onSettingsScreen: PropTypes.bool,
  tourID: PropTypes.string
};
