import { Alert } from 'react-native';

import { texts } from '../../config';

export const NoticeboardAlerts = (alertType: string) => {
  const buttonText = texts.noticeboard.abort,
    message = texts.noticeboard.alerts[alertType] ?? texts.noticeboard.alerts.error,
    title = texts.noticeboard.alerts.hint;

  return Alert.alert(title, message, [{ text: buttonText, style: 'cancel' }]);
};
