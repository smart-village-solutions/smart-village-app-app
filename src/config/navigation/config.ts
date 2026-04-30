import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { NavigatorConfig, ScreenName } from '../../types';
import { consts } from '../consts';
import { NavigationType } from '../../navigation/Navigator';

const { HOST_NAMES } = consts;

export const navigationConfig = (navigationType: NavigationType) => {
  let navigatorConfig: NavigatorConfig;
  const linkingConfig: LinkingOptions<{}> = {
    prefixes: [Linking.createURL('/')]
  };
  const screens = {
    [ScreenName.EncounterUserDetail]: HOST_NAMES.ENCOUNTER,
    [ScreenName.Detail]: HOST_NAMES.DETAIL,
    [ScreenName.Home]: '*'
  };

  if (navigationType != NavigationType.DRAWER) {
    // TODO: needs to be the index of the tab config where in-app links should navigate in
    const index = 0;

    navigatorConfig = {
      type: NavigationType.TAB
    };

    linkingConfig.config = {
      screens: {
        // For tab navigation choose the preferred tab by its position in the config array
        [`Stack${index}`]: {
          // The initialRouteName has to be the initial route of the chosen stack:
          // whatever is specified in the tab config for tab navigation
          initialRouteName: ScreenName.Home,
          screens
        }
      }
    };
  } else {
    navigatorConfig = {
      type: NavigationType.DRAWER
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

  return { navigatorConfig, linkingConfig };
};
