import PropTypes from 'prop-types';
import React from 'react';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARImageMarker,
  ViroARScene,
  ViroARTrackingTargets,
  ViroSound
} from '@viro-community/react-viro';

import { texts } from '../../config';

export const AugmentedRealityView = ({ sceneNavigator }) => {
  const {
    isObjectLoading,
    setIsObjectLoading,
    isStartAnimationAndSound,
    setIsStartAnimationAndSound,
    object
  } = sceneNavigator.viroAppProps;

  // TODO: these data can be updated according to the data coming from the server when the
  //       real 3D models arrive
  const position = [0, 0, 0];
  const rotation = [0, 0, 0];
  const scale = [0.002, 0.002, 0.002];

  ViroARTrackingTargets.createTargets({
    targetImage: {
      physicalWidth: 0.2, // real world width in meters
      source: { uri: object.target },
      type: 'image'
    }
  });

  return (
    <ViroARScene dragType="FixedToWorld">
      <ViroAmbientLight color={'#fff'} />

      {object.target ? (
        <ViroARImageMarker
          onAnchorFound={() => setIsStartAnimationAndSound(true)} // animation and sound file are started after the image is recognised
          pauseUpdates // prevents the model from continuous jumping
          target={'targetImage'}
        >
          <ViroSoundAnd3DObject
            {...{
              isObjectLoading,
              isStartAnimationAndSound,
              object,
              position,
              rotation,
              scale,
              setIsObjectLoading,
              setIsStartAnimationAndSound
            }}
          />
        </ViroARImageMarker>
      ) : (
        <ViroSoundAnd3DObject
          {...{
            isObjectLoading,
            isStartAnimationAndSound,
            object,
            position,
            rotation,
            scale,
            setIsObjectLoading,
            setIsStartAnimationAndSound
          }}
        />
      )}
    </ViroARScene>
  );
};

const ViroSoundAnd3DObject = (item) => {
  const {
    isObjectLoading,
    isStartAnimationAndSound,
    object,
    position,
    rotation,
    scale,
    setIsObjectLoading,
    setIsStartAnimationAndSound
  } = item;

  return (
    <>
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
    </>
  );
};

AugmentedRealityView.propTypes = {
  sceneNavigator: PropTypes.object
};
