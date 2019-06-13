import { TouchableNativeFeedback, TouchableOpacity } from 'react-native';

import { device } from '../config';

export const Touchable = device.platform === 'ios' ? TouchableOpacity : TouchableNativeFeedback;
