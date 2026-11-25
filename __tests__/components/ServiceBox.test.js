import React from 'react';
import renderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';

import { ServiceBox } from '../../src/components/ServiceBox';

const renderSnapshot = (component) => {
  let tree;

  renderer.act(() => {
    tree = renderer.create(component);
  });

  const result = tree.toJSON();

  renderer.act(() => {
    tree.unmount();
  });

  return result;
};

describe('ServiceBox', () => {
  it('renders square tile with default columns', () => {
    const tree = renderSnapshot(<ServiceBox />);
    expect(tree).toMatchSnapshot();
  });

  it('renders square big tile layout with dynamic columns', () => {
    const tree = renderSnapshot(<ServiceBox bigTile columns={2} orientation="portrait" />);
    expect(tree).toMatchSnapshot();
  });

  it('renders styled tile with orientation-specific factor', () => {
    const tree = renderSnapshot(<ServiceBox columns={4} hasTileStyle orientation="landscape" />);
    expect(tree).toMatchSnapshot();
  });

  it.each([2, 3, 4])('uses the same horizontal and vertical gap with %s columns', (columns) => {
    const gridWidth = 360;
    const gap = 5;
    const tree = renderSnapshot(
      <ServiceBox columns={columns} hasTileStyle gridWidth={gridWidth} gridGap={gap} />
    );
    const style = StyleSheet.flatten(tree.props.style);

    expect(style.width * columns + gap * (columns - 1)).toBeCloseTo(gridWidth);
    expect(style.flexBasis).toBeUndefined();
    expect(style.marginBottom).toBe(gap);
    expect(style.flexShrink).toBe(1);
  });
});
