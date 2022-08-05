import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { isARSupportedOnDevice } from '@viro-community/react-viro';

import { consts, device, texts } from '../../config';
import { checkDownloadedData } from '../../helpers';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';

import { ARModal } from './ARModal';
import { ARObjectList } from './ARObjectList';
import { WhatIsARButton } from './WhatIsARButton';

export const AugmentedReality = ({ data: staticData, navigation, onSettingsScreen }) => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    isARSupportedOnDevice(
      () => null,
      () => setIsARSupported(true)
    );
  }, []);

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

  if (!isARSupported) return null;

  if (isLoading || !staticData) return <LoadingSpinner loading />;

  const a11yText = consts.a11yLabel;

  if (onSettingsScreen) {
    return (
      <ARObjectList
        data={data}
        setData={setData}
        isLoading={isLoading}
        showDeleteAllButton
        showDownloadAllButton
        showFreeSpace
        showTitle
      />
    );
  }

  return (
    <>
      <WhatIsARButton {...{ data, isLoading, navigation }} />

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
        showOnDetailPage
      />

      <ARModal
        data={data}
        setData={setData}
        isListView
        isLoading={isLoading}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        showTitle
      />
    </>
  );
};

AugmentedReality.propTypes = {
  data: PropTypes.array,
  navigation: PropTypes.object,
  onSettingsScreen: PropTypes.bool
};
