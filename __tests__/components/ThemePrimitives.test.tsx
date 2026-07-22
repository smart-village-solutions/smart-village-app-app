import React from 'react';
import { StyleSheet, View } from 'react-native';
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
import { darkColors, lightColors } from '../../src/config/colors';
import { useThemeStyles } from '../../src/hooks/useThemeStyles';
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

const createProbeStyles = (colors: typeof lightColors) => ({
  surface: { backgroundColor: colors.surface }
});

const ThemeStyleProbe = () => {
  const styles = useThemeStyles(createProbeStyles);

  return <View style={styles.surface} testID="theme-style-probe" />;
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

  it('recreates semantic styles when the active palette changes', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <ThemeContext.Provider value={{ colors: lightColors, isDark: false, mode: 'light' }}>
          <ThemeStyleProbe />
        </ThemeContext.Provider>
      );
    });

    expect(tree!.root.findByProps({ testID: 'theme-style-probe' }).props.style).toMatchObject({
      backgroundColor: lightColors.surface
    });

    renderer.act(() => {
      tree!.update(
        <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
          <ThemeStyleProbe />
        </ThemeContext.Provider>
      );
    });

    expect(tree!.root.findByProps({ testID: 'theme-style-probe' }).props.style).toMatchObject({
      backgroundColor: darkColors.surface
    });
  });
});
