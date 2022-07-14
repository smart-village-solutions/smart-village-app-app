import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Alert, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroARSceneNavigator
} from '@viro-community/react-viro';

import { LoadingSpinner } from '../../components';
import { colors, Icon, normalize } from '../../config';

export const ARShowScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [object, setObject] = useState();

  const data = route?.params?.data ?? [];
  const index = route?.params?.index;

  const arSceneRef = useRef();
  const screenshotEffectOpacityRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    parser();
  }, []);

  const parser = async () => {
    // TODO: the `onPress` prop is just for testing
    await objectParser({ item: data[index], setObject, onPress: () => navigation.goBack() });

    setIsLoading(false);
  };

  const takeScreenshot = useCallback(async () => {
    const fileName = 'AugmentedReality_' + Date.now().toString();

    try {
      await arSceneRef.current._takeScreenshot(fileName, true);
      screenshotFlashEffect({ screenshotEffectOpacityRef });
    } catch (error) {
      console.error(error.message);
    }
  }, []);

  if (isLoading || !object || !object.vrx) return <LoadingSpinner loading />;

  return (
    <>
      <ViroARSceneNavigator
        ref={arSceneRef}
        autofocus
        initialScene={{
          scene: AugmentedRealityView
        }}
        viroAppProps={{ object }}
        style={styles.arSceneNavigator}
      />

      <TouchableOpacity
        style={[styles.backButton, styles.generalButtonStyle]}
        onPress={() => {
          /*
          to solve the Android crash problem, you must first remove the 3D object from the screen. 
          then navigation can be done.
          */
          setObject();
          navigation.goBack();
        }}
      >
        <Icon.Close color={colors.surface} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.generalButtonStyle, styles.screenShotButton]}
        onPress={takeScreenshot}
      >
        <Icon.NamedIcon name="camera" color={colors.darkText} size={normalize(30)} />
      </TouchableOpacity>

      <Animated.View
        style={[styles.flashEffectContainer, { opacity: screenshotEffectOpacityRef }]}
      />
    </>
  );
};

const AugmentedRealityView = ({ sceneNavigator }) => {
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [position, setPosition] = useState([0, -1, -5]);

  const { object } = sceneNavigator.viroAppProps;

  const moveObject = (newPosition) => {
    setPosition(newPosition);
  };

  const rotateObject = (rotateState, rotationFactor) => {
    let newRotation = [rotation[0], rotation[1] - rotationFactor, rotation[2]];

    if (rotateState === 2) {
      setRotation(newRotation);

      return;
    }
  };

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
        source={{ uri: object.vrx }}
        resources={[{ uri: object.png }]}
        type="VRX"
        position={position}
        scale={[0.02, 0.02, 0.02]}
        rotation={rotation}
        onDrag={moveObject}
        onRotate={rotateObject}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={(event) => handleError(event)}
      />
    </ViroARScene>
  );
};

const objectParser = async ({ item, setObject, onPress }) => {
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

  // TODO: Just for the test
  if (!parsedObject.vrx) {
    return Alert.alert(
      'Hinweis',
      'Bitte laden Sie ein echtes AR-Objekt herunter. Die Dateien im Gerät sind nur zu Testzwecken vorbereitet. Sie können ein Beispielobjekt sehen, indem Sie die Datei Diffuse Texture aus der Objektliste herunterladen.',
      [
        {
          text: 'OK',
          onPress
        }
      ]
    );
  }

  setObject(parsedObject);
};

const screenshotFlashEffect = ({ screenshotEffectOpacityRef }) => {
  Animated.parallel([
    Animated.timing(screenshotEffectOpacityRef, {
      duration: 0,
      toValue: 1,
      useNativeDriver: false
    }),
    Animated.timing(screenshotEffectOpacityRef, {
      duration: 500,
      toValue: 0,
      useNativeDriver: false
    })
  ]).start();
};

var styles = StyleSheet.create({
  arSceneNavigator: {
    flex: 1
  },
  backButton: {
    padding: normalize(5),
    right: normalize(10),
    top: normalize(50)
  },
  flashEffectContainer: {
    backgroundColor: colors.surface,
    height: '100%',
    position: 'absolute',
    width: '100%'
  },
  generalButtonStyle: {
    alignItems: 'center',
    backgroundColor: colors.gray60,
    borderRadius: 50,
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1
  },
  screenShotButton: {
    bottom: normalize(40),
    padding: normalize(15),
    right: normalize(10)
  }
});

ARShowScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};

AugmentedRealityView.propTypes = {
  sceneNavigator: PropTypes.object
};
