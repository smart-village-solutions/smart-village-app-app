import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { Button } from '../../src/components';

const renderToJSON = (element) => {
  let component;

  act(() => {
    component = renderer.create(element);
  });

  return component.toJSON();
};

describe('Button', () => {
  const onPress = () => {
    return;
  };

  it('renders a button with Outline style', () => {
    const tree = renderToJSON(<Button invert title="title" onPress={onPress} />);
    expect(tree).toMatchSnapshot();
  });

  it('renders a default button', () => {
    const tree = renderToJSON(<Button title="title" onPress={onPress} />);
    expect(tree).toMatchSnapshot();
  });
});
