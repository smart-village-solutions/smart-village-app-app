/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { SueMapView } from '../../SUE';

type Props = {
  navigation: StackNavigationProp<Record<string, any>>;
  route: RouteProp<any, never>;
};

export const SueMapScreen = ({ navigation, route }: Props) => {
  const queryVariables = route.params?.queryVariables ?? {};

  return <SueMapView navigation={navigation} queryVariables={queryVariables} route={route} />;
};
