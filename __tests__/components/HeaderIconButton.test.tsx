import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import {
  HEADER_ICON_TOUCH_TARGET_SIZE,
  HeaderIconButton
} from '../../src/components/HeaderIconButton';

describe('HeaderIconButton', () => {
  it('keeps the minimum touch target when a smaller custom style is provided', () => {
    const { UNSAFE_getByType } = render(
      <HeaderIconButton style={styles.smallTarget}>
        <Text>Action</Text>
      </HeaderIconButton>
    );

    const touchableStyle = StyleSheet.flatten(UNSAFE_getByType(TouchableOpacity).props.style);

    expect(touchableStyle.minHeight).toBe(HEADER_ICON_TOUCH_TARGET_SIZE);
    expect(touchableStyle.minWidth).toBe(HEADER_ICON_TOUCH_TARGET_SIZE);
  });
});

const styles = StyleSheet.create({
  smallTarget: {
    minHeight: 24,
    minWidth: 24
  }
});
