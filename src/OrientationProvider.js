import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

// TODO: import orientation package

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
    // TODO: on orientation change set new dimensions

    // returned function will be called on component unmount
    // TODO: return () => unsubscribe();
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
