import React from 'react';
import renderer from 'react-test-renderer';

import { HomeScreen } from '../../src/screens';

describe('HomeScreen', () => {
  const navigation = { navigate: jest.fn() };

  it('renders correctly', () => {
    const tree = renderer.create(<HomeScreen navigation={navigation} />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('must contain a right header element (drawer menu)', () => {
    const navigationOptions = HomeScreen.navigationOptions({ navigation });
    const rightHeaderElement = navigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });
});
