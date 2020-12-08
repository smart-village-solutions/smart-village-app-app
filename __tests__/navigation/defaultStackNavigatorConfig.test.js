import { defaultStackNavigatorConfig } from '../../src/navigation/defaultStackNavigatorConfig';

describe('defaultStackNavigatorConfig', () => {
  const navigation = { openDrawer: jest.fn() };
  const initialRouteName = 'Home';
  const defaultConfig = defaultStackNavigatorConfig(initialRouteName);

  it('must contain the initial route name given', () => {
    expect(defaultConfig.initialRouteName).toBe(initialRouteName);
  });

  it('must contain a right header element (for opening the drawer menu)', () => {
    const defaultNavigationOptions = defaultConfig.defaultNavigationOptions({
      navigation
    });
    const rightHeaderElement = defaultNavigationOptions.headerRight;

    expect(rightHeaderElement).toBeTruthy();
  });
});
