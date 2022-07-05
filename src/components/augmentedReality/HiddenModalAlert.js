import { Alert } from 'react-native';

import { texts } from '../../config';

export const HiddenModalAlert = ({ onPress }) => {
  return Alert.alert(
    texts.augmentedReality.modalHiddenAlertTitle,
    texts.augmentedReality.modalHiddenAlertMessage,
    [
      { text: texts.augmentedReality.ok, onPress, style: 'default' },
      { text: texts.augmentedReality.cancel, style: 'cancel' }
    ]
  );
};
