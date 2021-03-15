import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';

import { Link } from '../../src/components';

describe('Link', () => {
  it('renders a default Link', () => {
    const tree = renderer.create(<Link />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
