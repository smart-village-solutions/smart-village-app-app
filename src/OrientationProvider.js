import PropTypes from 'prop-types';
import React, { createContext, useSyncExternalStore } from 'react';
import { Dimensions } from 'react-native';

const defaultDimensions = {
  height: Dimensions.get('window').height,
  width: Dimensions.get('window').width
};

// default orientation should be portrait up, because we defined that in the expo configs. but we
// want to be sure with checking the device dimension.
const defaultOrientation =
  defaultDimensions.width < defaultDimensions.height ? 'portrait' : 'landscape';

export const OrientationContext = createContext({
  orientation: defaultOrientation,
  dimensions: defaultDimensions
});

const getLayout = ({ window, screen }) => ({
  dimensions: { height: window.height, width: window.width },
  // Android can resize the window when the keyboard opens. Use screen dimensions
  // for orientation so a shortened portrait window does not become landscape.
  orientation: screen.width > screen.height ? 'landscape' : 'portrait'
});

const getWindowDimensions = () => Dimensions.get('window');
const subscribeToDimensions = (onChange) => {
  const subscription = Dimensions.addEventListener('change', onChange);
  return () => subscription.remove();
};

export const OrientationProvider = ({ children }) => {
  const window = useSyncExternalStore(subscribeToDimensions, getWindowDimensions);
  const layout = getLayout({ window, screen: Dimensions.get('screen') });

  return <OrientationContext.Provider value={layout}>{children}</OrientationContext.Provider>;
};

OrientationProvider.propTypes = {
  children: PropTypes.object.isRequired
};
