import { fireEvent, render } from '@testing-library/react-native';
import type { StackHeaderProps } from 'expo-router/build/react-navigation/stack';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

const mockInsets = { top: 0, right: 0, bottom: 0, left: 0 };

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockInsets
}));
jest.mock('expo-router/build/react-navigation/elements', () => ({
  HeaderTitle: (props: object) => {
    const { Text } = jest.requireActual('react-native');
    return <Text {...props} />;
  },
  HeaderBackButton: () => null
}));
jest.mock('expo-router/build/react-navigation/stack', () => ({
  Header: ({ options }: { options: StackHeaderProps['options'] }) => {
    const { View } = jest.requireActual('react-native');
    return (
      <View testID="header" options={options}>
        <View testID="left">{options.headerLeft?.({})}</View>
        <View testID="right">{options.headerRight?.({})}</View>
        {typeof options.headerTitle === 'function' &&
          options.headerTitle({ children: options.title, tintColor: '#fff' })}
      </View>
    );
  }
}));

import { MeasuredHeader } from '../../src/navigation/MeasuredHeader';

const title = 'Auskunft aus dem Gewerbezentralregister';
const props = {
  layout: { width: 360, height: 800 },
  options: {
    title,
    headerTitleAlign: 'center',
    headerLeft: () => <Text>Back</Text>,
    headerRight: () => <Text>Search and accessibility</Text>
  }
} as StackHeaderProps;
const measure = (tree: ReturnType<typeof render>, side: string, width: number) => {
  const wrapper = tree
    .getByTestId(side)
    .findAllByType(View)
    .find((view) => view.props.onLayout);
  fireEvent(wrapper!, 'layout', { nativeEvent: { layout: { width, height: 48 } } });
};
const maxWidth = (tree: ReturnType<typeof render>) =>
  StyleSheet.flatten(tree.getByTestId('header').props.options.headerTitleContainerStyle).maxWidth;
const originalPlatform = Platform.OS;

describe('MeasuredHeader', () => {
  beforeEach(() => {
    Platform.OS = 'android';
    mockInsets.left = 0;
    mockInsets.right = 0;
  });
  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('reserves room for both actions and keeps the full accessible title', () => {
    const tree = render(<MeasuredHeader {...props} />);
    expect(maxWidth(tree)).toBe(0);
    measure(tree, 'left', 48);
    measure(tree, 'right', 104);
    expect(maxWidth(tree)).toBe(120);
    const text = tree.getByText(title);
    expect(text.props.numberOfLines).toBe(1);
    expect(text.props.ellipsizeMode).toBe('tail');
    expect(text.props.accessibilityLabel).toBe(title);
  });

  it('updates for dynamic action widths, landscape insets and screen rotation', () => {
    const tree = render(<MeasuredHeader {...props} />);
    measure(tree, 'left', 48);
    measure(tree, 'right', 104);
    measure(tree, 'right', 152);
    expect(maxWidth(tree)).toBe(24);
    mockInsets.left = 44;
    tree.rerender(<MeasuredHeader {...props} layout={{ width: 800, height: 360 }} />);
    expect(maxWidth(tree)).toBe(464);
    measure(tree, 'left', 200);
    expect(maxWidth(tree)).toBe(280);
    measure(tree, 'right', 500);
    expect(maxWidth(tree)).toBe(0);
  });

  it('releases space when actions are removed and supports explicit title strings', () => {
    const options = {
      ...props.options,
      headerLeft: undefined,
      headerRight: undefined,
      headerTitle: 'Work'
    };
    const tree = render(<MeasuredHeader {...props} />);
    measure(tree, 'left', 48);
    measure(tree, 'right', 104);
    tree.rerender(<MeasuredHeader {...props} options={options} />);
    expect(maxWidth(tree)).toBe(328);
    expect(tree.getByText('Work').props.accessibilityLabel).toBe('Work');
  });

  it('preserves custom titles and measures controls replaced by setOptions', () => {
    const headerTitle = () => <Text>Custom title</Text>;
    const tree = render(<MeasuredHeader {...props} options={{ ...props.options, headerTitle }} />);
    measure(tree, 'left', 48);
    measure(tree, 'right', 104);
    tree.rerender(
      <MeasuredHeader
        {...props}
        options={{ ...props.options, headerTitle, headerRight: () => <Text>Share</Text> }}
      />
    );
    measure(tree, 'right', 48);
    expect(maxWidth(tree)).toBe(232);
    expect(tree.getByTestId('header').props.options.headerTitle).toBe(headerTitle);
    expect(tree.getByText('Share')).toBeTruthy();
  });

  it('passes iOS options through without changing title layout or rendering', () => {
    Platform.OS = 'ios';
    const tree = render(<MeasuredHeader {...props} />);
    expect(tree.getByTestId('header').props.options).toBe(props.options);
  });
});
