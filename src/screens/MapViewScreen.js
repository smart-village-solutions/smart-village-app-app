import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Map, RegularText, Wrapper, WrapperRow, WrapperVertical } from '../components';
import { colors, Icon, normalize } from '../config';
import { navigationToArtworksDetailScreen } from '../helpers';

export const MapViewScreen = ({ navigation, route }) => {
  const {
    isAugmentedReality,
    isMaximizeButtonVisible,
    locations,
    onMarkerPress,
    showsUserLocation
  } = route?.params;

  /* the improvement in the next comment line has been added for augmented reality feature. */
  const { data, refetch } = route?.params?.augmentedRealityData ?? [];

  const [modelId, setModelId] = useState();
  const [modelData, setModelData] = useState();

  useEffect(() => {
    navigationToArtworksDetailScreen({ data, isShow: true, modelId, setModelData });
  }, [modelId]);
  /* end of augmented reality feature */

  return (
    <>
      <Map
        {...{
          isMaximizeButtonVisible,
          locations,
          mapStyle: styles.mapStyle,
          onMarkerPress: isAugmentedReality ? setModelId : onMarkerPress,
          showsUserLocation
        }}
      />
      {isAugmentedReality && modelData && (
        <Wrapper>
          <WrapperRow spaceBetween>
            <View style={styles.augmentedRealityInfoContainer}>
              <RegularText big>{modelData.title}</RegularText>
              <RegularText small>{modelData.locationInfo}</RegularText>
              <WrapperVertical>
                <RegularText placeholder numberOfLines={2}>
                  {modelData.description}
                </RegularText>
              </WrapperVertical>
            </View>

            <TouchableOpacity
              onPress={() =>
                navigationToArtworksDetailScreen({
                  data,
                  isNavigation: true,
                  modelId,
                  navigation,
                  refetch
                })
              }
            >
              <Icon.ArrowRight size={normalize(30)} color={colors.primary} />
            </TouchableOpacity>
          </WrapperRow>
        </Wrapper>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  augmentedRealityInfoContainer: {
    width: '90%'
  },
  mapStyle: {
    width: '100%',
    height: '100%'
  }
});

MapViewScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object
};
