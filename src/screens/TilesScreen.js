import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';

import { ServiceTiles } from '../components';
import { useMatomoTrackScreenView } from '../hooks';
import { SettingsContext } from '../SettingsProvider';

export const getTilesScreen = ({
  hasDiagonalGradientBackground,
  imageKey,
  isEditMode,
  listType,
  matomoString,
  staticJsonName,
  titleFallback,
  titleKey
}) => {
  const TilesScreen = () => {
    const { globalSettings } = useContext(SettingsContext);
    const { sections = {} } = globalSettings;
    const { [titleKey]: title = titleFallback, [imageKey]: image } = sections;

    useMatomoTrackScreenView(matomoString);

    return (
      <ServiceTiles
        hasDiagonalGradientBackground={hasDiagonalGradientBackground}
        image={image}
        isEditMode={isEditMode}
        listTypeProp={listType}
        staticJsonName={staticJsonName}
        title={title}
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
