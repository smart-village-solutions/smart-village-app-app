import React from 'react';
import renderer from 'react-test-renderer';

import { IndexScreen } from '../../src/screens';

describe('IndexScreen', () => {
  const navigation = { navigate: jest.fn() };

  it('renders correctly', () => {
    const tree = renderer.create(<IndexScreen navigation={navigation} />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('must contain a left header element (for going back)', () => {
    const navigationOptions = IndexScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement).toBeTruthy();
  });

  it('must contain a right header element (drawer menu)', () => {
    const navigationOptions = IndexScreen.navigationOptions({ navigation });
    const rightHeaderElement = navigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });
});
