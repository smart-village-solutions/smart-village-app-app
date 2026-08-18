import React, { ReactElement, useContext } from 'react';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { normalize } from '../../config';
import { getGridContentHeight } from '../../helpers/draggableGrid';
import { OrientationContext } from '../../OrientationProvider';

import { DraggableItem, Positions } from './DraggableItem';

type Props = {
  children: ReactElement<{ draggableId: string; draggableKey: string }>[];
  columns?: number;
  onDragEnd: (diff: Positions) => void;
};

export const DraggableGrid = ({ children, columns = 3, onDragEnd }: Props) => {
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

  const { dimensions } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();

  const containerPadding = normalize(14);
  const numberOfTiles = Math.max(1, columns);
  const availableWidth =
    dimensions.width - safeAreaInsets.left - safeAreaInsets.right - 2 * containerPadding;

  // calculate tile sizes based on live window dimensions, safe area insets and padding
  const tileSize = Math.max(0, availableWidth) / numberOfTiles;

  return (
    <Animated.ScrollView
      onScroll={onScroll}
      ref={scrollView}
      contentContainerStyle={{
        height: getGridContentHeight(children.length, numberOfTiles, tileSize),
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
