/* eslint-disable complexity */
import React from 'react';

import { SUEListScreen } from './SUEListScreen';
import { SUEMapScreen } from './SUEMapScreen';

const getComponent = (screen: 'map' | 'list') => {
  switch (screen) {
    case 'map':
      return SUEMapScreen;
    case 'list':
      return SUEListScreen;
    default:
      return SUEListScreen;
  }
};

export const SUEIndexScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const screenType = route?.params.screenType ?? '';

  const Component = getComponent(screenType);

  return <Component navigation={navigation} route={route} />;
};
