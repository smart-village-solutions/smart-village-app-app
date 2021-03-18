import React from 'react';
import renderer from 'react-test-renderer';

import { Icon } from '../../src/components';

describe('Icon', () => {
  it('renders a default Icon', () => {
    const tree = renderer.create(<Icon name="name" />);
    expect(tree).toMatchSnapshot();
  });
});
