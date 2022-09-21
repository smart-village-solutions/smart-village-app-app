import { isARSupportedOnDevice } from '@viro-community/react-viro';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';

import { colors, consts, device, texts } from '../../config';
import { checkDownloadedData, navigationToArtworksDetailScreen } from '../../helpers';
import { location, locationIconAnchor } from '../../icons';
import { getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
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

export const AugmentedReality = ({ id, navigation, onSettingsScreen, tourStops }) => {
  const { globalSettings } = useContext(SettingsContext);

  const { data: tourData } = useQuery(getQuery(QUERY_TYPES.TOUR_STOPS), {
    variables: { id },
    skip: !onSettingsScreen
  });

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectedFilterId = filter.find((entry) => entry.selected)?.id;
  const [modelId, setModelId] = useState();

  useEffect(() => {
    const { settings = {} } = globalSettings;

    settings.ar &&
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
      navigation
    });
  }, [modelId]);

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

  if (isLoading) return <LoadingSpinner loading />;

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

  const mapMarkers = mapToMapMarkers(data);
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

      <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />

      {selectedFilterId === TOP_FILTER.LIST_VIEW && (
        <ARObjectList
          data={data}
          setData={setData}
          isLoading={isLoading}
          navigation={navigation}
          showOnDetailPage
        />
      )}

      {selectedFilterId === TOP_FILTER.MAP_VIEW && (
        <Map
          locations={mapMarkers}
          onMarkerPress={setModelId}
          onMaximizeButtonPress={() =>
            navigation.navigate(ScreenName.MapView, {
              augmentedRealityData: { data },
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
        showTitle
      />
    </>
  );
};

const mapToMapMarkers = (data) =>
  data
    ?.map((item) => {
      const latitude = item.location?.geoLocation?.latitude;
      const longitude = item.location?.geoLocation?.longitude;

      if (!latitude || !longitude) return undefined;

      return {
        icon: location(colors.primary),
        iconAnchor: locationIconAnchor,
        id: item.id.toString(),
        position: {
          latitude,
          longitude
        }
      };
    })
    .filter((item) => item !== undefined);

AugmentedReality.propTypes = {
  id: PropTypes.string,
  navigation: PropTypes.object,
  onSettingsScreen: PropTypes.bool,
  tourStops: PropTypes.array
};
