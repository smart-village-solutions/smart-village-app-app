import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Alert, Animated, View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroARSceneNavigator,
  ViroSound
} from '@viro-community/react-viro';

import { LoadingSpinner } from '../../components';
import { colors, Icon, normalize, texts } from '../../config';

export const ARShowScreen = ({ navigation, route }) => {
  const [isStartAnimationAndSound, setIsStartAnimationAndSound] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isObjectLoading, setIsObjectLoading] = useState(true);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const data = route?.params?.data ?? [];
  const [object, setObject] = useState();
  const index = route?.params?.index;
  const arSceneRef = useRef();
  const screenshotEffectOpacityRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    objectParser({ item: data?.[index], setObject, setIsLoading });
  }, []);

  const takeScreenshot = useCallback(async () => {
    const fileName = 'AugmentedReality_' + Date.now().toString();

    try {
      await arSceneRef.current._takeScreenshot(fileName, true);

      screenshotFlashEffect({ screenshotEffectOpacityRef });
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
        viroAppProps={{
          isObjectLoading,
          setIsObjectLoading,
          isStartAnimationAndSound,
          setIsStartAnimationAndSound,
          object
        }}
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

      {isObjectLoading ? (
        <View style={styles.objectLoadingIndicatorComponent}>
          <LoadingSpinner loading />
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.generalButtonStyle, styles.screenRecording, styles.opacity]}
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
            style={[styles.generalButtonStyle, styles.screenShotButton, styles.opacity]}
            onPress={takeScreenshot}
          >
            <Icon.NamedIcon
              name="camera"
              color={colors.darkText}
              size={normalize(30)}
              style={styles.opacity}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.animationButton, styles.generalButtonStyle]}
            onPress={() => setIsStartAnimationAndSound(!isStartAnimationAndSound)}
          >
            {isStartAnimationAndSound ? (
              <Icon.NamedIcon name="pause" color={colors.primary} size={normalize(30)} />
            ) : (
              <Icon.NamedIcon name="play" color={colors.primary} size={normalize(30)} />
            )}
          </TouchableOpacity>
        </>
      )}

      <Animated.View
        style={[styles.flashEffectContainer, { opacity: screenshotEffectOpacityRef }]}
      />
    </>
  );
};

const AugmentedRealityView = ({ sceneNavigator }) => {
  const {
    isObjectLoading,
    setIsObjectLoading,
    isStartAnimationAndSound,
    setIsStartAnimationAndSound,
    object
  } = sceneNavigator.viroAppProps;

  // TODO: these data can be updated according to the data coming from the server when the
  //       real 3D models arrive
  const position = [0, -1, -5];
  const rotation = [0, 0, 0];
  const scale = [0.02, 0.02, 0.02];

  return (
    <ViroARScene dragType="FixedToWorld">
      <ViroAmbientLight color={'#fff'} />

      {!!object.mp3 && !isObjectLoading && (
        <ViroSound
          source={{ uri: object.mp3 }}
          paused={!isStartAnimationAndSound}
          onFinish={() => setIsStartAnimationAndSound(false)}
        />
      )}

      <Viro3DObject
        source={{ uri: object.vrx }}
        resources={[{ uri: object.png }]}
        type="VRX"
        position={position}
        rotation={rotation}
        scale={scale}
        onLoadStart={() => setIsObjectLoading(true)}
        onLoadEnd={() => setIsObjectLoading(false)}
        onError={() => alert(texts.augmentedReality.arShowScreen.objectLoadErrorAlert)}
        animation={{
          loop: true,
          name: object.animationName,
          run: isStartAnimationAndSound
        }}
      />
    </ViroARScene>
  );
};

const objectParser = async ({ item, setObject, setIsLoading, onPress }) => {
  let parsedObject = {};

  if (item.animationName) {
    parsedObject.animationName = item.animationName;
  }

  item?.localUris?.forEach((item) => {
    parsedObject[item.type] = item.uri;
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
  setIsLoading(false);
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
    borderRadius: 50,
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1
  },
  objectLoadingIndicatorComponent: {
    height: '100%',
    position: 'absolute',
    width: '100%'
  },
  opacity: {
    opacity: 0.6
  },
  screenRecording: {
    backgroundColor: colors.surface,
    bottom: normalize(120),
    padding: normalize(15),
    right: normalize(10)
  },
  screenShotButton: {
    backgroundColor: colors.surface,
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
