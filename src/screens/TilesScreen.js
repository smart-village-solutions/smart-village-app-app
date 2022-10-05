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
  imageKey
}) => {
  const TilesScreen = ({ navigation }) => {
    const { globalSettings } = useContext(SettingsContext);
    const { sections = {} } = globalSettings;
    const { [titleKey]: title = titleFallback, [imageKey]: image } = sections;

    useMatomoTrackScreenView(matomoString);

    return (
      <ServiceTiles
        navigation={navigation}
        staticJsonName={staticJsonName}
        title={title}
        image={image}
      />
    );
  };

  TilesScreen.propTypes = {
    navigation: PropTypes.object.isRequired
  };

  return TilesScreen;
};

export const TilesScreen = ({ route, navigation }) => {
  useEffect(() => {
    route.params?.screenTitle && navigation.setOptions({ title: route.params.screenTitle });
  }, [navigation, route.params?.screenTitle]);

  return getTilesScreen(route.params)({ navigation });
};
