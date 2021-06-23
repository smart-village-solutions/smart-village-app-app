import React from 'react';
import renderer from 'react-test-renderer';

import App from '../App';

describe('App', () => {
  test.skip('renders correctly', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toBeTruthy();
  });
});
