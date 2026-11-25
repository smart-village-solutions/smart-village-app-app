import { act, fireEvent, render } from '@testing-library/react-native';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';

import { ReorderableWidget } from '../../src/components/widgets/ReorderableWidget';

const widgetStyle = { width: 100 };

const callbacks = () => ({
  onLayout: jest.fn(),
  onDrag: jest.fn(),
  onHover: jest.fn(),
  onDragEnd: jest.fn(),
  onMove: jest.fn()
});

const widget = (handlers: ReturnType<typeof callbacks>, lifted = false) => (
  <ReorderableWidget
    id="weather"
    label="Weather"
    editing
    disabled={false}
    lifted={lifted}
    style={widgetStyle}
    testID="weather"
    {...handlers}
  >
    <View />
  </ReorderableWidget>
);

afterEach(() => jest.restoreAllMocks());

test('resting content stays visible through data updates and an edit round trip without remounting', () => {
  const mounted = jest.fn();
  const handlers = callbacks();
  const Balance = ({ coins }: { coins: number }) => {
    useEffect(() => {
      mounted();
    }, []);
    return <Text>{coins} Taler</Text>;
  };
  const card = (coins: number, editing: boolean) => (
    <ReorderableWidget
      id="balance"
      label="Balance"
      editing={editing}
      disabled={false}
      lifted={false}
      style={widgetStyle}
      testID="balance"
      {...handlers}
    >
      <Balance coins={coins} />
    </ReorderableWidget>
  );
  const tree = render(card(0, false));
  expect(tree.getByText('0 Taler')).toBeVisible();
  tree.rerender(card(12, false));
  expect(tree.getByText('12 Taler')).toBeVisible();
  tree.rerender(card(12, true));
  tree.rerender(card(12, false));
  expect(tree.getByText('12 Taler')).toBeVisible();
  expect(mounted).toHaveBeenCalledTimes(1);
});

test('holding and moving reports live hover before release and keeps the same gesture while lifted', async () => {
  const handlers = callbacks();
  const sequence: string[] = [];
  handlers.onDrag.mockImplementation(() => sequence.push('lift'));
  handlers.onHover.mockImplementation(() => sequence.push('hover'));
  handlers.onDragEnd.mockImplementation(() => sequence.push('release'));
  const tree = render(widget(handlers));
  const gesture = getByGestureTestId('widget-drag:weather');
  tree.rerender(widget(handlers, true));
  expect(getByGestureTestId('widget-drag:weather')).toBe(gesture);
  await act(async () =>
    fireGestureHandler(gesture, [
      { state: State.BEGAN, absoluteX: 30, absoluteY: 30 },
      { state: State.ACTIVE, absoluteX: 30, absoluteY: 30 },
      { state: State.ACTIVE, absoluteX: 150, absoluteY: 80 },
      { state: State.END, absoluteX: 150, absoluteY: 80 }
    ])
  );
  expect(sequence).toEqual(['lift', 'hover', 'release']);
  expect(handlers.onHover).toHaveBeenCalledWith('weather', 150, 80);
  expect(handlers.onDragEnd).toHaveBeenCalledWith('weather', true, 150, 80);
});

test('an interrupted drag reports cancellation rather than committing the preview', async () => {
  const handlers = callbacks();
  render(widget(handlers));
  await act(async () =>
    fireGestureHandler(getByGestureTestId('widget-drag:weather'), [
      { state: State.ACTIVE, absoluteX: 30, absoluteY: 30 },
      { state: State.ACTIVE, absoluteX: 150, absoluteY: 80 },
      { state: State.CANCELLED, absoluteX: 150, absoluteY: 80 }
    ])
  );
  expect(handlers.onDragEnd).toHaveBeenCalledWith('weather', false, 150, 80);
});

test('reflow cannot move or resize the held visual while the pointer stays still', async () => {
  jest.useFakeTimers();
  const tree = render(widget(callbacks()));
  const slot = tree.getByTestId('weather');
  const visual = tree.getByTestId('weather:visual');
  const gesture = getByGestureTestId('widget-drag:weather');
  await act(async () => {
    fireEvent(slot, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 100, height: 80 } } });
  });
  await act(async () => jest.advanceTimersByTime(50));
  await act(async () => {
    gesture.handlers.onStart?.({
      translationX: 0,
      translationY: 0,
      absoluteX: 20,
      absoluteY: 30
    } as never);
    gesture.handlers.onUpdate?.({
      translationX: 40,
      translationY: 60,
      absoluteX: 60,
      absoluteY: 90
    } as never);
  });
  await act(async () => jest.advanceTimersByTime(50));
  expect(visual).toHaveAnimatedStyle({
    width: 100,
    transform: [{ translateX: 40 }, { translateY: 60 }]
  });
  for (const [x, y, width] of [
    [180, 240, 60],
    [0, 500, 300],
    [120, 0, 100]
  ]) {
    await act(async () => {
      fireEvent(slot, 'layout', { nativeEvent: { layout: { x, y, width, height: 80 } } });
      jest.advanceTimersByTime(300);
    });
    expect(tree.getByTestId('weather:visual')).toBe(visual);
    expect(visual).toHaveAnimatedStyle({
      width: 100,
      transform: [{ translateX: 40 }, { translateY: 60 }]
    });
  }
  await act(async () => {
    gesture.handlers.onFinalize?.({ absoluteX: 60, absoluteY: 90 } as never, true);
  });
  await act(async () => jest.advanceTimersByTime(1000));
  expect(visual).toHaveAnimatedStyle({ transform: [{ translateX: 120 }, { translateY: 0 }] });
  tree.unmount();
  jest.useRealTimers();
});
