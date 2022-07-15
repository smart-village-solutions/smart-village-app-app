import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroARSceneNavigator
} from '@viro-community/react-viro';

import { LoadingSpinner } from '../../components';
import { colors, Icon, normalize, texts } from '../../config';

export const ARShowScreen = ({ navigation, route }) => {
  const [isStartAnimation, setIsStartAnimation] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const data = route?.params?.data ?? [];
  const [object, setObject] = useState();
  const index = route?.params?.index;
  const arSceneRef = useRef();

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
    } catch (error) {
      console.error(error.message);
    }
  }, []);

  const screenVideoRecording = async () => {
    const fileName = 'AugmentedReality_' + Date.now().toString();

    setIsVideoRecording(!isVideoRecording);

    if (!isVideoRecording) {
      arSceneRef.current._startVideoRecording(fileName, true, (error) => alert(error));
    } else {
      const { success } = await arSceneRef.current._stopVideoRecording();

      if (success) {
        Alert.alert(
          texts.augmentedReality.modalHiddenAlertTitle,
          texts.augmentedReality.arShowScreen.screenRecordingCompleted
        );
      } else {
        Alert.alert(
          texts.augmentedReality.modalHiddenAlertTitle,
          texts.augmentedReality.arShowScreen.screenRecordingError
        );
      }
    }
  };

  if (isLoading || !object || !object.vrx) return <LoadingSpinner loading />;

  return (
    <>
      <ViroARSceneNavigator
        ref={arSceneRef}
        autofocus
        initialScene={{
          scene: AugmentedRealityView
        }}
        viroAppProps={{ object, isStartAnimation }}
        style={styles.arSceneNavigator}
      />

      <TouchableOpacity
        style={[styles.backButton, styles.generalButtonStyle]}
        onPress={() => {
          /*
          to solve the Android crash problem, you must first remove the 3D object from the screen. 
          then navigation can be done.
          */
          if (isVideoRecording) {
            return Alert.alert(
              texts.augmentedReality.modalHiddenAlertTitle,
              texts.augmentedReality.arShowScreen.backNavigationErrorOnScreenRecord
            );
          }
          setObject();
          navigation.goBack();
        }}
      >
        <Icon.Close color={colors.surface} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.generalButtonStyle, styles.screenRecording]}
        onPress={screenVideoRecording}
      >
        {isVideoRecording ? (
          <Icon.NamedIcon
            name="stop"
            color={colors.error}
            size={normalize(30)}
            style={styles.opacity}
          />
        ) : (
          <Icon.NamedIcon
            name="videocam"
            color={colors.error}
            size={normalize(30)}
            style={styles.opacity}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.generalButtonStyle, styles.screenShotButton]}
        onPress={takeScreenshot}
      >
        <Icon.NamedIcon name="camera" color={colors.darkText} size={normalize(30)} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.animationButton, styles.generalButtonStyle]}
        onPress={() => setIsStartAnimation(!isStartAnimation)}
      >
        {isStartAnimation ? (
          <Icon.NamedIcon name="pause" color={colors.primary} size={normalize(30)} />
        ) : (
          <Icon.NamedIcon name="play" color={colors.primary} size={normalize(30)} />
        )}
      </TouchableOpacity>
    </>
  );
};

const AugmentedRealityView = ({ sceneNavigator }) => {
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [position, setPosition] = useState([0, -1, -5]);

  const { object, isStartAnimation } = sceneNavigator.viroAppProps;

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
        animation={{
          loop: true,
          name: object.animationName,
          run: isStartAnimation
        }}
      />
    </ViroARScene>
  );
};

const objectParser = async ({ item, setObject, onPress }) => {
  let parsedObject = {};

  if (item.animationName) {
    parsedObject.animationName = item.animationName;
  }

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

var styles = StyleSheet.create({
  animationButton: {
    backgroundColor: colors.surface,
    alignSelf: 'center',
    bottom: normalize(40),
    padding: normalize(15)
  },
  arSceneNavigator: {
    flex: 1
  },
  backButton: {
    padding: 5,
    right: 10,
    top: 100
  },
  generalButtonStyle: {
    alignItems: 'center',
    borderRadius: 50,
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1
  },
  opacity: {
    opacity: 0.6
  },
  screenRecording: {
    backgroundColor: colors.borderRgba,
    bottom: normalize(120),
    padding: normalize(15),
    right: normalize(10)
  },
  screenShotButton: {
    bottom: 100,
    padding: 15,
    right: 10
  }
});

ARShowScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};

AugmentedRealityView.propTypes = {
  sceneNavigator: PropTypes.object
};
