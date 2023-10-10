import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { useContext } from 'react';

import { SettingsContext } from '../../SettingsProvider';
import { NavigatorConfig, ScreenName } from '../../types';

import { tabNavigatorConfig } from './tabConfig';

let navigatorConfig: NavigatorConfig;
const linkingConfig: LinkingOptions = {
  prefixes: [Linking.createURL('/')]
};
const screens = {
  [ScreenName.EncounterUserDetail]: 'encounter',
  [ScreenName.Home]: '*'
};

const { globalSettings } = useContext(SettingsContext);

if (globalSettings.navigation != 'drawer') {
  const index = 1; // HINT: needs to be the index of the tab config where encounters is present

  navigatorConfig = {
    type: 'tab',
    config: tabNavigatorConfig
  };

  linkingConfig.config = {
    screens: {
      // For tab navigation choose the preferred tab by its position in the config array
      [`Stack${index}`]: {
        // The initialRouteName has to be the initial route of the chosen stack:
        // whatever is specified in the tab config for tab navigation
        initialRouteName: navigatorConfig.config.tabConfigs[index].stackConfig.initialRouteName,
        screens
      }
    }
  };
} else {
  navigatorConfig = {
    type: 'drawer'
  };

  linkingConfig.config = {
    screens: {
      AppStack: {
        // The initialRouteName has to be the initial route of the chosen stack:
        // Home for drawer navigation
        initialRouteName: ScreenName.Home,
        screens
      }
    }
  };
}

export { linkingConfig, navigatorConfig };
