import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

import * as ScreenOrientation from 'expo-screen-orientation';

const defaultDimensions = {
  height: Dimensions.get('window').height,
  width: Dimensions.get('window').width
};

export const OrientationContext = createContext({
  dimensions: defaultDimensions
});

export const OrientationProvider = ({ children }) => {
  const [dimensions, setDimensions] = useState(defaultDimensions);

  useEffect(() => {
    ScreenOrientation.addOrientationChangeListener(() => {
      // https://docs.expo.io/versions/latest/sdk/screen-orientation/#screenorientationaddorientationchangelistenerlistener
      setDimensions({
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
      });
    });

    // returned function will be called on component unmount
    // https://docs.expo.io/versions/latest/sdk/screen-orientation/#screenorientationremoveorientationchangelisteners
    return () => ScreenOrientation.removeOrientationChangeListeners();
  }, []);

  return (
    <OrientationContext.Provider value={{ dimensions }}>
      {children}
    </OrientationContext.Provider>
  );
};

OrientationProvider.propTypes = {
  children: PropTypes.object.isRequired
};
