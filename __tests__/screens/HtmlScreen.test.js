import React from 'react';
import renderer from 'react-test-renderer';

import { HtmlScreen } from '../../src/screens';

describe('HtmlScreen', () => {
  const navigation = { navigate: jest.fn() };
  it('renders correctly', () => {
    const tree = renderer.create(<HtmlScreen />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('must contain a left header element (for going back)', () => {
    const navigation = {
      navigate: jest.fn(),
      getParam: jest.fn((param) => param)
    };
    const navigationOptions = HtmlScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement).toBeTruthy();
  });

  it('must contain a right header element (drawer menu)', () => {
    const navigationOptions = HtmlScreen.navigationOptions({ navigation });
    const rightHeaderElement = navigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });
});
