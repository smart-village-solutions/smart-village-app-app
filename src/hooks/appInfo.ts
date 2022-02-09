import { ParamListBase, useNavigation } from '@react-navigation/native';

type NavigationRoute = {
  name: string;
  params?: Partial<ParamListBase>;
};

const getRouteType = (route: NavigationRoute) =>
  route.params?.rootRouteName ? `(${route.params?.rootRouteName})` : '';

const getQueryInfo = (route: NavigationRoute) =>
  route.params?.query
    ? `(Query: ${route.params.query}${
        route.params.queryVariables ? ` - ${JSON.stringify(route.params.queryVariables)}` : ''
      })`
    : '';

const routeInfo = (route: NavigationRoute) => {
  const routeType = getRouteType(route);
  const queryInfo = getQueryInfo(route);
  return `${route.name}${routeType ? ` ${routeType}` : ''}${queryInfo ? ` ${queryInfo}` : ''}`;
};

export const useAppInfo = () => {
  const navigation = useNavigation();
  const navigationState = navigation.getState();
  const route = navigationState.routes.map(routeInfo).join(' > ');
  return {
    route
  };
};
