import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Map, RegularText, Touchable, Wrapper, WrapperRow } from '../components';
import { colors, Icon, normalize } from '../config';
import { navigationToArtworksDetailScreen } from '../helpers';

export const MapViewScreen = ({ navigation, route }) => {
  const {
    geometryTourData,
    isAugmentedReality,
    isMaximizeButtonVisible,
    locations,
    onMarkerPress,
    showsUserLocation
  } = route?.params;

  /* the improvement in the next comment line has been added for augmented reality feature. */
  const { data } = route?.params?.augmentedRealityData ?? [];

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
          geometryTourData,
          isMaximizeButtonVisible,
          locations,
          mapStyle: styles.mapStyle,
          onMarkerPress: isAugmentedReality ? setModelId : onMarkerPress,
          showsUserLocation
        }}
      />
      {isAugmentedReality && modelData && (
        <Wrapper>
          <Touchable
            onPress={() =>
              navigationToArtworksDetailScreen({
                data,
                isNavigation: true,
                modelId,
                setModelId,
                navigation
              })
            }
          >
            <WrapperRow spaceBetween>
              <View style={styles.augmentedRealityInfoContainer}>
                {!!modelData.title && <RegularText big>{modelData.title}</RegularText>}
                {!!modelData.payload?.locationInfo && (
                  <RegularText small>{modelData.payload.locationInfo}</RegularText>
                )}
              </View>

              <Icon.ArrowRight size={normalize(30)} />
            </WrapperRow>
          </Touchable>
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
  },
  marginTop: {
    marginTop: normalize(14)
  },
  p: {
    color: colors.placeholder,
    marginBottom: normalize(16)
  }
});

MapViewScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object
};
