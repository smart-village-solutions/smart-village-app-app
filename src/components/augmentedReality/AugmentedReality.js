import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { isARSupportedOnDevice } from '@viro-community/react-viro';

import { colors, consts, device, texts } from '../../config';
import { checkDownloadedData, navigationToArtworksDetailScreen } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { location, locationIconAnchor } from '../../icons';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { IndexFilterWrapperAndList } from '../IndexFilterWrapperAndList';
import { LoadingSpinner } from '../LoadingSpinner';
import { Map } from '../map';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';

import { ARModal } from './ARModal';
import { ARObjectList } from './ARObjectList';
import { WhatIsARButton } from './WhatIsARButton';

const TOP_FILTER = {
  MAP_VIEW: 'mapView',
  LIST_VIEW: 'listView'
};

const INITIAL_FILTER = [
  { id: TOP_FILTER.MAP_VIEW, title: texts.augmentedReality.filter.mapView, selected: true },
  { id: TOP_FILTER.LIST_VIEW, title: texts.augmentedReality.filter.listView, selected: false }
];

export const AugmentedReality = ({ geometryTourData, navigation, onSettingsScreen, tourID }) => {
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
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectedFilterId = filter.find((entry) => entry.selected)?.id;
  const [modelId, setModelId] = useState();

  useEffect(() => {
    isARSupportedOnDevice(
      () => null,
      () => setIsARSupported(true)
    );
  }, []);

  useEffect(() => {
    navigationToArtworksDetailScreen({
      data,
      isNavigation: true,
      modelId,
      navigation,
      refetch
    });
  }, [modelId]);

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

  const mapMarkers = mapToMapMarkers(staticData);

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

      <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />

      {selectedFilterId === TOP_FILTER.LIST_VIEW && (
        <ARObjectList
          data={data}
          setData={setData}
          isLoading={isLoading}
          navigation={navigation}
          refetch={refetch}
          showOnDetailPage
        />
      )}

      {selectedFilterId === TOP_FILTER.MAP_VIEW && (
        <Map
          geometryTourData={geometryTourData}
          locations={mapMarkers}
          onMarkerPress={setModelId}
          onMaximizeButtonPress={() =>
            navigation.navigate(ScreenName.MapView, {
              augmentedRealityData: {
                data,
                refetch
              },
              geometryTourData,
              isAugmentedReality: true,
              isMaximizeButtonVisible: false,
              locations: mapMarkers
            })
          }
          isMaximizeButtonVisible
        />
      )}

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

const mapToMapMarkers = (augmentedReality) => {
  return augmentedReality
    ?.map((item) => {
      const latitude = item?.location?.lat;
      const longitude = item?.location?.lng;

      if (!latitude || !longitude) return undefined;
      return {
        icon: location(colors.primary),
        iconAnchor: locationIconAnchor,
        id: item.id.toString(),
        position: {
          lat: latitude,
          lng: longitude
        }
      };
    })
    .filter((item) => item !== undefined);
};

AugmentedReality.propTypes = {
  geometryTourData: PropTypes.array,
  navigation: PropTypes.object,
  onSettingsScreen: PropTypes.bool,
  tourID: PropTypes.string
};
