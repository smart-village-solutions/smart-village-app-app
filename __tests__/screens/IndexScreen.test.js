import React from 'react';
import renderer from 'react-test-renderer';

import { IndexScreen } from '../../src/screens';

describe('IndexScreen', () => {
  const navigation = { navigate: jest.fn() };

  test.skip('renders correctly', () => {
    const tree = renderer.create(<IndexScreen navigation={navigation} />).toJSON();
    expect(tree).toBeTruthy();
  });

  test.skip('must contain a left header element (for going back)', () => {
    const navigationOptions = IndexScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement).toBeTruthy();
  });

  test.skip('must contain a right header element (drawer menu)', () => {
    const navigationOptions = IndexScreen.navigationOptions({ navigation });
    const rightHeaderElement = navigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });
});
