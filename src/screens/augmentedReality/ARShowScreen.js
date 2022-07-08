import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroARSceneNavigator,
  ViroMaterials
} from '@viro-community/react-viro';

import { LoadingSpinner, RegularText } from '../../components';

export const ARShowScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const data = route?.params?.data ?? [];
  const [object, setObject] = useState();
  const index = route?.params?.index;

  useEffect(() => {
    parser();
  }, []);

  const parser = async () => {
    await objectParser({ item: data[index], setObject });
    setIsLoading(false);
  };

  if (isLoading || !object) return <LoadingSpinner loading />;

  return (
    <View style={styles.f1}>
      <ViroARSceneNavigator
        initialScene={{
          scene: AugmentedRealityView
        }}
        viroAppProps={{ object }}
        style={styles.f1}
      />
      <RegularText style={styles.backButton} onPress={() => navigation.goBack()}>
        Zurück
      </RegularText>
    </View>
  );
};

const AugmentedRealityView = ({ sceneNavigator }) => {
  const { object } = sceneNavigator.viroAppProps;

  ViroMaterials.createMaterials({
    SVA: {
      diffuseTexture: {
        uri: object.png
      }
    }
  });

  const handleLoadStart = () => {
    console.warn('OBJ loading has started');
  };
  const handleLoadEnd = () => {
    console.warn('OBJ loading has finished');
  };
  const handleError = (event) => {
    console.warn('OBJ loading failed with error: ' + event.nativeEvent.error);
  };

  return (
    <ViroARScene dragType="FixedToWorld">
      <ViroAmbientLight color={'#fff'} />

      <Viro3DObject
        source={{
          uri: object.vrx
        }}
        resources={['SVA']}
        type="VRX"
        position={[0, -1, -5]}
        scale={[0.02, 0.02, 0.02]}
        rotation={[0, 0, 0]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={(event) => handleError(event)}
      />
    </ViroARScene>
  );
};

const objectParser = async ({ item, setObject }) => {
  let parsedObject = {};

  item.localUris?.find((item) => {
    if (item.type === 'vrx') {
      parsedObject.vrx = item.uri;
    }
    if (item.type === 'png') {
      parsedObject.png = item.uri;
    }
    if (item.type === 'mp3') {
      parsedObject.mp3 = item.uri;
    }
  });

  setObject(parsedObject);
};

var styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    right: 10,
    top: 100,
    zIndex: 1
  },
  f1: {
    flex: 1
  }
});

ARShowScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};

AugmentedRealityView.propTypes = {
  sceneNavigator: PropTypes.object
};
