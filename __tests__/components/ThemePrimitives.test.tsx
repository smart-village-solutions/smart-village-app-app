import React from 'react';
import { StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';

jest.mock('react-native-elements', () => ({
  Button: (props: unknown) => {
    const ReactLocal = jest.requireActual('react');

    return ReactLocal.createElement('mock-button', props);
  }
}));

import { Button } from '../../src/components/Button';
import { LoadingContainer } from '../../src/components/LoadingContainer';
import { Switch } from '../../src/components/Switch';
import { darkColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

const renderWithDarkTheme = (component: React.ReactElement) => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
        {component}
      </ThemeContext.Provider>
    );
  });

  return tree!;
};

describe('themed shared primitives', () => {
  it('uses dark palette colors for primary buttons', () => {
    const tree = renderWithDarkTheme(<Button onPress={jest.fn()} title="Speichern" />);
    const button = tree.root.findByType('mock-button');

    expect(StyleSheet.flatten(button.props.buttonStyle)).toMatchObject({
      height: expect.any(Number)
    });
    expect(StyleSheet.flatten(button.props.titleStyle)).toMatchObject({
      color: darkColors.onPrimary
    });
  });

  it('uses the dark surface behind web loading states', () => {
    const tree = renderWithDarkTheme(
      <LoadingContainer web>
        <></>
      </LoadingContainer>
    );
    const loadingSurface = tree.root.find(
      (node) => StyleSheet.flatten(node.props.style)?.backgroundColor === darkColors.surface
    );

    expect(loadingSurface).toBeDefined();
  });

  it('uses dark palette colors for switches', () => {
    const tree = renderWithDarkTheme(
      <Switch accessibilityLabel="Theme" switchValue toggleSwitch={jest.fn()} />
    );
    const switchNode = tree.root.findByProps({ accessibilityRole: 'switch' });

    expect(switchNode.props.trackColor).toEqual({
      false: darkColors.shadow,
      true: darkColors.primary
    });
  });
});
