import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARImageMarker,
  ViroARScene,
  ViroARTrackingTargets,
  ViroSound
} from '@viro-community/react-viro';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { colors, texts } from '../../config';

export const AugmentedRealityView = ({ sceneNavigator }) => {
  const {
    isObjectLoading,
    setIsObjectLoading,
    isStartAnimationAndSound,
    setIsStartAnimationAndSound,
    object
  } = sceneNavigator.viroAppProps;

  const TARGET = 'targetImage';

  // TODO: these data can be updated according to the data coming from the server when the
  //       real 3D models arrive
  const position = [0, 0, 0];
  const rotation = [0, 0, 0];
  const scale = [0.002, 0.002, 0.002];

  useEffect(() => {
    ViroARTrackingTargets.createTargets({
      [TARGET]: {
        orientation: 'Up',
        physicalWidth: 0.2, // real world width in meters
        source: { uri: object.target },
        type: 'image'
      }
    });
  }, [object?.target]);

  const ViroContent = (
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
  );

  /* see `onAnchorFound` function to auto-start animation and sound file 
     when showing a 3D model that is not `TARGET` in the future time */

  return (
    <ViroARScene>
      <ViroAmbientLight color={colors.surface} />

      {object?.target ? (
        <ViroARImageMarker
          onAnchorFound={() => setIsStartAnimationAndSound(true)} // animation and sound file are started after the image is recognised
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
