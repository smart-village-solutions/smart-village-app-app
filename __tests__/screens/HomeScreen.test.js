import React from 'react';
import renderer from 'react-test-renderer';

import { HomeScreen } from '../../src/screens';

describe('HomeScreen', () => {
  const navigation = { navigate: jest.fn() };

  test.skip('renders correctly', () => {
    const tree = renderer.create(<HomeScreen navigation={navigation} />).toJSON();
    expect(tree).toBeTruthy();
  });

  test.skip('must contain a right header element (drawer menu)', () => {
    const navigationOptions = HomeScreen.navigationOptions({ navigation });
    const rightHeaderElement = navigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });
});
