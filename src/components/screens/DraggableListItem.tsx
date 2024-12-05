import React, { ReactNode, RefObject, useCallback, useContext } from 'react';
import { StyleSheet } from 'react-native';
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

import { colors, device, Icon, normalize } from '../../config';
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
  tileSize: number;
};

const animationConfig = {
  easing: Easing.inOut(Easing.ease),
  duration: 350
};

export const DraggableListItem = ({
  children,
  positions,
  id,
  onDragEnd,
  scrollView,
  scrollY,
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
  const contentHeight = Object.keys(positions.value).length * tileSize;

  const getPosition = useCallback(
    (position: number) => {
      'worklet';
      return {
        x: 0,
        y: position * tileSize
      };
    },
    [tileSize]
  );

  const getOrder = useCallback(
    (ty: number, max: number) => {
      'worklet';
      const y = Math.round(ty / tileSize) * tileSize;
      const row = Math.max(y, 0) / tileSize;
      return Math.min(row, max);
    },
    [tileSize]
  );

  const position = getPosition(positions.value[id]);
  const translateY = useSharedValue(position.y);

  useAnimatedReaction(
    () => positions.value[id],
    (newOrder) => {
      if (!isGestureActive.value) {
        const pos = getPosition(newOrder);
        translateY.value = withTiming(pos.y, animationConfig);
      }
    }
  );

  const onGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { y: number }>({
    onStart: (_, ctx) => {
      ctx.y = translateY.value;
    },
    onActive: ({ translationY }, ctx) => {
      isGestureActive.value = true;
      translateY.value = ctx.y + translationY;

      // 1. We calculate where the tile should be
      const newOrder = getOrder(translateY.value, Object.keys(positions.value).length - 1);

      // 2. We swap the positions
      const oldOrder = positions.value[id];

      if (newOrder !== oldOrder) {
        const idToSwap = Object.keys(positions.value).find(
          (key) => positions.value[key] === newOrder
        );

        if (idToSwap) {
          // Spread operator is not supported in worklets
          // And Object.assign doesn't seem to be working on alpha.6
          const newPositions = JSON.parse(JSON.stringify(positions.value));
          newPositions[id] = newOrder;
          newPositions[idToSwap] = oldOrder;
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

      translateY.value = withTiming(newPosition.y, animationConfig, () => {
        isGestureActive.value = false;
        runOnJS(onDragEnd)(positions.value);
      });
    }
  });

  const animatedStyle = useAnimatedStyle(() => {
    const zIndex = isGestureActive.value ? 100 : 0;
    const scale = withSpring(isGestureActive.value ? 1.05 : 1);

    return {
      height: tileSize,
      justifyContent: 'center',
      transform: [{ translateY: translateY.value }, { scale }],
      width: '100%',
      zIndex
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.draggableItem]}>
        {children}
      </Animated.View>
      <PanGestureHandler enabled onGestureEvent={onGestureEvent}>
        <Animated.View style={styles.animatedView}>
          <Icon.About />
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedView: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
    margin: normalize(10),
    padding: normalize(5)
  },
  draggableItem: {
    borderColor: colors.borderRgba,
    borderWidth: 1,
    margin: normalize(3)
  }
});
