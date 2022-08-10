import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';

import { AugmentedRealityView, LoadingSpinner } from '../../components';
import { colors, Icon, normalize, texts } from '../../config';

export const ARShowScreen = ({ navigation, route }) => {
  const [isStartAnimationAndSound, setIsStartAnimationAndSound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isObjectLoading, setIsObjectLoading] = useState(true);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const data = route?.params?.data ?? [];
  const [object, setObject] = useState();
  const index = route?.params?.index;
  const arSceneRef = useRef();
  const screenshotEffectOpacityRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    objectParser({
      item: data?.[index],
      setObject,
      setIsLoading,
      onPress: () => navigation.goBack()
    });
  }, []);

  const takeScreenshot = useCallback(async () => {
    const fileName = 'AugmentedReality_' + Date.now().toString();

    try {
      const { success, errorCode } = await arSceneRef.current._takeScreenshot(fileName, true);

      if (success) {
        screenshotFlashEffect({ screenshotEffectOpacityRef });
      } else {
        errorHandler(errorCode);
      }
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
      const { success, errorCode } = await arSceneRef.current._stopVideoRecording();

      if (success) {
        Alert.alert(
          texts.augmentedReality.modalHiddenAlertTitle,
          texts.augmentedReality.arShowScreen.screenRecordingCompleted
        );
      } else {
        errorHandler(errorCode);
      }
    }
  };

  if (isLoading || !object) return <LoadingSpinner loading />;

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

const objectParser = async ({ item, setObject, setIsLoading, onPress }) => {
  const parsedObject = { texture: [] };

  if (item?.payload?.animationName) {
    parsedObject.animationName = item?.payload?.animationName;
  }

  item?.payload?.localUris?.forEach((item) => {
    if (item.type === 'texture') {
      parsedObject[item.type].push({ uri: item.uri });
    } else {
      parsedObject[item.type] = item.uri;
    }
  });

  if (!parsedObject?.texture?.length || !parsedObject?.vrx) {
    return Alert.alert(
      texts.augmentedReality.modalHiddenAlertTitle,
      texts.augmentedReality.invalidModelError,
      [{ text: texts.augmentedReality.ok, onPress }]
    );
  }

  setObject(parsedObject);
  setIsLoading(false);
};

const errorHandler = (errorCode) => {
  Alert.alert(
    texts.augmentedReality.modalHiddenAlertTitle,
    texts.augmentedReality.arShowScreen.viroRecordingError?.[errorCode]
  );
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
