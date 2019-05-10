import React from 'react';
import renderer from 'react-test-renderer';

import HomeScreen from '../../src/screens/HomeScreen';

describe('HomeScreen', () => {
  const navigation = { navigate: jest.fn() };

  it('renders correctly', () => {
    const tree = renderer.create(<HomeScreen navigation={navigation} />).toJSON();
    expect(tree).toBeTruthy();
  });
});
