import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { WidgetContainer } from '../../src/components/widgets/WidgetContainer';
import { WidgetLayoutContext } from '../../src/components/widgets/WidgetLayoutContext';
import { normalize } from '../../src/config';

jest.mock('../../src/config', () => ({ normalize: jest.fn((value: number) => value) }));

const paddingCases = [
  { style: {}, expected: { padding: 16, paddingHorizontal: 12 } },
  { style: { padding: 0 }, expected: { padding: 0 } },
  { style: { padding: 6 }, expected: { padding: 6 } },
  {
    style: { paddingVertical: 8, paddingHorizontal: 0 },
    expected: { padding: 16, paddingVertical: 8, paddingHorizontal: 0 }
  },
  {
    style: { padding: 9, paddingVertical: 7, paddingTop: 0, paddingRight: 3 },
    expected: { padding: 9, paddingVertical: 7, paddingTop: 0, paddingRight: 3 }
  },
  {
    style: { paddingStart: 0, paddingEnd: 5 },
    expected: { padding: 16, paddingHorizontal: 12, paddingStart: 0, paddingEnd: 5 }
  },
  {
    style: { paddingBlock: 8, paddingInlineStart: 0 },
    expected: { padding: 16, paddingBlock: 8, paddingInlineStart: 0 }
  }
];

describe('WidgetContainer', () => {
  beforeEach(() => jest.mocked(normalize).mockImplementation((value: number) => value));

  it.each(paddingCases)('preserves padding overrides %j', ({ style, expected }) => {
    const { UNSAFE_getByType } = render(
      <WidgetLayoutContext.Provider value={{ mode: 'list' }}>
        <WidgetContainer accessibilityLabel="Widget" onPress={jest.fn()} widgetStyle={style}>
          {null}
        </WidgetContainer>
      </WidgetLayoutContext.Provider>
    );
    const actual = StyleSheet.flatten(UNSAFE_getByType(TouchableOpacity).props.style);

    expect(actual).toMatchObject(expected);
    if ('padding' in style) expect(actual.paddingHorizontal).toBeUndefined();
  });

  it('normalizes overrides once, retains decoration, and keeps the responsive touch target', () => {
    jest.mocked(normalize).mockImplementation((value: number) => value * 2);
    const onPress = jest.fn();
    const widgetStyle = {
      paddingVertical: 8,
      paddingBottom: 0,
      backgroundColor: '#123456',
      borderRadius: 4,
      marginTop: 3,
      height: 300,
      minHeight: 300,
      width: 300
    };
    const { getByRole } = render(
      <WidgetContainer accessibilityLabel="Open widget" onPress={onPress} widgetStyle={widgetStyle}>
        {null}
      </WidgetContainer>
    );
    const button = getByRole('button', { name: 'Open widget' });
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({
      paddingVertical: 16,
      paddingBottom: 0,
      backgroundColor: '#123456',
      borderRadius: 8,
      marginTop: 6,
      minHeight: 48,
      width: '100%'
    });
    expect(StyleSheet.flatten(button.props.style).height).toBeUndefined();
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
