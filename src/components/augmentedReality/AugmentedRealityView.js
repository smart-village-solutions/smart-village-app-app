import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARImageMarker,
  ViroARScene,
  ViroARTrackingTargets,
  ViroImage,
  ViroMaterials,
  ViroSound,
  ViroSpatialSound,
  ViroVideo
} from '@viro-community/react-viro';
import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';

import { colors, texts } from '../../config';
import { SettingsContext } from '../../SettingsProvider';

export const AugmentedRealityView = ({ sceneNavigator }) => {
  const {
    isObjectLoading,
    setIsObjectLoading,
    isStartAnimationAndSound,
    setIsStartAnimationAndSound,
    setIsAnchorFound,
    object
  } = sceneNavigator.viroAppProps;
  const { globalSettings } = useContext(SettingsContext);
  const {
    settings: { ar }
  } = globalSettings;

  const TARGET = 'targetImage';

  useEffect(() => {
    ViroARTrackingTargets.createTargets({
      [TARGET]: {
        orientation: 'Up',
        physicalWidth: ar?.physicalWidthforTargetImage || 0.2, // real world width in meters
        source: { uri: object?.target?.uri },
        type: 'image'
      }
    });
  }, [object?.target?.uri]);

  const ViroContent = (
    <ViroSoundAnd3DObject
      {...{
        isObjectLoading,
        setIsObjectLoading,
        isStartAnimationAndSound,
        setIsStartAnimationAndSound,
        object
      }}
    />
  );

  /* see `onAnchorFound` function to auto-start animation and sound file
     when showing a 3D model that is not `TARGET` in the future time */

  return (
    <ViroARScene>
      <ViroAmbientLight
        color={object?.light?.color || colors.surface}
        temperature={object?.light?.temperature || 6500}
        intensity={object?.light?.intensity || 1000}
        rotation={object?.light?.rotation || [0, 0, 0]}
      />

      {object?.target ? (
        <ViroARImageMarker
          onAnchorFound={() => {
            // animation and sound file are started after the image is recognized
            setIsAnchorFound(true);
            setIsStartAnimationAndSound(true);
          }}
          pauseUpdates // prevents the model from continuous jumping
          target={TARGET}
        >
          {ViroContent}
        </ViroARImageMarker>
      ) : (
        ViroContent
      )}
    </ViroARScene>
  );
};

// eslint-disable-next-line complexity
const ViroSoundAnd3DObject = (item) => {
  const {
    isObjectLoading,
    setIsObjectLoading,
    isStartAnimationAndSound,
    setIsStartAnimationAndSound,
    object
  } = item;

  if (object?.mp4) {
    // if the `chromaKeyFilteredVideo` prop is undefined, the default color of a green screen is set
    ViroMaterials.createMaterials({
      chromaKeyFilteredVideo: {
        chromaKeyFilteringColor: object?.mp4?.chromaKeyFilteredVideo || '#00FF00'
      }
    });
  }

  return (
    <>
      {!isObjectLoading && (
        <>
          {!!object?.mp3 &&
            (object?.mp3?.isSpatialSound ? (
              <ViroSpatialSound
                source={{ uri: object?.mp3?.uri }}
                paused={!isStartAnimationAndSound}
                onFinish={() => setIsStartAnimationAndSound(false)}
                maxDistance={object?.mp3?.maxDistance}
                minDistance={object?.mp3?.minDistance}
                position={object?.mp3?.position}
                rolloffModel={object?.mp3?.rolloffModel}
              />
            ) : (
              <ViroSound
                source={{ uri: object?.mp3?.uri }}
                paused={!isStartAnimationAndSound}
                onFinish={() => setIsStartAnimationAndSound(false)}
              />
            ))}

          {!!object?.mp4 && (
            <ViroVideo
              loop
              materials={['chromaKeyFilteredVideo']}
              position={object?.mp4?.position}
              rotation={object?.mp4?.rotation}
              scale={object?.mp4?.scale}
              source={{ uri: object?.mp4?.uri }}
            />
          )}

          {!!object?.image && (
            <ViroImage
              position={object?.image?.position}
              rotation={object?.image?.rotation}
              scale={object?.image?.scale}
              source={{ uri: object?.image?.uri }}
            />
          )}
        </>
      )}

      <Viro3DObject
        source={{ uri: object?.vrx?.uri }}
        resources={object?.texture}
        type="VRX"
        position={object?.vrx?.position}
        rotation={object?.vrx?.rotation}
        scale={object?.vrx?.scale}
        onLoadStart={() => setIsObjectLoading(true)}
        onLoadEnd={() => setIsObjectLoading(false)}
        onError={() => alert(texts.augmentedReality.arShowScreen.objectLoadErrorAlert)}
        animation={{
          loop: true,
          name: object?.animationName,
          run: isStartAnimationAndSound
        }}
      />
    </>
  );
};

AugmentedRealityView.propTypes = {
  sceneNavigator: PropTypes.object
};
