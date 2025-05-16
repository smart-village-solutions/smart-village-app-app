import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { LoadingSpinner, MapLibre, TextListItem, Wrapper } from '../components';
import { colors, normalize } from '../config';
import { navigationToArtworksDetailScreen } from '../helpers';
import { useMapSettings } from '../hooks';
import { SettingsContext } from '../SettingsProvider';

export const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { geometryTourData, isAugmentedReality, locations, onMarkerPress, showsUserLocation } =
    route?.params ?? {};
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();
  const { data: mapSettings, loading } = useMapSettings();

  /* the next lines has been added for augmented reality feature */
  const { data } = route?.params?.augmentedRealityData ?? [];

  const [modelId, setModelId] = useState();
  const [modelData, setModelData] = useState();

  useEffect(() => {
    if (isAugmentedReality) {
      navigationToArtworksDetailScreen({ data, isShow: true, modelId, setModelData });
    }
  }, [modelId]);
  /* end of augmented reality feature */

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <>
      <MapLibre
        {...{
          geometryTourData,
          locations,
          mapStyle: styles.map,
          onMarkerPress: isAugmentedReality
            ? setModelId
            : onMarkerPress || setSelectedPointOfInterest,
          selectedMarker: selectedPointOfInterest,
          showsUserLocation
        }}
      />

      {!!isAugmentedReality && !!modelData && (
        <Wrapper
          small
          style={[styles.listItemContainer, stylesWithProps({ navigationType }).position]}
        >
          <TextListItem
            item={{
              ...modelData,
              bottomDivider: false,
              subtitle: modelData.payload.locationInfo,
              onPress: () =>
                navigationToArtworksDetailScreen({
                  data,
                  isNavigation: true,
                  modelId,
                  navigation
                })
            }}
            navigation={navigation}
          />
        </Wrapper>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%'
  },
  listItemContainer: {
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    left: '4%',
    position: 'absolute',
    right: '4%',
    width: '92%',
    // shadow:
    elevation: 2,
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      height: 5,
      width: 0
    },
    shadowOpacity: 0.5,
    shadowRadius: 3
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ navigationType }: { navigationType: string }) => {
  return StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '8%' : '4%'
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
