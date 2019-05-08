import { createStackNavigator } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import IndexScreen from '../screens/IndexScreen';
import DetailScreen from '../screens/DetailScreen';

export const AppStackNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'Name of the village'
      })
    },
    Index: {
      screen: IndexScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'Index'
      })
    },
    Detail: {
      screen: DetailScreen
    }
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#08743c'
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    }
  }
);
