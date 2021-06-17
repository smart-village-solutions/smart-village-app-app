import React, { useContext } from 'react';
import renderer from 'react-test-renderer';

import { CrossData } from '../../src/components';

describe('CrossData', () => {
  jest.mock('react', () => {
    return jest.fn(() => {
      useContext;
    });
  });

  it('renders CrossData', () => {
    const tree = renderer.create(<CrossData />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
