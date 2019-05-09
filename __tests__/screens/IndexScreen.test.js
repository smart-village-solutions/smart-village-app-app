import React from 'react';
import renderer from 'react-test-renderer';

import IndexScreen from '../../src/screens/IndexScreen';
import { texts } from '../../src/config';

describe('IndexScreen', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<IndexScreen />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('must contain a left header element (for going home)', () => {
    const navigation = { navigate: jest.fn(), getParam: jest.fn((param) => param) };
    const navigationOptions = IndexScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement.props.title).toBe(texts.button.home);
  });
});
