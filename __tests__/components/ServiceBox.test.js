import React from 'react';
import renderer from 'react-test-renderer';

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
});
