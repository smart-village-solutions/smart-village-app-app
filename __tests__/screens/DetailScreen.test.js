import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useQuery } from 'react-query';

import { ReactQueryClient } from '../../src/ReactQueryClient';
import { DetailScreen } from '../../src/screens/DetailScreen';
import { initialContext, SettingsContext } from '../../src/SettingsProvider';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn()
}));

jest.mock('../../src/ReactQueryClient', () => ({
  ReactQueryClient: jest.fn()
}));

jest.mock('../../src/hooks', () => ({
  ...jest.requireActual('../../src/hooks'),
  useRefreshTime: () => 'refresh-time'
}));

jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudScrollContentContainerStyle: () => undefined,
  useRegisterReadAloudContent: jest.fn()
}));

describe('DetailScreen', () => {
  const navigation = { navigate: jest.fn(), setOptions: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn()
    });
  });

  it('renders correctly', async () => {
    let component;
    await act(async () => {
      component = renderer.create(<DetailScreen navigation={navigation} route={{}} />);
    });
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it.each([
    ['eventRecord', 'Event', true],
    ['eventRecord', undefined, false],
    ['newsItem', 'Event', false]
  ])(
    'applies the configured detail title for %s (%s)',
    async (query, eventDetailTitle, applies) => {
      const value = { ...initialContext, globalSettings: { sections: { eventDetailTitle } } };

      await act(async () => {
        renderer.create(
          <SettingsContext.Provider value={value}>
            <DetailScreen navigation={navigation} route={{ params: { query } }} />
          </SettingsContext.Provider>
        );
      });

      if (applies) {
        expect(navigation.setOptions).toHaveBeenCalledWith({ title: 'Event' });
      } else {
        expect(navigation.setOptions).not.toHaveBeenCalled();
      }
    }
  );

  it('uses the routed auth mode for the detail request', async () => {
    const request = jest.fn().mockResolvedValue({ genericItem: null });
    ReactQueryClient.mockResolvedValue({ request });
    useQuery.mockImplementation((_key, queryFunction) => {
      void queryFunction();

      return {
        data: undefined,
        isLoading: false,
        isRefetching: false,
        refetch: jest.fn()
      };
    });

    await act(async () => {
      renderer.create(
        <DetailScreen
          navigation={navigation}
          route={{
            params: {
              authMode: 'user',
              details: { genericType: 'Unknown' },
              query: 'genericItem',
              queryVariables: { id: 'hidden-noticeboard-entry' }
            }
          }}
        />
      );
    });

    expect(request).toHaveBeenCalledWith(
      expect.anything(),
      { id: 'hidden-noticeboard-entry' },
      { authMode: 'user' }
    );
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
