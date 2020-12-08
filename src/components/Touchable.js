import React from 'react';
import { TouchableNativeFeedback, TouchableOpacity } from 'react-native';

import { device } from '../config';

export const Touchable = (props) =>
  device.platform === 'ios' ? (
    <TouchableOpacity {...props} />
  ) : (
    <TouchableNativeFeedback {...props} />
  );
