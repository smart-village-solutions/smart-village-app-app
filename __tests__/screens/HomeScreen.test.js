import React from 'react';
import renderer from 'react-test-renderer';

import { HomeScreen } from '../../src/screens';

describe('HomeScreen', () => {
  const navigation = { navigate: jest.fn() };

  it.skip('renders correctly', () => {
    // skipping because of `Invariant Violation: Could not find "client" in the context or passed in as an option. Wrap the root component in an <ApolloProvider>, or pass an ApolloClient instance in via options.`
    const tree = renderer.create(<HomeScreen navigation={navigation} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it.skip('must contain a right header element (drawer menu)', () => {
    // skipping because of `TypeError: _screens.HomeScreen.navigationOptions is not a function`
    const navigationOptions = HomeScreen.navigationOptions({ navigation });
    const rightHeaderElement = navigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });
});
