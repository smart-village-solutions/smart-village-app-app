import * as Linking from 'expo-linking';

import { NavigatorConfig, ScreenName } from '../../types';

// import { tabNavigatorConfig } from './tabConfig';

// export const navigatorConfig: NavigatorConfig = {
//   type: 'tab',
//   config: tabNavigatorConfig
// };

// const index = 2;

// export const linkingConfig = {
//   prefixes: [Linking.createURL('/')],
//   config: {
//     screens: {
//       // For tab navigation choose the preferred tab by its position in the config array
//       [`Stack${index}`]: {
//         // The initialRouteName has to be the initial route of the chosen stack
//         // (Home for drawer navigation, and whatever is specified in the tab config for tab navigation)
//         initialRouteName: navigatorConfig.config.tabConfigs[index].stackConfig.initialRouteName,
//         screens: {
//           [ScreenName.EncounterUserDetail]: 'encounter',
//           [ScreenName.Home]: '*'
//         }
//       }
//     }
//   }
// };

export const navigatorConfig: NavigatorConfig = {
  type: 'drawer'
};

export const linkingConfig = {
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
