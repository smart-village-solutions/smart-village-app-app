import React, { ReactElement, useContext } from 'react';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { device, normalize } from '../../config';
import { OrientationContext } from '../../OrientationProvider';

import { DraggableItem, Positions } from './DraggableItem';

type Props = {
  children: ReactElement<{ draggableId: string; draggableKey: string }>[];
  onDragEnd: (diff: Positions) => void;
};

export const DraggableGrid = ({ children, onDragEnd }: Props) => {
  const scrollY = useSharedValue(0);
  const scrollView = useAnimatedRef<Animated.ScrollView>();
  const positions = useSharedValue<Positions>(
    Object.assign(
      {},
      ...children.map((child, index) => ({ [child.props.draggableId?.replace('​', '')]: index }))
    )
  );
  const onScroll = useAnimatedScrollHandler({
    onScroll: ({ contentOffset: { y } }) => {
      scrollY.value = y;
    }
  });

  const { orientation } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();

  const containerPadding = normalize(14);
  const numberOfTiles = orientation === 'landscape' ? 5 : 3;
  const deviceHeight = device.height - safeAreaInsets.left - safeAreaInsets.right;

  // calculate tile sizes based on device orientation, safe are insets and padding
  const tileSize =
    ((orientation === 'landscape' ? deviceHeight : device.width) - 2 * containerPadding) /
    numberOfTiles;

  return (
    <Animated.ScrollView
      onScroll={onScroll}
      ref={scrollView}
      contentContainerStyle={{
        height: Math.ceil(children.length / numberOfTiles) * tileSize,
        marginHorizontal: normalize(14)
      }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {children.map((child) => (
        <DraggableItem
          key={child.props.draggableKey}
          positions={positions}
          id={child.props.draggableId}
          onDragEnd={onDragEnd}
          scrollView={scrollView}
          scrollY={scrollY}
          numberOfTiles={numberOfTiles}
          tileSize={tileSize}
        >
          {child}
        </DraggableItem>
      ))}
    </Animated.ScrollView>
  );
};
