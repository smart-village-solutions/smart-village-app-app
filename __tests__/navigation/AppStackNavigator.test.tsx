import { createStackNavigatorResolver } from '../../src/navigation/AppStackNavigator';

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
