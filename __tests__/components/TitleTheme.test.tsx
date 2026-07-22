import React from 'react';
import { StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { TitleContainer, TitleShadow } from '../../src/components/Title';
import { darkColors, lightColors } from '../../src/config/colors';

describe('Title theme', () => {
  it.each([
    ['light', lightColors],
    ['dark', darkColors]
  ])('blends title surfaces into the %s screen background', (_, colors) => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <StyledThemeProvider theme={colors}>
          <>
            <TitleContainer flat testID="title-container" />
            <TitleShadow testID="title-shadow" />
          </>
        </StyledThemeProvider>
      );
    });

    const rendered = tree!.toJSON() as renderer.ReactTestRendererJSON[];

    expect(StyleSheet.flatten(rendered[0].props.style)).toMatchObject({
      backgroundColor: colors.background
    });
    expect(StyleSheet.flatten(rendered[1].props.style)).toMatchObject({
      backgroundColor: colors.background
    });
  });
});
