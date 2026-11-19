import React from 'react';
import renderer, { act } from 'react-test-renderer';

import {
  createStackNavigatorResolver,
  getStackNavigator
} from '../../src/navigation/AppStackNavigator';
import { initialContext, SettingsContext } from '../../src/SettingsProvider';
import { ScreenName } from '../../src/types/Navigation';

jest.mock('expo-router/build/react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: 'mock-stack-screen'
  })
}));

describe('createStackNavigatorResolver', () => {
  test('keeps the navigator component identity stable when its configuration is refreshed', () => {
    const resolveStackNavigator = createStackNavigatorResolver();
    const initialConfig = { initialRouteName: 'Home', screenConfigs: [] };
    const refreshedConfig = { initialRouteName: 'Home', screenConfigs: [] };

    const initialNavigator = resolveStackNavigator('Stack0', initialConfig);
    const refreshedNavigator = resolveStackNavigator('Stack0', refreshedConfig);

    expect(refreshedNavigator).toBe(initialNavigator);
  });

  test('uses separate navigator components for separate tabs', () => {
    const resolveStackNavigator = createStackNavigatorResolver();
    const config = { initialRouteName: 'Home', screenConfigs: [] };

    expect(resolveStackNavigator('Stack0', config)).not.toBe(
      resolveStackNavigator('Stack1', config)
    );
  });
});

test('uses the current title when a detail route is reused or the override is removed', () => {
  const Navigator = getStackNavigator({
    initialRouteName: ScreenName.Detail,
    screenConfigs: [
      {
        routeName: ScreenName.Detail,
        screenComponent: () => null,
        screenOptions: ({ route }) => ({ title: (route.params as { title: string }).title })
      }
    ]
  });
  const renderNavigator = (eventDetailTitle?: string) => (
    <SettingsContext.Provider
      value={{
        ...initialContext,
        globalSettings: { ...initialContext.globalSettings, sections: { eventDetailTitle } }
      }}
    >
      <Navigator />
    </SettingsContext.Provider>
  );
  let tree: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(renderNavigator('Event'));
  });

  const titleFor = (query: string, title: string) =>
    tree.root.findByType('mock-stack-screen' as never).props.options({
      route: { key: 'Detail-1', name: ScreenName.Detail, params: { query, title } }
    }).title;

  expect(titleFor('eventRecord', 'Veranstaltung')).toBe('Event');
  expect(titleFor('newsItem', 'Nachricht')).toBe('Nachricht');

  act(() => {
    tree.update(renderNavigator());
  });

  expect(titleFor('eventRecord', 'Veranstaltung')).toBe('Veranstaltung');
});
