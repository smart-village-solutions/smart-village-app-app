import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  HtmlView,
  Map,
  RegularText,
  Touchable,
  Wrapper,
  WrapperRow,
  WrapperVertical
} from '../components';
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
                navigation
              })
            }
          >
            <WrapperRow spaceBetween>
              <View style={styles.augmentedRealityInfoContainer}>
                {!!modelData.title && <RegularText big>{modelData.title}</RegularText>}
                {!!modelData.locationInfo && (
                  <RegularText small>{modelData.locationInfo}</RegularText>
                )}
                {!!modelData.description && (
                  <View style={styles.marginTop}>
                    <HtmlView html={modelData.description} tagsStyles={{ p: styles.p }} />
                  </View>
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
