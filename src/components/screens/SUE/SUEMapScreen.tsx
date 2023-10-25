/* eslint-disable complexity */
import React from 'react';

import { SUEMapView } from '../../SUE';

export const SUEMapScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const queryVariables = route.params?.queryVariables ?? {};

  return <SUEMapView navigation={navigation} queryVariables={queryVariables} route={route} />;
};
