import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { colors, normalize } from '../config';

export default function TabBarIcon(props) {
  return (
    <Ionicons
      name={props.name}
      size={normalize(26)}
      style={{ marginTop: normalize(7) }}
      color={props.focused ? colors.accent : colors.primary}
    />
  );
}
