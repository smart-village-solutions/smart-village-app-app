import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARImageMarker,
  ViroARScene,
  ViroARTrackingTargets,
  ViroImage,
  ViroMaterials,
  ViroQuad,
  ViroSound,
  ViroSpatialSound,
  ViroSpotLight,
  ViroVideo
} from '@reactvision/react-viro';
import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';

import { colors, consts, device, texts } from '../../config';
import { SettingsContext } from '../../SettingsProvider';

const { GB_TO_BYTES } = consts;

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
  const { isObjectLoading, setIsObjectLoading, isStartAnimationAndSound, object } = item;

  if (object?.mp4) {
    // if the `chromaKeyFilteredVideo` prop is undefined, the default color of a green screen is set
    ViroMaterials.createMaterials({
      chromaKeyFilteredVideo: {
        chromaKeyFilteringColor: object.mp4?.chromaKeyFilteredVideo || '#00FF00'
      }
    });
  }

  const isMore2GBRam = device.totalMemory > GB_TO_BYTES[2];

  return (
    <>
      {!isObjectLoading && (
        <>
          {!!object?.mp3 &&
            (object.mp3?.isSpatialSound ? (
              <ViroSpatialSound
                source={{ uri: object.mp3.uri }}
                paused={!isStartAnimationAndSound}
                loop
                maxDistance={object.mp3.maxDistance}
                minDistance={object.mp3.minDistance}
                position={object.mp3.position}
                rolloffModel={object.mp3.rolloffModel}
              />
            ) : (
              <ViroSound source={{ uri: object.mp3.uri }} paused={!isStartAnimationAndSound} loop />
            ))}

          {!!object?.mp4 && (
            <ViroVideo
              loop
              materials={['chromaKeyFilteredVideo']}
              position={object.mp4.position}
              rotation={object.mp4.rotation}
              scale={object.mp4.scale}
              source={{ uri: object.mp4.uri }}
            />
          )}

          {!!object?.image && (
            <ViroImage
              position={object.image.position}
              rotation={object.image.rotation}
              scale={object.image.scale}
              source={{ uri: object.image.uri }}
            />
          )}
        </>
      )}

      {!!object?.models?.length &&
        !!object?.textures?.length &&
        object.models.map((model, index) => (
          <Viro3DObject
            key={index}
            source={{ uri: model.uri }}
            resources={object.textures}
            type="VRX"
            position={model.position}
            rotation={model.rotation}
            scale={model.scale}
            onLoadStart={() => setIsObjectLoading(true)}
            onLoadEnd={() => setIsObjectLoading(false)}
            onError={() => alert(texts.augmentedReality.arShowScreen.objectLoadErrorAlert)}
            shadowCastingBitMask={2}
            animation={{
              loop: true,
              name: object?.animationName,
              run: isStartAnimationAndSound
            }}
          />
        ))}

      {object?.spot && isMore2GBRam && (
        <ViroSpotLight
          direction={object.spot.direction}
          innerAngle={object.spot.innerAngle}
          outerAngle={object.spot.outerAngle}
          position={object.spot.position}
          shadowMapSize={object.spot.shadowMapSize}
          shadowOpacity={object.spot.shadowOpacity}
          castsShadow
          influenceBitMask={2}
          shadowFarZ={5}
          shadowNearZ={2}
        />
      )}

      {object?.quad && isMore2GBRam && (
        <ViroQuad
          position={object.quad.position}
          arShadowReceiver
          lightReceivingBitMask={2}
          rotation={[-90, 0, 0]}
        />
      )}
    </>
  );
};

AugmentedRealityView.propTypes = {
  sceneNavigator: PropTypes.object
};
