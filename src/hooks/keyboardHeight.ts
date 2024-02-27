import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const onKeyboardChange = ({ endCoordinates }: KeyboardEvent) => {
      setKeyboardHeight(endCoordinates?.height || 0);
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', onKeyboardChange);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardChange);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardHeight;
};
