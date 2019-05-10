import React from 'react';
import renderer from 'react-test-renderer';

import AppContainer from '../../src/navigation/AppContainer';

describe('AppContainer', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AppContainer />).toJSON();
    expect(tree).toBeTruthy();
  });
});
