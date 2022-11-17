import React, { ReactNode, RefObject, useCallback, useContext } from 'react';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  scrollTo,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { device } from '../../config';
import { getHeaderHeight, statusBarHeight } from '../../helpers';
import { OrientationContext } from '../../OrientationProvider';

export type Positions = {
  [id: string]: number;
};

type Props = {
  children: ReactNode;
  positions: Animated.SharedValue<Positions>;
  id: string;
  onDragEnd: (diffs: Positions) => void;
  scrollView: RefObject<Animated.ScrollView>;
  scrollY: Animated.SharedValue<number>;
  numberOfTiles: number;
  tileSize: number;
};

const animationConfig = {
  easing: Easing.inOut(Easing.ease),
  duration: 350
};

export const DraggableItem = ({
  children,
  positions,
  id,
  onDragEnd,
  scrollView,
  scrollY,
  numberOfTiles,
  tileSize
}: Props) => {
  const { orientation } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();
  const containerHeight =
    device.height -
    safeAreaInsets.top -
    safeAreaInsets.bottom -
    getHeaderHeight(orientation) -
    statusBarHeight(orientation);

  const isGestureActive = useSharedValue(false);
  const contentHeight = (Object.keys(positions.value).length / numberOfTiles) * tileSize;

  const getPosition = useCallback(
    (position: number) => {
      'worklet';

      return {
        x: position % numberOfTiles === 0 ? 0 : tileSize * (position % numberOfTiles),
        y: Math.floor(position / numberOfTiles) * tileSize
      };
    },
    [numberOfTiles, tileSize]
  );

  const getOrder = useCallback(
    (tx: number, ty: number, max: number) => {
      'worklet';

      const x = Math.round(tx / tileSize) * tileSize;
      const y = Math.round(ty / tileSize) * tileSize;
      const row = Math.max(y, 0) / tileSize;
      const col = Math.max(x, 0) / tileSize;
      return Math.min(row * numberOfTiles + col, max);
    },
    [numberOfTiles, tileSize]
  );

  const position = getPosition(positions.value[id]);
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);

  useAnimatedReaction(
    () => positions.value[id],
    (newOrder) => {
      if (!isGestureActive.value) {
        const pos = getPosition(newOrder);
        translateX.value = withTiming(pos.x, animationConfig);
        translateY.value = withTiming(pos.y, animationConfig);
      }
    }
  );

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { x: number; y: number }
  >({
    onStart: (_, ctx) => {
      ctx.x = translateX.value;
      ctx.y = translateY.value;
      isGestureActive.value = true;
    },
    onActive: ({ translationX, translationY }, ctx) => {
      translateX.value = ctx.x + translationX;
      translateY.value = ctx.y + translationY;

      // 1. We calculate where the tile should be
      const newOrder = getOrder(
        translateX.value,
        translateY.value,
        Object.keys(positions.value).length - 1
      );

      // 2. We swap the positions
      const oldOlder = positions.value[id];

      if (newOrder !== oldOlder) {
        const idToSwap = Object.keys(positions.value).find(
          (key) => positions.value[key] === newOrder
        );

        if (idToSwap) {
          // Spread operator is not supported in worklets
          // And Object.assign doesn't seem to be working on alpha.6
          const newPositions = JSON.parse(JSON.stringify(positions.value));
          newPositions[id] = newOrder;
          newPositions[idToSwap] = oldOlder;
          positions.value = newPositions;
        }
      }

      // 3. Scroll up and down if necessary
      const lowerBound = scrollY.value;
      const upperBound = lowerBound + containerHeight - tileSize;
      const maxScroll = contentHeight - containerHeight;
      const leftToScrollDown = maxScroll - scrollY.value;

      if (translateY.value < lowerBound) {
        const diff = Math.min(lowerBound - translateY.value, lowerBound);
        scrollY.value -= diff;
        scrollTo(scrollView, 0, scrollY.value, false);
        ctx.y -= diff;
        translateY.value = ctx.y + translationY;
      }

      if (translateY.value > upperBound) {
        const diff = Math.min(translateY.value - upperBound, leftToScrollDown);
        scrollY.value += diff;
        scrollTo(scrollView, 0, scrollY.value, false);
        ctx.y += diff;
        translateY.value = ctx.y + translationY;
      }
    },
    onEnd: () => {
      const newPosition = getPosition(positions.value[id]);

      translateX.value = withTiming(newPosition.x, animationConfig, () => {
        isGestureActive.value = false;
        runOnJS(onDragEnd)(positions.value);
      });
      translateY.value = withTiming(newPosition.y, animationConfig);
    }
  });

  const style = useAnimatedStyle(() => {
    const zIndex = isGestureActive.value ? 100 : 0;
    const scale = withSpring(isGestureActive.value ? 1.05 : 1);

    return {
      height: tileSize,
      left: 0,
      padding: 3,
      position: 'absolute',
      top: 0,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }],
      width: tileSize,
      zIndex
    };
  });

  return (
    <Animated.View style={style}>
      <PanGestureHandler enabled onGestureEvent={onGestureEvent}>
        <Animated.View>{children}</Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};
