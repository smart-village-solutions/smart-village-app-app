import { isARSupportedOnDevice } from '@reactvision/react-viro';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';

import { SettingsContext } from '../../SettingsProvider';
import { texts } from '../../config';
import { checkDownloadedData, navigationToArtworksDetailScreen } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { IndexFilterWrapperAndList } from '../IndexFilterWrapperAndList';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { Wrapper } from '../Wrapper';
import { Map } from '../map';

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

export const AugmentedReality = ({
  geometryTourData,
  id,
  navigation,
  onSettingsScreen,
  tourStops
}) => {
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

  useEffect(() => {
    const { settings = {} } = globalSettings;

    const supportAr = async () => {
      try {
        const isARSupported = (await isARSupportedOnDevice())?.isARSupported;

        if (isARSupported) {
          setIsARSupported(true);
        }
      } catch (error) {
        // if Viro is not integrated, we need to catch the error for `isARSupportedOnDevice of null`
        console.error(error);
      }
    };

    !!settings.ar?.tourId && supportAr();
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

      <SectionHeader title={texts.augmentedReality.worksOfArt} />
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
          geometryTourData={geometryTourData}
          locations={mapMarkers}
          onMarkerPress={(modelId) =>
            navigationToArtworksDetailScreen({
              data,
              isNavigation: true,
              modelId,
              navigation
            })
          }
          onMaximizeButtonPress={() =>
            navigation.navigate(ScreenName.MapView, {
              augmentedRealityData: { data },
              geometryTourData,
              isAugmentedReality: true,
              locations: mapMarkers
            })
          }
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
        id: item.id.toString(),
        position: {
          latitude,
          longitude
        }
      };
    })
    .filter((item) => item !== undefined);

AugmentedReality.propTypes = {
  geometryTourData: PropTypes.array,
  id: PropTypes.string,
  navigation: PropTypes.object,
  onSettingsScreen: PropTypes.bool,
  tourStops: PropTypes.array
};
