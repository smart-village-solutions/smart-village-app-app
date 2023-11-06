import React from 'react';
import renderer from 'react-test-renderer';

import { Button } from '../../src/components';

describe('Button', () => {
  const onPress = () => {
    return;
  };

  it('renders a button with Outline style', () => {
    const tree = renderer.create(<Button invert title="title" onPress={onPress} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a default button', () => {
    const tree = renderer.create(<Button title="title" onPress={onPress} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
