import { isARSupportedOnDevice } from '@viro-community/react-viro';
import { useState } from 'react';

export const ARSupportingDevice = () => {
  const [isARSupported, setIsARSupported] = useState(false);

  isARSupportedOnDevice(
    () => null, // notSupportedCallback callBack
    () => setIsARSupported(true) // supportedCallback callBack
  );

  return { isARSupported };
};
