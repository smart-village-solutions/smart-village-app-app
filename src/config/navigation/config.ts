import * as Linking from 'expo-linking';
import { useContext } from 'react';

import { SettingsContext } from '../../SettingsProvider';
import { NavigatorConfig, ScreenName } from '../../types';

import { tabNavigatorConfig } from './tabConfig';

let navigatorConfig: NavigatorConfig;
let linkingConfig: any;

const { globalSettings } = useContext(SettingsContext);

if (globalSettings.navigation != 'drawer') {
  const index = 2;

  navigatorConfig = {
    type: 'tab',
    config: tabNavigatorConfig
  };

  linkingConfig = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        // For tab navigation choose the preferred tab by its position in the config array
        [`Stack${index}`]: {
          // The initialRouteName has to be the initial route of the chosen stack
          // (Home for drawer navigation, and whatever is specified in the tab config for tab navigation)
          initialRouteName: navigatorConfig.config.tabConfigs[index].stackConfig.initialRouteName,
          screens: {
            [ScreenName.EncounterUserDetail]: 'encounter',
            [ScreenName.Home]: '*'
          }
        }
      }
    }
  };
} else {
  navigatorConfig = {
    type: 'drawer'
  };

  linkingConfig = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        // For tab navigation choose the preferred tab by its position in the config array: AppStack -> `Stack${index}`
        AppStack: {
          // The initialRouteName has to be the initial route of the chosen stack
          // (Home for drawer navigation, and whatever is specified in the tab config for tab navigation)
          initialRouteName: ScreenName.Home,
          screens: {
            [ScreenName.EncounterUserDetail]: 'encounter',
            [ScreenName.Home]: '*'
          }
        }
      }
    }
  };
}

export { linkingConfig, navigatorConfig };

