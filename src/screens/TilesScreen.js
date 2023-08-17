import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';

import { ServiceTiles } from '../components';
import { useMatomoTrackScreenView } from '../hooks';
import { SettingsContext } from '../SettingsProvider';

export const getTilesScreen = ({
  matomoString,
  staticJsonName,
  titleFallback,
  titleKey,
  imageKey,
  hasDiagonalGradientBackground,
  isEditMode
}) => {
  const TilesScreen = () => {
    const { globalSettings } = useContext(SettingsContext);
    const { sections = {} } = globalSettings;
    const { [titleKey]: title = titleFallback, [imageKey]: image } = sections;

    useMatomoTrackScreenView(matomoString);

    return (
      <ServiceTiles
        staticJsonName={staticJsonName}
        title={title}
        image={image}
        hasDiagonalGradientBackground={hasDiagonalGradientBackground}
        isEditMode={isEditMode}
      />
    );
  };

  return TilesScreen;
};

export const TilesScreen = ({ route, navigation }) => {
  useEffect(() => {
    route.params?.screenTitle && navigation.setOptions({ title: route.params.screenTitle });
  }, [navigation, route.params?.screenTitle]);

  return getTilesScreen(route.params)({ navigation });
};

TilesScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
