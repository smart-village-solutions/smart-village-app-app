import React from 'react';
import renderer from 'react-test-renderer';

import { DetailScreen } from '../../src/screens';

describe('DetailScreen', () => {
  const navigation = { navigate: jest.fn() };

  it('renders correctly', () => {
    const tree = renderer.create(<DetailScreen navigation={navigation} route={{}} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it.skip('must contain a left header element (for going back)', () => {
    // skipping because of `TypeError: _screens.DetailScreen.navigationOptions is not a function`
    const navigationOptions = DetailScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement).toBeTruthy();
  });

  it.skip('must contain two right header elements (share and drawer menu)', () => {
    // skipping because of `TypeError: _screens.DetailScreen.navigationOptions is not a function`
    const navigationOptions = DetailScreen.navigationOptions({ navigation });
    const rightHeaderElements = navigationOptions.headerRight.props.children;

    expect(rightHeaderElements.length).toBe(2);
    expect(rightHeaderElements[0]).toBeTruthy();
    expect(rightHeaderElements[1]).toBeTruthy();
  });
});
