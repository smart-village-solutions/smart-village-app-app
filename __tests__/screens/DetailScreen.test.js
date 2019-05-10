import React from 'react';
import renderer from 'react-test-renderer';

import DetailScreen from '../../src/screens/DetailScreen';
import { texts } from '../../src/config';

describe('DetailScreen', () => {
  const navigation = { navigate: jest.fn(), getParam: jest.fn((param) => param) };
  const navigationOptions = DetailScreen.navigationOptions({ navigation });

  it('renders correctly', () => {
    const tree = renderer.create(<DetailScreen navigation={navigation} />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('must contain a left header element (for going back)', () => {
    const leftHeaderElement = navigationOptions.headerLeft;

    expect(leftHeaderElement.props.title).toBe(texts.button.back);
  });

  it('must contain two right header elements (share and drawer menu)', () => {
    const rightHeaderElements = navigationOptions.headerRight.props.children;

    expect(rightHeaderElements.length).toBe(2);
    expect(rightHeaderElements[0].props.title).toBe(texts.button.share);
    expect(rightHeaderElements[1].props.title).toBe('=');
  });
});
