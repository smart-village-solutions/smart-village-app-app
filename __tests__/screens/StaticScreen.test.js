import React from 'react';
import renderer from 'react-test-renderer';

import StaticScreen from '../../src/screens/StaticScreen';
import { texts } from '../../src/config';

describe('StaticScreen', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<StaticScreen />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('must contain a left header element (for going home)', () => {
    const navigation = { navigate: jest.fn(), getParam: jest.fn((param) => param) };
    const navigationOptions = StaticScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement.props.title).toBe(texts.button.home);
  });
});
