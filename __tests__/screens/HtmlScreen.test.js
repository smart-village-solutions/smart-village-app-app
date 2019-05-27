import React from 'react';
import renderer from 'react-test-renderer';

import { HtmlScreen } from '../../src/screens';
import { texts } from '../../src/config';

describe('HtmlScreen', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<HtmlScreen />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('must contain a left header element (for going home)', () => {
    const navigation = { navigate: jest.fn(), getParam: jest.fn((param) => param) };
    const navigationOptions = HtmlScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement.props.title).toBe(texts.button.home);
  });
});
