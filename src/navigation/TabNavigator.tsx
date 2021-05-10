import React from 'react';
import { RegularText } from '../components';

export const TabNavigator = ({ config }: { config: string }) => {
  if (config) return <RegularText>Config is present</RegularText>;

  return <RegularText>Config is missing</RegularText>;
};
