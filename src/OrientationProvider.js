import * as ScreenOrientation from 'expo-screen-orientation';
import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';
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

const getOrientation = (orientation) => {
  if (
    orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
    orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
  ) {
    return 'landscape';
  }

  return 'portrait';
};

export const OrientationProvider = ({ children }) => {
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const [orientation, setOrientation] = useState(defaultOrientation);

  useEffect(() => {
    ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      // we need to wait a short period of time before reading and setting the orientation and
      // dimensions, because some devices may take longer then other to update the orientation.
      setTimeout(() => {
        // https://docs.expo.io/versions/latest/sdk/screen-orientation/#screenorientationaddorientationchangelistenerlistener
        setOrientation(getOrientation(orientationInfo.orientation));
        setDimensions({
          height: Dimensions.get('window').height,
          width: Dimensions.get('window').width
        });
      }, 300);
    });

    // returned function will be called on component unmount
    // https://docs.expo.io/versions/latest/sdk/screen-orientation/#screenorientationremoveorientationchangelisteners
    return () => ScreenOrientation.removeOrientationChangeListeners();
  }, []);

  return (
    <OrientationContext.Provider value={{ orientation, dimensions }}>
      {children}
    </OrientationContext.Provider>
  );
};

OrientationProvider.propTypes = {
  children: PropTypes.object.isRequired
};
