import { NavigationProp, ParamListBase } from '@react-navigation/native';

import { RouteTarget } from '../types';

type NavigationWithPush = NavigationProp<ParamListBase> & {
  push?: (name: string, params?: Record<string, unknown>) => void;
};

type NavigateToRouteOptions = RouteTarget & {
  navigation: NavigationWithPush;
  usePush?: boolean;
};

const hasValidTabIndex = (targetTabIndex?: number) =>
  Number.isInteger(targetTabIndex) && (targetTabIndex as number) >= 0;

export const navigateToRoute = ({
  navigation,
  params,
  routeName,
  targetTabIndex,
  usePush = false
}: NavigateToRouteOptions) => {
  const shouldStayOnCurrentStack =
    routeName === 'SueList' && params?.query === 'myRequests';

  if (!shouldStayOnCurrentStack && hasValidTabIndex(targetTabIndex)) {
    const parentNavigation = navigation.getParent?.();

    if (parentNavigation?.navigate) {
      parentNavigation.navigate(`Stack${targetTabIndex}`, {
        screen: routeName,
        params
      });

      return;
    }

    console.warn(
      `[navigateToRoute] Could not resolve parent tab navigator for route "${routeName}" and targetTabIndex ${targetTabIndex}. Falling back to local navigation.`
    );
  }

  if (usePush && navigation.push) {
    navigation.push(routeName, params);

    return;
  }

  navigation.navigate(routeName as never, params as never);
};
