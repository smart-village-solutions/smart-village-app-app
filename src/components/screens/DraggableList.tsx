import React, { ReactElement } from 'react';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';

import { normalize } from '../../config';

import { Positions } from './DraggableItem';
import { DraggableListItem } from './DraggableListItem';

type Props = {
  children: ReactElement<{ draggableId: string; draggableKey: string }>[];
  onDragEnd: (diff: Positions) => void;
};

export const DraggableList = ({ children, onDragEnd }: Props) => {
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

  return (
    <Animated.ScrollView
      onScroll={onScroll}
      ref={scrollView}
      contentContainerStyle={{
        height: normalize(80) * children.length,
        marginHorizontal: normalize(14)
      }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {children.map((child) => (
        <DraggableListItem
          key={child.props.draggableKey}
          positions={positions}
          id={child.props.draggableId}
          onDragEnd={onDragEnd}
          scrollView={scrollView}
          scrollY={scrollY}
          numberOfTiles={1}
          tileSize={normalize(80)}
        >
          {child}
        </DraggableListItem>
      ))}
    </Animated.ScrollView>
  );
};
