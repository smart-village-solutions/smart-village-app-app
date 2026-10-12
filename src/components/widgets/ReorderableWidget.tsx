import React, { ReactNode, useContext, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { texts } from '../../config/texts';
import { useTheme } from '../../hooks/useTheme';
import type { WidgetBounds } from '../../helpers/widgetOrder';

type Props = {
  id: string;
  label: string;
  editing: boolean;
  disabled: boolean;
  lifted: boolean;
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  onLayout: (bounds: WidgetBounds) => void;
  onDrag: (id: string) => void;
  onHover: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, success: boolean, x: number, y: number) => void;
  onMove: (id: string, offset: number) => void;
  testID: string;
};

const spring = { damping: 24, stiffness: 280, mass: 0.65, overshootClamping: true };
const wiggle = {
  '0%': { transform: [{ rotate: '-0.8deg' }] },
  '50%': { transform: [{ rotate: '0.8deg' }] },
  '100%': { transform: [{ rotate: '-0.8deg' }] }
};

// Accessibility and drag state independently control the visual feedback.
// eslint-disable-next-line complexity
export const ReorderableWidget = ({
  id,
  label,
  editing,
  disabled,
  lifted,
  children,
  style,
  onLayout,
  onDrag,
  onHover,
  onDragEnd,
  onMove,
  testID
}: Props) => {
  const { colors } = useTheme();
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
  const systemReduceMotion = useReducedMotion();
  const reduceMotion = !!isReduceMotionEnabled || systemReduceMotion;
  const flatStyle = StyleSheet.flatten(style);
  const padding = Number(flatStyle?.paddingHorizontal || 0);
  const initialWidth = Math.max(0, Number(flatStyle?.width || 0) - 2 * padding);
  const [height, setHeight] = useState(0);
  const target = useSharedValue({ x: 0, y: 0, width: initialWidth, measured: false });
  const positioned = useSharedValue(false);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const width = useSharedValue(initialWidth);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const active = useSharedValue(false);
  const lift = useSharedValue(0);

  // The visual is a sibling of its layout slot, anchored to the stable grid.
  // Slot reflow never moves the held visual, so no per-frame measurement or
  // counter-translation is needed to keep it under the finger.
  useAnimatedReaction(
    () => ({ target: target.get(), active: active.get() }),
    (state) => {
      if (state.active || !state.target.measured) return;
      const animate = editing && !reduceMotion && positioned.get();
      x.set(animate ? withSpring(state.target.x, spring) : state.target.x);
      y.set(animate ? withSpring(state.target.y, spring) : state.target.y);
      width.set(animate ? withSpring(state.target.width, spring) : state.target.width);
      positioned.set(true);
    },
    [editing, reduceMotion]
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .withTestId(`widget-drag:${id}`)
        .enabled(editing && !disabled)
        .activateAfterLongPress(250)
        .averageTouches(true)
        .onStart((event) => {
          // Cancelling a previous settling animation starts from its visible position.
          originX.set(x.get() - event.translationX);
          originY.set(y.get() - event.translationY);
          x.set(x.get());
          y.set(y.get());
          width.set(width.get());
          active.set(true);
          lift.set(reduceMotion ? 1 : withSpring(1, spring));
          scheduleOnRN(onDrag, id);
        })
        .onUpdate((event) => {
          if (!active.get()) return;
          x.set(originX.get() + event.translationX);
          y.set(originY.get() + event.translationY);
          scheduleOnRN(onHover, id, event.absoluteX, event.absoluteY);
        })
        .onFinalize((event, success) => {
          if (!active.get()) return;
          active.set(false);
          lift.set(withTiming(0, { duration: reduceMotion ? 0 : 220 }));
          scheduleOnRN(onDragEnd, id, success, event.absoluteX, event.absoluteY);
        }),
    [
      active,
      disabled,
      editing,
      id,
      lift,
      onDrag,
      onDragEnd,
      onHover,
      originX,
      originY,
      reduceMotion,
      width,
      x,
      y
    ]
  );
  const positionStyle = useAnimatedStyle(() => ({
    width: width.get(),
    transform: [{ translateX: x.get() }, { translateY: y.get() }],
    zIndex: lift.get() > 0 ? 10 : 1,
    opacity: positioned.get() ? 1 : 0
  }));
  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : 1 + lift.get() * 0.045 }],
    shadowOpacity: lift.get() * 0.22,
    shadowRadius: lift.get() * 12,
    elevation: lift.get() * 8
  }));
  return (
    <>
      <Animated.View
        pointerEvents="none"
        accessible={false}
        collapsable={false}
        testID={testID}
        onLayout={({ nativeEvent: { layout } }) => {
          target.set({
            x: layout.x + padding,
            y: layout.y,
            width: Math.max(0, layout.width - 2 * padding),
            measured: true
          });
          onLayout({ id, ...layout });
        }}
        style={[style, { height }]}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View
          testID={`${testID}:visual`}
          onLayout={({ nativeEvent: { layout } }) =>
            setHeight((previous) => (previous === layout.height ? previous : layout.height))
          }
          accessible={editing}
          accessibilityRole={editing ? 'adjustable' : undefined}
          accessibilityLabel={editing ? label : undefined}
          accessibilityHint={editing ? texts.widgets.editHint : undefined}
          accessibilityActions={
            editing
              ? [
                  { name: 'decrement', label: texts.widgets.moveEarlier },
                  { name: 'increment', label: texts.widgets.moveLater }
                ]
              : undefined
          }
          onAccessibilityAction={({ nativeEvent }) => {
            if (editing && !disabled) onMove(id, nativeEvent.actionName === 'increment' ? 1 : -1);
          }}
          style={[styles.visual, positionStyle]}
        >
          <Animated.View style={[styles.lift, { shadowColor: colors.shadow }, liftStyle]}>
            <Animated.View
              pointerEvents={editing ? 'none' : 'auto'}
              importantForAccessibility={editing ? 'no-hide-descendants' : 'auto'}
              accessibilityElementsHidden={editing}
              style={[styles.content, editing && !lifted && !reduceMotion && animationStyle]}
            >
              {children}
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  visual: { position: 'absolute', top: 0, left: 0 },
  content: { width: '100%' },
  lift: { shadowOffset: { width: 0, height: 6 } }
});
const animationStyle = {
  animationName: wiggle,
  animationDuration: '240ms',
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite'
} as const;
