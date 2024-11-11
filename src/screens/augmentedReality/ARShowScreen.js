import { ViroARSceneNavigator } from '@reactvision/react-viro';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AugmentedRealityView, LoadingSpinner } from '../../components';
import { colors, Icon, normalize, texts } from '../../config';
import { objectParser } from '../../helpers';

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

export const ARShowScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isObjectLoading, setIsObjectLoading] = useState(true);
  const [isAnchorFound, setIsAnchorFound] = useState(false);
  const [isStartAnimationAndSound, setIsStartAnimationAndSound] = useState(false);
  const data = route?.params?.data ?? [];
  const [object, setObject] = useState();
  const index = route?.params?.index;
  const arSceneRef = useRef();
  const screenshotEffectOpacityRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    objectParser({
      payload: data?.[index]?.payload,
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
          setIsAnchorFound,
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
          setObject();
          navigation.goBack();
        }}
      >
        <Icon.Close color={colors.surface} />
      </TouchableOpacity>

      {isObjectLoading && (
        <View style={styles.objectLoadingIndicatorComponent}>
          <LoadingSpinner loading />
        </View>
      )}

      {!isObjectLoading && isAnchorFound && (
        <>
          <TouchableOpacity
            style={[styles.generalButtonStyle, styles.screenShotButton, styles.opacity]}
            onPress={takeScreenshot}
          >
            <Icon.Camera color={colors.darkText} size={normalize(30)} style={styles.opacity} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.animationButton, styles.generalButtonStyle]}
            onPress={() => setIsStartAnimationAndSound(!isStartAnimationAndSound)}
          >
            {isStartAnimationAndSound ? (
              <Icon.Pause size={normalize(30)} />
            ) : (
              <Icon.Play size={normalize(30)} />
            )}
          </TouchableOpacity>

          <Animated.View
            style={[styles.flashEffectContainer, { opacity: screenshotEffectOpacityRef }]}
          />
        </>
      )}
    </>
  );
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
