jest.mock('react-navigation', () => {
  return {
    createAppContainer: jest.fn(() => 'mocked createAppContainer'),
    createDrawerNavigator: jest.fn(() => 'mocked createDrawerNavigator'),
    createStackNavigator: jest.fn(() => 'mocked createStackNavigator')
  };
});
