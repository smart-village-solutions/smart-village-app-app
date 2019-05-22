import React from 'react';
import renderer from 'react-test-renderer';

import IndexScreen from '../../src/screens/IndexScreen';
import { texts } from '../../src/config';

describe('IndexScreen', () => {
  const navigation = { navigate: jest.fn() };

  it('renders correctly', () => {
    const tree = renderer.create(<IndexScreen navigation={navigation} />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('must contain a left header element (for going home)', () => {
    const navigationOptions = IndexScreen.navigationOptions({ navigation });
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement.props.title).toBe(texts.button.home);
  });
});
