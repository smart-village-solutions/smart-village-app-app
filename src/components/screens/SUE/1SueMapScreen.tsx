/* eslint-disable complexity */
import React from 'react';

import { SueMapView } from '../../SUE';

export const SueMapScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const queryVariables = route.params?.queryVariables ?? {};

  return <SueMapView navigation={navigation} queryVariables={queryVariables} route={route} />;
};
