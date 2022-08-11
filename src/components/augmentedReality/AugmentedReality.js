import { isARSupportedOnDevice } from '@viro-community/react-viro';
import PropTypes from 'prop-types';
import { default as React, default as React, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';

import { consts, device, texts } from '../../config';
import { checkDownloadedData } from '../../helpers';
import { getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';

import { ARModal } from './ARModal';
import { ARObjectList } from './ARObjectList';
import { WhatIsARButton } from './WhatIsARButton';

export const AugmentedReality = ({ id, navigation, onSettingsScreen, tourStops }) => {
  const { globalSettings } = useContext(SettingsContext);

  const { data: tourData } = useQuery(getQuery(QUERY_TYPES.TOUR_STOPS), {
    variables: { id },
    skip: !onSettingsScreen
  });

  const [isARSupported, setIsARSupported] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const { settings = {} } = globalSettings;

    settings.ar &&
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

  if (onSettingsScreen) {
    return (
      <ARObjectList
        data={tourData?.tour?.tourStops}
        setData={setData}
        isLoading={isLoading}
        showDeleteAllButton
        showDownloadAllButton
        showFreeSpace
        showTitle
      />
    );
  }

  if (isLoading) return <LoadingSpinner loading />;

  const a11yText = consts.a11yLabel;

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
  id: PropTypes.string,
  navigation: PropTypes.object,
  onSettingsScreen: PropTypes.bool,
  tourStops: PropTypes.array
};
