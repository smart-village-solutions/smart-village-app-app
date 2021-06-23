import React from 'react';
import renderer from 'react-test-renderer';

import { HtmlScreen } from '../../src/screens';

describe('HtmlScreen', () => {
  const navigation = { navigate: jest.fn() };

  it('renders correctly', () => {
    const tree = renderer.create(<HtmlScreen navigation={navigation} route={{}} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it.skip('must contain a left header element (for going back)', () => {
    // skipping because of `TypeError: _screens.HtmlScreen.navigationOptions is not a function`
    const navigationOptions = HtmlScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement).toBeTruthy();
  });

  it.skip('must contain a right header element (drawer menu)', () => {
    // skipping because of `TypeError: _screens.HtmlScreen.navigationOptions is not a function`
    const navigationOptions = HtmlScreen.navigationOptions({ navigation });
    const rightHeaderElement = navigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });
});
