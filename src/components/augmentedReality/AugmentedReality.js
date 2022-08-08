import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { isARSupportedOnDevice } from '@viro-community/react-viro';
import { useQuery } from 'react-apollo';

import { consts, device, texts } from '../../config';
import { checkDownloadedData } from '../../helpers';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';
import { GET_TOUR_STOPS } from '../../queries/tours';

import { ARModal } from './ARModal';
import { ARObjectList } from './ARObjectList';
import { WhatIsARButton } from './WhatIsARButton';
import { getQuery, QUERY_TYPES } from '../../queries';

export const AugmentedReality = ({ id, navigation, onSettingsScreen }) => {
  const {
    data: {
      tour: { tourStops }
    },
    loading
  } = useQuery(getQuery(QUERY_TYPES.TOUR_STOPS), { variables: { id } });

  const [isARSupported, setIsARSupported] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(loading);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    isARSupportedOnDevice(
      () => null,
      () => setIsARSupported(true)
    );
  }, []);

  useEffect(() => {
    setData(tourStops);

    if (tourStops?.length) {
      checkDownloadData({ data: tourStops });
    }
  }, [tourStops]);

  const checkDownloadData = async ({ data }) => {
    setIsLoading(true);
    await checkDownloadedData({ data, setData });
    setIsLoading(false);
  };

  if (!isARSupported) return null;

  if (isLoading || !tourStops?.length) return <LoadingSpinner loading />;

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
  tourStops: PropTypes.array,
  id: PropTypes.string,
  navigation: PropTypes.object,
  onSettingsScreen: PropTypes.bool
};
